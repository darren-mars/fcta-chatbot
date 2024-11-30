"use client";

import React from "react";

const VideoBanner = () => {
  return (
    <div className="relative w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-[30vh] object-cover scale-74" // Adjust the scale to zoom out
      >
        <source src="/videos/banner.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

    </div>
  );
};

export default VideoBanner;