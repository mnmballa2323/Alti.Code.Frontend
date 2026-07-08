"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useStripe } from "@stripe/react-stripe-js";

interface ACHBankFormProps {
  clientSecret: string | null;
}

export function ACHBankForm({ clientSecret }: ACHBankFormProps) {
  const stripe = useStripe();
  const [accountName, setAccountName] = useState("");
  const [holderType, setHolderType] = useState("");
  const [accountType, setAccountType] = useState("");
  const [isHolderOpen, setIsHolderOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLinkBank = async () => {
    if (!stripe) return;

    if (!accountName.trim()) {
      setError("Please enter the account holder name.");
      return;
    }

    if (!clientSecret) {
      setError(
        "Payment service is initializing. Please wait a moment and try again."
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
            "An error occurred while connecting your bank account."
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
    <div className="flex flex-col gap-6 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="sm:col-span-2">
          <input
            className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
            placeholder="Account Holder Name"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
        </div>

        {/* Custom Holder Type Dropdown */}
        <div className="relative">
          {isHolderOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsHolderOpen(false)}
            />
          )}
          <button
            className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-left flex items-center justify-between shadow-sm focus:outline-none"
            type="button"
            onClick={() => setIsHolderOpen(!isHolderOpen)}
          >
            <span
              className={
                holderType === ""
                  ? "text-neutral-400"
                  : "text-neutral-800 dark:text-neutral-200"
              }
            >
              {holderType === ""
                ? "Select Holder Type"
                : holderType === "company"
                  ? "Company"
                  : "Individual"}
            </span>
            <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>
          {isHolderOpen && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-lg py-1.5 z-50 overflow-hidden">
              <button
                className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 transition-colors"
                type="button"
                onClick={() => {
                  setHolderType("company");
                  setIsHolderOpen(false);
                }}
              >
                Company
              </button>
              <button
                className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 transition-colors"
                type="button"
                onClick={() => {
                  setHolderType("individual");
                  setIsHolderOpen(false);
                }}
              >
                Individual
              </button>
            </div>
          )}
        </div>

        {/* Custom Account Type Dropdown */}
        <div className="relative">
          {isAccountOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsAccountOpen(false)}
            />
          )}
          <button
            className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-left flex items-center justify-between shadow-sm focus:outline-none"
            type="button"
            onClick={() => setIsAccountOpen(!isAccountOpen)}
          >
            <span
              className={
                accountType === ""
                  ? "text-neutral-400"
                  : "text-neutral-800 dark:text-neutral-200"
              }
            >
              {accountType === ""
                ? "Select Account Type"
                : accountType === "checking"
                  ? "Checking"
                  : "Savings"}
            </span>
            <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
          </button>
          {isAccountOpen && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl shadow-lg py-1.5 z-50 overflow-hidden">
              <button
                className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 transition-colors"
                type="button"
                onClick={() => {
                  setAccountType("checking");
                  setIsAccountOpen(false);
                }}
              >
                Checking
              </button>
              <button
                className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 transition-colors"
                type="button"
                onClick={() => {
                  setAccountType("savings");
                  setIsAccountOpen(false);
                }}
              >
                Savings
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <input
          className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm opacity-50 cursor-not-allowed"
          placeholder="Bank Routing Number (Auto-verified via Stripe)"
          type="text"
          disabled
        />
        <input
          className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm opacity-50 cursor-not-allowed"
          placeholder="Bank Account Number (Auto-verified via Stripe)"
          type="text"
          disabled
        />
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
          <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
            ✓ Bank account linked successfully! It will be used for your
            monthly recurring billing.
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
            Stripe Financial Connections:
          </span>{" "}
          Bank accounts are securely linked and instantly verified for monthly
          recurring debits.
        </p>
        <button
          className="px-5 py-2.5 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-xs font-semibold rounded-lg shadow-sm focus:outline-none disabled:opacity-50"
          type="button"
          onClick={handleLinkBank}
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? "Connecting..." : "Link Bank Account"}
        </button>
      </div>
    </div>
  );
}
