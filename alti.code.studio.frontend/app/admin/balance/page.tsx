"use client";

import React from "react";
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, RefreshCw } from "lucide-react";

export default function BalancePage() {
  const currentBalance = 4250.00;
  const isAutoRechargeEnabled = true;
  
  return (
    <div className="flex-1 bg-[#F4F4F6] dark:bg-background min-h-screen p-8 lg:p-12 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        


        {/* Balance Card */}
        <div className="bg-black rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-2xl border border-neutral-800">
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="text-5xl md:text-7xl font-black tracking-tighter">
                ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-zinc-400 text-sm">
                Low balance auto-recharge is{" "}
                {isAutoRechargeEnabled ? (
                  <span className="text-emerald-400 font-medium">enabled</span>
                ) : (
                  <span className="text-red-400 font-medium">disabled</span>
                )}
                .
              </p>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <button className="w-full bg-white hover:bg-zinc-100 text-black py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add Funds
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Auto-Recharge
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
