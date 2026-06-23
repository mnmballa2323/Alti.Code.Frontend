"use client";

import React from "react";

const providers = [
  {
    name: "OpenAI",
    brand: "GPT Models",
    description: "Enterprise GPT models are executed within your private tenant subnet. Data is fully encrypted at rest and in transit, with standard contractual guarantees that customer prompts and outputs are never stored or used for model training.",
    models: ["GPT-4o", "GPT-4-Turbo", "o1-preview", "o1-mini"],
    badgeColor: "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/50",
    icon: (
      <svg className="w-8 h-8 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M12 3l4.5 4.5M12 21l-4.5-4.5M3 12l4.5-4.5M21 12l-4.5 4.5" />
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.1" />
      </svg>
    )
  },
  {
    name: "Anthropic",
    brand: "Claude Models",
    description: "Claude models are deployed using Azure AI Studio's secure Model-as-a-Service (MaaS) serverless endpoints. This channels all Claude inference traffic directly through Microsoft's sovereign infrastructure, completely bypassing external networks.",
    models: ["Claude 3.5 Sonnet", "Claude 3.5 Haiku", "Claude 3 Opus"],
    badgeColor: "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50",
    icon: (
      <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0h1.5m-9-9v-1.5m0 16.5V21" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5l9 9m0-9l-9 9" />
      </svg>
    )
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
            Dual Model AI Restriction
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-5xl">
            To guarantee absolute data sovereignty and regulatory compliance, the platform is restricted<br className="hidden md:inline" /> exclusively to the industry's two premier model providers, hosted securely on Microsoft Azure.
          </p>
        </div>

        {/* Providers Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl mx-auto">
          {providers.map((provider, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between p-8 rounded-[32px] border bg-gray-50 dark:bg-black/40 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300"
            >
              <div className="flex flex-col gap-8">
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

                {/* Description */}
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  {provider.description}
                </p>

                {/* Models List */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Supported Models:</span>
                  <div className="flex flex-wrap gap-2">
                    {provider.models.map((model, mIdx) => (
                      <span
                        key={mIdx}
                        className={`text-xs font-medium px-3 py-1 rounded-lg border ${provider.badgeColor}`}
                      >
                        {model}
                      </span>
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
