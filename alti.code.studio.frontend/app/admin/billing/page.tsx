"use client";

import React from "react";
import { CreditCard, Users, CheckCircle, ExternalLink, ShieldCheck } from "lucide-react";

export default function BillingPage() {
  const [activeSeats, setActiveSeats] = React.useState(7);
  const seatPrice = 15;
  const totalAmount = activeSeats * seatPrice;

  return (
    <div className="w-full pt-6">
      <div className="flex flex-col gap-6 max-w-3xl">
        
        {/* SaaS Subscription Info (Stripe billing integration) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Subscription Plan</h2>
                <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">Managed via Stripe SaaS Billing</p>
              </div>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Active
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {/* Plan Details */}
              <div className="flex justify-between items-center py-2 border-b border-neutral-50 dark:border-neutral-800/50">
                <span className="text-xs text-neutral-500">Plan Type</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Pro SaaS Plan</span>
              </div>
              
              {/* Seats Info */}
              <div className="flex justify-between items-center py-2 border-b border-neutral-50 dark:border-neutral-800/50">
                <span className="text-xs text-neutral-500">Active Seats</span>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{activeSeats} Seats</span>
                </div>
              </div>

              {/* Pricing per Seat */}
              <div className="flex justify-between items-center py-2 border-b border-neutral-50 dark:border-neutral-800/50">
                <span className="text-xs text-neutral-500">Price per Seat</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">${seatPrice}.00 / mo</span>
              </div>

              {/* Next Invoice */}
              <div className="flex justify-between items-center py-2 border-b border-neutral-50 dark:border-neutral-800/50">
                <span className="text-xs text-neutral-500">Next Invoice Date</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">July 28, 2026</span>
              </div>

              {/* Total Cost */}
              <div className="flex justify-between items-center py-3 bg-neutral-50 dark:bg-neutral-800/30 px-4 rounded-xl mt-4">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Total Recurring Cost</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">${totalAmount}.00 / mo</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-50 dark:border-neutral-800/50">
            <p className="text-[10px] text-neutral-400 max-w-[400px]">
              Updates to plan tiers, billing cycles, and seat expansion can be handled securely in the customer portal.
            </p>
            <button 
              type="button"
              className="bg-[#635BFF] hover:bg-[#5A52E6] text-white flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors focus:outline-none shrink-0"
            >
              <span>Manage Billing in Stripe</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Stripe Payment Elements Mock */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Payment Details</h2>
            <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">Secure Credit Card Vaulting</p>

            {/* Active Card Summary */}
            <div className="mt-6 p-4 border border-neutral-100 dark:border-neutral-800 rounded-xl flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg shadow-sm">
                  <CreditCard className="w-4 h-4 text-[#635BFF]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Visa ending in 4242</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">Primary</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Expires 12 / 2028</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Update Payment Method</p>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs focus:outline-none placeholder:text-neutral-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between pt-4 border-t border-neutral-50 dark:border-neutral-800/50">
            <p className="text-[9px] text-neutral-400 leading-normal flex items-start gap-1 max-w-[200px]">
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
