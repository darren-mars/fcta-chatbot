"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/utils";

type Card = {
  id: number;
  content: JSX.Element | React.ReactNode | string;
  className: string;
};

type UserSelections = {
  vibes: string;
  season: string;
  accommodation: string;
  activities: string;
};

const thumbnailSets: Record<keyof UserSelections, string[]> = {
  vibes: [
    'https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  ],
  season: [
    'https://unsplash.com/photos/OgcJIKRnRC8/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8OHx8d2ludGVyfGVufDB8fHx8MTczNzI3NzYxNHww&force=true',
    'https://unsplash.com/photos/wUWP53W7KbY/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTd8fGZhbGx8ZW58MHx8fHwxNzM3MzAwMTk3fDI&force=true',
    'https://unsplash.com/photos/88X1AIHuqeI/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTV8fHNwcmluZyUyMHRyZWVzfGVufDB8fHx8MTczNzM0MTU1MXwy&force=true',
    'https://unsplash.com/photos/-IwbJJfoC80/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8M3x8c3VtbWVyJTIwcmVzb3J0fGVufDB8fHx8MTczNzM0MTMxOHww&force=true',
  ],
  accommodation: [
    'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://unsplash.com/photos/1azAjl8FTnU/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8OXx8bHV4dXJ5JTIwY2FtcGluZ3xlbnwwfHx8fDE3MzczNDE1Nzl8Mg&force=true',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'https://unsplash.com/photos/UMqrwuwEVmQ/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8NXx8YmFsaSUyMGx1eHVyeXxlbnwwfHx8fDE3MzczNDE2NTR8Mg&force=true'
  ],
  activities: [
    'https://images.unsplash.com/photo-1475070929565-c985b496cb9f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  ]
};

export const LayoutGrid = ({ cards, currentStepKey }: { cards: Card[], currentStepKey: keyof UserSelections }) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [lastSelected, setLastSelected] = useState<Card | null>(null);

  const handleClick = (card: Card) => {
    setLastSelected(selected);
    setSelected(card);
  };

  const handleOutsideClick = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  return (
    <div className="w-full h-full p-10 grid grid-cols-1 md:grid-cols-3  max-w-7xl mx-auto gap-4 relative">
      {cards.map((card, i) => (
        <div key={i} className={cn(card.className, "")}>
          <motion.div
            onClick={() => handleClick(card)}
            className={cn(
              card.className,
              "relative overflow-hidden",
              selected?.id === card.id
                ? "rounded-lg cursor-pointer absolute inset-0 h-1/2 w-full md:w-1/2 m-auto z-50 flex justify-center items-center flex-wrap flex-col"
                : lastSelected?.id === card.id
                ? "z-40 bg-white rounded-xl h-full w-full"
                : "bg-white rounded-xl h-full w-full"
            )}
            layoutId={`card-${card.id}`}
          >
            {selected?.id === card.id && <SelectedCard selected={selected} />}
            <ImageComponent card={card} index={i} currentStepKey={currentStepKey} />
          </motion.div>
        </div>
      ))}
      <motion.div
        onClick={handleOutsideClick}
        className={cn(
          "absolute h-full w-full left-0 top-0 bg-black opacity-0 z-10",
          selected?.id ? "pointer-events-auto" : "pointer-events-none"
        )}
        animate={{ opacity: selected?.id ? 0.3 : 0 }}
      />
    </div>
  );
};

const ImageComponent = ({ card, index, currentStepKey }: { card: Card, index: number, currentStepKey: keyof UserSelections }) => {
  return (
    <motion.img
      layoutId={`image-${card.id}-image`}
      src={thumbnailSets[currentStepKey][index]}
      height="500"
      width="500"
      className={cn(
        "object-cover object-top absolute inset-0 h-full w-full transition duration-200"
      )}
    />
  );
};

const SelectedCard = ({ selected }: { selected: Card | null }) => {
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-[60]">
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 0.6,
        }}
        className="absolute inset-0 h-full w-full bg-black opacity-60 z-10"
      />
      <motion.div
        layoutId={`content-${selected?.id}`}
        initial={{
          opacity: 0,
          y: 100,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 100,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="relative px-8 pb-4 z-[70]"
      >
        {selected?.content}
      </motion.div>
    </div>
  );
};
