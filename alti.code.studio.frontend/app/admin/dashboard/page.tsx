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

  /* KPI definitions */
  const kpis: KpiCard[] = [
    {
      label: "Active Users",
      value: data.activeUsers.toLocaleString(),
      change: data.activeUsersChange,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "API Calls Today",
      value: data.apiCallsToday.toLocaleString(),
      change: data.apiCallsChange,
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Token Spend (Month)",
      value: `$${data.tokenSpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      change: data.tokenSpendChange,
      icon: CreditCard,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Agent Runs Today",
      value: data.agentRuns.toLocaleString(),
      change: data.agentRunsChange,
      icon: Cpu,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  const maxCalls = Math.max(...data.dailyUsage.map((d) => d.calls), 1);

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
        {/* Page heading */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-default-500 mt-1">
            Platform overview &amp; real-time metrics
          </p>
        </div>

        {/* ── KPI Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card
              key={kpi.label}
              className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm"
            >
              <CardBody className="p-5">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg}`}
                  >
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-semibold ${
                      kpi.change >= 0
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {kpi.change >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {Math.abs(kpi.change)}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground mt-3">
                  {kpi.value}
                </p>
                <p className="text-xs text-default-500 mt-1">{kpi.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* ── Usage Chart + Activity Feed ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Bar chart — 3 cols */}
          <Card className="lg:col-span-3 bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
            <CardHeader className="p-5 pb-0 flex items-center gap-2">
              <Icon
                className="text-lg text-blue-500"
                icon="solar:chart-square-bold-duotone"
              />
              <h2 className="text-sm font-bold text-foreground">
                API Calls — Last 7 Days
              </h2>
            </CardHeader>
            <CardBody className="p-5 pt-4">
              <div className="space-y-3">
                {data.dailyUsage.map((d) => (
                  <div key={d.day} className="flex items-center gap-3">
                    <span className="w-8 text-xs font-mono text-default-500 shrink-0">
                      {d.day}
                    </span>
                    <div className="flex-1 h-6 bg-default-100 dark:bg-white/5 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-lg transition-all duration-500"
                        style={{
                          width: `${(d.calls / maxCalls) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-mono text-default-500 w-14 text-right shrink-0">
                      {(d.calls / 1000).toFixed(1)}k
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Activity feed — 2 cols */}
          <Card className="lg:col-span-2 bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
            <CardHeader className="p-5 pb-0 flex items-center gap-2">
              <Icon
                className="text-lg text-emerald-500"
                icon="solar:history-bold-duotone"
              />
              <h2 className="text-sm font-bold text-foreground">
                Recent Activity
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              <ul className="divide-y divide-default-200 dark:divide-white/5">
                {data.recentActivity.map((item) => (
                  <li
                    key={item.id}
                    className="px-5 py-3 hover:bg-default-100 dark:hover:bg-white/5 transition-colors flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-default-100 dark:bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-3.5 h-3.5 text-default-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {item.description}
                      </p>
                      <p className="text-xs text-default-400 mt-0.5">
                        {item.timestamp}
                      </p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-default-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-default-600 shrink-0">
                      {item.user}
                    </div>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* ── System Status Row ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* GCP Services */}
          <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
            <CardBody className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-default-500">GCP Services</p>
                <p className="text-lg font-bold text-foreground">
                  {data.systemStatus.healthyServices}/
                  {data.systemStatus.totalServices}{" "}
                  <span className="text-sm font-normal text-default-400">
                    healthy
                  </span>
                </p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </CardBody>
          </Card>

          {/* Uptime */}
          <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
            <CardBody className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-default-500">Uptime</p>
                <p className="text-lg font-bold text-foreground">
                  {data.systemStatus.uptime}
                </p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            </CardBody>
          </Card>

          {/* Avg Latency */}
          <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
            <CardBody className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-default-500">Avg Latency</p>
                <p className="text-lg font-bold text-foreground">
                  {data.systemStatus.avgLatency}
                </p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
