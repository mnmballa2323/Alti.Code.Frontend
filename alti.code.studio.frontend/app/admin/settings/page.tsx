"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Building2,
  Shield,
  Bot,
  AlertTriangle,
  Save,
  Trash2,
  Download,
  Globe,
  Clock,
  Key,
  Lock,
  Cpu,
  Gauge,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { API_URL } from "@/lib/config";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface OrgSettings {
  name: string;
  domain: string;
  industry: string;
  timezone: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  ipAllowlist: string;
  enforceSSO: boolean;
}

interface AISettings {
  defaultModel: string;
  guardrailsEnabled: boolean;
  codeExecutionEnabled: boolean;
  maxTokenBudget: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Government",
  "Other",
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
];

const SESSION_TIMEOUTS = [
  { value: "15m", label: "15 minutes" },
  { value: "30m", label: "30 minutes" },
  { value: "1h", label: "1 hour" },
  { value: "4h", label: "4 hours" },
  { value: "8h", label: "8 hours" },
];

const AI_MODELS = [
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
];

/* ------------------------------------------------------------------ */
/*  Helper: Toggle Switch                                              */
/* ------------------------------------------------------------------ */

function Toggle({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full group"
    >
      <span className="text-sm text-default-700">{label}</span>
      {enabled ? (
        <ToggleRight className="h-6 w-6 text-primary" />
      ) : (
        <ToggleLeft className="h-6 w-6 text-default-400 group-hover:text-default-500 transition-colors" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  /* Form state */
  const [org, setOrg] = useState<OrgSettings>({
    name: "Alti Code Studio",
    domain: "alticode.dev",
    industry: "Technology",
    timezone: "America/New_York",
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    sessionTimeout: "1h",
    ipAllowlist: "",
    enforceSSO: false,
  });

  const [ai, setAI] = useState<AISettings>({
    defaultModel: "gemini-2.5-pro",
    guardrailsEnabled: true,
    codeExecutionEnabled: true,
    maxTokenBudget: 32000,
  });

  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken") ||
              localStorage.getItem("token")
            : null;

        const res = await fetch(`${API_URL}/admin/settings`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        if (json.success && json.data) {
          if (json.data.org) setOrg(json.data.org);
          if (json.data.security) setSecurity(json.data.security);
          if (json.data.ai) setAI(json.data.ai);
        }
      } catch {
        // API unavailable — keep defaults
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  /* ---- Save handler ---- */
  const handleSave = async (section: string, payload: Record<string, any>) => {
    setSaving(section);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") ||
            localStorage.getItem("token")
          : null;

      await fetch(`${API_URL}/admin/settings/${section}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    } catch {
      // silent fallback
    } finally {
      setSaving(null);
    }
  };

  /* ---- Shared styles ---- */
  const inputCls =
    "w-full rounded-lg border border-default-300 bg-default-100 px-3 py-2 text-sm text-foreground placeholder:text-default-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors";
  const selectCls = `${inputCls} appearance-none cursor-pointer`;
  const saveBtnCls =
    "flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50";

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* ================================================================ */}
      {/*  Organization Settings                                           */}
      {/* ================================================================ */}
      <Card className="border border-default-200 bg-default-50/50">
        <CardHeader className="flex items-center gap-2 px-4 py-3">
          <Building2 className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-semibold">Organization Settings</span>
        </CardHeader>
        <CardBody className="px-4 pb-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-default-500 mb-1">
                Organization Name
              </label>
              <input
                className={inputCls}
                value={org.name}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
                placeholder="My Organization"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-default-500 mb-1">
                Domain
              </label>
              <input
                className={inputCls}
                value={org.domain}
                onChange={(e) => setOrg({ ...org, domain: e.target.value })}
                placeholder="example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-default-500 mb-1">
                Industry
              </label>
              <select
                className={selectCls}
                value={org.industry}
                onChange={(e) => setOrg({ ...org, industry: e.target.value })}
              >
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-default-500 mb-1">
                Time Zone
              </label>
              <select
                className={selectCls}
                value={org.timezone}
                onChange={(e) => setOrg({ ...org, timezone: e.target.value })}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className={saveBtnCls}
              disabled={saving === "org"}
              onClick={() => handleSave("org", org)}
            >
              <Save className="h-4 w-4" />
              {saving === "org" ? "Saving…" : "Save"}
            </button>
          </div>
        </CardBody>
      </Card>

      {/* ================================================================ */}
      {/*  Security Settings                                               */}
      {/* ================================================================ */}
      <Card className="border border-default-200 bg-default-50/50">
        <CardHeader className="flex items-center gap-2 px-4 py-3">
          <Shield className="h-5 w-5 text-red-500" />
          <span className="text-sm font-semibold">Security Settings</span>
        </CardHeader>
        <CardBody className="px-4 pb-5 space-y-4">
          <Toggle
            label="Two-Factor Authentication"
            enabled={security.twoFactorEnabled}
            onToggle={() =>
              setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })
            }
          />

          <div>
            <label className="block text-xs font-medium text-default-500 mb-1">
              Session Timeout
            </label>
            <select
              className={selectCls}
              value={security.sessionTimeout}
              onChange={(e) =>
                setSecurity({ ...security, sessionTimeout: e.target.value })
              }
            >
              {SESSION_TIMEOUTS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-default-500 mb-1">
              IP Allowlist
            </label>
            <textarea
              className={`${inputCls} min-h-[80px] resize-y`}
              value={security.ipAllowlist}
              onChange={(e) =>
                setSecurity({ ...security, ipAllowlist: e.target.value })
              }
              placeholder="Enter one IP or CIDR per line…"
              rows={3}
            />
          </div>

          <Toggle
            label="Enforce SSO"
            enabled={security.enforceSSO}
            onToggle={() =>
              setSecurity({ ...security, enforceSSO: !security.enforceSSO })
            }
          />

          <div className="flex justify-end">
            <button
              className={saveBtnCls}
              disabled={saving === "security"}
              onClick={() => handleSave("security", security)}
            >
              <Save className="h-4 w-4" />
              {saving === "security" ? "Saving…" : "Save"}
            </button>
          </div>
        </CardBody>
      </Card>

      {/* ================================================================ */}
      {/*  AI Configuration                                                */}
      {/* ================================================================ */}
      <Card className="border border-default-200 bg-default-50/50">
        <CardHeader className="flex items-center gap-2 px-4 py-3">
          <Bot className="h-5 w-5 text-purple-500" />
          <span className="text-sm font-semibold">AI Configuration</span>
        </CardHeader>
        <CardBody className="px-4 pb-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-default-500 mb-1">
              Default Model
            </label>
            <select
              className={selectCls}
              value={ai.defaultModel}
              onChange={(e) => setAI({ ...ai, defaultModel: e.target.value })}
            >
              {AI_MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <Toggle
            label="AI Guardrails"
            enabled={ai.guardrailsEnabled}
            onToggle={() =>
              setAI({ ...ai, guardrailsEnabled: !ai.guardrailsEnabled })
            }
          />

          <Toggle
            label="Code Execution"
            enabled={ai.codeExecutionEnabled}
            onToggle={() =>
              setAI({ ...ai, codeExecutionEnabled: !ai.codeExecutionEnabled })
            }
          />

          <div>
            <label className="block text-xs font-medium text-default-500 mb-1">
              Max Token Budget Per Request
            </label>
            <input
              type="number"
              className={inputCls}
              value={ai.maxTokenBudget}
              onChange={(e) =>
                setAI({ ...ai, maxTokenBudget: parseInt(e.target.value, 10) || 0 })
              }
              min={1000}
              max={1000000}
              step={1000}
            />
          </div>

          <div className="flex justify-end">
            <button
              className={saveBtnCls}
              disabled={saving === "ai"}
              onClick={() => handleSave("ai", ai)}
            >
              <Save className="h-4 w-4" />
              {saving === "ai" ? "Saving…" : "Save"}
            </button>
          </div>
        </CardBody>
      </Card>

      {/* ================================================================ */}
      {/*  Danger Zone                                                     */}
      {/* ================================================================ */}
      <Card className="border-2 border-red-500/40 bg-red-500/5">
        <CardHeader className="flex items-center gap-2 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-sm font-semibold text-red-500">Danger Zone</span>
        </CardHeader>
        <CardBody className="px-4 pb-5 space-y-5">
          {/* Export Data */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-default-700">Export All Data</p>
              <p className="text-xs text-default-500">
                Download a full export of your organization data as JSON.
              </p>
            </div>
            <button className="flex items-center gap-1.5 rounded-lg border border-default-300 bg-default-100 px-4 py-2 text-sm font-medium text-default-700 hover:bg-default-200 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <hr className="border-red-500/20" />

          {/* Delete Organization */}
          <div>
            <p className="text-sm font-medium text-red-600">Delete Organization</p>
            <p className="text-xs text-default-500 mb-3">
              This action is irreversible. All data, members, agents, and billing
              history will be permanently deleted.
            </p>
            <div className="flex items-center gap-3">
              <input
                className={`${inputCls} flex-1 border-red-500/30 focus:border-red-500 focus:ring-red-500`}
                placeholder='Type "DELETE" to confirm'
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
              <button
                disabled={deleteConfirm !== "DELETE"}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
