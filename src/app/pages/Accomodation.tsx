// src/components/Accommodation.tsx

import React, { useState } from "react";
import { PillButton, SelectablePillButton } from "@/app/components/PillButton";
import GlowingButton from '@/app/components/GlowingButton'; // Ensure this matches Vibe.tsx
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
        What type of accommodation do you prefer?
      </h2>
      <p className="text-md font-merriweather text-gray-700 mb-4">
          Select one of the accommodations or describe your own
        </p>
      <div className="flex flex-wrap gap-2">
        {Object.keys(accommodationKeywords).map((type) => (
          <SelectablePillButton 
            key={type} 
            selected={selectedType === type}
            onClick={() => handleTypeSelect(type as AccommodationType)}
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
            placeholder="Describe your preferred accommodation"
            className="w-full py-3 px-4 border border-purple-600 text-purple-600 rounded-full"
          />
        </div>
      )}
    </div>
  );
}

export default Accommodation;
