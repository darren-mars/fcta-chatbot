// src/app/pages/Season.tsx

import React, { useState } from "react";
import { PillButton, SelectablePillButton } from "../components/PillButton";
import GlowingButton from '../components/GlowingButton'; // Ensure this matches Vibe.tsx

interface Selection {
  type: string;
  selectedKeywords?: string[];
  freeText: string;
}

interface SeasonProps {
  onSelect: (selection: Selection) => void;
  selections: Selection[];
  onFreeTextChange: (text: string) => void;
  setKeywords: (keywords: string[]) => void; // Matches Vibe.tsx
}

type SeasonType = "Spring" | "Summer" | "Fall" | "Winter";

const seasonTypes: SeasonType[] = ["Spring", "Summer", "Fall", "Winter"];

const seasonKeywords: Record<SeasonType, string[]> = {
  "Spring": ["Cherry Blossoms", "Hiking Trails", "Flower Festivals", "Mild Weather"],
  "Summer": ["Beach Days", "Outdoor Festivals", "Water Sports", "Sunny Weather"],
  "Fall": ["Leaf Peeping", "Pumpkin Patches", "Harvest Festivals", "Cool Breezes"],
  "Winter": ["Snowboarding", "Hot Springs", "Holiday Markets", "Cozy Cabins"],
};

const Season: React.FC<SeasonProps> = ({ onSelect, selections, onFreeTextChange, setKeywords }) => {
  const [selectedType, setSelectedType] = useState<SeasonType | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showFreeText, setShowFreeText] = useState(false);
  const [freeText, setFreeText] = useState("");

  const handleTypeSelect = (type: SeasonType) => {
    if (selectedType === type) {
      setSelectedType(null); // Deselect type
      setKeywords([]); // Clear keywords when type is deselected
    } else {
      setSelectedType(type);
      setSelectedKeywords([]);
      onSelect({ type, selectedKeywords: [], freeText: "" });
      setKeywords(seasonKeywords[type]); // Pass keywords to page-mobile
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
        What season inspires your ideal escape?
      </h2>
      <p className="text-md font-merriweather text-gray-700 mb-4">
          Select one of the seasons or describe your own
        </p>
      <div className="flex flex-wrap gap-2">
        {seasonTypes.map((type) => (
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
            placeholder="Describe your ideal season experience"
            className="w-full py-3 px-4 border border-purple-600 text-purple-600 rounded-full"
          />
        </div>
      )}
    </div>
  );
}

export default Season;
