"use client";

import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";

import { CreditCardForm } from "./components/CreditCardForm";

// Initialize Stripe outside of component render to avoid recreating Stripe object
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
).catch((err) => {
  console.error("Failed to load Stripe.js:", err);

  return null;
});

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

// Mock saved cards for demonstration
const MOCK_SAVED_CARDS: SavedCard[] = [
  {
    id: "pm_1",
    brand: "Visa",
    last4: "4242",
    expMonth: 8,
    expYear: 27,
    isDefault: true,
  },
  {
    id: "pm_2",
    brand: "Mastercard",
    last4: "8510",
    expMonth: 3,
    expYear: 26,
    isDefault: false,
  },
  {
    id: "pm_3",
    brand: "Amex",
    last4: "1001",
    expMonth: 12,
    expYear: 28,
    isDefault: false,
  },
];

const BRAND_LOGOS: Record<string, string> = {
  Visa: "/images/cards/visa_official.png",
  Mastercard: "/images/cards/mastercard_official.png",
  Amex: "/images/cards/amex_official.png",
};

const BRAND_DISPLAY: Record<string, string> = {
  Visa: "Visa",
  Mastercard: "Mastercard",
  Amex: "American Express",
};

function CardBrandLogo({ brand }: { brand: string }) {
  const containerStyle =
    "w-12 h-6 flex items-center justify-center shrink-0 bg-transparent";
  const logoSrc = BRAND_LOGOS[brand];

  if (!logoSrc) {
    return (
      <div className={containerStyle}>
        <svg
          className="h-4 w-auto"
          viewBox="0 0 120 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            fill="#999"
            fontFamily="Arial"
            fontSize="20"
            fontWeight="bold"
            textAnchor="middle"
            x="60"
            y="26"
          >
            CARD
          </text>
        </svg>
      </div>
    );
  }

  // Force absolute uniformity: all logos fit inside a 48px width by 18px (h-4.5) height bounding box
  return (
    <div className={containerStyle}>
      <img
        alt={brand}
        className="max-w-full max-h-4 object-contain"
        src={logoSrc}
      />
    </div>
  );
}

export default function BillingPage() {
  const { data: session } = useSession();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>(MOCK_SAVED_CARDS);

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
      console.warn(
        "Could not fetch SetupIntent (backend may be offline):",
        err,
      );
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchSetupIntent("card");
    }
  }, [session]);

  const handleSetDefault = (cardId: string) => {
    setSavedCards((prev) =>
      prev.map((c) => ({ ...c, isDefault: c.id === cardId })),
    );
  };

  const handleRemoveCard = (cardId: string) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  return (
    <div className="w-full pt-6">
      <div className="flex flex-col gap-8 w-full">
        {/* Credit Card Form */}
        <Elements stripe={stripePromise}>
          <CreditCardForm clientSecret={clientSecret} />
        </Elements>

        {/* Divider */}
        {savedCards.length > 0 && (
          <div className="border-t border-neutral-100 dark:border-neutral-800" />
        )}

        {/* Saved Payment Methods */}
        {savedCards.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              Saved Payment Methods
            </h3>
            <div className="flex flex-col gap-2">
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between px-5 py-3.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <CardBrandLogo brand={card.brand} />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {BRAND_DISPLAY[card.brand] || card.brand} ••••{" "}
                        {card.last4}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Expires {String(card.expMonth).padStart(2, "0")}/
                        {card.expYear}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {card.isDefault ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Default
                      </span>
                    ) : (
                      <button
                        className="text-[11px] font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                        type="button"
                        onClick={() => handleSetDefault(card.id)}
                      >
                        Set as default
                      </button>
                    )}
                    <button
                      className="p-1.5 text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                      title="Remove card"
                      type="button"
                      onClick={() => handleRemoveCard(card.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
