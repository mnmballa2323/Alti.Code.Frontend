"use client";

import React from "react";
import { Users, CreditCard, Landmark, Send } from "lucide-react";

export function CardBrandLogo({ brand }: { brand: string }) {
  const b = brand.toLowerCase();
  if (b === "visa") {
    return (
      <svg viewBox="0 0 24 15" className="h-4.5 w-auto shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.1 14.5L12.2 2H10.1L8.0 14.5H10.1ZM21.5 2H19.5c-.6 0-1.1.4-1.4 1.0L15.3 14.5h2.2l.4-1.2h2.7l.3 1.2h2.0l-1.4-12.5zm-3.0 7.2l.9-2.5.5 2.5h-1.4ZM6.3 2H4.2c-.2 0-.4.1-.5.3L.3 14.5H2.5l.4-1.2h2.7c.0.2.1.4.1.6l.2.6h2.2L6.8 2.0c0-.1-.1-.1-.5 0zm.3 4.3l-.3 1.2H4.1L5.1 4.5l1.5 1.8z" fill="#1A1F71" className="dark:fill-white" />
      </svg>
    );
  }
  if (b === "mastercard" || b === "master") {
    return (
      <svg viewBox="0 0 24 15" className="h-4.5 w-auto shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="7.5" r="7" fill="#EB001B" />
        <circle cx="16" cy="7.5" r="7" fill="#F79E1B" fillOpacity="0.8" />
      </svg>
    );
  }
  if (b === "amex" || b === "american express") {
    return (
      <svg viewBox="0 0 24 15" className="h-4.5 w-auto shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="15" rx="2" fill="#0070D2" />
        <text x="3" y="10" fill="white" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">AMEX</text>
      </svg>
    );
  }
  if (b === "discover") {
    return (
      <svg viewBox="0 0 24 15" className="h-4.5 w-auto shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="15" rx="2" fill="#F68220" />
        <text x="2" y="10" fill="white" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">DISCOVER</text>
      </svg>
    );
  }
  return <CreditCard className="w-4 h-4 text-neutral-400 shrink-0" />;
}

