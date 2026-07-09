"use client";

import React, { useState, useEffect } from "react";

import { useAppSelector } from "@/store";

interface Transaction {
  id: string;
  company: string;
  date: string;
  amount: string;
  type: string;
}

const baseTransactions: Transaction[] = [
  {
    id: "TXN-001",
    company: "Acme Corp",
    date: "June 12, 2026",
    amount: "$1,200.00",
    type: "Plan",
  },
  {
    id: "TXN-002",
    company: "Stark Industries",
    date: "June 11, 2026",
    amount: "$40.00",
    type: "Plan",
  },
  {
    id: "TXN-003",
    company: "Beta Labs",
    date: "June 10, 2026",
    amount: "$300.00",
    type: "Plan",
  },
  {
    id: "TXN-004",
    company: "Globex Inc",
    date: "June 09, 2026",
    amount: "$500.00",
    type: "Balance",
  },
  {
    id: "TXN-005",
    company: "Wayne Enterprises",
    date: "June 08, 2026",
    amount: "$100.00",
    type: "Balance",
  },
];

const mockTransactions: Transaction[] = Array.from({ length: 89 }).map(
  (_, i) => {
    const base = baseTransactions[i % baseTransactions.length];
    // Calculate descending dates
    const dateObj = new Date("2026-06-12");

    dateObj.setDate(dateObj.getDate() - i);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return {
      ...base,
      id: `TXN-${(i + 1).toString().padStart(3, "0")}`,
      date: dateStr,
    };
  },
);

export default function TransactionsPage() {
  const ITEMS_PER_PAGE = 9;
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTransactions = mockTransactions.filter((txn) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    return (
      txn.id.toLowerCase().includes(q) ||
      txn.company.toLowerCase().includes(q) ||
      txn.type.toLowerCase().includes(q) ||
      txn.date.toLowerCase().includes(q) ||
      txn.amount.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredTransactions.length,
  );
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex,
  );

  return (
    <div className="w-full flex-1 flex flex-col pt-6">
      <div className="w-full flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl items-center">
          <div className="col-span-2">Transaction ID</div>
          <div className="col-span-4">Company</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        {/* Floating Rows */}
        <div className="flex flex-col gap-2 mt-4">
          {paginatedTransactions.map((txn) => (
            <div
              key={txn.id}
              className="group grid grid-cols-12 items-center px-6 py-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="col-span-2">{txn.id}</div>
              <div className="col-span-4">{txn.company}</div>
              <div className="col-span-2">{txn.type}</div>
              <div className="col-span-2">{txn.date}</div>
              <div className="col-span-2 text-right">{txn.amount}</div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-between h-[68px] px-6 py-4 mt-auto mb-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <div className="text-neutral-500 dark:text-neutral-400">
            Showing{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredTransactions.length > 0 ? startIndex + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {endIndex}
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredTransactions.length}
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
