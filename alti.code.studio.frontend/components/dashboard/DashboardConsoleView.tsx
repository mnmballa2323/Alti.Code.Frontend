"use client";

import React from "react";
import { User, UserPlus, Users, CreditCard, TrendingUp } from "lucide-react";

export default function DashboardConsoleView() {
  return (
    <div className="flex flex-col gap-6 w-full h-full pt-4">
      {/* Top Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Individual Accounts Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[170px]">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Total Individual Accounts
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2">
                0
              </span>
            </div>
            <User className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
          <button className="mt-6 w-full py-2.5 text-center text-xs font-semibold bg-[#F9FAFB] dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50 rounded-xl transition-colors">
            view all of the individual accounts
          </button>
        </div>

        {/* Total Team Accounts Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[170px]">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Total Team Accounts
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2">
                0
              </span>
            </div>
            <UserPlus className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
          <button className="mt-6 w-full py-2.5 text-center text-xs font-semibold bg-[#F9FAFB] dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50 rounded-xl transition-colors">
            view all of the team accounts
          </button>
        </div>

        {/* Total Enterprise Accounts Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[170px]">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Total Enterprise Accounts
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2">
                0
              </span>
            </div>
            <Users className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
          <button className="mt-6 w-full py-2.5 text-center text-xs font-semibold bg-[#F9FAFB] dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50 rounded-xl transition-colors">
            view all of the enterprise accounts
          </button>
        </div>
      </div>

      {/* Bottom Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Recurring Revenues Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Monthly Recurring Revenues
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2">
                $0
              </span>
            </div>
            <CreditCard className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>

        {/* Annual Recurring Revenues Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Annual Recurring Revenues
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2">
                $0
              </span>
            </div>
            <TrendingUp className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
