"use client";

import React, { useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";

interface CreditCardFormProps {
  clientSecret: string | null;
}

export function CreditCardForm({ clientSecret }: CreditCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [name, setName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      setIsProcessing(false);
      return;
    }

    try {
      if (clientSecret) {
        // Real flow: confirm the SetupIntent to save the card
        const { error: stripeError, setupIntent } =
          await stripe.confirmCardSetup(clientSecret, {
            payment_method: {
              card: cardNumberElement,
              billing_details: {
                name: name,
              },
            },
          });

        if (stripeError) {
          setError(stripeError.message ?? "An error occurred while saving your card.");
        } else if (setupIntent?.status === "succeeded") {
          setSuccess(true);
          setName("");
        }
      } else {
        // Fallback: create a PaymentMethod directly (no SetupIntent)
        const { error: stripeError, paymentMethod } =
          await stripe.createPaymentMethod({
            type: "card",
            card: cardNumberElement,
            billing_details: {
              name: name,
            },
          });

        if (stripeError) {
          setError(stripeError.message ?? "An error occurred.");
        } else {
          setSuccess(true);
          setName("");
          console.log("PaymentMethod created:", paymentMethod?.id);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }

    setIsProcessing(false);
  };

  const ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: "14px",
        color: "#404040",
        "::placeholder": {
          color: "#a3a3a3",
        },
        iconColor: "#404040",
      },
      invalid: {
        color: "#ef4444",
      },
    },
  };

  const cardNumberOptions = {
    ...ELEMENT_OPTIONS,
    placeholder: "Card Number",
  };

  const cardExpiryOptions = {
    ...ELEMENT_OPTIONS,
    placeholder: "MM / YY",
  };

  const cardCvcOptions = {
    ...ELEMENT_OPTIONS,
    placeholder: "CVC",
  };

  const FallbackInput = ({ placeholder }: { placeholder: string }) => {
    const [val, setVal] = useState("");
    return (
      <input
        className="w-full h-full bg-transparent text-[14px] text-[#404040] placeholder:text-[#a3a3a3] focus:outline-none"
        placeholder={placeholder}
        type="text"
        title="Disable your adblocker to securely enter payment details"
        value={val}
        onChange={(e) => {
          // Allow numbers, spaces, and slashes
          setVal(e.target.value.replace(/[^0-9\s/]/g, ""));
        }}
      />
    );
  };

  const wrapperClass =
    "w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-center";

  return (
    <form onSubmit={handleSaveCard} className="flex flex-col gap-6 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <input
          className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
          placeholder="Cardholder Name"
          type="text"
          value={name}
          onChange={(e) => {
            // Only allow letters and spaces
            const textOnly = e.target.value.replace(/[^a-zA-Z\s]/g, "");
            setName(textOnly);
          }}
          required
        />
        <div className={wrapperClass}>
          {stripe ? <CardNumberElement options={cardNumberOptions} /> : <FallbackInput placeholder="Card Number" />}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className={wrapperClass}>
          {stripe ? <CardExpiryElement options={cardExpiryOptions} /> : <FallbackInput placeholder="MM / YY" />}
        </div>
        <div className={wrapperClass}>
          {stripe ? <CardCvcElement options={cardCvcOptions} /> : <FallbackInput placeholder="CVC" />}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
            ✓ Card saved successfully! It will be used for your monthly billing.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-xs font-semibold">{error}</div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-[11px] text-neutral-500 tracking-wide">
          <span className="font-bold text-neutral-900 dark:text-neutral-200">
            Stripe Security Notice:
          </span>{" "}
          Your card information is encrypted and securely saved via Stripe
          Vault.
        </p>
        <button
          className="px-10 h-11 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-sm font-semibold rounded-xl shadow-sm focus:outline-none disabled:opacity-50 shrink-0 min-w-[200px]"
          type="submit"
          disabled={isProcessing}
        >
          {isProcessing ? "Saving..." : "Save Card"}
        </button>
      </div>
    </form>
  );
}
