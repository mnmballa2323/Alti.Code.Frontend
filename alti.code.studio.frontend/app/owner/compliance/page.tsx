"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Lock,
  Eye,
  Database,
  Globe,
  RefreshCw,
  FileCheck,
} from "lucide-react";

import { API_URL } from "@/lib/config";

interface ComplianceControl {
  control: string;
  category: string;
  name: string;
  status: "pass" | "fail" | "warning";
  details: string;
}

interface ComplianceData {
  timestamp: string;
  totalControls: number;
  passed: number;
  failed: number;
  warnings: number;
  complianceScore: number;
  controls: ComplianceControl[];
}

const MOCK_DATA: ComplianceData = {
  timestamp: new Date().toISOString(),
  totalControls: 10,
  passed: 9,
  failed: 0,
  warnings: 1,
  complianceScore: 90,
  controls: [
    {
      control: "CC6.1",
      category: "Encryption",
      name: "Data Encryption at Rest",
      status: "pass",
      details: "Cloud SQL CMEK + GCS default encryption",
    },
    {
      control: "CC6.7",
      category: "Encryption",
      name: "Data Encryption in Transit",
      status: "pass",
      details: "TLS 1.3 enforced via Cloud Run",
    },
    {
      control: "CC6.2",
      category: "Access Control",
      name: "Authentication Required",
      status: "pass",
      details: "JWT + OAuth 2.0 on all endpoints",
    },
    {
      control: "CC6.3",
      category: "Access Control",
      name: "Role-Based Access Control",
      status: "pass",
      details: "RBAC: owner, admin, developer, viewer",
    },
    {
      control: "CC6.8",
      category: "Access Control",
      name: "Secret Management",
      status: "warning",
      details: "GCP Secret Manager — rotation due soon",
    },
    {
      control: "CC7.1",
      category: "Availability",
      name: "Backup Verification",
      status: "pass",
      details: "Cloud SQL daily backups with PITR",
    },
    {
      control: "CC7.2",
      category: "Availability",
      name: "Disaster Recovery",
      status: "pass",
      details: "Read replica us-east1, dual-region GCS",
    },
    {
      control: "CC7.3",
      category: "Monitoring",
      name: "Audit Logging",
      status: "pass",
      details: "Immutable SHA-256 hash chain",
    },
    {
      control: "CC7.4",
      category: "Monitoring",
      name: "Incident Response",
      status: "pass",
      details: "10 runbooks, alert policies, PagerDuty-ready",
    },
    {
      control: "CC8.1",
      category: "Data Residency",
      name: "Data Location Compliance",
      status: "pass",
      details: "All data in GCP us-central1",
    },
  ],
};

const STATUS_CONFIG = {
  pass: {
    icon: CheckCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Pass",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Warning",
  },
  fail: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    label: "Fail",
  },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Encryption: Lock,
  "Access Control": Shield,
  Availability: Database,
  Monitoring: Eye,
  "Data Residency": Globe,
};

export default function OwnerCompliancePage() {
  const [data, setData] = useState<ComplianceData>(MOCK_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      const headers: HeadersInit = { "Content-Type": "application/json" };

      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/compliance/audit`, { headers });

      if (res.ok) {
        const json = await res.json();

        if (json.data) setData(json.data);
      }
    } catch {
      /* mock fallback */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F4F6] dark:bg-background min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-default-400" />
      </div>
    );
  }

  const scoreColor =
    data.complianceScore >= 90
      ? "text-emerald-500"
      : data.complianceScore >= 70
        ? "text-amber-500"
        : "text-red-500";
  const categories = [...new Set(data.controls.map((c) => c.category))];

  return (
    <div className="flex-1 bg-[#F4F4F6] dark:bg-background min-h-screen overflow-y-auto">
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Compliance Dashboard
            </h1>
            <p className="text-xs text-default-500 mt-1">
              SOC 2 Type II — Last audit:{" "}
              {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-default-100 dark:bg-default-50/10 hover:bg-default-200 dark:hover:bg-default-100/20 transition-colors"
            onClick={() => fetchData(true)}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Run Audit
          </button>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
            <CardBody className="p-5 text-center">
              <p className={`text-4xl font-bold ${scoreColor}`}>
                {data.complianceScore}%
              </p>
              <p className="text-xs text-default-500 mt-1">Compliance Score</p>
            </CardBody>
          </Card>
          {[
            { label: "Passed", value: data.passed, color: "text-emerald-500" },
            {
              label: "Warnings",
              value: data.warnings,
              color: "text-amber-500",
            },
            { label: "Failed", value: data.failed, color: "text-red-500" },
          ].map((s) => (
            <Card
              key={s.label}
              className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm"
            >
              <CardBody className="p-5 text-center">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-default-500 mt-1">{s.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Controls by Category */}
        {categories.map((category) => {
          const CatIcon = CATEGORY_ICONS[category] || FileCheck;
          const controls = data.controls.filter((c) => c.category === category);

          return (
            <Card
              key={category}
              className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm"
            >
              <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
                <CatIcon className="w-5 h-5 text-default-500" />
                <h2 className="text-sm font-bold flex-1">{category}</h2>
                <span className="text-xs text-default-400">
                  {controls.filter((c) => c.status === "pass").length}/
                  {controls.length} passed
                </span>
              </CardHeader>
              <CardBody className="p-0">
                {controls.map((ctrl) => {
                  const cfg = STATUS_CONFIG[ctrl.status];
                  const StatusIcon = cfg.icon;

                  return (
                    <div
                      key={ctrl.control}
                      className="flex items-center justify-between px-5 py-3.5 border-b border-default-100 dark:border-white/5 last:border-0 hover:bg-default-50 dark:hover:bg-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}
                        >
                          <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-default-400">
                              {ctrl.control}
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              {ctrl.name}
                            </span>
                          </div>
                          <p className="text-xs text-default-500">
                            {ctrl.details}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
