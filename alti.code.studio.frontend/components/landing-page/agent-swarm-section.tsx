"use client";

import SwarmCanvas from "./swarm-canvas";

export default function AgentSwarmSection() {
  return (
    <section className="w-full py-32 bg-[#030014] text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24 relative z-10">
        {/* Left Side: Text & Context */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <h3 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-white">
              A 25,000 Agent Swarm. <br />
              At Your Command.
            </h3>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl font-medium">
              Forget chatbots and basic auto-regressive models. Inso Code provisions a dynamically coordinated network of 25,000 specialized AI agents that execute complex tasks in parallel. From database design and API connectors to automated security sweeps, each subagent collaborates with the swarm to run test suites, resolve compile errors, and deliver production-ready code to your repo in seconds.
            </p>
          </div>
        </div>

        {/* Right Side: Visual Representation */}
        <div className="flex-1 w-full flex justify-center lg:justify-center lg:translate-x-16 relative">
          <SwarmCanvas />
        </div>
      </div>
    </section>
  );
}
