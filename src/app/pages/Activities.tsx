// src/components/Activities.tsx

import React, { useState } from "react";
import PillButton from "@/app/components/PillButton";
import TinderSwiper from "@/app/components/TinderSwiper";
import GlowingButton from '@/app/components/GlowingButton'; // Ensure this matches Vibe.tsx
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
    if (selectedType === type) {
      setSelectedType(null); // Deselect type
      setKeywords([]); // Clear keywords when type is deselected
    } else {
      setSelectedType(type);
      setSelectedKeywords([]);
      onSelect({ type, selectedKeywords: [], freeText: "" });
      setKeywords(activityKeywords[type]); // Pass keywords to page-mobile
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
      <h2 className="text-2xl font-merriweather text-purple-800 mb-1">
        What kind of activities are you interested in?
      </h2>
      <p className="text-md font-merriweather text-gray-700 mb-4">
          Select one of the activities or describe your own
        </p>
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
            placeholder="Describe your preferred activities"
            className="w-full py-3 px-4 border border-purple-600 text-purple-600 rounded-full"
          />
        </div>
      )}
    </div>
  );
}

export default Activities;
