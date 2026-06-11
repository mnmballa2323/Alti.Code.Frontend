"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export default function BillingPage() {
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);

  // Custom Modal State for Unified Dialogs
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !cardholderName.trim() ||
      !cardNumber.trim() ||
      !expiry.trim() ||
      !cvc.trim()
    ) {
      setModalTitle("Card Details Required");
      setModalMessage("Please fill in all credit card details to proceed.");
      setModalOpen(true);

      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setModalTitle("Billing Saved");
      setModalMessage("Your billing details have been updated successfully!");
      setModalOpen(true);
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col h-full justify-start pt-6">
      <form className="space-y-6" onSubmit={handleSaveCard}>
        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="Cardholder Name"
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />
          <input
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="Card Number"
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <input
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="Expiry Date (MM/YY)"
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
          />
          <input
            className="w-full h-11 bg-white dark:bg-[#161b22] px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="CVC"
            type="text"
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
          />
        </div>

        {/* Footer: Action Button */}
        <div className="pt-4">
          <button
            className="w-full h-10 bg-neutral-800 dark:bg-neutral-200 hover:bg-neutral-900 dark:hover:bg-white text-white dark:text-neutral-950 font-semibold rounded-xl text-sm transition-all shadow-md shadow-neutral-800/10 flex items-center justify-center gap-2"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Card"
            )}
          </button>
        </div>
      </form>

      {/* Custom Unified Notification Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-[380px] bg-white dark:bg-[#161b22] border border-neutral-200/50 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                {modalTitle}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 px-4 leading-normal">
                {modalMessage}
              </p>
            </div>
            
            {/* Horizontal border line */}
            <div className="border-t border-neutral-100 dark:border-neutral-800" />
            
            {/* Footer Button Split */}
            <div className="flex w-full">
              <button
                className="flex-1 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#1f242c] transition-colors focus:outline-none cursor-pointer"
                onClick={() => setModalOpen(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
