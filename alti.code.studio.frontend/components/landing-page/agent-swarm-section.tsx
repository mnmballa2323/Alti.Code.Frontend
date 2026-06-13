"use client";

import SwarmCanvas from "./swarm-canvas";

export default function AgentSwarmSection() {
  return (
    <section className="w-full py-32 bg-gray-50 text-black px-4 sm:px-6 lg:px-8 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
        {/* Left Side: Text & Context */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <h3 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
              A 10,000 Agent Swarm. <br />
              At Your Command.
            </h3>
            <p className="text-xl text-gray-500 leading-relaxed max-w-2xl font-medium">
              Forget single-agent chatbots. Inso Code deploys a massive,
              dynamically coordinated swarm of over 10,000 specialized
              engineering agents. Whether you need a dedicated PostgreSQL
              optimizer, a React performance auditor, or an adversarial security
              red-team, the swarm provisions the exact experts you need in
              milliseconds.
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
