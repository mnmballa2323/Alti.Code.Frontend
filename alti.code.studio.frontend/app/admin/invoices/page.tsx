"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";

interface Invoice {
  id: string;
  month: string;
  amount: string;
}

const mockInvoices: Invoice[] = [
  { id: "INV-2026-001", month: "June 2026", amount: "$40.00" },
  { id: "INV-2026-002", month: "May 2026", amount: "$20.00" },
  { id: "INV-2026-003", month: "April 2026", amount: "$20.00" },
];

export default function InvoicesPage() {
  const handleDownload = (invoiceId: string) => {
    alert(`Downloading invoice ${invoiceId} PDF...`);
  };

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col h-full justify-start pt-6">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Invoices
        </h1>
        <Link
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-xl transition-all shadow-sm"
          href="/dashboard"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-500" />
          Back to Dashboard
        </Link>
      </div>

      <div className="space-y-4">
        {mockInvoices.map((inv) => (
          <div
            key={inv.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl transition-all shadow-sm duration-200"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* File Icon Box */}
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 shrink-0">
                <FileText className="w-5 h-5 text-neutral-500 dark:text-neutral-450" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 items-center ml-2">
                <div>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase">
                    Invoice ID
                  </p>
                  <p className="font-semibold text-neutral-800 dark:text-white text-sm">
                    {inv.id}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase">
                    Month
                  </p>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-250 text-sm">
                    {inv.month}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold tracking-wider uppercase">
                    Amount
                  </p>
                  <p className="font-semibold text-neutral-800 dark:text-white text-sm">
                    {inv.amount}
                  </p>
                </div>
              </div>
            </div>

            <button
              className="p-2.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-805/40 transition-colors flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161b22]"
              onClick={() => handleDownload(inv.id)}
            >
              <Download className="w-4 h-4" />
              <span className="text-xs font-semibold px-0.5">PDF</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
