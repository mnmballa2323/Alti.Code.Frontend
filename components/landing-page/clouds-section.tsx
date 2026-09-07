"use client";

import React from "react";
import { Icon } from "@iconify/react";

type AzureService = {
  id: string;
  name: string;
  icon: string;
  rgb: string;
  color: string;
};

const azureServices: AzureService[] = [
  {
    id: "azure-foundry",
    name: "Azure AI Foundry",
    icon: "logos:microsoft-azure",
    rgb: "0, 137, 214",
    color: "#0089D6",
  },
  {
    id: "azure-aks",
    name: "Azure Kubernetes Service",
    icon: "logos:kubernetes",
    rgb: "50, 108, 229",
    color: "#326CE5",
  },
  {
    id: "azure-cosmos",
    name: "Azure Cosmos DB",
    icon: "logos:azure-icon",
    rgb: "0, 120, 212",
    color: "#0078D4",
  },
];

export default function CloudsSection() {
  return (
    <section className="w-full pt-16 pb-28 bg-white dark:bg-[#030303] text-black dark:text-white px-4 sm:px-6 lg:px-8 border-none transition-colors duration-300 overflow-hidden relative">
      {/* Soft background grid lines */}
      <div className="absolute inset-0 moving-grid-bg opacity-[0.05] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-10 items-center text-center relative z-10">
        <div className="flex flex-col gap-6 max-w-5xl w-full px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-black dark:text-white">
            Microsoft Azure Native Sovereign Cloud
          </h3>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium max-w-3xl mx-auto">
            Architected and operating natively and exclusively on Microsoft
            Azure infrastructure. <br className="hidden md:inline" />
            Air-gapped security, Azure AI Foundry intelligence, and dedicated
            sovereign Azure specialists.
          </p>
        </div>

        {/* Static Grid Container */}
        <div className="w-full max-w-4xl px-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-center">
            {azureServices.map((service, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] group hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 cursor-pointer"
                style={
                  {
                    "--accent-color": service.color,
                    "--accent-rgb": service.rgb,
                    borderColor: service.color,
                    boxShadow: `0 4px 20px rgba(${service.rgb}, 0.15)`,
                  } as React.CSSProperties
                }
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0 transition-transform duration-300">
                  <Icon
                    className="w-5 h-5 object-contain"
                    icon={service.icon}
                  />
                </div>
                <span className="text-[13px] sm:text-sm font-semibold tracking-tight text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors whitespace-nowrap">
                  {service.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
