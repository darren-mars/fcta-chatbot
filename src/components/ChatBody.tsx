import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { AppleCardsCarousel } from "./AppleCardsCarousel";

interface Message {
  id: string;
  content: string;
  role: 'system' | 'user' | 'assistant';
  options?: string[];
}

interface Props {
  messages: Message[];
  isLoading: boolean;
  onSuggestionSubmit: (suggestion: string) => void;
}

const ChatBody = ({ messages, isLoading, onSuggestionSubmit }: Props) => {
  const messageListContainerRef = useRef<HTMLDivElement | null>(null);
  const isAtBottom = useRef(true);

  useEffect(() => {
    const container = messageListContainerRef.current;
    if (!container) return;

    if (isAtBottom.current) {
      container.scrollTop = container.scrollHeight - container.offsetHeight;
      isAtBottom.current = true;
    }
  }, [messages]);

  const isGettingResponse =
    isLoading && messages[messages.length - 1]?.role === "user";

  return (
    <div
      ref={messageListContainerRef}
      className="m mb-auto flex-1 overflow-auto"
      onScroll={() => {
        const container = messageListContainerRef.current;
        if (!container) return;

        isAtBottom.current =
          container.scrollTop ===
          container.scrollHeight - container.offsetHeight;
      }}
    >
      <div className="p-4">
        {messages.map((message, index) => (
          <div key={message.id}>
            <ChatMessage
              role={message.role}
              content={message.content}
              isThinking={
                !isGettingResponse && isLoading && index === messages.length - 1
              }
            />
            {message.role === 'assistant' && message.options && message.options.length > 0 && (
              <AppleCardsCarousel
                items={message.options}
                onSelect={onSuggestionSubmit}
              />
            )}
          </div>
        ))}
        {isGettingResponse && (
          <ChatMessage role="system" content="" isThinking />
        )}
      </div>
    </div>
  );
};

export default ChatBody;