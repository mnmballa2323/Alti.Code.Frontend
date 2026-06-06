"use client";

import { Cpu, Network, Zap, Lock } from "lucide-react";

export default function AgentSwarmSection() {
  const swarmStats = [
    { label: "Total Specialized Agents", value: "46,397", icon: <Network className="w-5 h-5 text-black" /> },
    { label: "Concurrent Executions", value: "Unlimited", icon: <Zap className="w-5 h-5 text-black" /> },
    { label: "Agent Architecture", value: "Genesis Protocol", icon: <Cpu className="w-5 h-5 text-black" /> },
    { label: "Security Boundary", value: "AgentShield", icon: <Lock className="w-5 h-5 text-black" /> },
  ];

  return (
    <section className="w-full py-32 bg-white text-black px-4 sm:px-6 lg:px-8 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
        
        {/* Left Side: Text & Context */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
              The Genesis Protocol
            </h2>
            <h3 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
              A 50,000+ Agent Swarm. <br />At Your Command.
            </h3>
            <p className="text-xl text-gray-500 leading-relaxed max-w-2xl font-medium">
              Forget single-agent chatbots. Alti Code Studio deploys a massive, dynamically coordinated 
              swarm of over 46,000 specialized engineering agents. Whether you need a dedicated 
              PostgreSQL optimizer, a React performance auditor, or an adversarial security red-team, 
              the swarm provisions the exact expert you need in milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
            {swarmStats.map((stat, idx) => (
              <div key={idx} className="flex flex-col gap-4 p-8 rounded-3xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                    {stat.icon}
                  </div>
                  <span className="text-gray-500 text-sm font-semibold tracking-wide">{stat.label}</span>
                </div>
                <span className="text-3xl font-bold tracking-tight text-black">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Visual Representation */}
        <div className="flex-1 w-full flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-[400px] aspect-square rounded-[3rem] border border-gray-200 bg-gray-50 flex items-center justify-center shadow-lg">
            {/* Minimalist rings */}
            <div className="absolute inset-8 rounded-full border border-gray-200" />
            <div className="absolute inset-[25%] rounded-full border border-gray-200" />
            <div className="absolute inset-[40%] rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-200">
              <Network className="w-12 h-12 text-black" />
            </div>
            
            {/* Minimalist dots representing agents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-gray-400 rounded-full" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-gray-800 rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-gray-300 rounded-full" />
          </div>
        </div>

      </div>
    </section>
  );
}
