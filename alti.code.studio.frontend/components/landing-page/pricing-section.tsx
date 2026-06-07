"use client";

import React from "react";
import { Cloud, Shield, Zap } from "lucide-react";

const plans = [
  {
    name: "Multi-Tenant Private Cloud",
    price: "250",
    description:
      "For individual developers who want zero-configuration, production-grade agent power.",
    icon: <Cloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    bulletColor: "bg-blue-500 dark:bg-blue-400",
    features: [
      "Hosted on Inso's secure multi-tenant cloud",
      "Unlimited access to Tri-Cloud model registry",
      "Standard execution queue for agent sandboxes",
      "Automatic scaling and zero infrastructure setup",
      "Community support & standard Slack channel access",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Team Plan",
    price: "300",
    description:
      "For engineering teams collaborating on complex swarms and shared workflows.",
    icon: <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    bulletColor: "bg-indigo-500 dark:bg-indigo-400",
    features: [
      "Hosted on Inso's secure multi-tenant cloud",
      "Shared workspaces and team project repositories",
      "Priority execution queue and higher concurrency",
      "Collaborative agent review loops and control loops",
      "Team-wide secrets management & access logs",
      "Priority developer support with 8hr response SLA",
    ],
    cta: "Upgrade Team",
    popular: true,
  },
  {
    name: "Enterprise Plan",
    price: "500",
    description:
      "For enterprises requiring complete data sovereignty and custom cloud environments.",
    icon: <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    bulletColor: "bg-emerald-500 dark:bg-emerald-400",
    features: [
      "Custom deployment: Single-tenant private cloud",
      "Self-hosted VPC on AWS, Azure, or GCP",
      "Full data sovereignty with zero external egress",
      "Custom agent hooks and VPC peering configurations",
      "Bring Your Own Keys (BYOK) model integration",
      "Dedicated account manager & 24/7 emergency phone SLA",
    ],
    cta: "Contact Enterprise",
    popular: false,
  },
];

export default function PricingSection() {
  return (
    <section
      className="w-full py-24 bg-white dark:bg-[#0A0A0A] px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-gray-900 transition-colors duration-300"
      id="pricing"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mb-20">
          <div className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-full tracking-wider uppercase">
            Flexible Plans
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-black dark:text-white leading-tight">
            Predictable Pricing.
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Deploy autonomous agent swarms in our secure multi-tenant cloud or
            your own enterprise tenant. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative flex flex-col justify-between p-8 md:p-10 rounded-[32px] border transition-all duration-300 ${
                plan.popular
                  ? "bg-slate-50 dark:bg-[#111111] border-blue-500/50 shadow-lg dark:shadow-blue-950/20 scale-105 z-10 md:-translate-y-2"
                  : "bg-white dark:bg-black border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700"
              }`}
            >
              {plan.popular && (
                <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-4 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full shadow-sm">
                  Most Popular
                </span>
              )}

              <div>
                {/* Icon & Plan Name */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-gray-800">
                    {plan.icon}
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white tracking-tight">
                    {plan.name}
                  </h3>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl md:text-5xl font-black text-black dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    {plan.name === "Multi-Tenant Private Cloud"
                      ? "/ month"
                      : "/ user / month"}
                  </span>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 font-medium">
                  {plan.description}
                </p>

                {/* Divider */}
                <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-8" />

                {/* Features List */}
                <ul className="flex flex-col gap-4 mb-10">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${plan.bulletColor}`} />
                      <span className="text-gray-600 dark:text-gray-300 font-medium leading-normal">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                  plan.popular
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
                    : "bg-gray-50 hover:bg-gray-100 dark:bg-neutral-950 dark:hover:bg-neutral-900 text-black dark:text-white border border-gray-200/50 dark:border-gray-800 active:scale-[0.98]"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
