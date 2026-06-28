"use client";

import React from "react";
import { Download } from "lucide-react";

export default function InvoicesPage() {
  const mockInvoices = [
    { id: "INV-2026-006", month: "June 2026", amount: "$25.00" },
    { id: "INV-2026-005", month: "May 2026", amount: "$25.00" },
    { id: "INV-2026-004", month: "April 2026", amount: "$25.00" },
    { id: "INV-2026-003", month: "March 2026", amount: "$25.00" },
    { id: "INV-2026-002", month: "February 2026", amount: "$25.00" },
    { id: "INV-2026-001", month: "January 2026", amount: "$25.00" },
    { id: "INV-2025-012", month: "December 2025", amount: "$25.00" },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Invoices
        </h1>
      </div>

      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-4 px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl">
          <div>INVOICE ID</div>
          <div>MONTH</div>
          <div>AMOUNT</div>
          <div className="flex justify-end">
            <div className="w-24 text-left">DOWNLOAD</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-4">
          {mockInvoices.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-4 items-center px-6 py-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              <div>{inv.id}</div>
              <div>{inv.month}</div>
              <div>{inv.amount}</div>
              <div className="flex justify-end">
                <div className="w-24 flex justify-start">
                  <button className="flex items-center gap-1.5 text-blue-500 hover:text-blue-600 font-semibold text-xs transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
