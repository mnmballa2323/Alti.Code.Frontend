"use client";

import React, { useState } from "react";
import {
  Key,
  Plus,
  Copy,
  Ban,
  Check,
  Eye,
  EyeOff,
  Activity,
  Gauge,
} from "lucide-react";

import { API_URL } from "@/lib/config";

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  fullKey: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string | null;
  status: "active" | "revoked";
}

const mockApiKeys: ApiKey[] = [
  {
    id: "key_01",
    name: "Production API",
    keyPreview: "alti_****...a8f2",
    fullKey: "alti_sk_prod_7g3k9m2x5n8q1w4e6r0t_a8f2",
    scopes: ["read", "write"],
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    lastUsed: new Date(Date.now() - 120000).toISOString(),
    status: "active",
  },
  {
    id: "key_02",
    name: "CI/CD Pipeline",
    keyPreview: "alti_****...b3c1",
    fullKey: "alti_sk_cicd_4f8h2j6l0n3p5r7t9v1x_b3c1",
    scopes: ["read"],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    lastUsed: new Date(Date.now() - 3600000).toISOString(),
    status: "active",
  },
  {
    id: "key_03",
    name: "Staging",
    keyPreview: "alti_****...d4e5",
    fullKey: "alti_sk_stg_9a1c3e5g7i2k4m6o8q0s_d4e5",
    scopes: ["read", "write"],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    lastUsed: new Date(Date.now() - 7200000).toISOString(),
    status: "active",
  },
  {
    id: "key_04",
    name: "Legacy v1",
    keyPreview: "alti_****...f6g7",
    fullKey: "alti_sk_leg_2b4d6f8h0j1l3n5p7r9t_f6g7",
    scopes: ["read"],
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
    lastUsed: new Date(Date.now() - 45 * 86400000).toISOString(),
    status: "revoked",
  },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>(mockApiKeys);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  const handleCopy = async (key: ApiKey) => {
    try {
      await navigator.clipboard.writeText(key.fullKey);
      setCopiedId(key.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      console.error("Failed to copy key");
    }
  };

  const handleRevoke = (id: string) => {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k))
    );
  };

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRelative = (iso: string | null) => {
    if (!iso) return "Never";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0">
      <div className="space-y-4">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#F3F4F6] dark:bg-[#0d1117] -mt-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <Key className="w-4.5 h-4.5 text-neutral-600 dark:text-neutral-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  API Keys
                </h1>
                <p className="text-[11px] text-neutral-400 font-medium">
                  Manage programmatic access to the Alti Code Studio API
                </p>
              </div>
            </div>
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-white text-xs font-semibold rounded-lg shadow-sm transition-colors focus:outline-none cursor-pointer"
              type="button"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate Key
            </button>
          </div>

          {/* Table Header */}
          <div
            className="grid gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-[10px] font-bold text-neutral-450 dark:text-neutral-500 tracking-wider uppercase shadow-sm"
            style={{
              gridTemplateColumns:
                "minmax(0, 1.3fr) minmax(0, 1.8fr) minmax(0, 1fr) 90px 80px 70px 100px",
            }}
          >
            <div>Name</div>
            <div>Key</div>
            <div>Scopes</div>
            <div>Created</div>
            <div>Last Used</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="space-y-3">
          {keys.map((key) => {
            const isRevealed = !!revealedKeys[key.id];
            const isCopied = copiedId === key.id;
            const isRevoked = key.status === "revoked";

            return (
              <div
                key={key.id}
                className={`grid gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-sm shadow-sm transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md ${
                  isRevoked ? "opacity-60" : ""
                }`}
                style={{
                  gridTemplateColumns:
                    "minmax(0, 1.3fr) minmax(0, 1.8fr) minmax(0, 1fr) 90px 80px 70px 100px",
                }}
              >
                {/* Name */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${
                      isRevoked
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : "bg-emerald-50 dark:bg-emerald-950/30"
                    }`}
                  >
                    <Key
                      className={`w-3.5 h-3.5 ${
                        isRevoked
                          ? "text-neutral-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    />
                  </div>
                  <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 truncate">
                    {key.name}
                  </span>
                </div>

                {/* Key (masked/revealed) */}
                <div className="flex items-center gap-2">
                  <code className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 truncate">
                    {isRevealed ? key.fullKey : key.keyPreview}
                  </code>
                  <button
                    className="shrink-0 p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    type="button"
                    onClick={() => toggleReveal(key.id)}
                    title={isRevealed ? "Hide key" : "Reveal key"}
                  >
                    {isRevealed ? (
                      <EyeOff className="w-3.5 h-3.5 text-neutral-400" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </button>
                </div>

                {/* Scopes */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {key.scopes.map((scope) => (
                    <span
                      key={scope}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                        scope === "write"
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                          : "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {scope}
                    </span>
                  ))}
                </div>

                {/* Created */}
                <div className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                  {formatDate(key.createdAt)}
                </div>

                {/* Last Used */}
                <div className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                  {formatRelative(key.lastUsed)}
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isRevoked
                        ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isRevoked ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                    />
                    {isRevoked ? "Revoked" : "Active"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 transition-all shadow-sm cursor-pointer"
                    type="button"
                    onClick={() => handleCopy(key)}
                    title="Copy key"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Copied
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy
                      </>
                    )}
                  </button>
                  {!isRevoked && (
                    <button
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-rose-200 dark:border-rose-800/50 bg-white dark:bg-[#161b22] hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-all shadow-sm cursor-pointer"
                      type="button"
                      onClick={() => handleRevoke(key.id)}
                      title="Revoke key"
                    >
                      <Ban className="w-3 h-3" />
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-28">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                API Calls Today
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                2,847
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold">
                requests
              </span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-28">
            <div className="flex items-center gap-2">
              <Gauge className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                Rate Limit Remaining
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-xl font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                97,153
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold">
                / 100,000
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
