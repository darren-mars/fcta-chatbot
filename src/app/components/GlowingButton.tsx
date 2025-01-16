
import React from 'react';

const GlowingButton: React.FC<{ onClick: () => void; showFreeText: boolean }> = ({ onClick, showFreeText }) => {
  return (
    <div className="w-full flex justify-center mt-4">
      <button
        onClick={onClick}
        className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-50"
      >
        <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#8b5cf6_50%,#3b82f6_100%)]" />
        <span className="absolute inset-0 rounded-full bg-white opacity-50" />
        <span className="relative inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-700 transition-colors duration-300 ease-in-out hover:bg-opacity-90">
          <span className="inline-flex items-center">
            <img src="/images/ai-logo.svg" alt="" className="w-6 h-6 mr-2" />
            <span>{showFreeText ? "Hide" : "Describe Experience"}</span>
          </span>
        </span>
        <span className="absolute inset-0 rounded-full animate-pulse-glow" />
      </button>
    </div>
  );
};

export default GlowingButton;
