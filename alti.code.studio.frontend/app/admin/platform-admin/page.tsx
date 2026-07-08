"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Settings,
  Key,
  Shield,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Copy,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

import { API_URL } from "@/lib/config";

interface OrgConfig {
  aiGuardrails: boolean;
  codeExecution: boolean;
  externalIntegrations: boolean;
}

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
}

export default function AdminPlatformAdminPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<OrgConfig>({
    aiGuardrails: true,
    codeExecution: false,
    externalIntegrations: true,
  });
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: "1", name: "Production API Key", prefix: "ak_prod_****7x2m", createdAt: "2026-06-15", lastUsed: "2 hours ago", status: "active" },
    { id: "2", name: "Staging API Key", prefix: "ak_stg_****9f4k", createdAt: "2026-06-20", lastUsed: "3 days ago", status: "active" },
    { id: "3", name: "Legacy Key (deprecated)", prefix: "ak_old_****1a3b", createdAt: "2026-01-10", lastUsed: "Never", status: "revoked" },
  ]);
  const [quotas] = useState({
    tokensUsed: 2_340_000,
    tokensLimit: 5_000_000,
    apiCallsUsed: 4_230,
    apiCallsLimit: 10_000,
    agentsActive: 7,
    agentsLimit: 10,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/admin/org-config`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.config) setConfig(json.data.config);
          if (json.data?.apiKeys) setApiKeys(json.data.apiKeys);
        }
      } catch { /* defaults */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const toggleFlag = (key: keyof OrgConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F4F6] dark:bg-background min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-default-400" />
      </div>
    );
  }

  const usagePercent = (used: number, limit: number) =>
    Math.round((used / limit) * 100);

  const flags = [
    { key: "aiGuardrails" as const, label: "AI Guardrails", desc: "Enforce content safety policies on all AI responses" },
    { key: "codeExecution" as const, label: "Code Execution", desc: "Allow agents to execute code in sandboxed environments" },
    { key: "externalIntegrations" as const, label: "External Integrations", desc: "Enable GitHub, Slack, and webhook integrations" },
  ];

  return (
    <div className="flex-1 bg-[#F4F4F6] dark:bg-background min-h-screen overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Organization Settings</h1>

        {/* Feature Flags */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Settings className="w-5 h-5 text-default-500" />
            <h2 className="text-sm font-bold flex-1">Organization Features</h2>
          </CardHeader>
          <CardBody className="p-0">
            {flags.map((flag) => (
              <div key={flag.key} className="flex items-center justify-between px-6 py-4 border-b border-default-100 dark:border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{flag.label}</p>
                  <p className="text-xs text-default-500">{flag.desc}</p>
                </div>
                <button className="focus:outline-none" onClick={() => toggleFlag(flag.key)}>
                  {config[flag.key] ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-default-300" />}
                </button>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* API Keys */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Key className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold flex-1">API Keys</h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Create Key
            </button>
          </CardHeader>
          <CardBody className="p-0">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between px-6 py-4 border-b border-default-100 dark:border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{key.name}</p>
                  <p className="text-xs font-mono text-default-400">{key.prefix}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-default-500">Last used: {key.lastUsed}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${key.status === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-500"}`}>
                    {key.status}
                  </span>
                  <button className="text-default-400 hover:text-foreground"><Copy className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Usage Quotas */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Shield className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-bold flex-1">Usage & Quotas</h2>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-5">
              {[
                { label: "Tokens", used: quotas.tokensUsed, limit: quotas.tokensLimit, color: "bg-blue-500" },
                { label: "API Calls", used: quotas.apiCallsUsed, limit: quotas.apiCallsLimit, color: "bg-emerald-500" },
                { label: "Active Agents", used: quotas.agentsActive, limit: quotas.agentsLimit, color: "bg-violet-500" },
              ].map((q) => (
                <div key={q.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">{q.label}</span>
                    <span className="text-xs font-mono text-default-500">
                      {q.used.toLocaleString()} / {q.limit.toLocaleString()} ({usagePercent(q.used, q.limit)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-default-100 dark:bg-default-50/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${q.color} transition-all duration-500`}
                      style={{ width: `${Math.min(usagePercent(q.used, q.limit), 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
