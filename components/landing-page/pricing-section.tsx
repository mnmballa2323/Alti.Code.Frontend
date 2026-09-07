"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/store";

const plans = [
  {
    name: "Enterprise Platform",
    price: "99",
    commitment: "Min. 1 seat",
    backendPlan: "launch",
    backendPrice: 9900,
    description: (
      <>
        Flat platform fee for secure sandboxed orchestration. Inference usage is
        billed at cost via your sovereign cloud provider for absolute data
        privacy.
      </>
    ),
    features: [
      "Native sovereign models",
      "At-cost token routing (zero markup)",
      "Secure sandboxed runtimes",
      "Dedicated sovereign agent swarms",
    ],
    cta: "Deploy Now",
    buttonClass: "bg-black text-white hover:bg-zinc-800",
    isContact: false,
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
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

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
      className="w-full py-24 bg-white text-black px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      id="pricing"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mb-20">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-black leading-tight">
            Predictable Pricing
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed font-medium">
            Enterprise licensing for sovereign agent orchestration and secure
            sandboxing.
            <br />
            Inference token usage is billed directly at cost or routed via
            client-managed keys.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 gap-8 w-full max-w-md items-stretch mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between p-6 xl:p-8 rounded-[32px] bg-zinc-100 transition-all duration-300 border"
              style={{
                borderColor: "#2563EB",
                boxShadow: "0 4px 20px rgba(37, 99, 235, 0.15)",
              }}
            >
              <div className="flex-1 flex flex-col justify-between mb-8">
                <div>
                  {/* Price Display */}
                  <div className="flex flex-col gap-1.5 mb-6 text-left">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-extrabold text-black tracking-tight shrink-0">
                        ${plan.price}
                      </span>
                      <span className="text-zinc-500 text-sm font-medium whitespace-nowrap">
                        / user / mo
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 mt-auto">
                  <p className="text-zinc-600 text-sm leading-relaxed font-medium text-left">
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
                ) : status === "authenticated" ? (
                  "Subscribe Now"
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
