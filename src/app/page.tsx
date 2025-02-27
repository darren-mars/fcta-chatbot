"use client";

import React, { useEffect, useState } from 'react';
import ResponsiveStepflow from './pages/page-web';

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showFlow, setShowFlow] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowFlow(true);
    }, 2000);
  };

  if (!isClient) {
    return null;
  }

  if (showFlow) {
    return <ResponsiveStepflow />;
  }

  return (
    <div className={`relative min-h-screen overflow-hidden transition-all duration-[2000ms] ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/videos/landing.mp4" type="video/mp4" />
      </video>

      <div className="relative z-20 flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-7 mt-80 text-sm text-center">
          <button
            onClick={handleStart}
            className="px-5 py-1 bg-violet-100/20 backdrop-blur-sm text-white rounded-3xl hover:bg-violet-500/40 transition-colors tracking-wider text-xl"
            style={{ fontFamily: 'TrajanPro, serif' }}
          >
            Begin
          </button>
        </div>
      </div>
    </div>
  );
}