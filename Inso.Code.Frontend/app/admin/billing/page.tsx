"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Landmark } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";

import { CreditCardForm } from "./components/CreditCardForm";
import { ACHBankForm } from "./components/ACHBankForm";

// Initialize Stripe outside of component render to avoid recreating Stripe object
// Forcing a test key so Stripe doesn't block localhost HTTP connections (live keys crash on localhost)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
).catch((err) => {
  console.error("Failed to load Stripe.js:", err);

  return null;
});

export default function BillingPage() {
  const { data: session } = useSession();
  const [paymentType, setPaymentType] = useState<"card" | "ach">("card");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  /**
   * Fetches a SetupIntent client secret from the backend.
   */
  const fetchSetupIntent = async (type: "card" | "us_bank_account") => {
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

      const token =
        (session?.user as any)?.accessToken ||
        (typeof window !== "undefined" &&
          localStorage.getItem("accessToken")) ||
        (typeof window !== "undefined" && localStorage.getItem("token"));

      const res = await fetch(`${API_URL}/payment/create-setup-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payment_method_type: type }),
      });

      const data = await res.json();

      if (data?.success && data?.data?.clientSecret) {
        setClientSecret(data.data.clientSecret);
      }
    } catch (err) {
      // Silently fail — forms will still render and work in Stripe Elements mode
      console.warn(
        "Could not fetch SetupIntent (backend may be offline):",
        err,
      );
    }
  };

  // Attempt to fetch a SetupIntent when the payment type changes
  useEffect(() => {
    if (session?.user) {
      fetchSetupIntent(paymentType === "ach" ? "us_bank_account" : "card");
    }
  }, [paymentType, session]);

  return (
    <div className="w-full pt-6">
      <div className="flex flex-col gap-6 w-full">
        {/* Payment Method Selector Toggle */}
        <div className="flex bg-neutral-200/70 dark:bg-neutral-800 p-1 rounded-xl w-max">
          <button
            className={`px-5 py-2.5 text-xs font-bold transition-all rounded-lg focus:outline-none flex items-center gap-2 ${paymentType === "card" ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"}`}
            type="button"
            onClick={() => setPaymentType("card")}
          >
            <CreditCard className="w-4 h-4" />
            Credit Card
          </button>
          <button
            className={`px-5 py-2.5 text-xs font-bold transition-all rounded-lg focus:outline-none flex items-center gap-2 ${paymentType === "ach" ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"}`}
            type="button"
            onClick={() => setPaymentType("ach")}
          >
            <Landmark className="w-4 h-4" />
            ACH Bank Debit
          </button>
        </div>

        {/* Payment Forms — always rendered, wrapped in Stripe Elements */}
        <Elements stripe={stripePromise}>
          {paymentType === "card" && (
            <CreditCardForm clientSecret={clientSecret} />
          )}
          {paymentType === "ach" && <ACHBankForm clientSecret={clientSecret} />}
        </Elements>
      </div>
    </div>
  );
}
