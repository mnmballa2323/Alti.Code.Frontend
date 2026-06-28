"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

export default function InvitePage() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Invite
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter First Name"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#ffffff_inset] dark:[&:-webkit-autofill]:shadow-[0_0_0px_1000px_#171717_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#171717] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff]"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter Last Name"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#ffffff_inset] dark:[&:-webkit-autofill]:shadow-[0_0_0px_1000px_#171717_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#171717] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff]"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1">
            <input
              type="email"
              placeholder="Enter Email Address"
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0px_1000px_#ffffff_inset] dark:[&:-webkit-autofill]:shadow-[0_0_0px_1000px_#171717_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#171717] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff]"
            />
          </div>
          <div className="flex-1 relative">
            <select 
              defaultValue="" 
              className="w-full h-11 px-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-400 focus:outline-none appearance-none pr-10"
            >
              <option value="" disabled>
                Select Role Type
              </option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-neutral-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-[11px] text-neutral-500 tracking-wide">
            <span className="font-bold text-neutral-900 dark:text-neutral-200">
              Billing notice:
            </span>{" "}
            Adding a new team member adds an active seat to your plan at $25.00/month.
          </p>
          <button className="px-5 py-2.5 bg-neutral-500 hover:bg-neutral-600 transition-colors text-white text-xs font-semibold rounded-lg">
            Invite Member
          </button>
        </div>
      </div>
    </div>
  );
}
