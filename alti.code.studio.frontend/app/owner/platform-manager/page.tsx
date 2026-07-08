"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Cpu,
  Sliders,
  DollarSign,
  Link2,
  Loader2,
  Save,
  Zap,
} from "lucide-react";
import { Icon } from "@iconify/react";

import { API_URL } from "@/lib/config";

interface QuotaTier {
  name: string;
  tokensPerMonth: number;
  apiCallsPerDay: number;
  maxAgents: number;
  price: string;
}

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  defaultForTier: string;
}

export default function OwnerPlatformManagerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [quotas, setQuotas] = useState<QuotaTier[]>([
    { name: "Cloud", tokensPerMonth: 5_000_000, apiCallsPerDay: 10_000, maxAgents: 10, price: "$49/mo" },
    { name: "Dedicated", tokensPerMonth: 50_000_000, apiCallsPerDay: 100_000, maxAgents: 50, price: "$499/mo" },
    { name: "Sovereign", tokensPerMonth: 500_000_000, apiCallsPerDay: 1_000_000, maxAgents: 500, price: "Custom" },
  ]);

  const [models, setModels] = useState<ModelConfig[]>([
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google", enabled: true, defaultForTier: "Sovereign" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "google", enabled: true, defaultForTier: "Cloud" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "google", enabled: true, defaultForTier: "" },
    { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", provider: "google", enabled: true, defaultForTier: "" },
  ]);

  const [integrations, setIntegrations] = useState({
    githubWebhook: "",
    slackWebhook: "",
    customWebhook: "",
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/admin/platform-manager`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.quotas) setQuotas(json.data.quotas);
          if (json.data?.models) setModels(json.data.models);
          if (json.data?.integrations) setIntegrations(json.data.integrations);
        }
      } catch { /* defaults */ }
      finally { setLoading(false); }
    };
    fetchConfig();
  }, []);

  const toggleModel = (id: string) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      await fetch(`${API_URL}/admin/platform-manager`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ quotas, models, integrations }),
      });
    } catch { /* silent */ }
    finally { setSaving(false); }
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
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Platform Manager</h1>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={saving}
            onClick={handleSave}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Resource Quotas */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Sliders className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-bold flex-1">Resource Quotas by Tier</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-default-200 dark:border-white/10">
                    <th className="text-left px-6 py-3 text-xs font-bold text-default-500 uppercase">Tier</th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-default-500 uppercase">Tokens/Month</th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-default-500 uppercase">API Calls/Day</th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-default-500 uppercase">Max Agents</th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-default-500 uppercase">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {quotas.map((tier) => (
                    <tr key={tier.name} className="border-b border-default-100 dark:border-white/5 last:border-0 hover:bg-default-50 dark:hover:bg-white/5">
                      <td className="px-6 py-4 font-semibold text-foreground">{tier.name}</td>
                      <td className="px-6 py-4 text-right font-mono text-default-500">{tier.tokensPerMonth.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono text-default-500">{tier.apiCallsPerDay.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-mono text-default-500">{tier.maxAgents}</td>
                      <td className="px-6 py-4 text-right font-semibold text-warning">{tier.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Model Configuration */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Cpu className="w-5 h-5 text-violet-500" />
            <h2 className="text-sm font-bold flex-1">AI Model Configuration</h2>
          </CardHeader>
          <CardBody className="p-0">
            {models.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between px-6 py-4 border-b border-default-100 dark:border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className="text-xl text-blue-500"
                    icon="simple-icons:googlegemini"
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{model.name}</p>
                    <p className="text-xs text-default-400 font-mono">{model.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {model.defaultForTier && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                      Default: {model.defaultForTier}
                    </span>
                  )}
                  <button
                    className="focus:outline-none"
                    onClick={() => toggleModel(model.id)}
                  >
                    {model.enabled ? (
                      <Zap className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Zap className="w-5 h-5 text-default-300" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Integration Settings */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Link2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-bold flex-1">Integration Settings</h2>
          </CardHeader>
          <CardBody className="p-6 space-y-4">
            {[
              { key: "githubWebhook" as const, label: "GitHub Webhook URL", icon: "mdi:github" },
              { key: "slackWebhook" as const, label: "Slack Webhook URL", icon: "mdi:slack" },
              { key: "customWebhook" as const, label: "Custom Webhook URL", icon: "mdi:webhook" },
            ].map((item) => (
              <div key={item.key}>
                <label className="flex items-center gap-2 text-xs font-bold text-default-500 mb-2">
                  <Icon className="text-base" icon={item.icon} />
                  {item.label}
                </label>
                <input
                  className="w-full p-3 rounded-xl bg-default-100 dark:bg-default-50/10 border border-default-200 dark:border-white/10 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="https://..."
                  type="url"
                  value={integrations[item.key]}
                  onChange={(e) =>
                    setIntegrations((prev) => ({ ...prev, [item.key]: e.target.value }))
                  }
                />
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
