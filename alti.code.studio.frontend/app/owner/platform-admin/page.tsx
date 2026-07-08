"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Settings,
  Bell,
  Shield,
  RefreshCw,
  Trash2,
  Rocket,
  Key,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

import { API_URL } from "@/lib/config";

interface PlatformConfig {
  maintenanceMode: boolean;
  signupsEnabled: boolean;
  betaFeatures: boolean;
  currentVersion: string;
  lastDeploy: string;
  cloudRunRevision: string;
  announcement: string;
}

export default function OwnerPlatformAdminPage() {
  const [config, setConfig] = useState<PlatformConfig>({
    maintenanceMode: false,
    signupsEnabled: true,
    betaFeatures: false,
    currentVersion: "2.0.0",
    lastDeploy: new Date().toISOString(),
    cloudRunRevision: "alti-backend-00042-xkz",
    announcement: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/admin/platform-config`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setConfig(json.data);
            setAnnouncement(json.data.announcement || "");
          }
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const toggleFlag = async (key: keyof PlatformConfig) => {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      await fetch(`${API_URL}/admin/platform-config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ [key]: updated[key] }),
      });
    } catch {
      setConfig(config);
    }
  };

  const executeAction = async (action: string) => {
    setSaving(true);
    try {
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("token");
      await fetch(`${API_URL}/admin/actions/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch {
      // Silent
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F4F6] dark:bg-background min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-default-400" />
      </div>
    );
  }

  const flags = [
    {
      key: "maintenanceMode" as const,
      label: "Maintenance Mode",
      desc: "Displays maintenance banner to all users. API requests still work.",
      icon: AlertTriangle,
      danger: true,
    },
    {
      key: "signupsEnabled" as const,
      label: "New Signups",
      desc: "Allow new user registration on the platform.",
      icon: CheckCircle,
      danger: false,
    },
    {
      key: "betaFeatures" as const,
      label: "Beta Features",
      desc: "Enable experimental features for all users.",
      icon: Rocket,
      danger: false,
    },
  ];

  const quickActions = [
    { label: "Clear Cache", icon: Trash2, action: "clear-cache", color: "text-amber-500" },
    { label: "Health Check", icon: RefreshCw, action: "health-check", color: "text-emerald-500" },
    { label: "Rotate Secrets", icon: Key, action: "rotate-secrets", color: "text-red-500" },
  ];

  return (
    <div className="flex-1 bg-[#F4F4F6] dark:bg-background min-h-screen overflow-y-auto">
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Platform Administration</h1>

        {/* Feature Flags */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Settings className="w-5 h-5 text-default-500" />
            <h2 className="text-sm font-bold flex-1">Feature Flags</h2>
          </CardHeader>
          <CardBody className="p-0">
            {flags.map((flag) => (
              <div
                key={flag.key}
                className="flex items-center justify-between px-6 py-4 border-b border-default-100 dark:border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <flag.icon
                    className={`w-4 h-4 ${flag.danger ? "text-amber-500" : "text-default-400"}`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{flag.label}</p>
                    <p className="text-xs text-default-500">{flag.desc}</p>
                  </div>
                </div>
                <button
                  className="focus:outline-none"
                  onClick={() => toggleFlag(flag.key)}
                >
                  {config[flag.key] ? (
                    <ToggleRight className="w-8 h-8 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-default-300" />
                  )}
                </button>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Deployment Info */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Rocket className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-bold flex-1">Deployment Info</h2>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-default-500 mb-1">Current Version</p>
                <p className="text-lg font-bold font-mono text-foreground">
                  v{config.currentVersion}
                </p>
              </div>
              <div>
                <p className="text-xs text-default-500 mb-1">Last Deploy</p>
                <p className="text-sm font-mono text-foreground">
                  {new Date(config.lastDeploy).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-default-500 mb-1">Cloud Run Revision</p>
                <p className="text-sm font-mono text-default-500">
                  {config.cloudRunRevision}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* System Announcements */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Bell className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold flex-1">System Announcement</h2>
          </CardHeader>
          <CardBody className="p-6">
            <textarea
              className="w-full p-3 rounded-xl bg-default-100 dark:bg-default-50/10 border border-default-200 dark:border-white/10 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="Write a banner message visible to all users..."
              rows={3}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
            />
            <div className="flex justify-end mt-3">
              <button
                className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                disabled={saving}
                onClick={() => executeAction("set-announcement")}
              >
                {saving ? "Publishing..." : "Publish"}
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
          <CardHeader className="flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10">
            <Shield className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-bold flex-1">Quick Actions</h2>
            <Info className="w-4 h-4 text-default-400" />
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((qa) => (
                <button
                  key={qa.action}
                  className="flex items-center gap-3 p-4 rounded-xl border border-default-200 dark:border-white/10 hover:bg-default-50 dark:hover:bg-white/5 transition-colors text-left"
                  disabled={saving}
                  onClick={() => executeAction(qa.action)}
                >
                  <qa.icon className={`w-5 h-5 ${qa.color}`} />
                  <span className="text-sm font-medium text-foreground">{qa.label}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
