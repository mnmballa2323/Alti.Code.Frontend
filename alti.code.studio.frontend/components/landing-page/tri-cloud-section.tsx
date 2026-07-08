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
      "Deploy scalable cloud compute resources optimized for rapid deployment while ensuring compliance in public zones.",
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
      "Deploy dedicated single tenant cloud infrastructure featuring complete physical data isolation and advanced virtual networks.",
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
      "Deploy compliant sovereign cloud instances certified for FedRAMP High and government regulations for sensitive public workloads.",
  },
];

export default function GcpSovereignSection() {
  return (
    <section
      className="w-full py-32 bg-[#030014] text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      id="architecture"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto flex flex-col items-center gap-20 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6 max-w-5xl">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Google Cloud. Sovereign Security.
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-zinc-400 leading-relaxed font-medium max-w-4xl">
            Deploy sovereign AI agent swarms on Google Cloud, Dedicated, and
            Assured Workloads. Enforce absolute compliance and physical data
            isolation tailored to your enterprise.
          </p>
        </div>

        {/* The 3 Environments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {deployments.map((deployment, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-6 xl:p-8 rounded-[32px] bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-blue-500/50 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300 relative group overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]"
            >
              {/* Card Absolute Glow */}
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-600/10 rounded-full blur-[60px] group-hover:bg-blue-500/20 transition-all duration-500 pointer-events-none" />

              <div className="flex flex-col gap-6 relative z-10">
                {/* Header Row: Icon */}
                <div className="flex items-center justify-between w-full">
                  <div className="w-14 h-14 bg-blue-900/30 border border-blue-800/50 rounded-2xl flex items-center justify-center p-3 shadow-sm">
                    {deployment.icon}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg xl:text-xl font-bold tracking-tight text-white">
                    {deployment.name}
                  </h4>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    {deployment.subtitle}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">
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
