// src/pages/api/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { formatSelectionsForQuery } from '@/lib/formatSelections';
import { TableClient, TableEntity } from '@azure/data-tables';
import { v4 as uuidv4 } from 'uuid';
import config from '@/config'; // Import the centralized config

interface VectorSearchResponse {
  manifest: {
    column_count: number;
    columns: { name: string }[];
  };
  result: {
    row_count: number;
    data_array: Array<[string, number]>;
  };
}

interface LlamaResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  // Define other fields as needed
}

// Initialize Azure Table Client
const tableClient = TableClient.fromConnectionString(config.azureStorageConnectionString, config.azureTableName);

export async function POST(req: NextRequest) {
  try {
    // 1. Parse Body
    // We expect the front end to send either:
    //   { userSelections, oauthToken, previousMessages }
    // or 
    //   { query, oauthToken, previousMessages }
    const { query, userSelections, oauthToken, previousMessages = [] } = await req.json();

    // 2. Validate OAuth token
    if (!oauthToken) {
      return NextResponse.json(
        { error: 'OAuth token is missing' },
        { status: 400 }
      );
    }

    // 3. Handle input: if we received structured JSON, convert it to text query
    let finalQuery = query;
    if (!finalQuery && userSelections) {
      finalQuery = formatSelectionsForQuery(userSelections);
    }

    if (!finalQuery) {
      return NextResponse.json(
        { error: 'No query or userSelections provided' },
        { status: 400 }
      );
    }

    // 4. Generate a unique Interaction ID
    const interactionId = uuidv4();

    // 5. Generate the current date for PartitionKey
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const currentDate = `${year}${month}${day}`;

    // Step 1: Perform vector search using Databricks API
    const vectorSearchResponse = await fetch(
      `${config.databricksHost}/api/2.0/vector-search/indexes/${config.vectorSearchIndexName}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.databricksApiToken}`, // Use the service token
          'Content-Type': 'application/json;charset=UTF-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          num_results: config.numVectorResults,
          columns: ['content_chunk'],
          query_text: finalQuery,
        }),
      }
    );

    if (!vectorSearchResponse.ok) {
      throw new Error(`Vector search failed: ${await vectorSearchResponse.text()}`);
    }

    const vectorData: VectorSearchResponse = await vectorSearchResponse.json();

    // Step 2: Combine vectorized chunks into context
    const relevantContext = vectorData.result.data_array
      .map(([content]) => content)
      .join('\n');

    // Step 3: Send combined context, query, and system prompt to the Llama endpoint
    const llamaResponse = await fetch(
      config.llamaEndpointUrl,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`token:${config.databricksApiToken}`).toString('base64')}`, // Use the service token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `${config.basePrompt}\n\n${relevantContext}`,
            },
            ...previousMessages,
            {
              role: 'user',
              content: finalQuery,
            },
          ],
        }),
      }
    );

    if (!llamaResponse.ok) {
      throw new Error(`Llama API error: ${await llamaResponse.text()}`);
    }

    const llamaData: LlamaResponse = await llamaResponse.json();

    // Log llamaData for debugging
    console.log('Llama API Response:', JSON.stringify(llamaData, null, 2));

    // Extract the assistant's response from the Llama API response
    const assistantResponse = llamaData.choices?.[0]?.message?.content || 'No response received.';

    // Step 4: Store interaction data in Azure Storage Tables
    const interactionEntity: TableEntity = {
      partitionKey: currentDate,
      rowKey: interactionId,
      timestamp: new Date().toISOString(),
      userSelections: JSON.stringify(userSelections || {}),
      query: finalQuery,
      assistantResponse: assistantResponse
    };

    await tableClient.createEntity(interactionEntity);

    // Step 5: Respond with the result and interaction ID
    return NextResponse.json({
      interactionId: interactionId,
      manifest: vectorData.manifest,
      result: {
        row_count: 1,
        data_array: [[assistantResponse, 1.0]],
      },
    });

  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
