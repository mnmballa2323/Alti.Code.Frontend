"use client";

import React, { useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";

interface ACHBankFormProps {
  clientSecret: string | null;
}

export function ACHBankForm({ clientSecret }: ACHBankFormProps) {
  const stripe = useStripe();
  const [accountName, setAccountName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLinkBank = async () => {
    if (!stripe) {
      setError(
        "Stripe failed to connect. Please pause your adblocker to securely link your bank.",
      );

      return;
    }

    if (!accountName.trim()) {
      setError("Please enter the account holder name.");

      return;
    }

    if (!clientSecret) {
      setError(
        "Payment service is initializing. Please wait a moment and try again.",
      );

      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const { setupIntent, error: stripeError } =
        await stripe.collectBankAccountForSetup({
          clientSecret,
          params: {
            payment_method_type: "us_bank_account",
            payment_method_data: {
              billing_details: {
                name: accountName,
                email: undefined,
              },
            },
          },
        });

      if (stripeError) {
        setError(
          stripeError.message ??
            "An error occurred while connecting your bank account.",
        );
      } else if (setupIntent?.status === "requires_confirmation") {
        // User selected a bank account — now confirm the SetupIntent
        const { error: confirmError, setupIntent: confirmedIntent } =
          await stripe.confirmUsBankAccountSetup(clientSecret);

        if (confirmError) {
          setError(confirmError.message ?? "Bank verification failed.");
        } else if (confirmedIntent?.status === "succeeded") {
          setSuccess(true);
        } else if (
          confirmedIntent?.status === "requires_action" &&
          confirmedIntent?.next_action?.type === "verify_with_microdeposits"
        ) {
          setSuccess(true);
        }
      } else if (setupIntent?.status === "succeeded") {
        setSuccess(true);
      }
    } catch (err) {
      setError("Failed to connect your bank account. Please try again.");
    }

    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          className="flex-1 h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
          placeholder="Account Holder Name"
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
        />
        <button
          className="px-10 h-11 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-sm font-semibold rounded-xl shadow-sm focus:outline-none disabled:opacity-50 shrink-0 min-w-[200px]"
          disabled={isProcessing}
          type="button"
          onClick={handleLinkBank}
        >
          {isProcessing ? "Linking..." : "Link Bank Account"}
        </button>
      </div>

      <p className="text-[11px] text-neutral-500 tracking-wide">
        <span className="font-bold text-neutral-900 dark:text-neutral-200">
          Stripe Financial Connections:
        </span>{" "}
        Your bank account will be securely linked and instantly verified.
      </p>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
            ✓ Bank account linked successfully! It will be used for your monthly
            recurring billing.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-xs font-semibold">{error}</div>
      )}
    </div>
  );
}
