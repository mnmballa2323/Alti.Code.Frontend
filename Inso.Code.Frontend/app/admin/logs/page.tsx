"use client";

import React from "react";

import { useAppSelector } from "@/store";

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
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const filteredLogs = MOCK_LOGS.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    return (
      log.action.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      log.date.toLowerCase().includes(q) ||
      log.time.toLowerCase().includes(q)
    );
  });

  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

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
          {paginatedLogs.map((log) => (
            <div
              key={log.id}
              className="group grid grid-cols-[25%_25%_25%_15%_10%] items-center px-6 py-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="text-[13px] text-neutral-900 dark:text-white">
                {log.actor}
              </div>
              <div className="text-[13px]">{log.action}</div>
              <div className="text-[13px]">{log.target}</div>
              <div className="text-[13px]">{log.date}</div>
              <div className="text-[13px]">{log.time}</div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-between h-[68px] px-6 py-4 mt-auto mb-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <div className="text-neutral-500 dark:text-neutral-400">
            Showing{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredLogs.length > 0 ? startIndex + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {endIndex}
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredLogs.length}
            </span>{" "}
            results
          </div>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <button
                className="px-4 py-1.5 rounded-lg bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 font-medium transition-colors"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Back
              </button>
            )}
            {currentPage < totalPages && totalPages > 0 && (
              <button
                className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-medium transition-colors"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
