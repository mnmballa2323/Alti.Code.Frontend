"use client";

import React from "react";
import { Search } from "lucide-react";

// Mock data for initial UI
const MOCK_LOGS = [
  {
    id: 1,
    action: "Invited new member",
    actor: "jane.doe@example.com",
    target: "john.smith@example.com",
    date: "Oct 24, 2026, 2:45 PM",
  },
  {
    id: 2,
    action: "Changed billing plan",
    actor: "jane.doe@example.com",
    target: "Upgraded to Enterprise",
    date: "Oct 23, 2026, 10:12 AM",
  },
  {
    id: 3,
    action: "Generated API Key",
    actor: "system_admin",
    target: "Production Key - 001",
    date: "Oct 21, 2026, 9:00 AM",
  },
  {
    id: 4,
    action: "Removed member",
    actor: "jane.doe@example.com",
    target: "legacy_contractor@example.com",
    date: "Oct 19, 2026, 4:20 PM",
  },
];

export default function LogsPage() {
  return (
    <div className="max-w-5xl mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
            Audit Logs
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            View a timeline of administrative actions taken in your workspace.
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search logs..."
            className="w-full sm:w-[280px] h-10 pl-9 pr-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-shadow"
          />
        </div>
      </div>

      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-[25%_25%_30%_20%] px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl">
          <div>ACTION</div>
          <div>ACTOR</div>
          <div>TARGET</div>
          <div>DATE</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-4">
          {MOCK_LOGS.map((log) => (
            <div
              key={log.id}
              className="group grid grid-cols-[25%_25%_30%_20%] items-center px-6 py-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="font-bold text-neutral-900 dark:text-white">{log.action}</div>
              <div>{log.actor}</div>
              <div>{log.target}</div>
              <div className="text-neutral-500 dark:text-neutral-400 text-xs">{log.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
