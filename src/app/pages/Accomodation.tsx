// src/components/Accommodation.tsx

import React, { useState } from "react";
import PillButton from "@/app/components/PillButton";
import TinderSwiper from "@/app/components/TinderSwiper";
import { Selection } from "@/types";

type AccommodationType = "Hotel" | "Resort" | "Vacation Rental" | "Boutique Hotel" | "Camping";

const accommodationKeywords: Record<AccommodationType, string[]> = {
  "Hotel": ["Luxury Hotel", "Business Hotel", "Budget Hotel", "All-Inclusive"],
  "Resort": ["Beach Resort", "Mountain Resort", "Eco-Resort", "Wellness Resort"],
  "Vacation Rental": ["Apartments", "Villas", "Cabins", "Condos"],
  "Boutique Hotel": ["Artistic", "Historic", "Modern", "Quirky"],
  "Camping": ["Glamping", "Tent Camping", "RV Camping", "Backcountry"],
};

interface AccommodationProps {
  onSelect: (selection: Selection) => void;
  selections: Selection[];
  onFreeTextChange: (text: string) => void;
  setKeywords: (keywords: string[]) => void;
}

const Accommodation: React.FC<AccommodationProps> = ({ onSelect, selections, onFreeTextChange, setKeywords }) => {
  const [selectedType, setSelectedType] = useState<AccommodationType | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [showFreeText, setShowFreeText] = useState(false);
  const [freeText, setFreeText] = useState("");

  const handleTypeSelect = (type: AccommodationType) => {
    if (selectedType === type) {
      setSelectedType(null); // Deselect type
      setKeywords([]); // Clear keywords when type is deselected
    } else {
      setSelectedType(type);
      setSelectedKeywords([]);
      onSelect({ type, selectedKeywords: [], freeText: "" });
      setKeywords(accommodationKeywords[type]); // Pass keywords to page-mobile
    }
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
        What type of accommodation do you prefer?
      </h2>

      <div className="flex flex-wrap gap-2">
        {Object.keys(accommodationKeywords).map((type) => (
          <PillButton
            key={type}
            selected={selectedType === type}
            onClick={() => handleTypeSelect(type as AccommodationType)}
          >
            {type}
          </PillButton>
        ))}
      </div>

      {selectedType && (
        <div className="flex flex-col items-center mt-8 w-full md:hidden">
          <TinderSwiper
            cards={accommodationKeywords[selectedType]}
            onSwipe={handleKeywordSwipe}
            onFinish={() => console.log("Swiping finished")}
          />
        </div>
      )}

      <PillButton onClick={() => setShowFreeText(!showFreeText)} className="bg-purple-300 text-purple-600 mt-4">
        {showFreeText ? "Hide" : "Describe Accommodation"}
      </PillButton>

      {showFreeText && (
        <input
          type="text"
          value={freeText}
          onChange={handleFreeTextChange}
          placeholder="Describe your preferred accommodation"
          className="w-full py-3 px-4 border border-purple-600 text-purple-600 rounded-full mt-2"
        />
      )}
    </div>
  );
};

export default Accommodation;
