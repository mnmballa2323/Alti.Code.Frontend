"use client";

import React from "react";

const plans = [
  {
    name: "Individual",
    price: "1,000",
    description:
      "For developers who want zero configuration, production grade agentic swarm power.",
    cta: "Start Free Trial",
    buttonClass:
      "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600",
  },
  {
    name: "Team",
    price: "1,500",
    description:
      "For engineering teams collaborating on complex swarms and shared workflows.",
    cta: "Upgrade Team",
    buttonClass:
      "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600",
  },
  {
    name: "Enterprise",
    price: "2,500",
    description:
      "For enterprises requiring complete data sovereignty and custom cloud environments.",
    cta: "Contact Enterprise",
    buttonClass:
      "bg-black hover:bg-neutral-900 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-black",
  },
];

export default function PricingSection() {
  return (
    <section
      className="w-full py-24 bg-gray-50 dark:bg-[#0A0A0A] px-4 sm:px-6 lg:px-8 border-t border-gray-100 dark:border-gray-900 transition-colors duration-300"
      id="pricing"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mb-20">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-black dark:text-white leading-tight">
            Predictable Pricing.
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Flat platform fee for swarm orchestration and secure sandboxing.
            <br />
            Inference token usage is tracked and billed directly at cost.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between p-8 md:p-10 rounded-[32px] border bg-white dark:bg-black border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-300"
            >
              <div className="flex-1 flex flex-col justify-between mb-8">
                <div>
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-black dark:text-white tracking-tight mb-6 text-left">
                    {plan.name}
                  </h3>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-1 mb-6 text-left">
                    <span className="text-4xl md:text-5xl font-black text-black dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                      / month
                    </span>
                  </div>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-medium mt-auto text-left">
                  {plan.description}
                </p>
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
