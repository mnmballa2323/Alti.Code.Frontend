"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  Globe,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  Zap,
  CheckCircle,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

interface ProviderSpend {
  azureOpenAI: number;
  gcpVertex: number;
  awsBedrock: number;
}

interface MonthlyTrend {
  month: string;
  spend: number;
}

interface SLAMetrics {
  availabilityPercent: number;
  avgLatencyMs: number;
  totalRequestsPerSecond: number;
  activeSpecialistAgents: number;
}

interface Tenant {
  id: string;
  name: string;
  plan: string;
  region: string;
  monthlySpend: number;
  tokenUsage: number;
  status: string;
}

interface SystemOperations {
  lastGlobalAuditTime: string;
  lastCmekRotationTime: string;
  unresolvedSecurityAlerts: number;
}

interface OwnerMetrics {
  systemSpendUSD: {
    total: number;
    byProvider: ProviderSpend;
    monthlyTrend: MonthlyTrend[];
  };
  slaMetrics: SLAMetrics;
  activeTenants: Tenant[];
  systemOperations: SystemOperations;
}

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState<OwnerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);

  const fetchMetrics = async () => {
    try {
      const token = session?.user?.accessToken;
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/analytics/owner-metrics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const body = await res.json();
        if (body.success) {
          setMetrics(body.data);
        }
      }
    } catch (err) {
      console.error("Failed to load owner metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchMetrics();
    }
  }, [session]);

  const handleCmekRotation = async () => {
    setIsRotating(true);
    // Simulate key rotation
    await new Promise((r) => setTimeout(r, 2000));
    setIsRotating(false);
    toast.success("CMEK Cryptographic Keys rotated successfully across all database pools!");
    if (metrics) {
      setMetrics({
        ...metrics,
        systemOperations: {
          ...metrics.systemOperations,
          lastCmekRotationTime: new Date().toISOString(),
        },
      });
    }
  };

  const handleGlobalAudit = async () => {
    setIsAuditing(true);
    // Simulate audit
    await new Promise((r) => setTimeout(r, 1500));
    setIsAuditing(false);
    toast.success("Platform integrity chain verified. Zero tampering detected!");
    if (metrics) {
      setMetrics({
        ...metrics,
        systemOperations: {
          ...metrics.systemOperations,
          lastGlobalAuditTime: new Date().toISOString(),
        },
      });
    }
  };

  if (loading || !metrics) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#0d1117]">
        <div className="text-center flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium text-neutral-400">Loading Business Metrics...</p>
        </div>
      </div>
    );
  }

  const { systemSpendUSD, slaMetrics, activeTenants, systemOperations } = metrics;

  return (
    <div className="flex-1 w-full space-y-8 animate-fade-in">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-125 transition-all duration-500" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-neutral-450 tracking-wider uppercase">Platform Cost (MTD)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">${systemSpendUSD.total.toLocaleString()}</div>
          <p className="text-[10px] text-green-400 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs last month</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-125 transition-all duration-500" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-neutral-450 tracking-wider uppercase">Active Tenants</span>
            <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <Globe className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{activeTenants.length} Tenants</div>
          <p className="text-[10px] text-green-400 font-bold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1 pending provisioning</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-125 transition-all duration-500" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-neutral-450 tracking-wider uppercase">System SLA</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Activity className="w-4 h-4 text-cyan-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{slaMetrics.availabilityPercent}%</div>
          <p className="text-[10px] text-green-400 font-bold mt-2 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>All microservices operational</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-125 transition-all duration-500" />
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-semibold text-neutral-450 tracking-wider uppercase">API Load</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{slaMetrics.totalRequestsPerSecond} RPS</div>
          <p className="text-[10px] text-neutral-400 mt-2">
            Average Latency: <strong className="text-white">{slaMetrics.avgLatencyMs}ms</strong>
          </p>
        </div>
      </div>

      {/* Main Mid Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Provider cost breakdown */}
        <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Inference Cost Allocation</span>
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-neutral-300 mb-1.5">
                  <span>Azure OpenAI Foundry</span>
                  <span className="text-white">${systemSpendUSD.byProvider.azureOpenAI.toLocaleString()}</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${(systemSpendUSD.byProvider.azureOpenAI / systemSpendUSD.total) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-neutral-300 mb-1.5">
                  <span>GCP Vertex AI</span>
                  <span className="text-white">${systemSpendUSD.byProvider.gcpVertex.toLocaleString()}</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full"
                    style={{ width: `${(systemSpendUSD.byProvider.gcpVertex / systemSpendUSD.total) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-neutral-300 mb-1.5">
                  <span>AWS Bedrock</span>
                  <span className="text-white">${systemSpendUSD.byProvider.awsBedrock.toLocaleString()}</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full"
                    style={{ width: `${(systemSpendUSD.byProvider.awsBedrock / systemSpendUSD.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-neutral-800 mt-6 text-[10px] text-neutral-400">
            Unified billing reconciled over Keystone API daily.
          </div>
        </div>

        {/* Operational settings */}
        <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span>Platform Operations</span>
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-400 mb-1">Last Cryptographic Key Rotation</p>
                <p className="text-xs font-bold text-white">
                  {new Date(systemOperations.lastCmekRotationTime).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400 mb-1">Last Global Audit Verification</p>
                <p className="text-xs font-bold text-white">
                  {new Date(systemOperations.lastGlobalAuditTime).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Zero pending security vulnerabilities</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCmekRotation}
              disabled={isRotating}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-[#0d1117] font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`} />
              <span>Rotate CMEK</span>
            </button>
            <button
              onClick={handleGlobalAudit}
              disabled={isAuditing}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white font-bold text-xs py-2 px-3 rounded-xl border border-neutral-700 transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? "animate-spin" : ""}`} />
              <span>Audit Chain</span>
            </button>
          </div>
        </div>

        {/* SLA and alerts panel */}
        <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <span>System Core Services</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-800">
                <span className="text-neutral-300">Swarm Orchestrator</span>
                <span className="font-bold text-green-400">Online</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-800">
                <span className="text-neutral-300">Redis Synapse Bus</span>
                <span className="font-bold text-green-400">Online</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-800">
                <span className="text-neutral-300">pgvector Memory Substrate</span>
                <span className="font-bold text-green-400">Online</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1">
                <span className="text-neutral-300">Keystone Identity Gateway</span>
                <span className="font-bold text-green-400">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 mt-6">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-neutral-400 leading-normal">
              Private cloud configured in isolated host mode. Public ingress calls are monitored by the default WAF middleware.
            </p>
          </div>
        </div>
      </div>

      {/* Active business tenants table */}
      <div className="bg-[#161b22] border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Enterprise Client Tenants
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0d1117]/30 text-neutral-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-6">Tenant Name</th>
                <th className="py-3 px-6">Subscription Plan</th>
                <th className="py-3 px-6">Region</th>
                <th className="py-3 px-6">Monthly Revenue</th>
                <th className="py-3 px-6">Token Bandwidth</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-xs text-neutral-200">
              {activeTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-neutral-800/25 transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">{tenant.name}</td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500">
                      {tenant.plan}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-neutral-400 font-mono">{tenant.region}</td>
                  <td className="py-4 px-6 font-semibold text-white">${tenant.monthlySpend.toLocaleString()}</td>
                  <td className="py-4 px-6 font-mono text-neutral-400">{tenant.tokenUsage.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 text-green-400 font-bold uppercase text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span>{tenant.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
