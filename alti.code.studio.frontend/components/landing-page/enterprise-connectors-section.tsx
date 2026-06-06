"use client";

import { 
  SiGooglecloud, SiVercel, SiSupabase, SiMongodb, 
  SiPlanetscale, SiRedis, SiCloudflare, SiKubernetes,
  SiDigitalocean, SiHeroku, SiNetlify, SiFirebase, SiSnowflake
} from "react-icons/si";
import { 
  FaAws
} from "react-icons/fa";
import { VscAzure } from "react-icons/vsc";
import React from "react";

const OrbitRing = ({ size, duration, reverse, items }: { size: number, duration: number, reverse?: boolean, items: React.ReactNode[] }) => {
  const radius = size / 2;
  return (
    <div 
      className={`absolute rounded-full border border-gray-300 border-dashed animate-spin`}
      style={{ 
        width: size, 
        height: size, 
        animationDuration: `${duration}s`,
        animationDirection: reverse ? 'reverse' : 'normal'
      }}
    >
      {items.map((item, i) => {
        const angle = (i / items.length) * 2 * Math.PI;
        const x = radius + radius * Math.cos(angle);
        const y = radius + radius * Math.sin(angle);
        return (
          <div 
            key={i}
            className="absolute -ml-6 -mt-6 w-12 h-12"
            style={{ left: x, top: y }}
          >
            <div 
              className="w-full h-full bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100 animate-spin-reverse"
              style={{ 
                animationDuration: `${duration}s`,
                animationDirection: reverse ? 'reverse' : 'normal'
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function EnterpriseConnectorsSection() {
  return (
    <section className="w-full py-32 bg-[#F5F5F7] text-black px-4 sm:px-6 lg:px-8 border-t border-gray-200 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-8 lg:justify-between">
        
        {/* Left Side: Text */}
        <div className="flex flex-col gap-6 max-w-2xl lg:w-[50%] z-10 text-center lg:text-left mx-auto lg:mx-0">
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-black leading-tight">
            66 Cloud Connections. Zero Friction. All Power.
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            Alti Code Studio isn&apos;t a walled garden. Your swarm connects directly to the absolute best 
            cloud infrastructure on the planet. From hyper-scalers to specialized providers, we integrate everywhere, for frictionless deployments.
          </p>
        </div>

        {/* Right Side: Orbital Ecosystem (Now visually on Left) */}
        <div className="relative w-full lg:w-[50%] h-[600px] flex items-center justify-center lg:-translate-x-16 scale-[0.65] sm:scale-75 md:scale-90 lg:scale-100">
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin-reverse {
              from { transform: rotate(360deg); }
              to { transform: rotate(0deg); }
            }
            .animate-spin-reverse {
              animation: spin-reverse linear infinite;
            }
          `}} />

          {/* Central Hub */}
          <div className="absolute z-30 flex items-center justify-center w-24 h-24 rounded-full bg-black shadow-[0_0_60px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform duration-500 cursor-pointer border border-gray-800">
            <img src="/logo-white.png" alt="Alti Code Studio" className="w-12 h-12 object-contain" />
          </div>

          {/* Inner Orbit: Hyperscalers */}
          <OrbitRing 
            size={260} 
            duration={25} 
            items={[
              <FaAws key="aws" className="w-6 h-6 text-[#232F3E]" />,
              <SiGooglecloud key="gcp" className="w-6 h-6 text-[#4285F4]" />,
              <VscAzure key="azure" className="w-6 h-6 text-[#0078D4]" />
            ]} 
          />

          {/* Middle Orbit: Databases & Core Infra */}
          <OrbitRing 
            size={420} 
            duration={40} 
            reverse
            items={[
              <SiSupabase key="supabase" className="w-6 h-6 text-[#3ECF8E]" />,
              <SiMongodb key="mongodb" className="w-6 h-6 text-[#47A248]" />,
              <SiPlanetscale key="planetscale" className="w-6 h-6 text-black" />,
              <SiRedis key="redis" className="w-6 h-6 text-[#DC382D]" />,
              <SiVercel key="vercel" className="w-6 h-6 text-black" />,
              <SiCloudflare key="cloudflare" className="w-6 h-6 text-[#F38020]" />
            ]} 
          />



        </div>

      </div>
    </section>
  );
}
