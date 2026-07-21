"use client";

import React from "react";

const deployments = [
  {
    name: "Amazon Web Services",
    subtitle: "AWS Bedrock",
    icon: (
      <img
        alt="AWS"
        className="w-8 h-8"
        src="/assets/cloud-logos/aws.svg?v=2"
      />
    ),
    features: [
      {
        title: "Multi-Tenant",
        description:
          "Elastic EC2 compute instances optimized for rapid scaling in shared public zones.",
      },
      {
        title: "Single-Tenant",
        description:
          "AWS Dedicated Hosts providing complete physical isolation for your instances.",
      },
      {
        title: "AWS GovCloud",
        description:
          "Isolated AWS regions certified for FedRAMP High and sensitive workloads.",
      },
    ],
  },
  {
    name: "Microsoft Azure",
    subtitle: "Azure AI Foundry",
    icon: (
      <img
        alt="Azure"
        className="w-8 h-8"
        src="/assets/cloud-logos/azure.svg"
      />
    ),
    features: [
      {
        title: "Multi-Tenant",
        description:
          "Highly-available Azure compute VMs optimized for scaling in public regions.",
      },
      {
        title: "Single-Tenant",
        description:
          "Azure Dedicated Hosts providing complete physical isolation for your VMs.",
      },
      {
        title: "Azure Government",
        description:
          "Isolated Azure regions certified for FedRAMP High and sensitive workloads.",
      },
    ],
  },
  {
    name: "Google Cloud",
    subtitle: "Vertex AI",
    icon: (
      <img alt="GCP" className="w-8 h-8" src="/assets/cloud-logos/gcp.svg" />
    ),
    features: [
      {
        title: "Multi-Tenant",
        description:
          "Scalable Compute Engine resources optimized for scaling in public regions.",
      },
      {
        title: "Single-Tenant",
        description:
          "Sole-tenant nodes providing complete physical isolation for your instances.",
      },
      {
        title: "Assured Workloads",
        description:
          "Compliant GCP environments certified for FedRAMP High sensitive workloads.",
      },
    ],
  },
];

export default function TriCloudSection() {
  return (
    <section
      className="w-full py-32 bg-white text-black px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      id="architecture"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-20 relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6 max-w-5xl">
          <h3 className="text-3xl sm:text-3xl md:text-4xl font-bold tracking-tight text-black leading-tight">
            Deploy Anywhere. Sovereign Security.
          </h3>
          <p className="text-lg text-zinc-600 leading-relaxed font-medium max-w-4xl mx-auto">
            Deploy sovereign AI agent swarms on AWS Bedrock, Azure Foundry, and
            Google Vertex AI.
            <br className="hidden md:block" />
            Enforce absolute compliance and physical data isolation tailored to
            your enterprise.
          </p>
        </div>

        {/* The 3 Environments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
          {deployments.map((deployment, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-6 xl:p-8 rounded-[32px] bg-zinc-100  border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-200 hover:-translate-y-1   transition-all duration-300 relative group overflow-hidden "
            >
              {/* Card Absolute Glow */}

              <div className="flex flex-col gap-6 relative z-10">
                {/* Header Row: Icon */}
                <div className="flex items-center justify-between w-full">
                  <div className="w-14 h-14 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center p-3 shadow-sm">
                    {deployment.icon}
                  </div>
                </div>

                {/* Title & Subtitle */}
                <div className="flex flex-col gap-1">
                  <h4 className="text-lg xl:text-xl font-bold tracking-tight text-black">
                    {deployment.name}
                  </h4>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    {deployment.subtitle}
                  </span>
                </div>

                {/* Features List */}
                <ul className="flex flex-col gap-4 mt-2">
                  {deployment.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 " />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-zinc-800">
                          {feature.title}
                        </span>
                        <span className="text-sm text-zinc-600 font-medium leading-relaxed">
                          {feature.description}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
