import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const userSelections = await req.json();

    console.log('Received user selections:', JSON.stringify(userSelections, null, 2));

    const apiResponse = await fetch(
      'https://kc8vh67wy9.execute-api.us-east-1.amazonaws.com/default/generateItinerary',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userSelections),
      }
    );

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('API response error:', apiResponse.status, errorText);
      return NextResponse.json(
        {
          error: 'Failed to generate itinerary',
          details: `API request failed with status ${apiResponse.status}: ${errorText}`,
        },
        { status: apiResponse.status }
      );
    }

    const responseData = await apiResponse.json();
    console.log('API response data:', JSON.stringify(responseData, null, 2));
    
    if (responseData.body) {
      try {
        const parsedBody = JSON.parse(responseData.body);
        return NextResponse.json(parsedBody);
      } catch (parseError) {
        console.error('Error parsing response body:', parseError);
        return NextResponse.json(responseData);
      }
    } else {
      return NextResponse.json(responseData);
    }
    

  } catch (error) {
    console.error('Detailed error in API route:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate itinerary',
        details: (error as Error).message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
