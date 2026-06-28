"use client";

import React from "react";
import { CreditCard, Users, ShieldCheck } from "lucide-react";

export default function BillingPage() {
  const [activeSeats, setActiveSeats] = React.useState(7);
  const seatPrice = 15;
  const totalAmount = activeSeats * seatPrice;

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

          {/* Card 4: Payment Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-28">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#635BFF]" />
              <span>Card</span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Visa *4242</span>
              <span className="text-[10px] text-neutral-400 font-semibold">12/28</span>
            </div>
          </div>
        </div>

        {/* Floating Input Fields (No white card background, original height/styles) */}
        <div className="flex flex-col gap-6 mt-4">
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

        {/* Stripe Notice and Save Card Action */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-[11px] text-neutral-500 tracking-wide flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
            <span>
              <span className="font-bold text-neutral-900 dark:text-neutral-200">
                Stripe Security Notice:
              </span>{" "}
              Your card information is encrypted and securely saved via Stripe Vault.
            </span>
          </p>
          <button className="px-5 py-2.5 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-xs font-semibold rounded-lg shadow-sm">
            Save Card
          </button>
        </div>

      </div>
    </div>
  );
}
