// // src/components/NavigationButtons.tsx

// import React from 'react';
// import { Button } from "@/app/components/GlowButton";

// interface NavigationButtonsProps {
//   currentStep: number;
//   totalSteps: number;
//   onBack: () => void;
//   onNext: () => void;
//   isNextEnabled: boolean;
// }

// const NavigationButtons: React.FC<NavigationButtonsProps> = ({
//   currentStep,
//   totalSteps,
//   onBack,
//   onNext,
//   isNextEnabled
// }) => {
//   const isLastStep = currentStep === totalSteps;

//   return (
//     <div className="flex justify-between px-6 py-4">
//       <Button
//         onClick={onBack}
//         disabled={currentStep === 1}
//         className="px-6 py-2 border border-purple-600 text-purple-600 rounded-full"
//       >
//         Back
//       </Button>
//       <Button
//         onClick={onNext}
//         disabled={!isNextEnabled}
//         className="px-6 py-2 bg-purple-600 text-white rounded-full"
//       >
//         {isLastStep ? "Create →" : "Next"}
//       </Button>
//     </div>
//   );
// };

// export default NavigationButtons;
