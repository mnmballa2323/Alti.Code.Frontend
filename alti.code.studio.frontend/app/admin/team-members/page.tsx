"use client";

import React from "react";
import { Download } from "lucide-react";

export default function MembersPage() {
  return (
    <div className="w-full">
      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-4 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl">
          <div>FIRST NAME</div>
          <div>LAST NAME</div>
          <div>EMAIL ADDRESS</div>
          <div>ROLE TYPE</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-4">
          <div className="grid grid-cols-4 items-center px-6 py-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300">
            <div>—</div>
            <div>—</div>
            <div className="flex items-center gap-2">
              meram.michael@gmail.com
              <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold">
                You
              </span>
            </div>
            <div>Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}
