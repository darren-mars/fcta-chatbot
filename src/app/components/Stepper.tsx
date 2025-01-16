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
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
      <div
        className={SubframeCore.twClassNames(
          "relative w-full h-2 bg-neutral-300 rounded",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <div
          className="absolute top-0 left-0 h-full bg-brand-100 rounded transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    );
  }
);

export const Stepper = StepperRoot;
