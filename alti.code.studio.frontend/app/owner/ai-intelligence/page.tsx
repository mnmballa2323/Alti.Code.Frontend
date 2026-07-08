"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Cpu,
  Zap,
  DollarSign,
  Clock,
  Activity,
  BarChart3,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Icon } from "@iconify/react";

import { API_URL } from "@/lib/config";

interface ModelPerf {
  id: string;
  name: string;
  requests: number;
  avgLatency: number;
  p95Latency: number;
  errorRate: number;
  cost: number;
  status: "active" | "degraded" | "offline";
}

interface EvalResult {
  suite: string;
  passRate: number;
  avgScore: number;
  durationMs: number;
  timestamp: string;
}

interface AiMetrics {
  totalInferences: number;
  avgLatency: number;
  p95Latency: number;
  totalCostToday: number;
  activeModels: number;
  models: ModelPerf[];
  routingDistribution: Record<string, number>;
  recentEvals: EvalResult[];
}

const MOCK_DATA: AiMetrics = {
  totalInferences: 14_872,
  avgLatency: 342,
  p95Latency: 1_240,
  totalCostToday: 47.23,
  activeModels: 4,
  models: [
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", requests: 2_340, avgLatency: 890, p95Latency: 2_100, errorRate: 0.2, cost: 28.50, status: "active" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", requests: 7_820, avgLatency: 210, p95Latency: 680, errorRate: 0.1, cost: 12.40, status: "active" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", requests: 3_210, avgLatency: 180, p95Latency: 450, errorRate: 0.3, cost: 4.10, status: "active" },
    { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", requests: 1_502, avgLatency: 95, p95Latency: 210, errorRate: 0.05, cost: 2.23, status: "active" },
  ],
  routingDistribution: {
    "Gemini 2.5 Pro": 16,
    "Gemini 2.5 Flash": 53,
    "Gemini 2.0 Flash": 21,
    "Flash Lite": 10,
  },
  recentEvals: [
    { suite: "Code Generation v3", passRate: 0.94, avgScore: 0.87, durationMs: 45_200, timestamp: "2026-07-08T10:30:00Z" },
    { suite: "Security Review", passRate: 0.88, avgScore: 0.82, durationMs: 32_100, timestamp: "2026-07-08T09:15:00Z" },
    { suite: "API Design", passRate: 0.96, avgScore: 0.91, durationMs: 28_400, timestamp: "2026-07-08T08:00:00Z" },
    { suite: "Documentation", passRate: 0.78, avgScore: 0.72, durationMs: 18_300, timestamp: "2026-07-07T22:00:00Z" },
    { suite: "Refactoring", passRate: 0.85, avgScore: 0.79, durationMs: 52_800, timestamp: "2026-07-07T18:00:00Z" },
  ],
};

export default function OwnerAiIntelligencePage() {
  const [data, setData] = useState<AiMetrics>(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/analytics/ai-intelligence`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.data) setData(json.data);
        }
      } catch { /* mock fallback */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const scoreBadge = (score: number) => {
    const color = score >= 0.8 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : score >= 0.5 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-red-500/10 text-red-500";
    return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>{(score * 100).toFixed(0)}%</span>;
  };

  const barColors: Record<string, string> = {
    "Gemini 2.5 Pro": "bg-violet-500",
    "Gemini 2.5 Flash": "bg-blue-500",
    "Gemini 2.0 Flash": "bg-cyan-500",
    "Flash Lite": "bg-emerald-500",
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F4F6] dark:bg-background min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-default-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F4F4F6] dark:bg-background min-h-screen overflow-y-auto">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">AI Intelligence Dashboard</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Inferences Today", value: data.totalInferences.toLocaleString(), icon: Zap, color: "text-violet-500", bg: "bg-violet-500/10" },
            { label: "Avg Latency", value: `${data.avgLatency}ms`, sub: `p95: ${data.p95Latency}ms`, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Cost Today", value: `$${data.totalCostToday.toFixed(2)}`, icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10" },
            { label: "Active Models", value: data.activeModels.toString(), icon: Cpu, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          ].map((kpi) => (
            <Card key={kpi.label} className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
              <CardBody className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                    <p className="text-xs text-default-500 mt-1">{kpi.label}</p>
                    {kpi.sub && <p className="text-xs text-default-400 mt-0.5">{kpi.sub}</p>}
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Model Performance Table */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-bold flex-1">Model Performance</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default-200 dark:border-white/10">
                    {["Model", "Requests", "Avg Latency", "P95", "Error Rate", "Cost", "Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-default-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.models.map((m) => (
                    <tr key={m.id} className="border-b border-default-100 dark:border-white/5 last:border-0 hover:bg-default-50 dark:hover:bg-white/5">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Icon className="text-lg text-blue-500" icon="simple-icons:googlegemini" />
                          <span className="font-semibold text-foreground">{m.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-default-500">{m.requests.toLocaleString()}</td>
                      <td className="px-5 py-3.5 font-mono text-default-500">{m.avgLatency}ms</td>
                      <td className="px-5 py-3.5 font-mono text-default-500">{m.p95Latency}ms</td>
                      <td className="px-5 py-3.5 font-mono text-default-500">{m.errorRate}%</td>
                      <td className="px-5 py-3.5 font-mono text-amber-500">${m.cost.toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${m.status === "active" ? "bg-emerald-500" : m.status === "degraded" ? "bg-amber-500" : "bg-red-500"}`} />
                          <span className="text-xs text-default-400 capitalize">{m.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Routing Distribution */}
          <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
            <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
              <BarChart3 className="w-5 h-5 text-violet-500" />
              <h2 className="text-sm font-bold flex-1">Routing Distribution</h2>
            </CardHeader>
            <CardBody className="p-5 space-y-4">
              {Object.entries(data.routingDistribution).map(([model, pct]) => (
                <div key={model}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">{model}</span>
                    <span className="text-xs font-mono text-default-500">{pct}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-default-100 dark:bg-default-50/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColors[model] || "bg-blue-500"} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Recent Evaluations */}
          <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
            <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-bold flex-1">Recent Evaluations</h2>
            </CardHeader>
            <CardBody className="p-0">
              {data.recentEvals.map((ev, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-default-100 dark:border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{ev.suite}</p>
                    <p className="text-xs text-default-400">{new Date(ev.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {scoreBadge(ev.passRate)}
                    <span className="text-xs font-mono text-default-500">{(ev.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
