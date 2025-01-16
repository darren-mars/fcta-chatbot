// src/app/components/SwipeableCard.tsx

import React, { useState } from 'react';

interface SwipeableCardProps {
  title: string;
  subtitle: string;
  onSwipe: (keyword: string, direction: 'left' | 'right') => void;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({ title, subtitle, onSwipe }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    onSwipe(title, direction);
    setCurrentCardIndex((prevIndex) => (prevIndex + 1) % 1); // Update this logic based on your card data
  };

  return (
    <div className="relative w-full h-[calc(100vh-300px)] max-h-[500px] rounded-lg overflow-hidden mx-auto">
      <div className="absolute inset-0 bg-gray-200" />
      <div className="absolute inset-0 flex items-center justify-center">
        <h2 className="text-4xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
        <p className="text-white text-sm">{subtitle}</p>
      </div>
      <div className="absolute bottom-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center">
        <img src="/ai-logo.svg" alt="AI Logo" className="w-5 h-5" />
      </div>
      <div className="absolute inset-0 flex">
        <div className="w-1/2 h-full" onClick={() => handleSwipe('left')} />
        <div className="w-1/2 h-full" onClick={() => handleSwipe('right')} />
      </div>
    </div>
  );
};

export default SwipeableCard;
