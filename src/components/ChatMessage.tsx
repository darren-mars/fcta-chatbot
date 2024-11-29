import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import Spinner from "./Spinner";

interface Props extends Pick<Message, "role" | "content"> {
  isThinking?: boolean;
}

const ChatMessage = ({ role, content, isThinking = false }: Props) => {
  const isUser = role === "user";
  const backgroundColor = isUser
    ? "bg-slate-200 dark:bg-slate-800"
    : "bg-zinc-100 dark:bg-zinc-800";
  return (
    <div
      className={`mb-4 flex flex-col space-y-1 ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      <div className="text-sm text-zinc-400">{isUser ? "User" : "AI"}</div>
      {content && (
        <div
          className={`mb-4 max-w-[90%] rounded px-4 py-2 ${backgroundColor}`}
        >
          <article className="prose dark:prose-invert">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        </div>
      )}
      {isThinking && <Spinner />}
    </div>
  );
};

export default ChatMessage;
