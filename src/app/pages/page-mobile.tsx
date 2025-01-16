// src/app/pages/page-mobile.tsx

import React, { useState, useEffect } from "react";
import Header from '../components/Header';
import { Stepper } from '../components/Stepper';
import Vibe from '../pages/Vibe';
import Season from '../pages/Season';
import Accommodation from '../pages/Accomodation';
import Activities from '../pages/Activities';
import { UserSelections, Selection } from '@/types';

const steps = [Vibe, Season, Accommodation, Activities];

function StepflowFctaMobile() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userSelections, setUserSelections] = useState<UserSelections>({
    vibes: [],
    season: [],
    accommodation: [],
    activities: [],
  });
  const [currentKeywords, setCurrentKeywords] = useState<string[]>([]);
  const [showFinalJSON, setShowFinalJSON] = useState<boolean>(false);

  const CurrentStepComponent = steps[currentStep - 1] as React.FC<{
    onSelect: (selection: Selection) => void;
    selections: Selection[];
    onFreeTextChange: (text: string) => void;
    setKeywords: (keywords: string[]) => void; // new prop to pass keywords to page-mobile
  }>;
  const currentStepKey = ['vibes', 'season', 'accommodation', 'activities'][currentStep - 1] as keyof UserSelections;

  const handleTypeSelect = (selection: Selection) => {
    setUserSelections((prev: UserSelections) => {
      const updatedSelections = [...prev[currentStepKey]];
      updatedSelections.push(selection);
      return { ...prev, [currentStepKey]: updatedSelections };
    });
  };

  const handleKeywordSwipe = (keyword: string, direction: 'left' | 'right') => {
    if (direction === 'right') {
      setUserSelections((prev: UserSelections) => {
        const updatedSelections = [...prev[currentStepKey]];
        const lastSelection = updatedSelections[updatedSelections.length - 1];
        if (!lastSelection.selectedKeywords?.includes(keyword)) {
          lastSelection.selectedKeywords?.push(keyword);
        }
        return { ...prev, [currentStepKey]: updatedSelections };
      });
    }
  };

  const handleFreeTextChange = (text: string) => {
    setUserSelections((prev: UserSelections) => {
      const updatedSelections = [...prev[currentStepKey]];
      const lastSelection = updatedSelections[updatedSelections.length - 1];
      lastSelection.freeText = text;
      return { ...prev, [currentStepKey]: updatedSelections };
    });
  };

  useEffect(() => {
    setCurrentKeywords([]);
  }, [currentStep, userSelections]);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <div className="flex-none p-4">
        {/* <Header /> */}
      </div>
      <div className="flex-none px-4 mb-4">
        <Stepper currentStep={currentStep} totalSteps={steps.length} />
      </div>
      <div className="flex-grow flex flex-col items-center px-4 pb-4">
        <div className="w-full max-w-md">
          <CurrentStepComponent
            onSelect={handleTypeSelect}
            selections={userSelections[currentStepKey]}
            onFreeTextChange={handleFreeTextChange}
            setKeywords={setCurrentKeywords} // pass setKeywords to Vibe component
          />
        </div>
      </div>
    </div>
  );
}

export default StepflowFctaMobile;