export default function BillingPage() {
  const [activeSeats, setActiveSeats] = React.useState(7);
  const seatPrice = 15;
  const totalAmount = activeSeats * seatPrice;

  const [paymentType, setPaymentType] = React.useState<"card" | "ach" | "wire">("card");
  const [activePaymentMethod, setActivePaymentMethod] = React.useState<{
    type: "card" | "ach" | "wire";
    details: string;
    extra: string;
  }>({
    type: "card",
    details: "*4242",
    extra: "Visa"
  });

  const handleSaveCard = () => {
    setActivePaymentMethod({
      type: "card",
      details: "*4242",
      extra: "Visa"
    });
  };

  const handleLinkBank = () => {
    setActivePaymentMethod({
      type: "ach",
      details: "Chase *9103",
      extra: "ACH"
    });
  };

  const handleSelectWire = () => {
    setActivePaymentMethod({
      type: "wire",
      details: "J.P. Morgan",
      extra: "Wire"
    });
  };

  return (
    <div className="w-full pt-6">
      <div className="flex flex-col gap-6 w-full">
        
        {/* Floating Box Cards in a Row for the Plan & Card Part */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Card 1: Plan Type */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm relative flex flex-col justify-between h-28">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Plan</div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Pro SaaS</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Active
              </span>
            </div>
          </div>

          {/* Card 2: Active Seats */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-28">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Seats</div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{activeSeats} Active</span>
              <span className="text-[10px] text-neutral-400 font-semibold">${seatPrice}/seat</span>
            </div>
          </div>

          {/* Card 3: Monthly Cost */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-28">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Total Monthly</div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">${totalAmount}.00</span>
              <span className="text-[10px] text-neutral-400 font-semibold">USD</span>
            </div>
          </div>

          {/* Card 4: Payment Method */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-28">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Payment</div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {activePaymentMethod.type === "card" && <CardBrandLogo brand="visa" />}
                {activePaymentMethod.type === "ach" && <Landmark className="w-4 h-4 text-[#635BFF]" />}
                {activePaymentMethod.type === "wire" && <Send className="w-4 h-4 text-[#635BFF]" />}
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  {activePaymentMethod.details}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-semibold">
                {activePaymentMethod.extra}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="flex border-b border-neutral-100 dark:border-neutral-800 gap-6 mt-4">
          <button
            type="button"
            onClick={() => setPaymentType("card")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none flex items-center gap-1.5 ${paymentType === "card" ? "border-b-2 border-black dark:border-white text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"}`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Credit Card
          </button>
          <button
            type="button"
            onClick={() => setPaymentType("ach")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none flex items-center gap-1.5 ${paymentType === "ach" ? "border-b-2 border-black dark:border-white text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"}`}
          >
            <Landmark className="w-3.5 h-3.5" />
            ACH Bank Debit
          </button>
          <button
            type="button"
            onClick={() => setPaymentType("wire")}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none flex items-center gap-1.5 ${paymentType === "wire" ? "border-b-2 border-black dark:border-white text-neutral-900 dark:text-white" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"}`}
          >
            <Send className="w-3.5 h-3.5" />
            Wire Transfer
          </button>
        </div>

        {/* Dynamic Forms based on Selector Selection */}
        {paymentType === "card" && (
          <>
            {/* Credit Card Inputs */}
            <div className="flex flex-col gap-6 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Enter Cardholder Name"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Enter Card Number"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="MM / YY"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                />
                <input
                  type="text"
                  placeholder="CVC"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                />
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-[11px] text-neutral-500 tracking-wide">
                <span className="font-bold text-neutral-900 dark:text-neutral-200">
                  Stripe Security Notice:
                </span>{" "}
                Your card information is encrypted and securely saved via Stripe Vault.
              </p>
              <button
                type="button"
                onClick={handleSaveCard}
                className="px-5 py-2.5 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-xs font-semibold rounded-lg shadow-sm focus:outline-none"
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <input
                  type="text"
                  placeholder="Account Holder Name"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Bank Routing Number"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Bank Account Number"
                  className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 shadow-sm"
                />
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-[11px] text-neutral-500 tracking-wide">
                <span className="font-bold text-neutral-900 dark:text-neutral-200">
                  Stripe Financial Connections:
                </span>{" "}
                Bank accounts are securely linked and instantly verified for monthly recurring debits.
              </p>
              <button
                type="button"
                onClick={handleLinkBank}
                className="px-5 py-2.5 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-xs font-semibold rounded-lg shadow-sm focus:outline-none"
              >
                Link Bank Account
              </button>
            </div>
          </>
        )}

        {paymentType === "wire" && (
          <>
            {/* Stripe Virtual Bank Details for Wire Transfer */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 shadow-sm mt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-50 dark:border-neutral-800/50">
                <div>
                  <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Virtual Bank Account Details</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Wire transfer instructions generated via Stripe</p>
                </div>
                <button
                  type="button"
                  onClick={handleSelectWire}
                  className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900 text-white text-xs font-semibold rounded-lg transition-colors focus:outline-none"
                >
                  Set as Primary
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Bank Name</span>
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mt-1">J.P. Morgan Chase (Stripe Treasury)</p>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Routing Number</span>
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mt-1">021000021</p>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Account Number</span>
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mt-1">893029103</p>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Account Name</span>
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mt-1">Alti Code Studio LLC</p>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider text-red-500 dark:text-red-400">Payment Reference (Memo)</span>
                  <p className="text-xs font-bold text-red-500 dark:text-red-400 mt-1">ALTI-9283-RECON</p>
                </div>
              </div>

              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed mt-6 pt-4 border-t border-neutral-50 dark:border-neutral-800/50">
                <span className="font-bold text-neutral-700 dark:text-neutral-300">Important Instruction:</span> Initiate Wire or ACH credit transfers from your commercial banking portal to this unique virtual account. Please include your <span className="font-bold">Payment Reference</span> in the wire memo line to ensure Stripe reconciles the balance instantly.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
