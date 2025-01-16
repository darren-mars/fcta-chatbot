import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion
import Header from '../components/Header';
import { Stepper } from '../components/Stepper';
import Vibe from '../pages/Vibe';
import Season from '../pages/Season';
import Accommodation from '../pages/Accomodation';
import Activities from '../pages/Activities';
import TinderSwiper from '@/app/components/TinderSwiper';
import { UserSelections, Selection } from '@/types';
import PlaneTicket from '../components/PlaneTicket';
// import { LayoutGrid } from "../components/LayoutGrid";

const steps = [Vibe, Season, Accommodation, Activities];

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
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [showFinalJSON, setShowFinalJSON] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [requestsLog, setRequestsLog] = useState<{databricks: string, llama: string, response: string}>({
    databricks: '',
    llama: '',
    response: ''
  });
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
      setCurrentKeywords([]); // Reset current keywords to hide TinderSwiper
    } else {
      setShowFinalJSON(true);
      setIsLoading(true);

      // Prepare the JSON structure 
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
            notes: s.freeText || undefined
          })),
          accommodation: userSelections.accommodation.map(a => ({
            category: a.type,
            keywords: a.selectedKeywords,
            notes: a.freeText || undefined
          })),
          activities: userSelections.activities.map(a => ({
            category: a.type,
            keywords: a.selectedKeywords,
            notes: a.freeText || undefined
          })),
        }
      };

      // Retrieve the OAuth token
      const oauthToken = process.env.NEXT_PUBLIC_OAUTH_TOKEN || "dapi0ec22d874c1b479080fac1afc5088e97"; // Replace with actual token retrieval logic

      if (!oauthToken) {
        setError('OAuth token is missing. Please log in.');
        setIsLoading(false);
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

        setRequestsLog({
          databricks: JSON.stringify(databricksRequest, null, 2),
          llama: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: `${systemPrompt}\n\n${relevantContext}`,
              },
              {
                role: 'user',
                content: finalQuery,
              },
            ]
          }, null, 2),
          response: JSON.stringify(responseData.result.data_array[0][0], null, 2)
        });

        // Extract the assistant's response from the API response
        const assistantResponse = responseData.result.data_array[0][0];
        setAiResponse(assistantResponse);
      } catch (error) {
        console.error('Error in fetching AI response:', error);
        setError('Failed to fetch AI response. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  

  const cards = [
    {
      id: '1',
      content: (
        <div>
          <p className="font-bold md:text-4xl text-xl text-white">
            House in the woods
          </p>
          <p className="font-normal text-base text-white"></p>
          <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
            A serene and tranquil retreat, this house in the woods offers a peaceful
            escape from the hustle and bustle of city life.
          </p>
        </div>
      ),
      className: "md:col-span-2",
      thumbnail:
        "https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: '2',
      content: (
        <div>
          <p className="font-bold md:text-4xl text-xl text-white">
            House above the clouds
          </p>
          <p className="font-normal text-base text-white"></p>
          <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
            Perched high above the world, this house offers breathtaking views and a
            unique living experience. It&apos;s a place where the sky meets home,
            and tranquility is a way of life.
          </p>
        </div>
      ),
      className: "col-span-1",
      thumbnail:
        "https://images.unsplash.com/photo-1464457312035-3d7d0e0c058e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: '3',
      content: (
        <div>
          <p className="font-bold md:text-4xl text-xl text-white">
            Greens all over
          </p>
          <p className="font-normal text-base text-white"></p>
          <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
            A house surrounded by greenery and nature&apos;s beauty. It&apos;s the
            perfect place to relax, unwind, and enjoy life.
          </p>
        </div>
      ),
      className: "col-span-1",
      thumbnail:
        "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: '4',
      content: (
        <div>
          <p className="font-bold md:text-4xl text-xl text-white">
            Rivers are serene
          </p>
          <p className="font-normal text-base text-white"></p>
          <p className="font-normal text-base my-4 max-w-lg text-neutral-200">
            A house by the river is a place of peace and tranquility. It&apos;s the
            perfect place to relax, unwind, and enjoy life.
          </p>
        </div>
      ),
      className: "md:col-span-2",
      thumbnail:
        "https://images.unsplash.com/photo-1475070929565-c985b496cb9f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];
  

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
        <span className="ml-2 text-lg">Show JSON View</span>
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
            <h2 className="text-xl font-bold mb-4">Databricks Request</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto h-full">
              {requestsLog.databricks}
            </pre>
          </div>
          <div className="flex flex-col p-4 w-1/5">
            <h2 className="text-xl font-bold mb-4">Databricks Response</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto h-full">
              {requestsLog.llama}
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
                  setRequestsLog({databricks: '', llama: '', response: ''}); // Clear requests log
                }}
              >
                Start Over
              </button>
            </div>
          ) : (
            <>
              <div className="flex w-full h-full items-center justify-center">
                {/* Left side - Swiper */}
                <div className="w-1/2 pr-4">
                  <div className="border-1 rounded-xl p-6 h-full w-full flex flex-col">
                    {currentKeywords.length > 0 && (
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-full h-1/2 max-w-xl">
                          <TinderSwiper
                            cards={currentKeywords}
                            onSwipe={handleKeywordSwipe}
                            onFinish={() => setCurrentKeywords([])}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
  
                <div className="inline-block h-full w-0.5 self-stretch bg-neutral-100 opacity-100"></div>
  
                {/* Right side - Questions */}
                <div className="w-1/2 pl-4">
                  <div className="border-2 border-gray-200 rounded-xl p-6 h-full flex flex-col justify-center items-center text-center">
                    <Header />
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
                      <button
                        className="px-6 py-3 bg-[#3d144d] text-white rounded-full font-medium"
                        onClick={handleNextStep}
                      >
                        {currentStep === totalSteps ? 'Create' : 'Continue'}
                      </button>
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
