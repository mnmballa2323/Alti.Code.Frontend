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
        Sovereign agent systems in standard multi-tenant zones for strict
        corporate compliance and comprehensive data security.
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
      "bg-white text-black hover:bg-zinc-100",
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
        Dedicated single-tenant infrastructure entirely isolated on private
        networks for unparalleled security and data isolation.
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
      "bg-white text-black hover:bg-zinc-100",
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
        FedRAMP High and strict sovereignty compliant environments built
        exclusively for classified public sector workloads.
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
      "bg-blue-600 hover:bg-blue-700 text-white",
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
      className="w-full py-24 bg-[#030014] text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      id="pricing"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mb-20">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white leading-tight">
            Predictable Pricing.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-medium">
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
              className="relative flex flex-col justify-between p-6 xl:p-8 rounded-[32px] border border-blue-500/50 shadow-sm transition-all duration-300 lightning-glow-card-active"
            >
              <div className="flex-1 flex flex-col justify-between mb-8">
                <div>
                  {/* Plan Name */}
                  <div className="mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight text-left whitespace-nowrap">
                      {plan.name}
                    </h3>
                  </div>

                  {/* Price Display */}
                  <div className="flex flex-col gap-1.5 mb-6 text-left">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight shrink-0">
                        ${plan.price}
                      </span>
                      <span className="text-zinc-500 text-sm font-medium whitespace-nowrap">
                        / user / mo
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                      {plan.commitment} • Billed Annually
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-6 mt-auto">
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium text-left">
                    {plan.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 border border-transparent active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed micro-beam-btn ${plan.buttonClass}`}
                disabled={loading === plan.backendPlan}
                onClick={() => handleCheckout(plan)}
              >
                {loading === plan.backendPlan ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        fill="currentColor"
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
