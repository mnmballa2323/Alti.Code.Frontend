"use client";

import { Button } from "@heroui/react";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroSwarm() {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-black text-white px-4">
      {/* Background Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Radial Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/0 via-black/80 to-black pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto gap-8 mt-10">
        
        {/* Top Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-200">The Genesis Protocol is Live</span>
        </div>

        {/* Massive Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight font-secondary leading-[1.1]">
          The World&apos;s Most Powerful <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Autonomous Swarm
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-2xl text-default-400 max-w-3xl font-light leading-relaxed">
          Unleash an unstoppable network of 50,000+ specialized engineering agents powered by 
          the ultimate Tri-Cloud intelligence engine.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
          <Button 
            as={Link} 
            href="/register" 
            size="lg" 
            className="w-full sm:w-auto bg-white text-black font-semibold rounded-full px-10 py-6 text-lg hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]"
          >
            Deploy The Swarm <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            as={Link} 
            href="#architecture" 
            size="lg" 
            variant="bordered"
            className="w-full sm:w-auto text-white border-white/20 hover:bg-white/10 rounded-full px-10 py-6 text-lg transition-colors"
          >
            View Architecture
          </Button>
        </div>

        {/* Social Proof / Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12 mt-20 border-t border-white/10 pt-10 text-left">
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-bold text-white">46,397</span>
            <span className="text-sm text-default-500 font-medium uppercase tracking-wider">Dynamic Agents</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-bold text-white">44+</span>
            <span className="text-sm text-default-500 font-medium uppercase tracking-wider">Cloud Connectors</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-bold text-white">3</span>
            <span className="text-sm text-default-500 font-medium uppercase tracking-wider">Foundation Models</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-4xl font-bold text-white">Zero</span>
            <span className="text-sm text-default-500 font-medium uppercase tracking-wider">API Markup</span>
          </div>
        </div>
      </div>
    </section>
  );
}
