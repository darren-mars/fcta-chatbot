import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface AppleCardsCarouselProps {
  items: string[];
  onSelect: (item: string) => void;
}

export const AppleCardsCarousel: React.FC<AppleCardsCarouselProps> = ({
  items,
  onSelect
}) => {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={constraintsRef}
      className="h-[200px] w-full flex items-center justify-center relative overflow-hidden mt-4"
    >
      <div className="flex gap-4 items-center justify-start relative p-4 w-full">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            className={cn(
              "w-[280px] h-[160px] bg-zinc-800/50 backdrop-blur-sm rounded-2xl cursor-grab relative shrink-0",
              "flex items-center justify-center flex-col gap-3 p-6 hover:scale-105 transition-all duration-300",
              "border border-zinc-700/50",
              activeCard === idx ? "shadow-2xl" : "shadow-lg"
            )}
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            dragTransition={{
              bounceStiffness: 600,
              bounceDamping: 20,
            }}
            onDragStart={() => setActiveCard(idx)}
            onDragEnd={() => setActiveCard(null)}
            onClick={() => onSelect(item)}
          >
            <div className="text-lg font-semibold text-zinc-200 mb-1">
              Option {String.fromCharCode(65 + idx)}
            </div>
            <p className="text-zinc-300/80 text-center text-sm leading-tight">
              {item}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AppleCardsCarousel;