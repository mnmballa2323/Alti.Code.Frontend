"use client";

import React from "react";
import { Download } from "lucide-react";

import { useAppSelector } from "@/store";

interface InvoiceItem {
  id: string;
  date: string;
  description: string;
  ledgerItem: string;
  amount: string;
  paymentMethod: string;
}

export default function InvoicesPage() {
  const ITEMS_PER_PAGE = 8;
  const mockInvoices: InvoiceItem[] = [
    {
      id: "INV-2026-006",
      date: "June 1, 2026",
      description: "Monthly Seat Subscription",
      ledgerItem: "Alti Code Studio Developer Seat (1 Active Member)",
      amount: "$50.00",
      paymentMethod: "Visa ending in 4242",
    },
    {
      id: "INV-2026-005",
      date: "May 15, 2026",
      description: "Account Credit Top-Up",
      ledgerItem: "Vertex AI Model Inference Usage Credits (1,333,333 Tokens)",
      amount: "$100.00",
      paymentMethod: "ACH Bank Transfer",
    },
    {
      id: "INV-2026-004",
      date: "April 10, 2026",
      description: "Auto-Recharge Credits",
      ledgerItem: "Auto-Balance Top-Up via Threshold Guard",
      amount: "$50.00",
      paymentMethod: "Visa ending in 4242",
    },
    {
      id: "INV-2026-003",
      date: "March 1, 2026",
      description: "Monthly Seat Subscription",
      ledgerItem: "Alti Code Studio Developer Seat (1 Active Member)",
      amount: "$50.00",
      paymentMethod: "Visa ending in 4242",
    },
    {
      id: "INV-2026-002",
      date: "February 20, 2026",
      description: "Account Credit Top-Up",
      ledgerItem: "Vertex AI Model Inference Usage Credits (2,666,666 Tokens)",
      amount: "$200.00",
      paymentMethod: "Mastercard ending in 8891",
    },
    {
      id: "INV-2026-001",
      date: "January 1, 2026",
      description: "Monthly Seat Subscription",
      ledgerItem: "Alti Code Studio Developer Seat (1 Active Member)",
      amount: "$50.00",
      paymentMethod: "Visa ending in 4242",
    },
    {
      id: "INV-2025-012",
      date: "December 15, 2025",
      description: "Account Credit Top-Up",
      ledgerItem: "Initial Workspace Onboarding Credits",
      amount: "$100.00",
      paymentMethod: "Visa ending in 4242",
    },
  ];

  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const filteredInvoices = mockInvoices.filter((inv) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();

    return (
      inv.id.toLowerCase().includes(q) ||
      inv.amount.toLowerCase().includes(q) ||
      inv.description.toLowerCase().includes(q) ||
      inv.date.toLowerCase().includes(q)
    );
  });

  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(
    startIndex + ITEMS_PER_PAGE,
    filteredInvoices.length,
  );
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

  const handleDownloadPdf = (inv: InvoiceItem) => {
    const win = window.open("", "_blank");

    if (!win) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${inv.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111827; background: #ffffff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
            .status { background: #dcfce7; color: #166534; font-size: 12px; font-weight: 700; padding: 4px 12px; rounded: 12px; border-radius: 9999px; text-transform: uppercase; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; font-size: 14px; }
            .details div span { color: #6b7280; display: block; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; font-weight: 600; }
            .ledger-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .ledger-table th { text-align: left; padding: 12px; background: #f9fafb; font-size: 11px; text-transform: uppercase; color: #4b5563; border-bottom: 1px solid #e5e7eb; }
            .ledger-table td { padding: 16px 12px; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
            .total-section { display: flex; justify-content: flex-end; font-size: 16px; font-weight: 700; margin-top: 20px; }
            .footer { margin-top: 50px; border-top: 1px solid #e5e7eb; pt: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div className="header">
            <div>
              <div className="company">ALTI CODE STUDIO</div>
              <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">Sovereign Autonomous Software Engineering</div>
            </div>
            <div style="text-align: right;">
              <span className="status">PAID</span>
              <div style="font-size: 14px; font-weight: 700; margin-top: 8px;">${inv.id}</div>
            </div>
          </div>

          <div className="details">
            <div>
              <span>Billed To</span>
              <strong>Workspace Admin</strong><br />
              meram.michael@gmail.com
            </div>
            <div style="text-align: right;">
              <span>Invoice Details</span>
              <strong>Date:</strong> ${inv.date}<br />
              <strong>Payment:</strong> ${inv.paymentMethod}
            </div>
          </div>

          <table className="ledger-table">
            <thead>
              <tr>
                <th>Ledger Item Description</th>
                <th>Category</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${inv.ledgerItem}</strong></td>
                <td>${inv.description}</td>
                <td style="text-align: right; font-family: monospace; font-weight: 600;">${inv.amount}</td>
              </tr>
            </tbody>
          </table>

          <div className="total-section">
            <div style="width: 250px; border-top: 2px solid #111827; padding-top: 12px; display: flex; justify-content: space-between;">
              <span>Total Paid:</span>
              <span style="font-family: monospace; font-size: 18px;">${inv.amount}</span>
            </div>
          </div>

          <div className="footer" style="margin-top: 60px; text-align: center; font-size: 12px; color: #6b7280;">
            Thank you for building with Alti Code Studio. Official Tax Receipt & Ledger Breakdown.<br />
            Cryptographic Audit Hash: 0x8a92f...c491b
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    win.document.write(htmlContent);
    win.document.close();
  };

  return (
    <div className="w-full flex-1 flex flex-col pt-6">
      <div className="w-full flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-[40%_40%_20%] px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-lg">
          <div>INVOICE ID</div>
          <div>AMOUNT</div>
          <div className="text-right pr-4">RECEIPT</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-4">
          {paginatedInvoices.map((inv) => (
            <div
              key={inv.id}
              className="grid grid-cols-[40%_40%_20%] items-center px-6 py-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="font-mono text-neutral-900 dark:text-white font-semibold">
                {inv.id}
              </div>
              <div className="font-mono font-semibold text-neutral-900 dark:text-white">
                {inv.amount}
              </div>
              <div className="flex items-center justify-end">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-semibold text-xs rounded-lg transition-colors shrink-0 cursor-pointer"
                  title="Download Ledger PDF"
                  onClick={() => handleDownloadPdf(inv)}
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        <div className="sticky bottom-6 z-20 flex items-center justify-between h-[68px] px-6 py-4 mt-auto mb-4 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <div className="text-neutral-500 dark:text-neutral-400">
            Showing{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredInvoices.length > 0 ? startIndex + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {endIndex}
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-900 dark:text-white">
              {filteredInvoices.length}
            </span>{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            <button
              className="h-10 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev))
              }
            >
              Previous
            </button>
            <button
              className="h-10 px-6 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black transition-colors text-white text-sm font-semibold rounded-lg flex items-center justify-center border border-transparent disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() =>
                setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
