"use client";

import React, { useState } from "react";
import Header from '../components/Header';
import { Stepper } from '../components/Stepper';
import Vibe from '../pages/Vibe';
import Season from '../pages/Season';
import Accommodation from '../pages/Accomodation';
import Activities from '../pages/Activities';
import TinderSwiper from '@/app/components/TinderSwiper';
import { UserSelections, Selection } from '@/types';

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
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showFinalJSON, setShowFinalJSON] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [requestsLog, setRequestsLog] = useState<string>("");

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
          vibes: userSelections.vibes.map(v => ({
            category: v.type,
            keywords: v.selectedKeywords,
            notes: v.freeText || undefined
          })),
          season: userSelections.season.map(s => ({
            category: s.type,
            keywords: s.selectedKeywords,
          })),
          accommodation: userSelections.accommodation.map(a => ({
            category: a.type,
            keywords: a.selectedKeywords,
          })),
          activities: userSelections.activities.map(a => ({
            category: a.type,
            keywords: a.selectedKeywords,
          })),
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

        const { finalQuery, relevantContext, systemPrompt } = responseData;

        // Log the request to Databricks
        const databricksRequest = {
          num_results: 3,
          columns: ['content_chunk'],
          query_text: finalQuery,
        };

        setRequestsLog(`Databricks Request:\n${JSON.stringify(databricksRequest, null, 2)}\n\n`);

        // Log the request to Llama API
        const llamaRequest = {
          messages: [
            {
              role: 'system',
              content: `${systemPrompt}\n\n${relevantContext}`,
            },
            {
              role: 'user',
              content: finalQuery,
            },
          ],
        };

        setRequestsLog(prevLog => prevLog + `Llama API Request:\n${JSON.stringify(llamaRequest, null, 2)}\n\n`);

        // Extract the assistant's response from the API response
        const assistantResponse = responseData.result.data_array[0][0];
        setAiResponse(assistantResponse);

      } catch (error) {
        console.error('Error in fetching AI response:', error);
        setError('Failed to fetch AI response. Please try again later.');
      }
    }
  };

  return (
    <div className="flex h-screen bg-white p-8 overflow-hidden">
      {showFinalJSON ? (
        // Final JSON and AI Response Display
        <div className="w-full flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold text-purple-800 mb-4">Your Trip Preferences ✨</h2>
          <div className="flex space-x-4">
            <pre className="bg-gray-100 p-6 rounded-lg text-left max-w-3xl overflow-x-auto shadow-md">
              {requestsLog}
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
              setRequestsLog(""); // Clear requests log
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
                  <div className="w-full h-full max-w-xl">
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
