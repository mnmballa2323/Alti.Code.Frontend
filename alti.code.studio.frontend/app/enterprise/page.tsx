"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, Spinner, Chip } from "@heroui/react";
import {
  Activity,
  CreditCard,
  ShieldCheck,
  Webhook,
  Users,
  Database,
  Globe,
  Gauge,
  TrendingUp,
  Server,
  ArrowUpRight,
  Zap,
  BarChart3,
} from "lucide-react";

import { fetchCommandCenterData } from "@/lib/enterprise-api";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}

export default function EnterpriseCommandCenter() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const load = async () => {
    try {
      setLoading(true);
      const result = await fetchCommandCenterData();

      setData(result);
      setError("");
      setLastRefresh(new Date());
    } catch (err) {
      setError("Failed to connect to enterprise backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);

    return () => clearInterval(interval);
  }, []);

  const cards: StatCard[] = data
    ? [
        {
          label: "System Health",
          value: data.system?.dependencies ?? "—",
          icon: <Server className="w-5 h-5" />,
          color: "from-emerald-500 to-green-600",
          sub: `Deps tracked`,
        },
        {
          label: "Total Costs Tracked",
          value: data.cost?.totalTracked ?? 0,
          icon: <CreditCard className="w-5 h-5" />,
          color: "from-blue-500 to-cyan-600",
          sub: `${data.cost?.categories ?? 5} categories`,
        },
        {
          label: "Performance Benchmarks",
          value: data.performance?.totalBenchmarks ?? 0,
          icon: <Gauge className="w-5 h-5" />,
          color: "from-amber-500 to-orange-600",
          sub: `${data.performance?.slaTiers ?? 3} SLA tiers`,
        },
        {
          label: "Billing Accounts",
          value: data.billing?.totalAccounts ?? 0,
          icon: <TrendingUp className="w-5 h-5" />,
          color: "from-violet-500 to-purple-600",
          sub: `${data.billing?.plans ?? 5} plans`,
        },
        {
          label: "Active Webhooks",
          value: data.webhooks?.totalWebhooks ?? 0,
          icon: <Webhook className="w-5 h-5" />,
          color: "from-pink-500 to-rose-600",
          sub: `${data.webhooks?.events ?? 17} event types`,
        },
        {
          label: "Compliance Assessments",
          value: data.compliance?.totalAssessments ?? 0,
          icon: <ShieldCheck className="w-5 h-5" />,
          color: "from-teal-500 to-emerald-600",
          sub: `${data.compliance?.frameworks ?? 5} frameworks`,
        },
        {
          label: "Collab Sessions",
          value: data.collaboration?.totalSessions ?? 0,
          icon: <Users className="w-5 h-5" />,
          color: "from-indigo-500 to-blue-600",
          sub: `${data.collaboration?.patterns ?? 6} patterns`,
        },
        {
          label: "Migrations",
          value: data.migration?.totalMigrations ?? 0,
          icon: <Globe className="w-5 h-5" />,
          color: "from-sky-500 to-blue-600",
          sub: `${data.migration?.regions ?? 8} regions`,
        },
        {
          label: "Marketplace Agents",
          value: data.marketplace?.totalAgents ?? 0,
          icon: <Zap className="w-5 h-5" />,
          color: "from-fuchsia-500 to-pink-600",
          sub: `${data.marketplace?.categories ?? 0} categories`,
        },
        {
          label: "Dashboards Built",
          value: data.dashboards?.totalDashboards ?? 0,
          icon: <BarChart3 className="w-5 h-5" />,
          color: "from-lime-500 to-green-600",
          sub: `${data.dashboards?.widgetTypes ?? 15} widget types`,
        },
      ]
    : [];

  if (loading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner color="secondary" size="lg" />
        <span className="ml-3 text-default-400">
          Loading Enterprise Command Center...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Command Center</h2>
          <p className="text-sm text-default-400">
            Live infrastructure overview • Last refreshed{" "}
            {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Chip color={error ? "danger" : "success"} size="sm" variant="dot">
          {error ? "Disconnected" : "Live"}
        </Chip>
      </div>

      {error && (
        <Card className="bg-danger/10 border border-danger/20">
          <CardBody className="text-danger text-sm py-3">
            ⚠ {error} — Retrying every 15s. Make sure the backend is running on
            port 5000.
          </CardBody>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <Card
            key={i}
            className="bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] cursor-default"
          >
            <CardBody className="py-4 px-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${card.color} shadow-lg`}
                >
                  <div className="text-white">{card.icon}</div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-default-300" />
              </div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="text-sm font-medium text-default-300 mt-0.5">
                {card.label}
              </div>
              {card.sub && (
                <div className="text-xs text-default-500 mt-1">{card.sub}</div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card className="bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20">
          <CardBody className="py-5">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-violet-400" />
              <div>
                <div className="text-white font-bold">Real-Time Monitoring</div>
                <div className="text-xs text-default-400">
                  Health checks poll every 15s across all services
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/20">
          <CardBody className="py-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="text-white font-bold">
                  5 Compliance Frameworks
                </div>
                <div className="text-xs text-default-400">
                  SOC2 • ISO 27001 • HIPAA • FedRAMP • PCI-DSS
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/20">
          <CardBody className="py-5">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-amber-400" />
              <div>
                <div className="text-white font-bold">Multi-Region Ready</div>
                <div className="text-xs text-default-400">
                  8 global regions with tenant migration support
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
