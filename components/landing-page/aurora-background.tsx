"use client";

import React from "react";

export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black">
      {/* 
        The "Absolute Void" Aesthetic
        No grids, no lines. Just pure pitch black and a soft spotlight.
      */}

      {/* Stark White Spotlight centered perfectly behind the headline */}
      {/* We use an ellipse so it spreads wider horizontally to cover the long headline */}
      <div className="absolute top-[35vh] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vh] rounded-[100%] bg-white/[0.04] blur-[120px]" />

      {/* A second, smaller, slightly more intense white core glow directly behind the text */}
      <div className="absolute top-[35vh] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[20vh] rounded-[100%] bg-white/[0.05] blur-[100px]" />

      {/* Aggressive Dark Vignette to crush the edges and corners to pure pitch black */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_10%,_#000000_80%)]" />
    </div>
  );
}
