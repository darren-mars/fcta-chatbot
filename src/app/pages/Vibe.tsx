// src/app/pages/Vibe.tsx

import React, { useState } from "react";
import PillButton from "@/app/components/PillButton";
import TinderSwiper from "@/app/components/TinderSwiper";

interface Selection {
  type: string;
  selectedKeywords?: string[];
  freeText: string;
}

interface VibeProps {
  onSelect: (selection: Selection) => void;
  selections: Selection[];
  onFreeTextChange: (text: string) => void;
  setKeywords: (keywords: string[]) => void; // new prop to pass keywords to page-mobile
}

type VibeType = "Relaxing" | "Adventurous" | "Cultural" | "Romantic" | "Nature-Immersive";

const vibeTypes: VibeType[] = [
  "Relaxing",
  "Adventurous",
  "Cultural",
  "Romantic",
  "Nature-Immersive",
];

const vibeKeywords: Record<VibeType, string[]> = {
  "Relaxing": ["Beach Retreat", "Spa Day", "Mountain Getaway", "Yoga Retreat"],
  "Adventurous": ["Safari Adventure", "Jungle Trekking", "Skydiving", "Mountain Climbing"],
  "Cultural": ["Historical Tours", "Local Festivals", "Art Galleries", "Food Tours"],
  "Romantic": ["Sunset Cruises", "Candlelit Dinners", "Couples Spa", "Scenic Walks"],
  "Nature-Immersive": ["National Parks", "Wildlife Watching", "Camping", "Eco-Lodges"],
};

const Vibe: React.FC<VibeProps> = ({ onSelect, selections, onFreeTextChange, setKeywords }) => {
  const [selectedType, setSelectedType] = useState<VibeType | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showFreeText, setShowFreeText] = useState(false);
  const [freeText, setFreeText] = useState("");

  const handleTypeSelect = (type: VibeType) => {
    if (selectedType === type) {
      setSelectedType(null); // Deselect type
      setKeywords([]); // Clear keywords when type is deselected
    } else {
      setSelectedType(type);
      setSelectedKeywords([]);
      onSelect({ type, selectedKeywords: [], freeText: "" });
      setKeywords(vibeKeywords[type]); // Pass keywords to page-mobile
    }
  };

  const handleKeywordSwipe = (keyword: string, direction: 'left' | 'right') => {
    if (direction === 'right') {
      setSelectedKeywords(prev => {
        if (!prev.includes(keyword)) {
          return [...prev, keyword];
        }
        return prev;
      });
    }
  };

  const handleFreeTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFreeText(e.target.value);
    onFreeTextChange(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedType) {
      onSelect({
        type: selectedType,
        selectedKeywords,
        freeText
      });
      setSelectedType(null);
      setSelectedKeywords([]);
      setFreeText("");
      setShowFreeText(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="text-2xl font-merriweather text-purple-800 mb-4">
        What kind of vibe would you like your trip to have?
      </h2>
      <div className="flex flex-wrap gap-2">
        {vibeTypes.map((type) => (
          <PillButton 
            key={type} 
            selected={selectedType === type}
            onClick={() => handleTypeSelect(type)}
          >
            {type}
          </PillButton>
        ))}
      </div>

      {selectedType && (
        <div className="flex flex-col items-center mt-8 w-full md:hidden">
          <TinderSwiper
            cards={vibeKeywords[selectedType]}
            onSwipe={handleKeywordSwipe}
            onFinish={() => console.log("Swiping finished")}
          />
        </div>
      )}

      <PillButton
        onClick={() => setShowFreeText(!showFreeText)}
        className="bg-purple-300 text-purple-600 mt-4"
      >
        {showFreeText ? "Hide" : "Describe Experience"}
      </PillButton>

      {showFreeText && (
        <div className="w-full mt-4">
          <input
            type="text"
            value={freeText}
            onChange={handleFreeTextChange}
            placeholder="Describe your experience"
            className="w-full py-3 px-4 border border-purple-600 text-purple-600 rounded-full"
          />
        </div>
      )}
    </div>
  );
}

export default Vibe;
