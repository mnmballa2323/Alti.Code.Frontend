"use client";

import React from "react";
import { cn } from "@/lib/utils";

const providers = [
  {
    name: "Anthropic",
    brand: "Claude Models",
    icon: (
      <svg className="w-8 h-8 text-black dark:text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
      </svg>
    ),
    models: [
      {
        name: "Claude Sonnet 4.6",
        role: "TDD & High-Speed Coding",
        description: "Executes test-driven refactoring, real-time code generation, and rapid local compilation loops.",
        tags: ["TDD Loop", "Code Gen", "Local CLI"],
        metric: { label: "Speed", value: "99%" }
      },
      {
        name: "Claude Opus 4.6",
        role: "Architecture & Multi-Repo",
        description: "Resolves complex multi-repository dependencies, deep architectural planning, and consensus.",
        tags: ["System Design", "Multi-Repo", "Consensus"],
        metric: { label: "Complexity", value: "97%" }
      }
    ]
  },
  {
    name: "Google Cloud",
    brand: "Gemini Models",
    icon: (
      <svg className="w-8 h-8 text-[#1A73E8]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
      </svg>
    ),
    models: [
      {
        name: "Gemini 3.5 Flash",
        role: "High-Speed Analysis & Multimodal",
        description: "High-speed reasoning, advanced multimodal tasks, and context-efficient code refactoring.",
        tags: ["Multimodal", "Fast Context", "Code Refactor"],
        metric: { label: "Speed", value: "98%" }
      },
      {
        name: "Gemini 3.1 Pro",
        role: "Deep Reasoning & Logic",
        description: "Complex logic reasoning, deep analysis, and multi-file code understanding.",
        tags: ["Deep Logic", "Multi-File", "Analysis"],
        metric: { label: "Logic", value: "96%" }
      }
    ]
  }
];

export default function ModelProvidersSection() {
  return (
    <section
      className="w-full py-32 bg-white dark:bg-[#0A0A0A] text-black dark:text-white px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-gray-900 transition-colors duration-300"
      id="model-intelligence"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6 max-w-5xl">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white leading-tight">
            Dual Sovereign AI Restriction
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-5xl">
            To guarantee absolute data sovereignty and regulatory compliance, the platform is restricted<br className="hidden md:inline" /> exclusively to the industry's premier model providers, hosted securely on Microsoft Azure and Google Cloud.
          </p>
        </div>

        {/* Providers Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl mx-auto items-stretch">
          {providers.map((provider, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between p-8 rounded-[32px] border bg-gray-50 dark:bg-black/40 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300 h-full"
            >
              <div className="flex flex-col gap-8 h-full justify-between">
                {/* Header Row: Icon, Title & Brand */}
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center p-3 shadow-sm flex-shrink-0">
                    {provider.icon}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white leading-tight">
                      {provider.name}
                    </h4>
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                      {provider.brand}
                    </span>
                  </div>
                </div>

                {/* Models List */}
                <div className="flex flex-col gap-4 flex-grow justify-end mt-4">
                  <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Supported Models
                  </span>
                  <div className={cn(
                    "grid gap-4 h-full",
                    provider.models.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                  )}>
                    {provider.models.map((model, mIdx) => (
                      <div
                        key={mIdx}
                        className="flex flex-col justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-black/30 border border-gray-100 dark:border-gray-900 shadow-sm hover:border-gray-200 dark:hover:border-gray-700 dark:hover:bg-black/60 transition-all duration-300 h-full"
                      >
                        <div className="flex flex-col gap-3">
                          {/* Title and Metric Row */}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                              <span className="text-sm font-bold text-black dark:text-white">
                                {model.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">
                              {model.metric.value} {model.metric.label}
                            </span>
                          </div>

                          {/* Specialization Role & Description */}
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
                              {model.role}
                            </span>
                            <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                              {model.description}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {model.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[9px] font-bold px-2 py-0.5 rounded bg-gray-100/50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-800/30 whitespace-nowrap"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
