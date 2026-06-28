"use client";

import React from "react";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Cloud",
    price: "1,000",
    commitment: "Min. 1 seat",
    description: (
      <>
        Sovereign agent systems in standard multi-tenant commercial zones for
        corporate compliance.
      </>
    ),
    features: [
      "Multi-tenant deployment",
      "Google Cloud host",
      "Shared infrastructure",
      "Fastest deployment",
    ],
    cta: "Deploy Cloud",
    buttonClass:
      "bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black",
  },
  {
    name: "Dedicated",
    price: "2,500",
    commitment: "Min. 5 seats",
    description: (
      <>
        Dedicated single-tenant infrastructure with enhanced security and
        physical data isolation.
      </>
    ),
    features: [
      "Single-tenant deployment",
      "Google Cloud host",
      "Dedicated infrastructure",
      "Enhanced security & data isolation",
    ],
    cta: "Deploy Dedicated",
    buttonClass:
      "bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black",
  },
  {
    name: "Sovereign",
    price: "5,000",
    commitment: "Min. 10 seats",
    description: (
      <>
        FedRAMP High and strict sovereignty-compliant environments for public
        sector workloads.
      </>
    ),
    features: [
      "Sovereign deployment",
      "Google Cloud Assured Workloads",
      "FedRAMP High capable",
      "Sovereign security controls",
    ],
    cta: "Contact Us",
    buttonClass:
      "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600",
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
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-black dark:text-white leading-tight">
            Predictable Pricing.
          </h2>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Enterprise licensing for sovereign agent orchestration and secure
            sandboxing.
            <br />
            Inference token usage is billed directly at cost or routed via
            client-managed keys.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl items-stretch mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between p-6 xl:p-8 rounded-[32px] border bg-gray-50 dark:bg-black/40 border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300"
            >
              <div className="flex-1 flex flex-col justify-between mb-8">
                <div>
                  {/* Plan Name */}
                  <div className="mb-6">
                    <h3 className="text-sm xl:text-base font-bold text-black dark:text-white tracking-tight text-left whitespace-nowrap">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Price Display */}
                  <div className="flex flex-col gap-1.5 mb-6 text-left">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-extrabold text-black dark:text-white tracking-tight shrink-0">
                        ${plan.price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium whitespace-nowrap">
                        / user / mo
                      </span>
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                      {plan.commitment} • Billed Annually
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-6 mt-auto">
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium text-left">
                    {plan.description}
                  </p>

                  {/* Features List */}
                  <div className="border-t border-gray-200/60 dark:border-gray-800/60 pt-5">
                    <ul className="space-y-3 text-left">
                      {plan.features.map((feature, fIdx) => (
                        <li
                          key={fIdx}
                          className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2"
                        >
                          <Check className="w-4.5 h-4.5 text-emerald-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 border border-transparent active:scale-[0.98] ${plan.buttonClass}`}
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
