"use client";

import React from "react";
import { Download } from "lucide-react";

export default function InvoicesPage() {
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

  return (
    <div className="w-full pt-6">
      <div className="w-full">
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
          {mockInvoices.map((inv) => (
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
      </div>
    </div>
  );
}
