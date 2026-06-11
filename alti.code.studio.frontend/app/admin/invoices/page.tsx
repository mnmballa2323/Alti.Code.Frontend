"use client";

import React, { useState } from "react";
import { Download, Search } from "lucide-react";
import jsPDF from "jspdf";

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
  const [searchQuery, setSearchQuery] = useState("");

  const handleDownload = (invoiceId: string) => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ALTI CODE STUDIO", 15, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("123 Enterprise Way", 15, 28);
    doc.text("billing@alticodestudio.com", 15, 34);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`INVOICE: ${invoiceId}`, 140, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc.text(`Date: ${date}`, 140, 28);
    doc.text(`Due: Upon Receipt`, 140, 34);

    // Draw a horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 42, 195, 42);

    // Table Headers
    doc.setFont("helvetica", "bold");
    doc.text("Description", 15, 50);
    doc.text("Amount", 160, 50);

    doc.line(15, 54, 195, 54);

    // Table Content
    doc.setFont("helvetica", "normal");
    const selectedInvoice = mockInvoices.find((inv) => inv.id === invoiceId);
    const amount = selectedInvoice ? selectedInvoice.amount : "$20.00";
    const month = selectedInvoice ? selectedInvoice.month : "Services Rendered";

    doc.text(`Alti Code Studio Subscription - ${month}`, 15, 62);
    doc.text(amount, 160, 62);

    doc.line(15, 68, 195, 68);

    // Total
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid:", 130, 78);
    doc.text(amount, 160, 78);

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for your business!", 15, 100);

    doc.save(`${invoiceId}.pdf`);
  };

  const filteredInvoices = mockInvoices.filter((inv) => {
    const query = searchQuery.toLowerCase();

    return (
      inv.id.toLowerCase().includes(query) ||
      inv.month.toLowerCase().includes(query) ||
      inv.amount.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0">
      <div className="space-y-4">
        {mockInvoices.length > 0 ? (
          <div className="w-full">
            {/* Sticky Header Wrapper */}
            <div className="sticky top-0 z-30 bg-[#F3F4F6] dark:bg-[#0d1117] -mt-4 pt-4 pb-2">
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <input
                  className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all shadow-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                  placeholder="Search..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase shadow-sm">
                <div className="col-span-3">Invoice ID</div>
                <div className="col-span-3">Month</div>
                <div className="col-span-4">Amount</div>
                <div className="col-span-2 flex items-center justify-end pr-4">
                  Action
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="space-y-3 mt-6">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  return (
                    <div
                      key={inv.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-sm transition-all shadow-sm duration-200"
                    >
                      <div className="col-span-3 text-neutral-800 dark:text-neutral-250 font-medium">
                        {inv.id}
                      </div>
                      <div className="col-span-3 text-neutral-800 dark:text-neutral-250 font-medium">
                        {inv.month}
                      </div>
                      <div className="col-span-4 text-neutral-800 dark:text-neutral-250 font-medium">
                        {inv.amount}
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <button
                          className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-850/40 transition-colors flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161b22]"
                          onClick={() => handleDownload(inv.id)}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
                  No invoices match your search query.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
            No invoices configured.
          </div>
        )}
      </div>
    </div>
  );
}
