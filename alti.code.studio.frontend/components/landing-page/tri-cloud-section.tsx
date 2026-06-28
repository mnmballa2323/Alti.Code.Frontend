"use client";

import React from "react";

const deployments = [
  {
    name: "Google Cloud",
    subtitle: "Multi-tenant Google Cloud",
    icon: (
      <img
        alt="Google Cloud"
        className="w-8 h-8"
        src="/assets/cloud-logos/gcp.svg"
      />
    ),
    description:
      "Deploy scalable and shared cloud compute resources optimized for rapid deployment while ensuring corporate compliance in public tenant zones.",
  },
  {
    name: "Dedicated Cloud",
    subtitle: "Single-tenant Google Cloud",
    icon: (
      <img
        alt="Dedicated Cloud"
        className="w-8 h-8"
        src="/assets/cloud-logos/gcp.svg"
      />
    ),
    description:
      "Deploy dedicated single tenant infrastructure featuring complete physical data isolation and advanced virtual networks for enterprise safety.",
  },
  {
    name: "Assured Workloads",
    subtitle: "Sovereign Google Cloud",
    icon: (
      <img
        alt="Assured Workloads"
        className="w-8 h-8"
        src="/assets/cloud-logos/gcp.svg"
      />
    ),
    description:
      "Deploy compliant and isolated sovereign cloud instances certified for FedRAMP High and government regulations to secure sensitive public workloads.",
  },
];

export default function GcpSovereignSection() {
  return (
    <section
      className="w-full py-32 bg-white dark:bg-[#0A0A0A] text-black dark:text-white px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-gray-900 transition-colors duration-300"
      id="architecture"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-20">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6 max-w-5xl">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white leading-tight">
            Google Cloud. Sovereign Security.
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium max-w-5xl">
            Deploy sovereign AI agent swarms on Google Cloud, Dedicated Cloud,
            and Assured Workloads environments. Enforce absolute compliance and
            data isolation tailored to your organization.
          </p>
        </div>

        {/* The 3 Environments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {deployments.map((deployment, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between p-6 xl:p-8 rounded-[32px] border bg-gray-50 dark:bg-black/40 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300"
            >
              <div className="flex flex-col gap-6">
                {/* Header Row: Icon */}
                <div className="flex items-center justify-between w-full">
                  <div className="w-14 h-14 bg-white dark:bg-[#111] border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-center p-3 shadow-sm">
                    {deployment.icon}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg xl:text-xl font-bold tracking-tight text-black dark:text-white">
                    {deployment.name}
                  </h4>
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                    {deployment.subtitle}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                  {deployment.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
