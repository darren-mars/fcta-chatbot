// src/app/pages/Season.tsx

import React, { useState } from "react";
import PillButton from "@/app/components/PillButton";
import TinderSwiper from "@/app/components/TinderSwiper";

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
    setSelectedType(type);
    setSelectedKeywords([]);
    onSelect({ type, selectedKeywords: [], freeText: "" });
    setKeywords(seasonKeywords[type]); // Pass keywords to page-mobile
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
        What season inspires your ideal escape?
      </h2>
      <div className="flex flex-wrap gap-2">
        {seasonTypes.map((type) => (
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
            cards={seasonKeywords[selectedType]}
            onSwipe={handleKeywordSwipe}
            onFinish={() => console.log("Swiping finished")}
          />
        </div>
      )}

      <PillButton
        onClick={() => setShowFreeText(!showFreeText)}
        className="bg-purple-300 text-purple-600 mt-4"
      >
        {showFreeText ? "Hide" : "Describe Ideal Season"}
      </PillButton>

      {showFreeText && (
        <div className="w-full mt-4">
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