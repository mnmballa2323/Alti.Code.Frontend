"use client";

import React, { useState } from "react";
import { DollarSign, Users, Download, Search } from "lucide-react";

interface Transaction {
  id: string;
  customer: string;
  date: string;
  amount: string;
  plan: string;
}

const mockTransactions: Transaction[] = [
  { id: "TXN-001", customer: "admin@acme.corp", date: "June 12, 2026", amount: "$1,200.00", plan: "Enterprise" },
  { id: "TXN-002", customer: "johndoe@gmail.com", date: "June 11, 2026", amount: "$40.00", plan: "Individual" },
  { id: "TXN-003", customer: "team@betalabs.io", date: "June 10, 2026", amount: "$300.00", plan: "Teams" },
  { id: "TXN-004", customer: "billing@globex.inc", date: "June 09, 2026", amount: "$1,200.00", plan: "Enterprise" },
  { id: "TXN-005", customer: "jane.smith@yahoo.com", date: "June 08, 2026", amount: "$40.00", plan: "Individual" },
];

export default function RevenuePage() {
  return (
    <div className="w-full flex flex-col h-full justify-start pt-0 space-y-6">
      
      {/* Top Section: High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Monthly Recurring Revenue</h3>
            <DollarSign className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">$45,200</span>
          </div>

        </div>

        <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Annual Run Rate (ARR)</h3>
            <DollarSign className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">$542,400</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Users</h3>
            <Users className="w-5 h-5 text-neutral-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900 dark:text-white">1,245</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions */}
      <div className="w-full flex flex-col gap-3">
        
        {/* Search Bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
          <Search className="w-4 h-4 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="w-full bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:ring-0"
          />
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider shadow-sm">
          <div className="col-span-2">Transaction ID</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Plan</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-1 text-right">Download</div>
        </div>

        {/* Floating Rows */}
        <div className="flex flex-col gap-3">
          {mockTransactions.map((txn) => (
            <div key={txn.id} className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm">
                <div className="col-span-2 font-medium text-sm text-neutral-900 dark:text-white">{txn.id}</div>
                <div className="col-span-3 text-sm text-neutral-600 dark:text-neutral-300">{txn.customer}</div>
                <div className="col-span-2 text-sm text-neutral-600 dark:text-neutral-300">
                  {txn.plan}
                </div>
                <div className="col-span-2 text-sm text-neutral-500 dark:text-neutral-400">{txn.date}</div>
                <div className="col-span-2 text-sm text-neutral-600 dark:text-neutral-300">{txn.amount}</div>
                <div className="col-span-1 flex justify-end">
                  <button className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
