import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion
import { Stepper } from '../components/Stepper';
import Vibe from '../pages/Vibe';
import Season from '../pages/Season';
import Accommodation from '../pages/Accomodation';
import Activities from '../pages/Activities';
import TinderSwiper from '../components/TinderSwiper';
import { UserSelections, Selection } from '../../types';
import PlaneTicket from '../components/PlaneTicket';

const steps = [Vibe, Season, Accommodation, Activities];

const vibeKeywords = {
  "Relaxing": ["Beach Retreat", "Spa Day", "Mountain Getaway", "Yoga Retreat"],
  "Adventurous": ["Safari Adventure", "Jungle Trekking", "Skydiving", "Mountain Climbing"],
  "Cultural": ["Historical Tours", "Local Festivals", "Art Galleries", "Food Tours"],
  "Romantic": ["Sunset Cruises", "Candlelit Dinners", "Couples Spa", "Scenic Walks"],
  "Nature-Immersive": ["National Parks", "Wildlife Watching", "Camping", "Eco-Lodges"],
};

function StepflowFctaMobile() {
  const steps = [Vibe, Season, Accommodation, Activities];
  const totalSteps = steps.length;
  const bottomRef = useRef<HTMLDivElement>(null);

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
  const [showFreeText, setShowFreeText] = useState<boolean>(false); // State for showing free text input

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

    // Set keywords to trigger TinderSwiper rendering
    setCurrentKeywords(vibeKeywords[selection.type as keyof typeof vibeKeywords]);

    // Scroll to the bottom
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Scroll to the bottom after currentKeywords is updated
    if (currentKeywords.length > 0 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentKeywords]);

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

      const oauthToken = process.env.NEXT_PUBLIC_OAUTH_TOKEN || "dapi0ec22d874c1b479080fac1afc5088e97"; // Replace with actual token retrieval logic

      if (!oauthToken) {
        setError('OAuth token is missing. Please log in.');
        setIsLoading(false);
        return;
      }

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

  return (
    <div className="flex flex-col h-screen bg-white p-4 overflow-hidden">
      {showFinalJSON ? (
        <PlaneTicket loading={isLoading} aiResponse={aiResponse} />
      ) : (
        <div className="flex flex-col h-full overflow-y-auto">
          <Stepper currentStep={currentStep} totalSteps={totalSteps} />
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full flex-1">
              <div className="border-2 border-gray-200 rounded-xl p-4 mt-8 h-full flex flex-col justify-center items-center text-center">
                <div className="mt-4 w-full flex flex-col items-center">
                  <CurrentStepComponent
                    onSelect={handleTypeSelect}
                    selections={userSelections[currentStepKey]}
                    onFreeTextChange={handleFreeTextChange}
                    setKeywords={(keywords) => setCurrentKeywords(keywords)}
                  />
                </div>
              </div>
            </div>

            {currentKeywords.length > 0 && (
              <div className="w-full mb-4 flex-none">
                <div className="border-1 rounded-xl p-4 h-full w-full flex flex-col">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-full h-auto max-w-sm mt-12">
                      <TinderSwiper
                        cards={currentKeywords}
                        onSwipe={handleKeywordSwipe}
                        onFinish={() => setCurrentKeywords([])}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}


              <div className="flex flex-col items-center mt-4 mb-6">
                <button
                  className="px-8 py-2 text-white mt-8 bg-[#481a5a] rounded-full"
                  onClick={handleNextStep}
                >
                  {currentStep === totalSteps ? 'Create' : '→'}
                </button>
              </div>

              <div ref={bottomRef}></div>

          </div>
        </div>
      )}
    </div>
  );
}

export default StepflowFctaMobile;
