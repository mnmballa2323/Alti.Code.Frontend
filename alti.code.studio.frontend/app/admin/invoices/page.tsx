"use client";

import React from "react";
import { Download } from "lucide-react";
import { useAppSelector } from "@/store";

export default function InvoicesPage() {
  const ITEMS_PER_PAGE = 8;
  const mockInvoices = [
    {
      id: "INV-2026-006",
      plan: "Standard",
      seats: "1 Seat",
      month: "June 2026",
      amount: "$25.00",
    },
    {
      id: "INV-2026-005",
      plan: "Standard",
      seats: "1 Seat",
      month: "May 2026",
      amount: "$25.00",
    },
    {
      id: "INV-2026-004",
      plan: "Standard",
      seats: "1 Seat",
      month: "April 2026",
      amount: "$25.00",
    },
    {
      id: "INV-2026-003",
      plan: "Standard",
      seats: "1 Seat",
      month: "March 2026",
      amount: "$25.00",
    },
    {
      id: "INV-2026-002",
      plan: "Standard",
      seats: "1 Seat",
      month: "February 2026",
      amount: "$25.00",
    },
    {
      id: "INV-2026-001",
      plan: "Standard",
      seats: "1 Seat",
      month: "January 2026",
      amount: "$25.00",
    },
    {
      id: "INV-2025-012",
      plan: "Standard",
      seats: "1 Seat",
      month: "December 2025",
      amount: "$25.00",
    },
  ];

  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const filteredInvoices = mockInvoices.filter((inv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.id.toLowerCase().includes(q) ||
      inv.plan.toLowerCase().includes(q) ||
      inv.seats.toLowerCase().includes(q) ||
      inv.month.toLowerCase().includes(q) ||
      inv.amount.toLowerCase().includes(q)
    );
  });

  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredInvoices.length);
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  return (
    <div className="w-full flex-1 flex flex-col pt-6">
      <div className="w-full flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-6 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl">
          <div>INVOICE ID</div>
          <div>PLAN</div>
          <div>SEATS</div>
          <div>MONTH</div>
          <div className="text-right">AMOUNT</div>
          <div />
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-4">
          {paginatedInvoices.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-6 items-center px-6 py-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              <div>{inv.id}</div>
              <div>{inv.plan}</div>
              <div>{inv.seats}</div>
              <div>{inv.month}</div>
              <div className="text-right">{inv.amount}</div>
              <div className="flex justify-end">
                <button className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 font-semibold text-xs transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-between h-[68px] px-6 py-4 mt-auto mb-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <div className="text-neutral-500 dark:text-neutral-400">
            Showing <span className="font-medium text-neutral-900 dark:text-white">{filteredInvoices.length > 0 ? startIndex + 1 : 0}</span> to <span className="font-medium text-neutral-900 dark:text-white">{endIndex}</span> of <span className="font-medium text-neutral-900 dark:text-white">{filteredInvoices.length}</span> results
          </div>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-4 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Previous
              </button>
            )}
            {currentPage < totalPages && totalPages > 0 && (
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
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
