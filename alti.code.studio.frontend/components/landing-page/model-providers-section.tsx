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
      <svg className="w-8 h-8 text-[#00A67E]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
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
      <svg className="w-8 h-8 text-[#CC9E76] dark:text-[#E0B896]" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
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
