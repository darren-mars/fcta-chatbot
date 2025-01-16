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
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showFinalJSON, setShowFinalJSON] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      const lastSelection = updatedSelections[updatedSelections.length - 1];
      lastSelection.freeText = text;
      return { ...prev, [currentStepKey]: updatedSelections };
    });
  };

  const handleNextStep = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowFinalJSON(true);

      // Prepare the JSON structure as required
      const formattedSelections = {
        userSelections: {
          vibes: userSelections.vibes,
          season: userSelections.season,
          accommodation: userSelections.accommodation,
          activities: userSelections.activities,
        }
      };

      // Retrieve the OAuth token
      const oauthToken = process.env.NEXT_PUBLIC_OAUTH_TOKEN || "dapi0ec22d874c1b479080fac1afc5088e97"; // Replace with actual token retrieval logic

      if (!oauthToken) {
        setError('OAuth token is missing. Please log in.');
        return;
      }

      // Call the API with userSelections
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userSelections: formattedSelections.userSelections,
            oauthToken,
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${await response.text()}`);
        }

        const responseData = await response.json();
        console.log('AI API Response:', responseData);

        // Extract the assistant's response from the API response
        const assistantResponse = responseData.result.data_array[0][0];
        setAiResponse(assistantResponse);

      } catch (error) {
        console.error('Error in fetching AI response:', error);
        setError('Failed to fetch AI response. Please try again later.');
      }
    }
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
          {showFinalJSON ? (
            // Final JSON and AI Response Display
            <div className="w-full flex flex-col items-center justify-center">
              <h2 className="text-3xl font-bold text-purple-800 mb-4">Your Trip Preferences ✨</h2>
              <div className="flex space-x-4">
                <pre className="bg-gray-100 p-6 rounded-lg text-left max-w-3xl overflow-x-auto shadow-md">
                  {JSON.stringify(userSelections, null, 2)}
                </pre>
                <pre className="bg-gray-100 p-6 rounded-lg text-left max-w-3xl overflow-x-auto shadow-md">
                  {aiResponse || 'Fetching AI response...'}
                </pre>
              </div>
              {error && <div className="text-red-500 mt-4">{error}</div>}
              <button
                className="mt-6 px-6 py-3 rounded-full bg-purple-600 text-white font-medium"
                onClick={() => {
                  setCurrentStep(1);
                  setShowFinalJSON(false);
                  setUserSelections({ vibes: [], season: [], accommodation: [], activities: [] });
                  setAiResponse(null);
                  setError(null);
                }}
              >
                Start Over 🔄
              </button>
            </div>
          ) : (
            <CurrentStepComponent
              onSelect={handleTypeSelect}
              selections={userSelections[currentStepKey]}
              onFreeTextChange={handleFreeTextChange}
              setKeywords={(keywords) => {
                setCurrentKeywords(keywords);
              }}
            />
          )}
          <button
            className="px-6 py-2 rounded-full bg-purple-600 text-white mt-4"
            onClick={handleNextStep}
          >
            {currentStep === steps.length ? "Create ✨" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StepflowFctaMobile;
