"use client";

import { Button } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroSwarm() {
  return (
    <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-white text-black px-4 sm:px-6 lg:px-8">
      
      {/* Super subtle radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-white pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto gap-10 mt-10">
        
        {/* Top Badge */}
        <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-gray-50 shadow-sm">
          <span className="text-sm font-medium text-gray-600 tracking-wide">The Genesis Protocol is Live</span>
        </div>

        {/* Apple-style Headline */}
        <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter text-black leading-[1.05]">
          Autonomous engineering. <br className="hidden md:block" />
          <span className="text-gray-400">At scale.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-3xl text-gray-500 max-w-3xl font-medium leading-snug tracking-tight">
          Unleash a network of 50,000+ specialized engineering agents powered by 
          the ultimate Tri-Cloud intelligence engine.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
          <Button 
            as={Link} 
            href="/register" 
            size="lg" 
            className="w-full sm:w-auto bg-black text-white font-medium rounded-full px-12 py-7 text-lg hover:scale-[1.02] transition-transform shadow-lg"
          >
            Deploy The Swarm
          </Button>
          <Button 
            as={Link} 
            href="#architecture" 
            size="lg" 
            variant="bordered"
            className="w-full sm:w-auto text-black border-gray-200 hover:bg-gray-50 rounded-full px-12 py-7 text-lg transition-colors font-medium"
          >
            View Architecture <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mt-24 text-left w-full max-w-4xl">
          <div className="flex flex-col gap-1">
            <span className="text-5xl font-semibold tracking-tighter text-black">46k+</span>
            <span className="text-sm text-gray-500 font-medium">Dynamic Agents</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-5xl font-semibold tracking-tighter text-black">44</span>
            <span className="text-sm text-gray-500 font-medium">Cloud Connectors</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-5xl font-semibold tracking-tighter text-black">3</span>
            <span className="text-sm text-gray-500 font-medium">Foundation Models</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-5xl font-semibold tracking-tighter text-black">Zero</span>
            <span className="text-sm text-gray-500 font-medium">API Markup</span>
          </div>
        </div>
      </div>
    </section>
  );
}
