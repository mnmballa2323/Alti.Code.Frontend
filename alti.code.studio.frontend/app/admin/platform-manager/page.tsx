"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Cpu,
  Sliders,
  Bell,
  Loader2,
  Save,
  Zap,
} from "lucide-react";
import { Icon } from "@iconify/react";

import { API_URL } from "@/lib/config";

interface ModelPreference {
  id: string;
  name: string;
  enabled: boolean;
  preferred: boolean;
}

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export default function AdminPlatformManagerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [models, setModels] = useState<ModelPreference[]>([
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", enabled: true, preferred: true },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", enabled: true, preferred: false },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", enabled: true, preferred: false },
    { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", enabled: false, preferred: false },
  ]);

  const [quotaAllocation, setQuotaAllocation] = useState({
    engineering: 60,
    research: 25,
    operations: 15,
  });

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { key: "usage_alert", label: "Usage Alerts", description: "Notify when team usage exceeds 80% of quota", enabled: true },
    { key: "security_alert", label: "Security Alerts", description: "Notify on suspicious API key usage or failed auth attempts", enabled: true },
    { key: "agent_errors", label: "Agent Errors", description: "Notify when agent execution fails repeatedly", enabled: false },
    { key: "billing_alert", label: "Billing Alerts", description: "Notify before billing cycle renewal", enabled: true },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/admin/org-manager`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.models) setModels(json.data.models);
          if (json.data?.quotaAllocation) setQuotaAllocation(json.data.quotaAllocation);
          if (json.data?.notifications) setNotifications(json.data.notifications);
        }
      } catch { /* defaults */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const toggleModel = (id: string) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const setPreferred = (id: string) => {
    setModels((prev) => prev.map((m) => ({ ...m, preferred: m.id === id })));
  };

  const toggleNotification = (key: string) => {
    setNotifications((prev) => prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
      await fetch(`${API_URL}/admin/org-manager`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ models, quotaAllocation, notifications }),
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
          <h1 className="text-2xl font-bold text-foreground">Organization Manager</h1>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={saving}
            onClick={handleSave}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Model Preferences */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Cpu className="w-5 h-5 text-violet-500" />
            <h2 className="text-sm font-bold flex-1">AI Model Preferences</h2>
          </CardHeader>
          <CardBody className="p-0">
            {models.map((model) => (
              <div key={model.id} className="flex items-center justify-between px-6 py-4 border-b border-default-100 dark:border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <Icon className="text-xl text-blue-500" icon="simple-icons:googlegemini" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{model.name}</p>
                    <p className="text-xs text-default-400 font-mono">{model.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${model.preferred ? "bg-blue-500 text-white" : "bg-default-100 dark:bg-default-50/10 text-default-500 hover:bg-default-200"}`}
                    onClick={() => setPreferred(model.id)}
                  >
                    {model.preferred ? "★ Preferred" : "Set Preferred"}
                  </button>
                  <button className="focus:outline-none" onClick={() => toggleModel(model.id)}>
                    <Zap className={`w-5 h-5 ${model.enabled ? "text-emerald-500" : "text-default-300"}`} />
                  </button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Quota Allocation */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Sliders className="w-5 h-5 text-emerald-500" />
            <h2 className="text-sm font-bold flex-1">Team Quota Allocation</h2>
          </CardHeader>
          <CardBody className="p-6 space-y-5">
            {Object.entries(quotaAllocation).map(([team, pct]) => (
              <div key={team}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium capitalize text-foreground">{team}</span>
                  <span className="text-xs font-mono text-default-500">{pct}%</span>
                </div>
                <input
                  className="w-full accent-blue-500"
                  max="100"
                  min="0"
                  type="range"
                  value={pct}
                  onChange={(e) =>
                    setQuotaAllocation((prev) => ({ ...prev, [team]: parseInt(e.target.value) }))
                  }
                />
              </div>
            ))}
            <p className="text-xs text-default-400 mt-2">
              Total: {Object.values(quotaAllocation).reduce((a, b) => a + b, 0)}%
              {Object.values(quotaAllocation).reduce((a, b) => a + b, 0) !== 100 && (
                <span className="text-amber-500 ml-2">(should equal 100%)</span>
              )}
            </p>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Bell className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold flex-1">Notification Preferences</h2>
          </CardHeader>
          <CardBody className="p-0">
            {notifications.map((notif) => (
              <div key={notif.key} className="flex items-center justify-between px-6 py-4 border-b border-default-100 dark:border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-foreground">{notif.label}</p>
                  <p className="text-xs text-default-500">{notif.description}</p>
                </div>
                <button className="focus:outline-none" onClick={() => toggleNotification(notif.key)}>
                  <div className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${notif.enabled ? "bg-emerald-500" : "bg-default-200 dark:bg-default-100/20"}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${notif.enabled ? "translate-x-4" : "translate-x-0"}`} />
                  </div>
                </button>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
