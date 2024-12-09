"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import VideoBanner from "@/components/VideoBanner";
import ChatFooter from "@/components/ChatFooter";
import ChatBody from "@/components/ChatBody";

interface Message {
  id: string;
  content: string;
  role: 'system' | 'user' | 'assistant';
  options?: string[];
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
  const ws = useRef<WebSocket | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    ws.current = new WebSocket('wss://uhueud8q45.execute-api.us-east-2.amazonaws.com/dev');
    
    ws.current.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      if (data.chunk || data.options) {
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          
          if (lastMessage && lastMessage.role === 'assistant') {
            return prevMessages.map((msg, index) => {
              if (index === prevMessages.length - 1) {
                return {
                  ...msg,
                  content: data.chunk ? msg.content + data.chunk : msg.content,
                  options: data.options || msg.options
                };
              }
              return msg;
            });
          }
          
          return [...prevMessages, {
            id: uuid(),
            content: data.chunk || "",
            options: data.options,
            role: 'assistant'
          }];
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

  const handleSubmitSuggestion = (suggestion: string) => {
    if (isLoading || !ws.current) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, {
      id: uuid(),
      content: suggestion,
      role: 'user'
    }]);

    try {
      ws.current.send(JSON.stringify({
        action: "sendMessage",
        question: suggestion,
      }));
    } catch (error) {
      console.error('Error sending message:', error);
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
        <ChatBody 
          messages={messages} 
          isLoading={isLoading}
          onSuggestionSubmit={handleSubmitSuggestion}  // Changed to match ChatBody Props
        />
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