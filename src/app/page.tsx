"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      router.push('/chat');
    }, 2000);
  };

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
        <div className="flex flex-col items-center gap-8 mt-96">
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-violet-100/20 backdrop-blur-sm text-white rounded-3xl hover:bg-violet-500/40 transition-colors tracking-wider text-2xl"
            style={{ fontFamily: 'TrajanPro, serif' }}
          >
            Start your journey
          </button>
        </div>
      </div>
    </div>
  );
}