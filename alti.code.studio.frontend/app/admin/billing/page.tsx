"use client";

import React from "react";
import { CreditCard, Users, ShieldCheck } from "lucide-react";

export default function BillingPage() {
  const [activeSeats, setActiveSeats] = React.useState(7);
  const seatPrice = 15;
  const totalAmount = activeSeats * seatPrice;

  return (
    <div className="w-full pt-6">
      <div className="flex flex-col gap-6 max-w-4xl">
        
        {/* Floating Box Cards in a Row for the Plan Part */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        </div>

        {/* Payment Details Card (Simplified & Floating) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-50 dark:border-neutral-800/50">
            <div>
              <h2 className="text-xs font-bold text-neutral-900 dark:text-white">Payment Method</h2>
              <p className="text-[10px] text-neutral-400 mt-0.5">Secure credit card vaulting</p>
            </div>
            
            <div className="flex items-center gap-3 bg-neutral-50/50 dark:bg-neutral-800/20 px-4 py-2 border border-neutral-100 dark:border-neutral-800 rounded-xl">
              <CreditCard className="w-4 h-4 text-[#635BFF]" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Visa ending in 4242</span>
                  <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">Primary</span>
                </div>
                <p className="text-[9px] text-neutral-400">Expires 12 / 2028</p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Update Card Info</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Cardholder Name"
                className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs focus:outline-none placeholder:text-neutral-400"
              />
              <input
                type="text"
                placeholder="Card Number"
                className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs focus:outline-none placeholder:text-neutral-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="MM / YY"
                className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs focus:outline-none placeholder:text-neutral-400"
              />
              <input
                type="text"
                placeholder="CVC"
                className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs focus:outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between pt-4 border-t border-neutral-50 dark:border-neutral-800/50">
            <p className="text-[9px] text-neutral-400 leading-normal flex items-start gap-1 max-w-[280px]">
              <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span>Card information is encrypted and securely tokenized directly with Stripe Vault APIs.</span>
            </p>
            <button className="px-4 py-2 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-xs font-semibold rounded-lg transition-colors focus:outline-none shrink-0">
              Save Card
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
