"use client";

import React from "react";
import { CreditCard, Landmark, ChevronDown } from "lucide-react";

export default function BillingPage() {
  const [activeSeats, setActiveSeats] = React.useState(7);
  const seatPrice = 15;
  const totalAmount = activeSeats * seatPrice;

  const [paymentType, setPaymentType] = React.useState<"card" | "ach">("card");
  const [activePaymentMethod, setActivePaymentMethod] = React.useState<{
    type: "card" | "ach";
    details: string;
    extra: string;
  }>({
    type: "card",
    details: "•••• 4242",
    extra: "Visa",
  });

  const [holderType, setHolderType] = React.useState("");
  const [accountType, setAccountType] = React.useState("");

  const [isHolderOpen, setIsHolderOpen] = React.useState(false);
  const [isAccountOpen, setIsAccountOpen] = React.useState(false);

  const handleSaveCard = () => {
    setActivePaymentMethod({
      type: "card",
      details: "•••• 4242",
      extra: "Visa",
    });
  };

  const handleLinkBank = () => {
    setActivePaymentMethod({
      type: "ach",
      details: "Chase •••• 9103",
      extra: "ACH",
    });
  };

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

        {/* Dynamic Forms based on Selector Selection */}
        {paymentType === "card" && (
          <>
            {/* Credit Card Inputs */}
            <div className="flex flex-col gap-6 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                  placeholder="Enter Cardholder Name"
                  type="text"
                />
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                  placeholder="Enter Card Number"
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                  placeholder="MM / YY"
                  type="text"
                />
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                  placeholder="CVC"
                  type="text"
                />
              </div>
            </div>

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
                className="px-5 py-2.5 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-xs font-semibold rounded-lg shadow-sm focus:outline-none"
                type="button"
                onClick={handleSaveCard}
              >
                Save Card
              </button>
            </div>
          </>
        )}

        {paymentType === "ach" && (
          <>
            {/* ACH Direct Debit Inputs */}
            <div className="flex flex-col gap-6 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="sm:col-span-2">
                  <input
                    className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                    placeholder="Account Holder Name"
                    type="text"
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
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                  placeholder="Bank Routing Number"
                  type="text"
                />
                <input
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                  placeholder="Bank Account Number"
                  type="text"
                />
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-[11px] text-neutral-500 tracking-wide">
                <span className="font-bold text-neutral-900 dark:text-neutral-200">
                  Stripe Financial Connections:
                </span>{" "}
                Bank accounts are securely linked and instantly verified for
                monthly recurring debits.
              </p>
              <button
                className="px-5 py-2.5 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-xs font-semibold rounded-lg shadow-sm focus:outline-none"
                type="button"
                onClick={handleLinkBank}
              >
                Link Bank Account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
