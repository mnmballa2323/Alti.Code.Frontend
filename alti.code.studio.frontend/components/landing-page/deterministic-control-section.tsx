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
      description:
        "Running real-time static analysis and vulnerability scans...",
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
      description:
        "Writing unit tests first and enforcing 80%+ coverage checks...",
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
      description:
        "Verifying style compliance, cognitive complexity, and design patterns...",
      iconPath: (
        <>
          <circle
            cx="277"
            cy="277"
            fill="none"
            r="6"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            stroke="currentColor"
            strokeWidth="1.5"
            x1="281"
            x2="288"
            y1="281"
            y2="288"
          />
        </>
      ),
    },
    {
      id: "database",
      name: "Database Expert",
      x: 120,
      y: 280,
      description:
        "Inspecting database schemas and validating migration scripts...",
      iconPath: (
        <>
          <ellipse
            cx="120"
            cy="274"
            fill="none"
            rx="9"
            ry="3.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M111 274 V280 A9 3.5 0 0 0 129 280 V274"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M111 280 V286 A9 3.5 0 0 0 129 286 V280"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </>
      ),
    },
    {
      id: "api",
      name: "API Designer",
      x: 80,
      y: 148,
      description:
        "Validating API route configurations and response payloads...",
      iconPath: (
        <>
          <path
            d="M72 143 L67 148 L72 153"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M88 143 L93 148 L88 153"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <line
            stroke="currentColor"
            strokeWidth="1.5"
            x1="77"
            x2="83"
            y1="152"
            y2="144"
          />
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
          <p className="text-xl text-zinc-200 leading-relaxed font-medium text-balance">
            Most AI coding tools are unpredictable black boxes. Inso Code is
            built for enterprise engineering teams who demand absolute control.
            With native guardrails, deterministic instruction steering, and
            mandatory TDD workflows, our agents build robust production systems.
          </p>
        </div>

        {/* Right Column (Animation Window) */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[1.2/1] max-w-md mx-auto bg-white border border-zinc-200 shadow-2xl p-5 flex flex-col justify-between overflow-hidden text-zinc-900 select-none rounded-2xl">
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
                stroke: #09090b;
                stroke-width: 2.5px;
                stroke-dasharray: 6 4;
              }
              .flow-dots-inactive {
                animation: flow-dots 2s linear infinite;
                stroke: #27272a;
                stroke-width: 2px;
                stroke-dasharray: 6 4;
              }
            `,
              }}
            />

            <svg
              className="w-full h-full max-h-[260px] object-contain"
              viewBox="0 0 400 360"
            >
              {/* Connection Lines (Center to Satellites) */}
              {agents.map((agent, index) => {
                const isActive = index === activeStep;

                return (
                  <line
                    key={agent.id}
                    className={
                      isActive ? "flow-dots-active" : "flow-dots-inactive"
                    }
                    x1="200"
                    x2={agent.x}
                    y1="180"
                    y2={agent.y}
                  />
                );
              })}

              {/* Pulsing Outer Ring for Active Node */}
              {agents.map((agent, index) => {
                if (index !== activeStep) return null;

                return (
                  <circle
                    key={`ping-${agent.id}`}
                    className="fill-none stroke-zinc-950/30 stroke-[1.5px] animate-ping"
                    cx={agent.x}
                    cy={agent.y}
                    r="24"
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
                      className={`transition-colors duration-500 ${
                        isActive
                          ? "fill-zinc-950 stroke-zinc-950"
                          : "fill-white stroke-zinc-950"
                      }`}
                      cx={agent.x}
                      cy={agent.y}
                      r="18"
                      strokeWidth="2.5"
                    />

                    {/* Icon Container */}
                    <g
                      className={`transition-colors duration-500 ${
                        isActive ? "text-white" : "text-zinc-950"
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
                  className="fill-none stroke-zinc-950/10 stroke-1 animate-pulse"
                  cx="200"
                  cy="180"
                  r="36"
                />
                <circle
                  className="fill-white stroke-zinc-950"
                  cx="200"
                  cy="180"
                  r="26"
                  strokeWidth="3"
                />
                {/* Supreme Commander Logo Icon */}
                <g transform="translate(184, 164) scale(0.0376)">
                  <path
                    d="M687.4,421.4C695.5,387,718.6,264,718.6,264l-155.2-53.9c0,0-33.8-132.5-137.5-143.5c-121.5-8.4-160.3,143.9-160.3,143.9c-21.1,3.4-155.3,53.5-155.3,53.5c-1.3,9.2,30.4,160,30.4,160S41.4,513.9,90,616.8c48.5,102.9,199.6,64.6,199.6,64.6C322.8,716.8,415,789.3,415,789.3l124.3-108.5c52,11.1,88,12.6,127.5-1.9c15.7-5.8,30.5-13.8,43.4-24.4C818.5,566.7,687.4,421.4,687.4,421.4z M484.7,225.5l-16-38.2c0,0-78.6-12.1-156.2,11.4c0,0,34.5-110.8,123.2-89.3s101.4,156.8,101.8,218.8c0,0-184.9-72.9-361.7,64.1l-20.9-101.5C154.9,290.8,351.9,194.1,484.7,225.5z M533.7,367.4C506.3,511,415,574.8,415,574.8c-108.6-94.2-119.6-207.4-119.6-207.4C427,323.9,533.7,367.4,533.7,367.4z M415,738.5c0,0-185.1-136.8-217.1-263.2l-27.5,37.9c0,0,40.9,96.7,87.7,132.3c0,0-119,26.8-140.5-75.1c-17.1-101.1,139.8-184.4,139.8-184.4s32.7,196.3,239.4,283.3L415,738.5z M703.4,602.4c-8.7,17.6-24.1,30.8-42.4,37.9c-98.6,38.5-211.6-41.6-211.6-41.6c159.8-136,124.8-344.3,124.8-344.3l97.8,33.4c-20.7,221.8-114.5,320.4-114.5,320.4l42.9,4.8c44.5-54.1,72.4-143.1,72.4-143.1S735.2,538.4,703.4,602.4z"
                    fill="#09090b"
                  />
                </g>
              </g>
            </svg>
          </div>

          {/* Interactive Agent Description Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 mt-2 flex-shrink-0 transition-all duration-500 min-h-[76px] flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-sans">
                {agents[activeStep].name}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed font-sans font-medium">
              {agents[activeStep].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
