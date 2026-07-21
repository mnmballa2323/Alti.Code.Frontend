"use client";

import React from "react";
import { Icon } from "@iconify/react";

const clouds = [
  {
    id: "aws",
    name: "AWS",
    icon: "logos:aws",
    rgb: "35, 47, 62",
    color: "#232F3E",
  },
  {
    id: "google-cloud",
    name: "Google Cloud",
    icon: "logos:google-cloud",
    rgb: "66, 133, 244",
    color: "#4285F4",
  },
  {
    id: "azure",
    name: "Microsoft Azure",
    icon: "logos:microsoft-azure",
    rgb: "0, 137, 214",
    color: "#0089D6",
  },
  {
    id: "alibaba",
    name: "Alibaba Cloud",
    icon: "simple-icons:alibabacloud",
    rgb: "255, 102, 0",
    color: "#FF6600",
    isMonochrome: true,
  },
  {
    id: "oracle",
    name: "Oracle Cloud",
    icon: "logos:oracle",
    rgb: "248, 0, 0",
    color: "#F80000",
  },
  {
    id: "ibm",
    name: "IBM Cloud",
    icon: "logos:ibm",
    rgb: "5, 47, 173",
    color: "#052FAD",
  },
];

export default function CloudsSection() {
  return (
    <section className="w-full py-16 bg-white dark:bg-[#030303] text-black dark:text-white px-4 sm:px-6 lg:px-8 border-none transition-colors duration-300 overflow-hidden relative">
      {/* Soft background grid lines */}
      <div className="absolute inset-0 moving-grid-bg opacity-[0.05] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-10 items-center text-center relative z-10">
        <div className="flex flex-col gap-6 max-w-5xl w-full px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-black dark:text-white">
            Universal Cloud Integration
          </h3>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium max-w-2xl mx-auto">
            Deploy your sovereign agent swarms onto the top 6 global cloud
            platforms with absolute data privacy.
          </p>
        </div>

        {/* Static Grid Container */}
        <div className="w-full max-w-7xl px-4 mt-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 justify-center">
            {clouds.map((cloud, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] group hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                style={
                  {
                    "--accent-color": cloud.color,
                    "--accent-rgb": cloud.rgb,
                  } as React.CSSProperties
                }
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform duration-300">
                  <Icon
                    className="w-5 h-5 object-contain"
                    icon={cloud.icon}
                    style={cloud.isMonochrome ? { color: cloud.color } : undefined}
                  />
                </div>
                <span className="text-[13px] sm:text-sm font-semibold tracking-tight text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors whitespace-nowrap">
                  {cloud.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
