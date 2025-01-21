// src/app/pages/Vibe.tsx

import React, { useState } from "react";
import { PillButton, SelectablePillButton } from "../components/PillButton";
import GlowingButton from '../components/GlowingButton';
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
    <div className="flex flex-col items-start gap-4 items-center ">
      <h2 className="text-2xl font-merriweather text-[#30123C] mb-1">
        What kind of vibe would you like your trip to have?
      </h2>
      <p className="text-md font-merriweather text-gray-700 mb-4">
          Select one of the experiences or describe your own
        </p>
      <div className="flex flex-wrap gap-2">
        {vibeTypes.map((type) => (
          <SelectablePillButton 
            key={type} 
            selected={selectedType === type}
            onClick={() => handleTypeSelect(type)}
          >
            {type}
          </SelectablePillButton>
        ))}
      </div>
      <div className="w-full flex justify-center mt-4">
      <GlowingButton 
  onClick={() => setShowFreeText(!showFreeText)} 
  showFreeText={showFreeText} 
/>

</div>




      {showFreeText && (
        <div className="w-full mt-4 ">
          
          <input
            type="text"
            value={freeText}
            onChange={handleFreeTextChange}
            placeholder="Describe your experience"
            className="w-full py-3 px-4 border text-purple-600 rounded-full"
          />
          
        </div>
      )}
    </div>
  );
}

export default Vibe;
