"use client";

import React from "react";
import * as SubframeCore from "@subframe/core";

interface StepperRootProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const StepperRoot = React.forwardRef<HTMLElement, StepperRootProps>(
  function StepperRoot(
    { currentStep, totalSteps, className, ...otherProps }: StepperRootProps,
    ref
  ) {
    const segments = Array.from({ length: totalSteps }, (_, index) => index < currentStep);

    return (
      <div
        className={SubframeCore.twClassNames(
          "flex w-full h-2 gap-2",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        {segments.map((filled, index) => (
          <div
            key={index}
            className={`flex-1 h-full rounded-full transition-all duration-300 ${filled ? 'bg-[#30123C]' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    );
  }
);

export const Stepper = StepperRoot;
