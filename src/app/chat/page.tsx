"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import VideoBanner from "@/components/VideoBanner";
import ChatFooter from "@/components/ChatFooter";
import ChatBody from "@/components/ChatBody";

// Define the structure for the API response
interface DatabricksResponse {
  manifest: {
    column_count: number;
    columns: { name: string }[];
  };
  result: {
    row_count: number;
    data_array: Array<[string, number]>; // Array of tuples containing content and score
  };
}

interface Message {
  id: string;
  content: string;
  role: 'system' | 'user' | 'assistant';
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuid(),
      content: "Welcome to Travel Associates. \n \nI'm here to craft your next remarkable journey. What inspires you?",
      role: "system",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // this shoulodn't be here
  const oauthToken = "dapi0ec22d874c1b479080fac1afc5088e97";

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const queryDatabricks = async (query: string) => {
    try {
      const vectorResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          oauthToken,
        }),
      });
  
      if (!vectorResponse.ok) {
        throw new Error(`Failed to fetch vector search results: ${vectorResponse.statusText}`);
      }
  
      // Expecting the full response structure
      const vectorData: DatabricksResponse = await vectorResponse.json();
  
      // Check if we have valid vector search results
      if (!vectorData || !vectorData.result || !vectorData.result.data_array) {
        throw new Error('Invalid response structure from vector search');
      }
  
      // Extract the assistant's response from the API response
      const assistantResponse = vectorData.result.data_array[0][0]; // This gets the assistant's message
  
      return assistantResponse;
  
    } catch (error) {
      console.error('Error querying API:', error);
      throw error;
    }
  };
  
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
  
    setIsLoading(true);
    setMessages(prev => [...prev, {
      id: uuid(),
      content: input,
      role: 'user'
    }]);
  
    try {
      const response = await queryDatabricks(input); // This now gets the assistant's response
      setMessages(prev => [...prev, {
        id: uuid(),
        content: response,
        role: 'assistant'
      }]);
  
      setInput("");
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, {
        id: uuid(),
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        role: 'assistant'
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleSubmitSuggestion = async (suggestion: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setMessages(prev => [...prev, {
      id: uuid(),
      content: suggestion,
      role: 'user'
    }]);

    try {
      const response = await queryDatabricks(suggestion);
      
      setMessages(prev => [...prev, {
        id: uuid(),
        content: response,
        role: 'assistant'
      }]);
    } catch (error) {
      console.error('Error processing suggestion:', error);
      setMessages(prev => [...prev, {
        id: uuid(),
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        role: 'assistant'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] transition-opacity duration-500 dark:bg-zinc-900 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="w-full">
        <VideoBanner />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div ref={chatBodyRef} className="px-4 pb-4">
          <ChatBody messages={messages} isLoading={isLoading} />
        </div>
      </div>
        
      <div className="w-full bg-zinc-900 px-4 py-3">
        <ChatFooter
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
          onSubmit={handleSubmit}
          onSuggestionSubmit={handleSubmitSuggestion}
        />
      </div>
    </div>
  );
}
