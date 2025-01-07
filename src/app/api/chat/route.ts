// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Log to verify incoming request
    const { query, oauthToken } = await req.json(); // Expecting oauthToken in the request body
    if (!query) {
      return NextResponse.json({ error: 'Query text is missing' }, { status: 400 });
    }

    // Check if the OAuth token is provided
    if (!oauthToken) {
      return NextResponse.json({ error: 'OAuth token is missing' }, { status: 400 });
    }

    // Check environment variables
    const { WORKSPACE_URL } = process.env;
    if (!WORKSPACE_URL) {
      throw new Error('Missing required environment variable for Databricks workspace URL');
    }

    // Step 2: Query the Databricks API using the provided OAuth token
    const response = await fetch(
      `${WORKSPACE_URL}/api/2.0/vector-search/indexes/fcta_innovation_stream.default.ta_chatbot_search_idx/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Content-Type': 'application/json;charset=UTF-8',
          'Accept': 'application/json, text/plain, */*'
        },
        body: JSON.stringify({
          num_results: 3,
          columns: ["content_chunk"],
          query_text: query
        })
      }
    );

    // Handle API response errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Databricks API response error:', errorText);
      throw new Error(`Databricks API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in chat API route:', error.message); // Accessing `message` safely
      return NextResponse.json(
        { error: 'Failed to process request', details: error.message }, // Include error details for debugging
        { status: 500 }
      );
    } else {
      console.error('Unexpected error:', error); // Handle unexpected error types
      return NextResponse.json(
        { error: 'Failed to process request', details: 'Unexpected error occurred.' },
        { status: 500 }
      );
    }
  }
}
