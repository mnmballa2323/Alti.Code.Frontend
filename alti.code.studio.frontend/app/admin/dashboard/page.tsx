"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Icon } from "@iconify/react";
import {
  Users,
  Activity,
  CreditCard,
  Cpu,
  Shield,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  LogIn,
  Bot,
  KeyRound,
  Settings,
  UserPlus,
} from "lucide-react";

import { API_URL } from "@/lib/config";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface KpiCard {
  label: string;
  value: string;
  change: number; // percentage, positive = up
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
}

interface DailyUsage {
  day: string;
  calls: number;
}

interface ActivityItem {
  id: string;
  icon: React.ComponentType<any>;
  description: string;
  timestamp: string;
  user: string;
}

interface SystemStatus {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  dot: string; // tailwind color for status dot
}

interface DashboardData {
  activeUsers: number;
  activeUsersChange: number;
  apiCallsToday: number;
  apiCallsChange: number;
  tokenSpend: number;
  tokenSpendChange: number;
  agentRuns: number;
  agentRunsChange: number;
  dailyUsage: DailyUsage[];
  recentActivity: ActivityItem[];
  systemStatus: {
    healthyServices: number;
    totalServices: number;
    uptime: string;
    avgLatency: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Fallback mock data                                                 */
/* ------------------------------------------------------------------ */

const MOCK_DATA: DashboardData = {
  activeUsers: 1284,
  activeUsersChange: 12.5,
  apiCallsToday: 48329,
  apiCallsChange: 8.2,
  tokenSpend: 2847.63,
  tokenSpendChange: -3.1,
  agentRuns: 1562,
  agentRunsChange: 24.7,
  dailyUsage: [
    { day: "Mon", calls: 32400 },
    { day: "Tue", calls: 41200 },
    { day: "Wed", calls: 38700 },
    { day: "Thu", calls: 45100 },
    { day: "Fri", calls: 48329 },
    { day: "Sat", calls: 27800 },
    { day: "Sun", calls: 21500 },
  ],
  recentActivity: [
    {
      id: "1",
      icon: LogIn,
      description: "admin@alticode.dev signed in",
      timestamp: "2 min ago",
      user: "AK",
    },
    {
      id: "2",
      icon: Bot,
      description: "Agent run completed — code-reviewer",
      timestamp: "8 min ago",
      user: "MR",
    },
    {
      id: "3",
      icon: KeyRound,
      description: "New API key created for Team Bravo",
      timestamp: "23 min ago",
      user: "JL",
    },
    {
      id: "4",
      icon: UserPlus,
      description: "elena.v@company.io invited to workspace",
      timestamp: "1 hr ago",
      user: "AK",
    },
    {
      id: "5",
      icon: Settings,
      description: "Guardrail policy updated — max-tokens",
      timestamp: "3 hrs ago",
      user: "MR",
    },
  ],
  systemStatus: {
    healthyServices: 69,
    totalServices: 69,
    uptime: "99.97%",
    avgLatency: "142ms",
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken") ||
              localStorage.getItem("token")
            : null;

        const res = await fetch(`${API_URL}/analytics/admin-dashboard`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        if (json.success && json.data) {
          setData(json.data);
        }
      } catch {
        // API unavailable — keep mock data
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);



  const activeSeats = 7;
  const seatPrice = 15;
  const totalAmount = activeSeats * seatPrice;
  const activePaymentMethod = {
    details: "•••• 4242",
    extra: "Visa",
  };

  /* Loading state */
  if (loading) {
    return (
      <div className="w-full h-full p-8 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <Icon
            className="text-4xl text-default-300 mb-4"
            icon="solar:chart-square-bold-duotone"
          />
          <p className="text-default-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F4F4F6] dark:bg-background min-h-screen overflow-y-auto">
      <div className="p-8 max-w-6xl mx-auto space-y-6">


        {/* ── Subscription Summary Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Plan Type */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm relative flex flex-col justify-between h-28">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              Plan
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                Pro SaaS
              </span>
            </div>
          </div>

          {/* Card 2: Active Seats */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-28">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              Seats
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                {activeSeats} Active
              </span>
            </div>
          </div>

          {/* Card 3: Payment Method */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-28">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              Payment
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                {activePaymentMethod.details}
              </span>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
