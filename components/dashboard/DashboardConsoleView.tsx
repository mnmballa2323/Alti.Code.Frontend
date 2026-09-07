"use client";

import React, { useEffect, useState } from "react";
import { Users, CreditCard, TrendingUp, Wallet, Loader2 } from "lucide-react";

import { API_URL } from "@/lib/config";

interface OwnerMetrics {
  totalAccounts: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  totalAvailableBalance: number;
}

export default function DashboardConsoleView() {
  const [metrics, setMetrics] = useState<OwnerMetrics>({
    totalAccounts: 0,
    monthlyRecurringRevenue: 0,
    annualRecurringRevenue: 0,
    totalAvailableBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_URL}/analytics/owner-metrics`, {
          headers,
        });
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};

        if (json && json.success && json.data) {
          setMetrics({
            totalAccounts: json.data.totalAccounts || 0,
            monthlyRecurringRevenue: json.data.monthlyRecurringRevenue || 0,
            annualRecurringRevenue: json.data.annualRecurringRevenue || 0,
            totalAvailableBalance: json.data.totalAvailableBalance || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch platform owner metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
        <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
        <p className="text-sm text-neutral-500">Loading console metrics...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full min-h-[calc(100vh-140px)] pt-4 pb-8">
      {/* Top Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        {/* Total Accounts Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Total Accounts
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2 animate-fade-in">
                {metrics.totalAccounts.toLocaleString()}
              </span>
            </div>
            <Users className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>

        {/* Monthly Recurring Revenues Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Monthly Recurring Revenues
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2 animate-fade-in">
                $
                {metrics.monthlyRecurringRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <CreditCard className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>

        {/* Annual Recurring Revenues Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Annual Recurring Revenues
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2 animate-fade-in">
                $
                {metrics.annualRecurringRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <TrendingUp className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>

        {/* Total Available Balance Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Total Available Balance
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2 animate-fade-in">
                $
                {metrics.totalAvailableBalance.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <Wallet className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>
      </div>

      {/* Central White Logo Watermark */}
      <div className="flex-1 flex items-center justify-center py-10 min-h-[250px]">
        <img
          alt="Inso Code Logo"
          className="w-40 h-40 object-contain opacity-25 dark:opacity-40 select-none pointer-events-none animate-fade-in"
          src="/logo-white.png"
        />
      </div>
    </div>
  );
}
