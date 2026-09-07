"use client";

import React from "react";
import { Icon } from "@iconify/react";

type GcpService = {
  id: string;
  name: string;
  icon: string;
  rgb: string;
  color: string;
};

const gcpServices: GcpService[] = [
  {
    id: "gcp-vertex",
    name: "Vertex AI & Gemini",
    icon: "logos:google-cloud",
    rgb: "66, 133, 244",
    color: "#4285F4",
  },
  {
    id: "gcp-run-gke",
    name: "Cloud Run & GKE",
    icon: "logos:kubernetes",
    rgb: "52, 168, 83",
    color: "#34A853",
  },
  {
    id: "gcp-data",
    name: "Cloud SQL & Spanner",
    icon: "logos:google-cloud",
    rgb: "234, 67, 53",
    color: "#EA4335",
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
            Google Cloud Platform Native Sovereign Architecture
          </h3>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium max-w-3xl mx-auto">
            Architected and operating natively and exclusively on Google Cloud Platform infrastructure. <br className="hidden md:inline" />
            Zero-trust security, Vertex AI Gemini intelligence, and dedicated sovereign Google Cloud specialists.
          </p>
        </div>

        {/* Static Grid Container */}
        <div className="w-full max-w-4xl px-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-center">
            {gcpServices.map((service, idx) => (
              <div
                key={service.id || idx}
                className="group relative flex flex-col items-center p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: `rgba(${service.rgb}, 0.1)` }}
                >
                  <Icon className="w-8 h-8" icon={service.icon} />
                </div>
                <h4 className="text-lg font-semibold tracking-tight text-black dark:text-white">
                  {service.name}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
