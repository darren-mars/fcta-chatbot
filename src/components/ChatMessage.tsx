import React from 'react';

interface Props {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool';
  content?: string;
  isThinking?: boolean;
}

const ChatMessage = ({ role, content, isThinking = false }: Props) => {
  const isUser = role === 'user';
  const backgroundColor = isUser
    ? "bg-slate-200 dark:bg-slate-800"
    : "bg-zinc-100 dark:bg-zinc-800";

  return (
    <div
      className={`mb-4 flex flex-col space-y-1 ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      <div className="text-sm text-zinc-400 flex items-center gap-2">
        {isUser ? (
          "User"
        ) : (
          <>
            <img
              src="/images/ta-icon.png"
              alt="Travel Associates"
              className="w-8 h-8 mb-1"
            />
            <span className="sr-only">Travel Associates</span>
          </>
        )}
      </div>
      {content && (
        <div
          className={`mb-4 max-w-[90%] rounded px-4 py-2 ${backgroundColor}`}
        >
          <div className="prose dark:prose-invert whitespace-pre-wrap">
            {content}
          </div>
        </div>
      )}
      {isThinking && (
        <div className="flex justify-center items-center p-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;