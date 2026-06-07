"use client";

import React, { useState, useEffect } from "react";

interface AgentNode {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  iconPath: React.ReactNode;
}

export default function DeterministicControlSection() {
  const [activeStep, setActiveStep] = useState(0);

  const agents: AgentNode[] = [
    {
      id: "security",
      name: "Security Sentinel",
      x: 200,
      y: 60,
      description: "Running real-time static analysis and vulnerability scans...",
      iconPath: (
        <path
          d="M194 54 V49 A6 6 0 0 1 206 49 V54 M190 54 H210 V68 H190 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ),
    },
    {
      id: "tdd",
      name: "TDD Guide",
      x: 320,
      y: 148,
      description: "Writing unit tests first and enforcing 80%+ coverage checks...",
      iconPath: (
        <path
          d="M312 148 L317 153 L327 143 M308 148 A12 12 0 1 1 332 148 A12 12 0 1 1 308 148"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ),
    },
    {
      id: "reviewer",
      name: "Code Reviewer",
      x: 280,
      y: 280,
      description: "Verifying style compliance, cognitive complexity, and design patterns...",
      iconPath: (
        <>
          <circle cx="277" cy="277" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="281" y1="281" x2="288" y2="288" stroke="currentColor" strokeWidth="1.5" />
        </>
      ),
    },
    {
      id: "database",
      name: "Database Expert",
      x: 120,
      y: 280,
      description: "Inspecting database schemas and validating migration scripts...",
      iconPath: (
        <>
          <ellipse cx="120" cy="274" rx="9" ry="3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M111 274 V280 A9 3.5 0 0 0 129 280 V274" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M111 280 V286 A9 3.5 0 0 0 129 286 V280" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </>
      ),
    },
    {
      id: "api",
      name: "API Designer",
      x: 80,
      y: 148,
      description: "Validating API route configurations and response payloads...",
      iconPath: (
        <>
          <path d="M72 143 L67 148 L72 153" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M88 143 L93 148 L88 153" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="77" y1="152" x2="83" y2="144" stroke="currentColor" strokeWidth="1.5" />
        </>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % agents.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [agents.length]);

  return (
    <section className="w-full py-32 bg-black text-white px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          <h3 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-white">
            Deterministic Output. <br />
            Absolute Security.
          </h3>
          <p className="text-xl text-slate-400 leading-relaxed font-medium text-balance">
            Most AI coding tools are unpredictable black boxes. Inso Code is
            built for enterprise engineering teams who demand absolute control.
            With native guardrails, deterministic instruction steering, and
            mandatory TDD workflows, our agents build robust production systems.
          </p>
        </div>

        {/* Right Column (Animation Window) */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[1.2/1] max-w-md mx-auto bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl p-5 flex flex-col justify-between overflow-hidden text-slate-100 select-none">
          {/* SVG Swarm Canvas */}
          <div className="flex-1 min-h-0 relative flex items-center justify-center py-2">
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes flow-dots {
                to {
                  stroke-dashoffset: -20;
                }
              }
              .flow-dots-active {
                animation: flow-dots 0.8s linear infinite;
                stroke: #10B981;
                stroke-width: 2px;
                stroke-dasharray: 6 4;
              }
              .flow-dots-inactive {
                animation: flow-dots 2s linear infinite;
                stroke: #27272A;
                stroke-width: 1.5px;
                stroke-dasharray: 6 4;
              }
            `,
              }}
            />

            <svg viewBox="0 0 400 360" className="w-full h-full max-h-[260px] object-contain">
              {/* Connection Lines (Center to Satellites) */}
              {agents.map((agent, index) => {
                const isActive = index === activeStep;

                return (
                  <line
                    key={agent.id}
                    x1="200"
                    y1="180"
                    x2={agent.x}
                    y2={agent.y}
                    className={isActive ? "flow-dots-active" : "flow-dots-inactive"}
                  />
                );
              })}

              {/* Pulsing Outer Ring for Active Node */}
              {agents.map((agent, index) => {
                if (index !== activeStep) return null;

                return (
                  <circle
                    key={`ping-${agent.id}`}
                    cx={agent.x}
                    cy={agent.y}
                    r="24"
                    className="fill-none stroke-emerald-500/40 stroke-1 animate-ping"
                  />
                );
              })}

              {/* Satellite Node Containers */}
              {agents.map((agent, index) => {
                const isActive = index === activeStep;

                return (
                  <g key={agent.id} className="cursor-pointer">
                    {/* Node Background */}
                    <circle
                      cx={agent.x}
                      cy={agent.y}
                      r="18"
                      className={`transition-colors duration-500 ${
                        isActive
                          ? "fill-emerald-950/80 stroke-emerald-500"
                          : "fill-zinc-950 stroke-zinc-800"
                      }`}
                      strokeWidth="2"
                    />

                    {/* Icon Container */}
                    <g
                      className={`transition-colors duration-500 ${
                        isActive ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      {agent.iconPath}
                    </g>
                  </g>
                );
              })}

              {/* Supreme Commander Node (Center) */}
              <g>
                {/* Pulse wave for commander */}
                <circle
                  cx="200"
                  cy="180"
                  r="36"
                  className="fill-none stroke-blue-500/20 stroke-1 animate-pulse"
                />
                <circle
                  cx="200"
                  cy="180"
                  r="26"
                  className="fill-blue-950/90 stroke-blue-500"
                  strokeWidth="2.5"
                />
                {/* Supreme Commander Star/Hexagon Icon */}
                <path
                  d="M200 171 L203 177 L209 178 L204 183 L206 189 L200 186 L194 189 L196 183 L191 178 L197 177 Z"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2"
                />
              </g>
            </svg>
          </div>

          {/* Interactive Agent Description Card */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5 mt-2 flex-shrink-0 transition-all duration-500 min-h-[76px] flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-sans">
                {agents[activeStep].name}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans font-medium">
              {agents[activeStep].description}
            </p>
          </div>

          {/* Bottom Status bar */}
          <div className="mt-3.5 flex items-center justify-between text-[10px] text-zinc-600 border-t border-zinc-900 pt-3 flex-shrink-0 font-sans font-semibold">
            <div>50,000 agents mapped</div>
            <div>latency: 18ms</div>
            <div>orchestrator: active</div>
          </div>
        </div>
      </div>
    </section>
  );
}
