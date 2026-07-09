"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  UserPlus,
  Users,
  CreditCard,
  TrendingUp,
  Loader2,
} from "lucide-react";

import { API_URL } from "@/lib/config";

interface OwnerMetrics {
  cloudAccounts: number;
  dedicatedAccounts: number;
  sovereignAccounts: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
}

export default function DashboardConsoleView() {
  const [metrics, setMetrics] = useState<OwnerMetrics>({
    cloudAccounts: 0,
    dedicatedAccounts: 0,
    sovereignAccounts: 0,
    monthlyRecurringRevenue: 0,
    annualRecurringRevenue: 0,
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
        const json = await res.json();

        if (json && json.success && json.data) {
          setMetrics({
            cloudAccounts: json.data.cloudAccounts || 0,
            dedicatedAccounts: json.data.dedicatedAccounts || 0,
            sovereignAccounts: json.data.sovereignAccounts || 0,
            monthlyRecurringRevenue: json.data.monthlyRecurringRevenue || 0,
            annualRecurringRevenue: json.data.annualRecurringRevenue || 0,
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
    <div className="flex flex-col gap-6 w-full h-full pt-4">
      {/* Top Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Cloud Accounts Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Total Cloud Accounts
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2 animate-fade-in">
                {metrics.cloudAccounts.toLocaleString()}
              </span>
            </div>
            <User className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>

        {/* Total Dedicated Accounts Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Total Dedicated Accounts
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2 animate-fade-in">
                {metrics.dedicatedAccounts.toLocaleString()}
              </span>
            </div>
            <UserPlus className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>

        {/* Total Sovereign Accounts Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800 rounded-[20px] p-8 flex flex-col justify-between min-h-[130px]">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">
                Total Sovereign Accounts
              </span>
              <span className="text-[36px] font-bold text-neutral-950 dark:text-white leading-none mt-2 animate-fade-in">
                {metrics.sovereignAccounts.toLocaleString()}
              </span>
            </div>
            <Users className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>
      </div>

      {/* Bottom Row Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}
