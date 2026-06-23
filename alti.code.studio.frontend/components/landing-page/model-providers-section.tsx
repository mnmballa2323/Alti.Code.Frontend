"use client";

import React from "react";

const providers = [
  {
    name: "Azure OpenAI Foundry",
    brand: "OpenAI GPT-4o / o1 Integration",
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
    name: "Azure AI Studio",
    brand: "Anthropic Claude 3.5 Integration",
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
        <div className="flex flex-col items-center text-center gap-6 max-w-4xl">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white leading-tight">
            Dual Model AI Restriction
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            To guarantee absolute data sovereignty and regulatory compliance, the platform is restricted exclusively to the industry's two premier model providers, hosted securely on Microsoft Azure.
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
                {/* Header Row: Icon */}
                <div className="flex items-center justify-between w-full">
                  <div className="w-14 h-14 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center p-3 shadow-sm">
                    {provider.icon}
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 uppercase tracking-wider">
                    Azure Native
                  </span>
                </div>

                {/* Title & Brand */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
                    {provider.name}
                  </h4>
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    {provider.brand}
                  </span>
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

        {/* Security Warning Box */}
        <div className="w-full max-w-5xl p-8 rounded-3xl border border-red-100 bg-red-50/30 dark:border-red-950/40 dark:bg-red-950/10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-2xl flex items-center justify-center flex-shrink-0 text-red-600 dark:text-red-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-red-800 dark:text-red-300">
              Sovereign Endpoint Compliance Guardrail
            </span>
            <p className="text-xs sm:text-sm text-red-700/80 dark:text-red-400/80 leading-relaxed font-medium">
              In accordance with Azure Sovereign Cloud policy requirements (DoD IL5 & FedRAMP High), our model router blocks all direct outbound calls to third-party public AI providers (such as AWS Bedrock, GCP Vertex AI, or public OpenAI APIs) at the network security level. Only Azure-hosted Foundry and AI Studio endpoints are authorized.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
