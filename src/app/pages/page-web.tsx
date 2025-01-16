import React, { useState } from "react";
import Header from '../components/Header';
import { Stepper } from '../components/Stepper';
import Vibe from '../pages/Vibe';
import Season from '../pages/Season';
import Accommodation from '../pages/Accomodation';
import Activities from '../pages/Activities';
import TinderSwiper from '@/app/components/TinderSwiper';
import { UserSelections, Selection } from '@/types';
import Image from 'next/image';

const steps = [Vibe, Season, Accommodation, Activities];

function StepflowFctaWeb() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userSelections, setUserSelections] = useState<UserSelections>({
    vibes: [],
    season: [],
    accommodation: [],
    activities: [],
  });
  const [currentKeywords, setCurrentKeywords] = useState<string[]>([]);
  const [currentImage, setCurrentImage] = useState("");
  const [showFinalJSON, setShowFinalJSON] = useState<boolean>(false); // 👈 Added state

  const CurrentStepComponent = steps[currentStep - 1] as React.FC<{
    onSelect: (selection: Selection) => void;
    selections: Selection[];
    onFreeTextChange: (text: string) => void;
    setKeywords: (keywords: string[]) => void;
  }>;
  const currentStepKey = ['vibes', 'season', 'accommodation', 'activities'][currentStep - 1] as keyof UserSelections;

  const handleTypeSelect = (selection: Selection) => {
    setUserSelections((prev: UserSelections) => {
      const updatedSelections = [...prev[currentStepKey]];
      updatedSelections.push(selection);
      return { ...prev, [currentStepKey]: updatedSelections };
    });
    setCurrentImage(`/path-to-${selection.type.toLowerCase()}-image.jpg`);
  };

  const handleKeywordSwipe = (keyword: string, direction: 'left' | 'right') => {
    // Add keyword only on "right" swipe (selection)
    if (direction === 'right') {
      setUserSelections((prev: UserSelections) => {
        const updatedSelections = [...prev[currentStepKey]];
        if (updatedSelections.length > 0) {
          const lastSelection = updatedSelections[updatedSelections.length - 1];
          if (lastSelection && !lastSelection.selectedKeywords?.includes(keyword)) {
            lastSelection.selectedKeywords?.push(keyword);
          }
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

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowFinalJSON(true);
    }
  };


  return (
    <div className="flex h-screen bg-white p-8 overflow-hidden">
      {showFinalJSON ? (
        // 🎉 Final JSON Display
        <div className="w-full flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold text-purple-800 mb-4">Your Trip Preferences ✨</h2>
          <pre className="bg-gray-100 p-6 rounded-lg text-left max-w-3xl overflow-x-auto shadow-md">
            {JSON.stringify(userSelections, null, 2)}
          </pre>
          <button
            className="mt-6 px-6 py-3 rounded-full bg-purple-600 text-white font-medium"
            onClick={() => {
              setCurrentStep(1); 
              setShowFinalJSON(false); 
              setUserSelections({ vibes: [], season: [], accommodation: [], activities: [] });
            }}
          >
            Start Over 🔄
          </button>
        </div>
      ) : (
        <>
          {/* Left side - Swiper */}
          <div className="w-1/2 pr-4">
            <div className="border-2 border-gray-200 rounded-xl p-6 h-full w-full flex flex-col">
              {currentKeywords.length > 0 && (
              <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full h-full max-w-xl"> {/* Increased max-width and added full height */}
                <TinderSwiper
                  cards={currentKeywords}
                  onSwipe={handleKeywordSwipe}
                  onFinish={() => console.log("Swiping finished")}
                />
              </div>
            </div>
             
              )}
            </div>
          </div>

          {/* Right side - Questions */}
          <div className="w-1/2 pl-4">
            <div className="border-2 border-gray-200 rounded-xl p-6 h-full">
              <Header />
              <Stepper currentStep={currentStep} totalSteps={steps.length} />
              <div className="mt-8">
              <CurrentStepComponent
              onSelect={handleTypeSelect}
              selections={userSelections[currentStepKey]}
              onFreeTextChange={handleFreeTextChange}
              setKeywords={(keywords) => {
                setCurrentKeywords(keywords);
              }}
            />
                <button
                  className="px-6 py-2 rounded-full bg-purple-600 text-white mt-4"
                  onClick={handleNextStep}
                >
                  {currentStep === steps.length ? "Create ✨" : "Continue"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StepflowFctaWeb;