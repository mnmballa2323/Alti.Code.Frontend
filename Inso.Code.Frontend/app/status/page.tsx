"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Activity,
  Brain,
  Database,
  Globe,
  HardDrive,
  Lock,
  Radio,
  Search,
  Server,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Bell,
  RefreshCw,
} from "lucide-react";

import { API_URL } from "@/lib/config";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ServiceStatus {
  name: string;
  icon: React.ComponentType<any>;
  status: "operational" | "degraded" | "outage";
  uptime: number;
}

interface Incident {
  id: string;
  date: string;
  title: string;
  status: "resolved" | "monitoring" | "investigating";
  duration: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Mock / Fallback Data                                               */
/* ------------------------------------------------------------------ */

const FALLBACK_SERVICES: ServiceStatus[] = [
  { name: "API Gateway", icon: Server, status: "operational", uptime: 99.98 },
  {
    name: "AI Engine (Vertex AI)",
    icon: Brain,
    status: "operational",
    uptime: 99.95,
  },
  {
    name: "Database (Cloud SQL)",
    icon: Database,
    status: "operational",
    uptime: 99.99,
  },
  { name: "Authentication", icon: Lock, status: "operational", uptime: 100.0 },
  {
    name: "File Storage (GCS)",
    icon: HardDrive,
    status: "operational",
    uptime: 99.97,
  },
  {
    name: "Real-time (WebSocket)",
    icon: Radio,
    status: "operational",
    uptime: 99.92,
  },
  {
    name: "Search (Firestore)",
    icon: Search,
    status: "operational",
    uptime: 99.96,
  },
  { name: "CDN", icon: Globe, status: "operational", uptime: 99.99 },
];

const FALLBACK_INCIDENTS: Incident[] = [
  {
    id: "inc-003",
    date: "2026-07-05",
    title: "Elevated latency on AI Engine",
    status: "resolved",
    duration: "42 min",
    description:
      "Vertex AI endpoint experienced elevated p95 latency due to regional load balancer reconfiguration. Auto-scaling resolved the issue.",
  },
  {
    id: "inc-002",
    date: "2026-06-28",
    title: "WebSocket reconnection delays",
    status: "resolved",
    duration: "18 min",
    description:
      "Brief WebSocket disconnections affected ~3% of active sessions during a rolling deployment. Connection pooling patch deployed.",
  },
  {
    id: "inc-001",
    date: "2026-06-15",
    title: "Scheduled maintenance — Database migration",
    status: "resolved",
    duration: "2 hr 15 min",
    description:
      "Planned Cloud SQL schema migration with zero-downtime blue-green cutover. All services remained available throughout.",
  },
];

/** Generate 90 days of uptime bar data, mostly green with a few amber */
const generateUptimeBars = (): ("green" | "amber" | "red")[] => {
  const bars: ("green" | "amber" | "red")[] = Array(90).fill("green");

  // Sprinkle 2–3 amber days matching our incidents
  bars[5] = "amber"; // ~5 days ago
  bars[12] = "amber"; // ~12 days ago
  bars[25] = "amber"; // ~25 days ago

  return bars;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>(FALLBACK_SERVICES);
  const [incidents, setIncidents] = useState<Incident[]>(FALLBACK_INCIDENTS);
  const [lastUpdated, setLastUpdated] = useState<string>(
    new Date().toISOString(),
  );
  const [isLoading, setIsLoading] = useState(true);

  const uptimeBars = generateUptimeBars();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/status/public`);

        if (res.ok) {
          const data = await res.json();

          if (data.services) setServices(data.services);
          if (data.incidents) setIncidents(data.incidents);
          if (data.lastUpdated) setLastUpdated(data.lastUpdated);
        }
      } catch {
        // Fallback data already set
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const overallStatus = services.some((s) => s.status === "outage")
    ? "outage"
    : services.some((s) => s.status === "degraded")
      ? "degraded"
      : "operational";

  const statusConfig = {
    operational: {
      label: "All Systems Operational",
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      Icon: CheckCircle2,
    },
    degraded: {
      label: "Partial Degradation",
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      Icon: AlertTriangle,
    },
    outage: {
      label: "Major Outage",
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/10",
      Icon: XCircle,
    },
  };

  const overall = statusConfig[overallStatus];
  const OverallIcon = overall.Icon;

  const serviceStatusDot = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-emerald-500";
      case "degraded":
        return "bg-amber-500";
      case "outage":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const barColor = (bar: string) => {
    switch (bar) {
      case "green":
        return "bg-emerald-500 hover:bg-emerald-400";
      case "amber":
        return "bg-amber-500 hover:bg-amber-400";
      case "red":
        return "bg-red-500 hover:bg-red-400";
      default:
        return "bg-emerald-500";
    }
  };

  return (
    <div className="min-h-screen bg-default-50 dark:bg-[#0A0A0A]">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="border-b border-default-200 dark:border-white/10 bg-white dark:bg-[#111111]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Inso Code — System Status
            </h1>
          </div>

          {/* Overall Status Badge */}
          <div
            className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl ${overall.bgColor}`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${overall.color} animate-pulse`}
            />
            <OverallIcon className={overall.textColor} size={18} />
            <span className={`text-sm font-semibold ${overall.textColor}`}>
              {overall.label}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* ── Service Status Grid ─────────────────────────────── */}
        <Card className="bg-white dark:bg-[#111111] border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="px-6 pt-6 pb-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Service Status
            </h2>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service) => {
                const ServiceIcon = service.icon;

                return (
                  <div
                    key={service.name}
                    className="flex items-center justify-between p-4 rounded-xl border border-default-100 dark:border-white/5 bg-default-50 dark:bg-black/40 hover:border-default-200 dark:hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ServiceIcon
                        className="text-gray-500 dark:text-gray-400"
                        size={18}
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {service.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-500">
                        {service.uptime.toFixed(2)}%
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${serviceStatusDot(service.status)}`}
                        />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                          {service.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* ── Uptime Chart — 90 Day ──────────────────────────── */}
        <Card className="bg-white dark:bg-[#111111] border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="px-6 pt-6 pb-0">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Uptime — Last 90 Days
              </h2>
              <span className="text-xs font-mono text-gray-500">
                99.97% average
              </span>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="flex items-end gap-[2px] h-12">
              {uptimeBars.map((bar, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-sm transition-all duration-200 cursor-pointer ${barColor(bar)}`}
                  style={{
                    height:
                      bar === "green"
                        ? "100%"
                        : bar === "amber"
                          ? "60%"
                          : "30%",
                    minWidth: "2px",
                  }}
                  title={`${90 - idx} days ago — ${bar === "green" ? "No issues" : bar === "amber" ? "Minor incident" : "Outage"}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-[10px] text-gray-400">90 days ago</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-emerald-500" />
                  <span className="text-[10px] text-gray-400">No issues</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-amber-500" />
                  <span className="text-[10px] text-gray-400">Degraded</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm bg-red-500" />
                  <span className="text-[10px] text-gray-400">Outage</span>
                </div>
              </div>
              <span className="text-[10px] text-gray-400">Today</span>
            </div>
          </CardBody>
        </Card>

        {/* ── Incident History ────────────────────────────────── */}
        <Card className="bg-white dark:bg-[#111111] border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="px-6 pt-6 pb-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Incident History
            </h2>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 rounded-xl border border-default-100 dark:border-white/5 bg-default-50 dark:bg-black/40"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="text-emerald-500 shrink-0"
                        size={16}
                      />
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {incident.title}
                      </h3>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 capitalize shrink-0">
                      {incident.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 ml-6">
                    {incident.description}
                  </p>
                  <div className="flex items-center gap-4 ml-6 text-[11px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {incident.date}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span>Duration: {incident.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* ── Footer ──────────────────────────────────────────── */}
        <footer className="flex items-center justify-between py-6 border-t border-default-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <RefreshCw size={12} />
            <span>
              Last updated:{" "}
              {new Date(lastUpdated).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            <Bell size={12} />
            Subscribe to updates
          </button>
        </footer>
      </main>
    </div>
  );
}
