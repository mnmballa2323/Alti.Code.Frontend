"use client";

import { 
  SiGooglecloud, SiVercel, SiSupabase, SiMongodb, 
  SiPlanetscale, SiRedis, SiCloudflare, SiKubernetes,
  SiDigitalocean, SiFirebase, SiSnowflake
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
        const x = (radius + radius * Math.cos(angle)).toFixed(4);
        const y = (radius + radius * Math.sin(angle)).toFixed(4);
        return (
          <div 
            key={i}
            className="absolute -ml-6 -mt-6 w-12 h-12"
            style={{ left: `${x}px`, top: `${y}px` }}
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
              <img key="aws" src="/assets/cloud-logos/aws.svg" alt="AWS" className="w-6 h-6 object-contain" />,
              <img key="gcp" src="/assets/cloud-logos/gcp.svg" alt="Google Cloud" className="w-6 h-6 object-contain" />,
              <img key="azure" src="/assets/cloud-logos/azure.svg" alt="Azure" className="w-6 h-6 object-contain" />
            ]} 
          />

          {/* Middle Orbit: Databases & Core Infra */}
          <OrbitRing 
            size={420} 
            duration={40} 
            reverse
            items={[
              <SiKubernetes key="kubernetes" className="w-6 h-6 text-[#326CE5]" />,
              <SiDigitalocean key="digitalocean" className="w-6 h-6 text-[#0080FF]" />,
              <div key="oracle" className="w-6 h-6 flex items-center justify-center font-black text-[#F80000] text-[8px] tracking-tighter" style={{ fontFamily: 'sans-serif' }}>ORACLE</div>,
              <div key="ibm" className="w-6 h-6 flex items-center justify-center text-[#0530AD]">
                <svg role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <title>IBM</title>
                  <path d="M23.544 15.993c.038 0 .06-.017.06-.053v-.036c0-.035-.022-.052-.06-.052h-.09v.14zm-.09.262h-.121v-.498h.225c.112 0 .169.066.169.157 0 .079-.036.129-.09.15l.111.19h-.133l-.092-.17h-.07zm.434-.222v-.062c0-.2-.157-.357-.363-.357a.355.355 0 00-.363.357v.062c0 .2.156.358.363.358a.355.355 0 00.363-.358zm-.838-.03c0-.28.212-.492.475-.492.264 0 .475.213.475.491 0 .279-.211.491-.475.491a.477.477 0 01-.475-.49zM16.21 8.13l-.216-.624h-3.56v.624zm.413 1.19l-.216-.623h-3.973v.624zm2.65 7.147h3.107v-.624h-3.108zm0-1.192h3.107v-.623h-3.108zm0-1.19h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-1.865zm0-1.191h1.864v-.624h-3.555l-.175.504-.175-.504h-3.555v.624h1.865v-.574l.2.574h3.33l.2-.574zm1.864-1.815h-3.142l-.217.624h3.359zm-7.46 3.006h1.865v-.624h-1.865zm0 1.19h1.865v-.623h-1.865zm-1.243 1.191h3.108v-.623h-3.108zm0 1.192h3.108v-.624h-3.108zm6.386-8.961l-.216.624h3.776v-.624zm-.629 1.815h4.19v-.624h-3.974zm-4.514 1.19h3.359l-.216-.623h-3.143zm2.482 2.383h2.496l.218-.624h-2.932zm.417 1.19h1.662l.218-.623h-2.098zm.416 1.191h.83l.218-.623h-1.266zm.414 1.192l.217-.624h-.432zm-12.433-.006l4.578.006c.622 0 1.18-.237 1.602-.624h-6.18zm4.86-3v.624h2.092c0-.216-.03-.425-.083-.624zm-3.616.624h1.865v-.624H6.217zm3.617-3.573h2.008c.053-.199.083-.408.083-.624H9.834zm-3.617 0h1.865v-.624H6.217zM9.55 7.507H4.973v.624h6.18a2.36 2.36 0 00-1.602-.624zm2.056 1.191H4.973v.624h6.884a2.382 2.382 0 00-.25-.624zm-5.39 2.382v.624h4.87c.207-.176.382-.387.519-.624zm4.87 1.191h-4.87v.624h5.389a2.39 2.39 0 00-.519-.624zm-6.114 3.006h6.634c.11-.193.196-.402.25-.624H4.973zM0 8.13h4.352v-.624H0zm0 1.191h4.352v-.624H0zm1.243 1.191h1.865v-.624H1.243zm0 1.191h1.865v-.624H1.243zm0 1.19h1.865v-.623H1.243zm0 1.192h1.865v-.624H1.243zM0 15.276h4.352v-.623H0zm0 1.192h4.352v-.624H0Z"/>
                </svg>
              </div>,
              <SiFirebase key="firebase" className="w-6 h-6 text-[#FFCA28]" />,
              <SiSnowflake key="snowflake" className="w-6 h-6 text-[#29B5E8]" />
            ]} 
          />



        </div>

      </div>
    </section>
  );
}
