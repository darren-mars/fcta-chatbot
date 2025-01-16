// src/components/Activities.tsx

import React, { useState } from "react";
import PillButton from "@/app/components/PillButton";
import TinderSwiper from "@/app/components/TinderSwiper";
import { Selection } from "@/types";

type ActivityType = "Sightseeing" | "Outdoor Adventures" | "Cultural Experiences" | "Food & Drink" | "Relaxation";

const activityKeywords: Record<ActivityType, string[]> = {
  "Sightseeing": ["Landmarks", "City Tours", "Museums", "Scenic Spots"],
  "Outdoor Adventures": ["Hiking", "Kayaking", "Ziplining", "Rock Climbing"],
  "Cultural Experiences": ["Theatre", "Local Markets", "Workshops", "Festivals"],
  "Food & Drink": ["Wine Tasting", "Street Food", "Fine Dining", "Breweries"],
  "Relaxation": ["Spa Day", "Beach Lounging", "Yoga Retreats", "Nature Walks"],
};

interface ActivitiesProps {
  onSelect: (selection: Selection) => void;
  selections: Selection[];
  onFreeTextChange: (text: string) => void;
  setKeywords: (keywords: string[]) => void;
}

const Activities: React.FC<ActivitiesProps> = ({ onSelect, selections, onFreeTextChange, setKeywords }) => {
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showFreeText, setShowFreeText] = useState(false);
  const [freeText, setFreeText] = useState("");

  const handleTypeSelect = (type: ActivityType) => {
    setSelectedType(type);
    setSelectedKeywords([]);
    onSelect({ type, selectedKeywords: [], freeText: "" });
    setKeywords(activityKeywords[type]);
  };

  const handleKeywordSwipe = (keyword: string, direction: 'left' | 'right') => {
    if (direction === 'right') {
      setSelectedKeywords(prev => prev.includes(keyword) ? prev : [...prev, keyword]);
    }
  };

  const handleFreeTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFreeText(e.target.value);
    onFreeTextChange(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedType) {
      onSelect({ type: selectedType, selectedKeywords, freeText });
      setSelectedType(null);
      setSelectedKeywords([]);
      setFreeText("");
      setShowFreeText(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="text-2xl font-merriweather text-purple-800 mb-4">
        What kind of activities are you interested in?
      </h2>

      <div className="flex flex-wrap gap-2">
        {Object.keys(activityKeywords).map((type) => (
          <PillButton
            key={type}
            selected={selectedType === type}
            onClick={() => handleTypeSelect(type as ActivityType)}
          >
            {type}
          </PillButton>
        ))}
      </div>

      {selectedType && (
        <div className="flex flex-col items-center mt-8 w-full md:hidden">
          <TinderSwiper
            cards={activityKeywords[selectedType]}
            onSwipe={handleKeywordSwipe}
            onFinish={() => console.log("Swiping finished")}
          />
        </div>
      )}

      <PillButton onClick={() => setShowFreeText(!showFreeText)} className="bg-purple-300 text-purple-600 mt-4">
        {showFreeText ? "Hide" : "Describe Activity"}
      </PillButton>

      {showFreeText && (
        <input
          type="text"
          value={freeText}
          onChange={handleFreeTextChange}
          placeholder="Describe your preferred activities"
          className="w-full py-3 px-4 border border-purple-600 text-purple-600 rounded-full mt-2"
        />
      )}
    </div>
  );
};

export default Activities;