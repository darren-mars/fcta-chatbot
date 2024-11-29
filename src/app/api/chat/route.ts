import { Message, StreamingTextResponse } from "ai";

const WS_URL = 'wss://uhueud8q45.execute-api.us-east-2.amazonaws.com/dev';

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt } = await req.json();

    const sessionId = "test-connection-id"; 

    const userMessage = messages.find((message: Message) => message.role === "user");
    const question = userMessage?.content || "";

    const payload = {
      action: "sendMessage",
      question,
      sessionId,
    };

    // WebSocket connection
    const resultText = await new Promise<string>((resolve, reject) => {
      const socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        console.log("WebSocket connection opened");
        socket.send(JSON.stringify(payload));
      };

      socket.onmessage = (event) => {
        console.log("Message received from WebSocket:", event.data);
        try {
          const data = JSON.parse(event.data);
          resolve(data.text || "");
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          reject(error);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(new Error("WebSocket connection failed."));
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
    });

    // Create a ReadableStream to stream the response to the frontend
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(resultText); // Push received text to the stream
        controller.close();
      },
    });

    return new StreamingTextResponse(stream); // Send back the streamed text

  } catch (error) {
    console.error("Error during request processing:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred during the request processing" }),
      { status: 500 }
    );
  }
}