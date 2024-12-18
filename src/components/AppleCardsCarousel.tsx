import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface AppleCardsCarouselProps {
  items: string[];
  onSelect: (item: string) => void;
}

const VIDEO_MAPPINGS = {
  urban: '/videos/boat.mp4',
  rainforest: '/videos/rainforest.mp4',
  blend: '/videos/blend.mp4',
  culture: '/videos/city.mp4',
  beach: '/videos/beach.mp4',
  tropical: '/videos/beach.mp4', 
  paradise: '/videos/beach.mp4',
  european: '/videos/city.mp4',
  city: '/videos/city.mp4',
  cultural: '/videos/city.mp4',
  australian: '/videos/hotel.mp4',
  luxury: '/videos/hotel.mp4',
  mountain: '/videos/mountain.mp4',
  country: '/videos/mountain.mp4',
  retreat: '/videos/mountain.mp4',
  nature: '/videos/mountain.mp4',
  exotic: '/videos/mountain.mp4',
  something: '/videos/something-else.mp4'
};

const findMatchingVideo = (optionText: string): string | null => {
  const lowercaseText = optionText.toLowerCase();
  for (const [keyword, videoPath] of Object.entries(VIDEO_MAPPINGS)) {
    if (lowercaseText.includes(keyword)) {
      return videoPath;
    }
  }
  return null;
};

export const AppleCardsCarousel: React.FC<AppleCardsCarouselProps> = ({
  items,
  onSelect
}) => {
  const [activeCard, setActiveCard] = useState<number | null>(null);

  return (
    <div className="w-full overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory">
      <div className="flex gap-3 px-4 py-2 min-w-min">
        {items.map((item, idx) => {
          const videoPath = findMatchingVideo(item);
          
          return (
            <motion.div
              key={idx}
              className={cn(
                // Base styles with snap
                "snap-center shrink-0 cursor-pointer relative",
                // Smaller width for mobile to fit more cards
                "w-[140px] sm:w-[200px] md:w-[250px]",
                "h-[200px] sm:h-[300px] md:h-[350px]",
                // Background and border
                "bg-zinc-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl",
                "border border-zinc-700/50",
                // Shadow and hover effects
                activeCard === idx ? "shadow-2xl" : "shadow-lg",
                "hover:scale-105 transition-all duration-300",
                // Flex layout for content
                "flex items-center justify-center"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveCard(idx);
                onSelect(item);
              }}
            >
              {videoPath && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover rounded-xl sm:rounded-2xl opacity-50"
                >
                  <source src={videoPath} type="video/mp4" />
                </video>
              )}
              <div className="relative z-10 p-2 sm:p-4">
                <p className="text-zinc-100 text-center text-sm sm:text-base md:text-lg font-medium break-words">
                  {item}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AppleCardsCarousel;