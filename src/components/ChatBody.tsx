import { Message } from "ai";
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

interface Props {
  messages: Message[];
  isLoading: boolean;
}

const ChatBody = ({ messages, isLoading }: Props) => {
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
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            isThinking={
              !isGettingResponse && isLoading && index === messages.length - 1
            }
          />
        ))}
        {isGettingResponse && (
          <ChatMessage role="system" content="" isThinking />
        )}
      </div>
    </div>
  );
};

export default ChatBody;
