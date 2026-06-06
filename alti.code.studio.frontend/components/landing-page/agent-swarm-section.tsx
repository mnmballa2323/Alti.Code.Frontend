"use client";

import { Cpu, Network, Zap, Lock } from "lucide-react";

export default function AgentSwarmSection() {
  const swarmStats = [
    { label: "Total Specialized Agents", value: "46,397", icon: <Network className="w-5 h-5 text-blue-400" /> },
    { label: "Concurrent Executions", value: "Unlimited", icon: <Zap className="w-5 h-5 text-yellow-400" /> },
    { label: "Agent Architecture", value: "Genesis Protocol", icon: <Cpu className="w-5 h-5 text-purple-400" /> },
    { label: "Security Boundary", value: "AgentShield", icon: <Lock className="w-5 h-5 text-green-400" /> },
  ];

  return (
    <section className="w-full py-24 bg-black text-white px-4 border-t border-white/5 relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        
        {/* Left Side: Text & Context */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold tracking-widest text-purple-400 uppercase">
              The Genesis Protocol
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold font-secondary leading-tight">
              A 50,000+ Agent Swarm At Your Command.
            </h3>
            <p className="text-lg text-default-400 leading-relaxed max-w-2xl">
              Forget single-agent chatbots. Alti Code Studio deploys a massive, dynamically coordinated 
              swarm of over 46,000 specialized engineering agents. Whether you need a dedicated 
              PostgreSQL optimizer, a React performance auditor, or an adversarial security red-team, 
              the swarm provisions the exact expert you need in milliseconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            {swarmStats.map((stat, idx) => (
              <div key={idx} className="flex flex-col gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-black/50 border border-white/5">
                    {stat.icon}
                  </div>
                  <span className="text-white/60 text-sm font-medium">{stat.label}</span>
                </div>
                <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Visual Representation */}
        <div className="flex-1 w-full flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-md aspect-square rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center animate-[spin_60s_linear_infinite]">
            <div className="absolute inset-0 rounded-full border border-dashed border-white/20 animate-[spin_40s_linear_infinite_reverse]" />
            <div className="absolute inset-[20%] rounded-full border border-purple-500/30 bg-purple-500/5 animate-[pulse_4s_ease-in-out_infinite]" />
            <div className="absolute inset-[40%] rounded-full border border-blue-500/50 bg-blue-500/10 backdrop-blur-md shadow-[0_0_60px_-15px_rgba(59,130,246,0.5)] flex items-center justify-center">
              <Network className="w-12 h-12 text-white animate-pulse" />
            </div>
            
            {/* Simulated Nodes */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-pink-400 rounded-full shadow-[0_0_15px_rgba(244,114,182,0.8)]" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
          </div>
        </div>

      </div>
    </section>
  );
}
