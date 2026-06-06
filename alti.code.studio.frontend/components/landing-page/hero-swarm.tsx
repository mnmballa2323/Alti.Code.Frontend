"use client";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import MagicCodeBackground from "./magic-code-background";

export default function HeroSwarm() {
  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden bg-white text-black px-4 sm:px-6 lg:px-8">
      {/* Magical animated network background */}
      <MagicCodeBackground />
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto gap-10 mt-10">
        
        {/* Apple-style Headline */}
        <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter text-black leading-[1.05]">
          Autonomous engineering.
        </h1>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
          <Button 
            as={Link} 
            href="/download/windows" 
            size="lg" 
            className="w-full sm:w-auto bg-black text-white font-semibold rounded-full px-10 py-7 text-lg hover:scale-[1.02] transition-transform shadow-lg flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-5 h-5">
              <path fill="#F25022" d="M0,0 H47 V47 H0 Z" />
              <path fill="#7FBA00" d="M53,0 H100 V47 H53 Z" />
              <path fill="#00A4EF" d="M0,53 H47 V100 H0 Z" />
              <path fill="#FFB900" d="M53,53 H100 V100 H53 Z" />
            </svg>
            Download for Windows
          </Button>
          <Button 
            as={Link} 
            href="/download/mac" 
            size="lg" 
            className="w-full sm:w-auto bg-black text-white font-semibold rounded-full px-10 py-7 text-lg hover:scale-[1.02] transition-transform shadow-lg flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="w-5 h-5" fill="currentColor">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 24 184.8 8 273.5q-9 59.4 20 114.1c18.9 31.5 45.3 68.1 81.4 66.9 31-1.2 44.5-19.7 82.2-19.7 37.6 0 49.3 19 82.2 19 36.2-.6 58-31 75.9-61.9 22.8-38.3 32-77.8 33-80.4-5.3-2.6-63.6-25-64-82.8zM263.6 84.6c16.6-21.3 27.6-50 24.5-79.6-25.3 1.5-56.1 18.5-73.8 39.5-14.7 17.5-27 46.5-23.2 75.2 28.5 2.5 56.4-15.6 72.5-35.1z"/>
            </svg>
            Download for Mac
          </Button>
        </div>

        {/* Statistics Banner */}
        <div className="mt-20 w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200/60 bg-white/70 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-4 transition-all hover:shadow-3xl hover:-translate-y-1">
          <div className="flex flex-col items-center justify-center py-6 px-4 group">
            <span className="text-4xl md:text-5xl font-extrabold text-black tracking-tight group-hover:scale-105 transition-transform">50,000</span>
            <span className="text-gray-500 font-bold mt-2 text-xs md:text-sm uppercase tracking-widest">Agent Swarm</span>
          </div>
          <div className="flex flex-col items-center justify-center py-6 px-4 group">
            <span className="text-4xl md:text-5xl font-extrabold text-black tracking-tight group-hover:scale-105 transition-transform">44</span>
            <span className="text-gray-500 font-bold mt-2 text-xs md:text-sm uppercase tracking-widest">Cloud Providers</span>
          </div>
          <div className="flex flex-col items-center justify-center py-6 px-4 group">
            <span className="text-4xl md:text-5xl font-extrabold text-black tracking-tight group-hover:scale-105 transition-transform">250</span>
            <span className="text-gray-500 font-bold mt-2 text-xs md:text-sm uppercase tracking-widest">App Connectors</span>
          </div>
        </div>
      </div>
    </section>
  );
}
