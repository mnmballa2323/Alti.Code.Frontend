"use client";

import React from "react";

// Mock data for initial UI
const MOCK_LOGS = [
  {
    id: 1,
    action: "Invited new member",
    actor: "jane.doe@example.com",
    target: "john.smith@example.com",
    date: "Oct 24, 2026",
    time: "2:45 PM",
  },
  {
    id: 2,
    action: "Changed billing plan",
    actor: "jane.doe@example.com",
    target: "Upgraded to Enterprise",
    date: "Oct 23, 2026",
    time: "10:12 AM",
  },
  {
    id: 3,
    action: "Generated API Key",
    actor: "system_admin",
    target: "Production Key - 001",
    date: "Oct 21, 2026",
    time: "9:00 AM",
  },
  {
    id: 4,
    action: "Removed member",
    actor: "jane.doe@example.com",
    target: "legacy_contractor@example.com",
    date: "Oct 19, 2026",
    time: "4:20 PM",
  },
];

export default function LogsPage() {
  return (
    <div className="w-full flex-1 flex flex-col pt-6">
      <div className="w-full flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-[25%_25%_25%_15%_10%] px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl">
          <div>ACTOR</div>
          <div>ACTION</div>
          <div>TARGET</div>
          <div>DATE</div>
          <div>TIME</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-4">
          {MOCK_LOGS.map((log) => (
            <div
              key={log.id}
              className="group grid grid-cols-[25%_25%_25%_15%_10%] items-center px-6 py-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="text-neutral-900 dark:text-white">
                {log.actor}
              </div>
              <div>{log.action}</div>
              <div>{log.target}</div>
              <div>{log.date}</div>
              <div>{log.time}</div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-between px-6 py-4 mt-auto mb-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <div className="text-neutral-500 dark:text-neutral-400">
            Showing{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              1
            </span>{" "}
            to{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {MOCK_LOGS.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {MOCK_LOGS.length}
            </span>{" "}
            results
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button className="px-4 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
