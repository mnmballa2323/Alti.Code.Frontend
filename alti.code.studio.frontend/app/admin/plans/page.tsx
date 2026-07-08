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
        Sovereign agent systems in standard multi tenant zones for strict
        corporate compliance and comprehensive data security.
      </>
    ),
    features: [
      "Multi tenant deployment",
      "Google Cloud host",
      "Shared infrastructure",
      "Fastest deployment",
    ],
    cta: "Current Plan",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white disabled:text-white",
    isContact: false,
    isCurrent: true,
  },
  {
    name: "Dedicated",
    price: "2,500",
    commitment: "Min. 5 seats",
    backendPlan: "build",
    backendPrice: 250000,
    description: (
      <>
        Dedicated single tenant infrastructure entirely isolated on private
        networks for unparalleled security and complete data isolation.
      </>
    ),
    features: [
      "Single tenant deployment",
      "Google Cloud host",
      "Dedicated infrastructure",
      "Enhanced security & data isolation",
    ],
    cta: "Select Plan",
    buttonClass: "bg-white text-black hover:bg-zinc-100",
    isContact: false,
    isCurrent: false,
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
    buttonClass: "bg-white text-black hover:bg-zinc-100",
    isContact: true,
    isCurrent: false,
  },
];

export default function PlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const profile = useAppSelector((state) => state.user.data);
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleCheckout = async (plan: (typeof plans)[number]) => {
    if (plan.isContact) {
      router.push("/contact");
      return;
    }
    
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
        }),
      });

      const data = await res.json();

      if (data?.data?.url) {
        window.location.href = data.data.url;
      } else if (data?.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
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
    <div className="flex-1 bg-[#F4F4F6] dark:bg-background min-h-screen p-8 lg:p-12 overflow-y-auto">
      <div className="max-w-[85rem] mx-auto pt-4 md:pt-12">
        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between p-5 xl:p-6 rounded-[32px] bg-[#030014] border border-blue-500/50 shadow-sm transition-all duration-300"
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
                  </div>
                </div>

                <div className="flex flex-col gap-6 mt-auto">
                  <p className="text-zinc-400 text-[13px] leading-relaxed font-medium text-left">
                    {plan.description}
                  </p>
                </div>
              </div>

              <button
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 disabled:cursor-not-allowed ${plan.buttonClass} ${plan.isCurrent ? "" : "disabled:opacity-60"}`}
                disabled={loading === plan.backendPlan || plan.isCurrent}
                onClick={() => !plan.isCurrent && handleCheckout(plan)}
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
    </div>
  );
}
