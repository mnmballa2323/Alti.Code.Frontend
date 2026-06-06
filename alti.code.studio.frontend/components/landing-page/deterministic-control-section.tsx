"use client";

import { ShieldCheck, Anchor, Crosshair, TerminalSquare } from "lucide-react";

export default function DeterministicControlSection() {
  const features = [
    {
      title: "AgentShield Security",
      description: "Enterprise-grade sandboxing. Agents cannot execute destructive commands, access unauthorized files, or leak secrets out of the environment.",
      icon: <ShieldCheck className="w-7 h-7 text-black" />,
    },
    {
      title: "Hookify Workflows",
      description: "Automated trigger-based hooks ensure that before an agent commits code, it must pass your organization's exact formatting, testing, and security gates.",
      icon: <Anchor className="w-7 h-7 text-black" />,
    },
    {
      title: "Deterministic Steering",
      description: "Stop dealing with hallucinating chat bots. Our agents follow strict system-level instructions to execute engineering tasks precisely as commanded.",
      icon: <Crosshair className="w-7 h-7 text-black" />,
    },
    {
      title: "Zero-Mutation Execution",
      description: "Agents prioritize immutability and test-driven-development (TDD) by default. They write tests first, then implement the minimal viable fix.",
      icon: <TerminalSquare className="w-7 h-7 text-black" />,
    }
  ];

  return (
    <section className="w-full py-32 bg-white text-black px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        
        {/* Left Side: Copy */}
        <div className="flex flex-col gap-8">
          <h3 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]">
            Deterministic Output. <br />
            Absolute Security.
          </h3>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            Most AI coding tools are unpredictable black boxes. Alti Code Studio is built for enterprise 
            engineering teams who demand absolute control. With built-in guardrails, deterministic instruction 
            steering, and mandatory TDD workflows, our agents don&apos;t just write code—they engineer robust systems.
          </p>

          {/* Trust marker */}
          <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-black bg-gray-50 border border-gray-200 px-6 py-3 rounded-full w-fit">
            <ShieldCheck className="w-5 h-5" /> SOC2 Type II & Air-Gap Ready
          </div>
        </div>

        {/* Right Side: Grid of Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="flex flex-col gap-5 p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-gray-300 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                {feature.icon}
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-2xl font-semibold tracking-tight text-black">{feature.title}</h4>
                <p className="text-gray-500 text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
