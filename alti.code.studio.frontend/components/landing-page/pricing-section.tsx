"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";

const plans = [
  {
    name: "Cloud",
    price: "1,000",
    commitment: "Min. 1 seat",
    backendPlan: "launch",
    backendPrice: 100000,
    description: (
      <>
        Sovereign agent systems in standard multi tenant zones designed for
        corporate compliance and security.
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
    isContact: false,
  },
  {
    name: "Dedicated",
    price: "2,500",
    commitment: "Min. 5 seats",
    backendPlan: "build",
    backendPrice: 250000,
    description: (
      <>
        Dedicated single tenant infrastructure isolated on private networks with
        enhanced security and data isolation.
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
    isContact: false,
  },
  {
    name: "Sovereign",
    price: "5,000",
    commitment: "Min. 10 seats",
    backendPlan: "scale",
    backendPrice: 500000,
    description: (
      <>
        FedRAMP High and strict sovereignty compliant environments for
        classified public sector agent workloads.
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
    isContact: true,
  },
];

export default function PricingSection() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const profile = useAppSelector((state) => state.user.data);
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleCheckout = async (plan: (typeof plans)[number]) => {
    // Sovereign tier → contact form
    if (plan.isContact) {
      router.push("/contact");
      return;
    }

    // Not logged in → register first
    if (status !== "authenticated" || !session?.user) {
      router.push("/register");
      return;
    }

    setLoading(plan.backendPlan);

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

      const token =
        (session.user as any).accessToken ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token");

      const res = await fetch(`${API_URL}/payment/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_name: plan.backendPlan,
          price: plan.backendPrice,
          duration: "year",
        }),
      });

      const data = await res.json();

      if (data?.data?.url) {
        window.location.href = data.data.url;
      } else if (data?.data) {
        window.location.href = data.data;
      } else {
        console.error("Checkout session response:", data);
        alert("Unable to start checkout. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Payment service unavailable. Please try again later.");
    } finally {
      setLoading(null);
    }
  };

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
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleCheckout(plan)}
                disabled={loading === plan.backendPlan}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 border border-transparent active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed ${plan.buttonClass}`}
              >
                {loading === plan.backendPlan ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Processing…
                  </span>
                ) : (
                  plan.cta
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
