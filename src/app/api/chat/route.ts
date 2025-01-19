import { NextRequest, NextResponse } from 'next/server';
import { formatSelectionsForQuery } from '@/lib/formatSelections';
import fs from 'fs/promises'; // Use promises for async file read
import path from 'path';

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

const SYSTEM_PROMPT_PATH = process.env.NEXT_PUBLIC_BASE_PROMPT || '';
let SYSTEM_PROMPT = '';

// Asynchronously read the system prompt file when the server starts
async function loadSystemPrompt() {
  if (SYSTEM_PROMPT_PATH) {
    try {
      SYSTEM_PROMPT = await fs.readFile(SYSTEM_PROMPT_PATH, 'utf-8');
    } catch (error) {
      console.error(`Failed to read the system prompt file: ${(error as Error).message}`);
    }
  }
}

// Load the system prompt at startup
loadSystemPrompt();

export async function POST(req: NextRequest) {
  try {
    // 1. Parse Body
    const { query, userSelections, oauthToken } = await req.json();

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

    // Step 1: Perform vector search
    const vectorSearchResponse = await fetch(
      'https://adb-19070432379385.5.azuredatabricks.net/api/2.0/vector-search/indexes/fcta_innovation_stream.default.ta_chatbot_search_idx/query',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${oauthToken}`,
          'Content-Type': 'application/json;charset=UTF-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          num_results: 3,
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
      'https://adb-19070432379385.5.azuredatabricks.net/serving-endpoints/databricks-meta-llama-3-3-70b-instruct/invocations',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`token:${oauthToken}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `${SYSTEM_PROMPT}\n\n${relevantContext}`,
            },
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

    const llamaData = await llamaResponse.json();

    // Log llamaData for debugging
    console.log('Llama API Response:', JSON.stringify(llamaData, null, 2));

    // Extract the assistant's response from the Llama API response
    const assistantResponse = llamaData.choices?.[0]?.message?.content || 'No response received.';

    // Step 4: Respond with the result
    return NextResponse.json({
      manifest: vectorData.manifest,
      result: {
        row_count: 1,
        data_array: [[assistantResponse, 1.0]],
      },
      finalQuery,
      relevantContext,
      systemPrompt: SYSTEM_PROMPT,
    });

  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: (error as Error).message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
