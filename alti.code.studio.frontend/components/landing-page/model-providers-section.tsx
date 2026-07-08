"use client";

import React from "react";

import { cn } from "@/lib/utils";

const providers = [
  {
    name: "Anthropic",
    brand: "Claude Models",
    glowClass: "from-orange-500/10 via-orange-500/2 to-transparent",
    borderHoverClass:
      "hover:border-orange-500/30 dark:hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5",
    models: [
      {
        name: "Claude Sonnet 4.6",
        role: "TDD & High-Speed Coding",
        description:
          "Executes test-driven refactoring, real-time code generation, and rapid local compilation loops.",
        tags: ["TDD Loop", "Code Gen", "Local CLI"],
        metric: { label: "Speed", value: "99%" },
      },
      {
        name: "Claude Opus 4.8",
        role: "Architecture & Multi-Repo",
        description:
          "Resolves complex multi-repository dependencies, deep architectural planning, and consensus.",
        tags: ["System Design", "Multi-Repo", "Consensus"],
        metric: { label: "Complexity", value: "97%" },
      },
      {
        name: "Claude Fable 5",
        role: "Frontier Cognitive Research",
        description:
          "Executing self-directed research, deep structural validation, and autonomous generation.",
        tags: ["Frontier Model", "Self-Correction", "Cognitive"],
        metric: { label: "Reasoning", value: "99.8%" },
      },
    ],
  },
  {
    name: "Google",
    brand: "Gemini Models",
    glowClass: "from-blue-500/10 via-blue-500/2 to-transparent",
    borderHoverClass:
      "hover:border-blue-500/30 dark:hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5",
    models: [
      {
        name: "Gemini 3.5 Flash",
        role: "High-Speed Analysis & Multimodal",
        description:
          "High-speed reasoning, advanced multimodal tasks, and context-efficient code refactoring.",
        tags: ["Multimodal", "Fast Context", "Code Refactor"],
        metric: { label: "Speed", value: "98%" },
      },
      {
        name: "Gemini 3.5 Pro",
        role: "Deep Reasoning & Logic",
        description:
          "Complex logic reasoning, deep analysis, and multi-file code understanding.",
        tags: ["Deep Logic", "Multi-File", "Analysis"],
        metric: { label: "Logic", value: "98.5%" },
      },
    ],
  },

];

export default function ModelProvidersSection() {
  return (
    <section
      className="relative w-full py-32 bg-zinc-50/40 dark:bg-[#030303] text-black dark:text-white px-4 sm:px-6 lg:px-8 border-y border-zinc-200/50 dark:border-zinc-900 transition-colors duration-300 overflow-hidden"
      id="model-intelligence"
    >
      {/* Decorative background glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-[10%] w-[30vw] h-[30vh] rounded-full bg-blue-500/5 dark:bg-blue-500/3 blur-[120px]" />
        <div className="absolute bottom-1/4 right-[10%] w-[30vw] h-[30vh] rounded-full bg-blue-500/5 dark:bg-blue-500/3 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center gap-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6 max-w-5xl">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white leading-tight">
            Triple Sovereign AI Restriction
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-normal max-w-5xl">
            To guarantee absolute data sovereignty and regulatory compliance,
            the platform is restricted
            <br className="hidden md:inline" />
            exclusively to the premier model providers hosted securely on Google
            Cloud and Microsoft Azure.
          </p>
        </div>

        {/* Providers Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto items-stretch">
          {providers.map((provider, idx) => (
            <div
              key={idx}
              className={cn(
                "group relative flex items-center justify-center p-8 rounded-[24px] border transition-all duration-500 h-28 overflow-hidden",
                "bg-white/60 dark:bg-zinc-950/40 backdrop-blur-md border-zinc-200/60 dark:border-zinc-800/80 shadow-sm",
                provider.borderHoverClass,
              )}
            >
              {/* Glowing decorative gradient behind the provider card */}
              <div
                className={cn(
                  "absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0",
                  provider.glowClass,
                )}
              />

              <span className="relative z-10 text-2xl font-bold tracking-tight text-black dark:text-white leading-tight group-hover:scale-105 transition-transform duration-300">
                {provider.name}
              </span>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-normal max-w-4xl text-center">
          * Anthropic, Google, and OpenAI are trademarks of their respective
          owners. Mention of these providers signifies compatibility with their
          sovereign API endpoints and does not imply official partnership,
          sponsorship, or endorsement.
        </p>
      </div>
    </section>
  );
}
