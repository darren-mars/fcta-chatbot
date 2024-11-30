"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import VideoBanner from "../components/VideoBanner";
import ChatFooter from "../components/ChatFooter";
import ChatBody from "../components/ChatBody";

interface Message {
 id: string;
 content: string;
 role: 'system' | 'user' | 'assistant';
}

interface WebSocketMessage {
 chunk?: string;
 end?: boolean;
 data?: string;
}

export default function Chat() {
 const [messages, setMessages] = useState<Message[]>([
   {
     id: uuid(),
     content: "Welcome to Travel Associates. \n \nI'm here to craft your next remarkable journey. What inspires you?",
     role: "system",
   }
 ]);
 const [input, setInput] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const ws = useRef<WebSocket | null>(null);

 useEffect(() => {
   // Initialize WebSocket connection
   ws.current = new WebSocket('wss://uhueud8q45.execute-api.us-east-2.amazonaws.com/dev');
   
   ws.current.onmessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data) as WebSocketMessage;
    const chunk = data.chunk;
    
    if (chunk && typeof chunk === 'string') {  // Type guard to ensure chunk is string
      setMessages(prevMessages => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        
        if (lastMessage && lastMessage.role === 'assistant') {
          return prevMessages.map((msg, index) => {
            if (index === prevMessages.length - 1) {
              return {
                ...msg,
                content: msg.content + chunk
              };
            }
            return msg;
          });
        } 
        
        const newMessage: Message = {
          id: uuid(),
          content: chunk,
          role: 'assistant'
        };
        
        return [...prevMessages, newMessage];
      });
    }
    
    if (data.end) {
      setIsLoading(false);
    }
  };

   ws.current.onerror = (error: Event) => {
     console.error('WebSocket error:', error);
     setIsLoading(false);
   };

   ws.current.onclose = () => {
     console.log('WebSocket connection closed');
     setIsLoading(false);
   };

   return () => {
     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
       ws.current.close();
     }
   };
 }, []);

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!input.trim() || isLoading || !ws.current) return;

   setIsLoading(true);
   setMessages(prev => [...prev, {
     id: uuid(),
     content: input,
     role: 'user'
   }]);

   try {
     ws.current.send(JSON.stringify({
       action: "sendMessage",
       question: input,
     }));

     setInput("");
   } catch (error) {
     console.error('Error sending message:', error);
     setIsLoading(false);
   }
 };

 // Inside the Chat component render function
return (
  <main className="m-auto flex h-[100dvh] w-full max-w-screen-2xl flex-col bg-white dark:bg-zinc-900">
    {/* Video Banner */}
    <VideoBanner />
    
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-auto">
        <ChatBody messages={messages} isLoading={isLoading} />
        
        <ChatFooter
          input={input}
          onInputChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onSubmit={handleSubmit}
          onSuggestionClick={(suggestion: string) => {
            setInput(suggestion);
          }}
        />
      </div>
    </div>
  </main>
);
}