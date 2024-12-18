import React, { useEffect, useRef } from "react";
import ChatMessage from './ChatMessage';
import { AppleCardsCarousel } from "./AppleCardsCarousel";
import DurationSlider from './DurationSlider';

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

const ChatBody: React.FC<Props> = ({ messages, isLoading, onSuggestionSubmit }) => {
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

  const isGettingResponse = isLoading && messages[messages.length - 1]?.role === "user";

  const renderMessageContent = (message: Message): JSX.Element => {
    if (message.content.includes("duration") && message.content.includes("sojourn")) {
      return (
        <div className="mt-4 mb-4">
          <DurationSlider 
            onSelect={(duration: number) => {
              let responseMessage: string;
              if (duration <= 4) {
                responseMessage = "I'd like to plan a long weekend getaway (3-4 days)";
              } else if (duration <= 7) {
                responseMessage = "I'm thinking of about a week-long vacation (5-7 days)";
              } else {
                responseMessage = "I'm interested in an extended escape (8+ days or more)";
              }
              onSuggestionSubmit(responseMessage);
            }} 
          />
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        {message.content.split('\n').map((text: string, i: number) => (
          text ? <p key={i} className="mb-4">{text}</p> : <br key={i} />
        ))}
      </div>
    );
  };

  return (
    <div
      ref={messageListContainerRef}
      className="mb-auto flex-1 overflow-auto"
      onScroll={() => {
        const container = messageListContainerRef.current;
        if (!container) return;

        isAtBottom.current =
          container.scrollTop === container.scrollHeight - container.offsetHeight;
      }}
    >
      <div className="p-4">
        {messages.map((message: Message, index: number) => (
          <React.Fragment key={message.id}>
            <ChatMessage 
              role={message.role}
              content={renderMessageContent(message)}
              isThinking={!isGettingResponse && isLoading && index === messages.length - 1}
            />
            {message.role === 'assistant' && 
             message.options && 
             message.options.length > 0 && 
             !message.content.includes("duration") && (
              <AppleCardsCarousel
                items={message.options}
                onSelect={onSuggestionSubmit}
              />
            )}
          </React.Fragment>
        ))}
        {isGettingResponse && (
          <ChatMessage role="system" content="" isThinking />
        )}
      </div>
    </div>
  );
};

export default ChatBody;