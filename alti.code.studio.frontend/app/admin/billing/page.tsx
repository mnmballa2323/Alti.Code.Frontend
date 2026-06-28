"use client";

import React from "react";

export default function BillingPage() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Billing
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Cardholder Name"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#ffffff_inset] dark:[&:-webkit-autofill]:shadow-[0_0_0px_1000px_#171717_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#171717] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff]"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Card Number"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#ffffff_inset] dark:[&:-webkit-autofill]:shadow-[0_0_0px_1000px_#171717_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#171717] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff]"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="MM / YY"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#ffffff_inset] dark:[&:-webkit-autofill]:shadow-[0_0_0px_1000px_#171717_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#171717] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff]"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="CVC"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#ffffff_inset] dark:[&:-webkit-autofill]:shadow-[0_0_0px_1000px_#171717_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#171717] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-[11px] text-neutral-500 tracking-wide">
            <span className="font-bold text-neutral-900 dark:text-neutral-200">
              Stripe Security Notice:
            </span>{" "}
            Your card information is encrypted and securely saved via Stripe Vault.
          </p>
          <button className="px-5 py-2.5 bg-neutral-500 hover:bg-neutral-600 transition-colors text-white text-xs font-semibold rounded-lg">
            Save Card
          </button>
        </div>
      </div>
    </div>
  );
}
