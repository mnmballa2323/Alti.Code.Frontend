"use client";

import { ShieldCheck, Anchor, Crosshair, TerminalSquare } from "lucide-react";

export default function DeterministicControlSection() {
  const features = [
    {
      title: "AgentShield Security",
      description: "Enterprise-grade sandboxing. Agents cannot execute destructive commands, access unauthorized files, or leak secrets out of the environment.",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    },
    {
      title: "Hookify Workflows",
      description: "Automated trigger-based hooks ensure that before an agent commits code, it must pass your organization's exact formatting, testing, and security gates.",
      icon: <Anchor className="w-6 h-6 text-blue-400" />,
    },
    {
      title: "Deterministic Steering",
      description: "Stop dealing with hallucinating chat bots. Our agents follow strict system-level instructions to execute engineering tasks precisely as commanded.",
      icon: <Crosshair className="w-6 h-6 text-purple-400" />,
    },
    {
      title: "Zero-Mutation Execution",
      description: "Agents prioritize immutability and test-driven-development (TDD) by default. They write tests first, then implement the minimal viable fix.",
      icon: <TerminalSquare className="w-6 h-6 text-pink-400" />,
    }
  ];

  return (
    <section className="w-full py-24 bg-[#0a0a0a] text-white px-4 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Copy */}
        <div className="flex flex-col gap-6">
          <h2 className="text-sm font-semibold tracking-widest text-emerald-400 uppercase">
            Chaos vs. Control
          </h2>
          <h3 className="text-4xl md:text-5xl font-bold font-secondary leading-tight">
            Deterministic Output. <br />
            Absolute Security.
          </h3>
          <p className="text-lg text-default-400 leading-relaxed">
            Most AI coding tools are unpredictable black boxes. Alti Code Studio is built for enterprise 
            engineering teams who demand absolute control. With built-in guardrails, deterministic instruction 
            steering, and mandatory TDD workflows, our agents don&apos;t just write code—they engineer robust systems.
          </p>

          {/* CTA or additional trust marker */}
          <div className="mt-6 flex items-center gap-3 text-sm font-medium text-emerald-400/80 bg-emerald-400/10 border border-emerald-400/20 px-4 py-2 rounded-full w-fit">
            <ShieldCheck className="w-4 h-4" /> SOC2 Type II & Air-Gap Ready
          </div>
        </div>

        {/* Right Side: Grid of Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className="flex flex-col gap-4 p-6 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-colors shadow-xl"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold">{feature.title}</h4>
              <p className="text-default-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
