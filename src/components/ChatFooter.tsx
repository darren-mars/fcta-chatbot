import { ChangeEvent, FormEvent, useState } from "react";
import Button from "./Button";

interface Props {
  input: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
  "Who are you?",
  "What tech stack is this template using?",
  "Where can I get the source code?",
];

const ChatFooter = ({
  input,
  onInputChange,
  onSubmit,
  onSuggestionClick,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <footer className="flex-shrink-0 space-y-4 border-t p-4 dark:border-zinc-800">
      <div>
        <div className="mb-2 flex justify-between text-xs text-zinc-400">
          <div>You may want to ask...</div>
          <div
            className="-m-4 cursor-pointer p-4"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? "hide" : "show"}
          </div>
        </div>
        {isExpanded && (
          <div className="-mb-2 -ml-2 flex flex-wrap overflow-auto">
            {SUGGESTIONS.map((suggestion) => (
              <Button
                key={suggestion}
                className="mb-2 ml-2 whitespace-nowrap text-sm"
                onClick={() => onSuggestionClick(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
      <form className="flex space-x-4" onSubmit={onSubmit}>
        <input
          className="flex-1 rounded-md bg-zinc-100 p-2 dark:bg-zinc-800"
          value={input}
          onChange={onInputChange}
          placeholder="Say something..."
        />
        <Button type="submit">Send</Button>
      </form>
    </footer>
  );
};

export default ChatFooter;
