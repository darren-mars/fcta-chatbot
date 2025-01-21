import React from 'react';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  children: React.ReactNode;
}

const PillButton: React.FC<PillButtonProps> = ({ selected, children, className, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-full ${
        selected
          ? "bg-[#30123C] text-white"
          : "bg-[#30123C] text-gray-600"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};


const SelectablePillButton: React.FC<PillButtonProps> = ({ selected, children, className, ...props }) => {
  return (
    <button
      className={`px-4 py-2 rounded-full border ${
        selected
          ? "bg-white border-purple-800 text-purple-800"
          : "bg-white border-gray-300 text-gray-600"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { PillButton, SelectablePillButton };
