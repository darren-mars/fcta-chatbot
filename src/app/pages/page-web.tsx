import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion
import { Stepper } from '../components/Stepper';
import Vibe from '../pages/Vibe';
import Season from '../pages/Season';
import Accommodation from '../pages/Accomodation';
import Activities from '../pages/Activities';
import TinderSwiper from '../components/TinderSwiper';
import { UserSelections, Selection } from '../../types';
import PlaneTicket from '../components/PlaneTicket';
import { PillButton } from '../components/PillButton';
import { LayoutGrid } from '../components/LayoutGrid'; // Import LayoutGrid

function StepflowFctaWeb() {
  const steps = [Vibe, Season, Accommodation, Activities];
  const totalSteps = steps.length;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userSelections, setUserSelections] = useState<UserSelections>({
    vibes: [],
    season: [],
    accommodation: [],
    activities: [],
  });
  const [currentKeywords, setCurrentKeywords] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState<{ itinerary?: string; package?: string } | null>(null);
  const [showFinalJSON, setShowFinalJSON] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showJsonView, setShowJsonView] = useState<boolean>(false); // Toggle state



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
  };

  const handleKeywordSwipe = (keyword: string, direction: 'left' | 'right') => {
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
      if (updatedSelections.length === 0) {
        // If there are no selections, add a new selection with just the free text
        updatedSelections.push({ type: 'FreeText', freeText: text });
      } else {
        const lastSelection = updatedSelections[updatedSelections.length - 1];
        if (lastSelection) {
          lastSelection.freeText = text;
        }
      }
      return { ...prev, [currentStepKey]: updatedSelections };
    });
  };

  const handleNextStep = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setCurrentKeywords([]);
    } else {
      setShowFinalJSON(true);
      setIsLoading(true);
  
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userSelections),
        });
  
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }
  
        const responseData = await response.json();
        console.log('AI API Response:', responseData);
        // Set aiResponse directly to the response data
        setAiResponse(responseData);
  
      } catch (error: unknown) {
        console.error('Error in fetching AI response:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  
  

  return (
    <div className="flex flex-col h-screen bg-white p-8 overflow-hidden">
      {/* Toggle Switch */}
      <div className="flex justify-center mb-4">
        <input
          type="checkbox"
          className="toggle"
          checked={showJsonView}
          onChange={() => setShowJsonView(!showJsonView)}
        />
      </div>

      {showJsonView ? (
        // JSON View
        <div className="flex flex-row space-x-4 overflow-x-auto">
          <div className="flex flex-col p-4 w-1/5">
            <h2 className="text-xl font-bold mb-4">User Selections ➡️</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto h-full">
              {JSON.stringify(userSelections, null, 2)}
            </pre>
          </div>
          <div className="flex flex-col p-4 w-1/5">
            <h2 className="text-xl font-bold mb-4">Generated Itinerary</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto h-full">
              {JSON.stringify(aiResponse, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="flex flex-1">
          {showFinalJSON ? (
            // Final JSON and AI Response Display
            <div className="w-full flex flex-col items-center justify-center">
              <div className="flex space-x-4 w-full">
                <div className="flex space-x-4 w-full">
                <PlaneTicket loading={isLoading} aiResponse={aiResponse} />
                </div>
              </div>
              {error && <div className="text-red-500 mt-4">{error}</div>}
              <button
                className="mt-6 px-6 py-3 rounded-full bg-purple-900 text-white font-medium"
                onClick={() => {
                  setCurrentStep(1);
                  setShowFinalJSON(false);
                  setUserSelections({ vibes: [], season: [], accommodation: [], activities: [] });
                  setAiResponse(null);
                  setError(null);
                }}
              >
                Start Over
              </button>
            </div>
          ) : (
            <>
              <div className="flex w-full items-center justify-center">
                {/* Left side - Swiper or LayoutGrid */}
                <div className="w-1/2 pr-4">
                  <div className="border-1 rounded-xl p-6 h-full w-full flex flex-col">
                    {currentKeywords.length > 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-full h-1/2 max-w-xl">
                          <TinderSwiper
                            cards={currentKeywords}
                            onSwipe={handleKeywordSwipe}
                            onFinish={() => setCurrentKeywords([])}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-screen py-20 w-full">
                      <LayoutGrid cards={cards} currentStepKey={currentStepKey} />                    </div>
                    )}
                  </div>
                </div>

                <div className="inline-block h-full w-0.5 self-stretch bg-neutral-100 opacity-100"></div>

                {/* Right side - Questions */}
                <div className="w-1/2 pl-4 ">
                  <div className="border-2 border-gray-200 rounded-xl p-6 h-full flex flex-col justify-center items-center text-center">
                    <Stepper currentStep={currentStep} totalSteps={totalSteps} />
                    <div className="mt-8 w-full flex flex-col items-center">
                      <CurrentStepComponent
                        onSelect={handleTypeSelect}
                        selections={userSelections[currentStepKey]}
                        onFreeTextChange={handleFreeTextChange}
                        setKeywords={(keywords) => {
                          setCurrentKeywords(keywords);
                        }}
                      />
                    </div>
                  </div>
                  {/* Continue button */}
                  {!showFinalJSON && (
                    <div className="flex justify-center mt-8">
                      <PillButton
                        className="bg-[#30123C] text-white w-1/3 text-lg flex items-center justify-center"
                        onClick={handleNextStep}
                      >
                        {currentStep === totalSteps ? 'Create' : 'Continue'}
                      </PillButton>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default StepflowFctaWeb;

const cards = [
  {
    id: 1,
    content: <div>Content for card 1</div>,
    className: 'md:col-span-2',
  },
  {
    id: 2,
    content: <div>Content for card 2</div>,
    className: 'col-span-1',
  },
  {
    id: 3,
    content: <div>Content for card 3</div>,
    className: 'col-span-1',
  },
  {
    id: 4,
    content: <div>Content for card 4</div>,
    className: 'md:col-span-2',
  },

];