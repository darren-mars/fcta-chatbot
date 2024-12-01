// ChatFooter.tsx
import { ChangeEvent, FormEvent, useState } from "react";
import Button from "./Button";

interface Props {
  input: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSuggestionSubmit: (suggestion: string) => void; // Changed from onSuggestionClick
}

const SUGGESTIONS = [
  "Romantic Getaway",
  "Greece",
  "Grand Prix"
];

const ChatFooter = ({
  input,
  onInputChange,
  onSubmit,
  onSuggestionSubmit, // Changed prop name
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <footer className="flex-shrink-0 space-y-4 border-t p-4 dark:border-zinc-800">
      <div>
        <div className="mb-2 flex justify-between text-xs text-purple-400">
          <div>You may want to say...</div>
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
                onClick={() => onSuggestionSubmit(suggestion)} // Changed to use new prop
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