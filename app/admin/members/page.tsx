"use client";

import React from "react";

import { useAppSelector } from "@/store";

export default function InvitePage() {
  const profile = useAppSelector((state) => state.user.data);

  const planPrices: Record<string, string> = {
    launch: "200",
    build: "2,500",
    scale: "5,000",
    cloud: "200",
    dedicated: "2,500",
    sovereign: "5,000",
  };
  const currentPlan = profile?.plan?.toLowerCase() || "cloud";
  const currentPrice = planPrices[currentPlan] || "200";

  return (
    <div className="w-full pt-6">
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 items-center">
          <div className="flex-1">
            <input
              className="w-full h-10 px-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
              placeholder="Enter First Name"
              type="text"
            />
          </div>
          <div className="flex-1">
            <input
              className="w-full h-10 px-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
              placeholder="Enter Last Name"
              type="text"
            />
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex-1">
            <input
              className="w-full h-10 px-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none placeholder:text-neutral-400"
              placeholder="Enter Email Address"
              type="email"
            />
          </div>
          <div className="flex-none">
            <button className="h-10 px-6 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-sm font-semibold rounded-lg border border-transparent flex items-center justify-center shrink-0">
              Invite Member
            </button>
          </div>
        </div>

        <p className="text-[11px] text-neutral-500 tracking-wide">
          <span className="font-bold text-neutral-900 dark:text-neutral-200">
            Billing notice:
          </span>{" "}
          Adding a new member adds an active seat to your plan at $
          {currentPrice}/month.
        </p>
      </div>
    </div>
  );
}
