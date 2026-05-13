"use client";

import React, { useState, useEffect, useCallback } from "react";

import ChatBotLayout from "@/components/ChatbotLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts?.headers },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));

    throw new Error(err.error || res.statusText);
  }

  return res.json();
}

const CATEGORY_ICONS: Record<string, string> = {
  Design: "🎨",
  DevOps: "🔧",
  Infrastructure: "☁️",
  Database: "🗄️",
  Payments: "💳",
  Testing: "🧪",
  Documentation: "📚",
  Security: "🛡️",
};

interface Power {
  id: string;
  name: string;
  description: string;
  provider: string;
  category: string;
  tags: string[];
  installed: boolean;
}

interface InstalledPower extends Power {
  installedAt: string;
  details?: Power;
}

export default function PowersPage() {
  const [powers, setPowers] = useState<Power[]>([]);
  const [installed, setInstalled] = useState<InstalledPower[]>([]);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState<string | null>(null);
  const [uninstalling, setUninstalling] = useState<string | null>(null);
  const [tab, setTab] = useState<"browse" | "installed">("browse");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadPowers = useCallback(async () => {
    try {
      const [avail, inst] = await Promise.all([
        apiFetch("/powers"),
        apiFetch("/powers/installed"),
      ]);

      setPowers(avail.powers || []);
      setInstalled(inst.powers || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPowers();
  }, [loadPowers]);

  const installPower = async (id: string, name: string) => {
    setInstalling(id);
    setError(null);
    try {
      await apiFetch(`/powers/${id}/install`, { method: "POST" });
      setSuccessMsg(
        `✅ "${name}" installed! Steering files and hooks are ready.`,
      );
      setTimeout(() => setSuccessMsg(null), 4000);
      await loadPowers();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setInstalling(null);
    }
  };

  const uninstallPower = async (id: string, name: string) => {
    if (
      !confirm(
        `Uninstall "${name}"? This will remove its steering files and hooks.`,
      )
    )
      return;
    setUninstalling(id);
    setError(null);
    try {
      await apiFetch(`/powers/${id}/uninstall`, { method: "DELETE" });
      setSuccessMsg(`"${name}" uninstalled.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadPowers();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUninstalling(null);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(powers.map((p) => p.category))),
  ];

  const filteredPowers = powers.filter((p) => {
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.includes(search.toLowerCase()));
    const matchesCat = category === "All" || p.category === category;

    return matchesSearch && matchesCat;
  });

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Powers
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Add specialized tools and context to your AI agents on-demand
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-xl p-4 mb-4 text-sm flex justify-between">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-900/30 border border-emerald-500/40 text-emerald-400 rounded-xl p-4 mb-4 text-sm">
            {successMsg}
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Available Powers", value: powers.length, color: "cyan" },
            { label: "Installed", value: installed.length, color: "emerald" },
            {
              label: "Categories",
              value: categories.length - 1,
              color: "blue",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4"
            >
              <p className={`text-2xl font-bold text-${s.color}-400`}>
                {s.value}
              </p>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {[
            { key: "browse", label: "🔍 Browse" },
            { key: "installed", label: `✅ Installed (${installed.length})` },
          ].map((t) => (
            <button
              key={t.key}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.key ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
              onClick={() => setTab(t.key as typeof tab)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "browse" && (
          <>
            {/* Search + Filter */}
            <div className="flex gap-3 mb-6">
              <input
                className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl text-slate-200 p-3 text-sm focus:outline-none focus:border-cyan-500"
                placeholder="Search powers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex gap-2 flex-wrap">
                {categories.map((c) => (
                  <button
                    key={c}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${category === c ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                    onClick={() => setCategory(c)}
                  >
                    {c !== "All" ? CATEGORY_ICONS[c] : ""} {c}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPowers.map((power) => (
                  <div
                    key={power.id}
                    className={`bg-slate-800/50 border rounded-2xl p-5 transition-all ${power.installed ? "border-cyan-500/40 bg-cyan-900/10" : "border-slate-700/50 hover:border-cyan-500/30"}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {CATEGORY_ICONS[power.category] || "⚡"}
                        </span>
                        <div>
                          <h3 className="text-slate-200 font-semibold">
                            {power.name}
                          </h3>
                          <p className="text-slate-500 text-xs">
                            {power.provider}
                          </p>
                        </div>
                      </div>
                      {power.installed ? (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium">
                          ✅ Installed
                        </span>
                      ) : null}
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      {power.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {power.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-slate-700/60 text-slate-400 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {power.installed ? (
                        <button
                          className="px-4 py-1.5 bg-slate-700 hover:bg-red-900/50 hover:text-red-400 text-slate-400 text-xs font-medium rounded-lg transition-all"
                          disabled={uninstalling === power.id}
                          onClick={() => uninstallPower(power.id, power.name)}
                        >
                          {uninstalling === power.id ? "Removing…" : "Remove"}
                        </button>
                      ) : (
                        <button
                          className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-all"
                          disabled={installing === power.id}
                          onClick={() => installPower(power.id, power.name)}
                        >
                          {installing === power.id
                            ? "Installing…"
                            : "⚡ Install"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "installed" &&
          (installed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-slate-400">
              <span className="text-4xl mb-3">⚡</span>
              <p className="text-lg font-medium text-slate-300">
                No powers installed
              </p>
              <p className="text-sm mt-1">
                Browse available powers to get started
              </p>
              <button
                className="mt-4 px-5 py-2 bg-cyan-600 text-white text-sm font-medium rounded-xl"
                onClick={() => setTab("browse")}
              >
                Browse Powers
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {installed.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-800/50 border border-cyan-500/30 rounded-xl p-5 flex items-center gap-4"
                >
                  <span className="text-2xl">
                    {CATEGORY_ICONS[p.details?.category || ""] || "⚡"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-200 font-semibold">{p.name}</h3>
                    <p className="text-slate-500 text-xs">
                      Installed {new Date(p.installedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="px-4 py-1.5 bg-slate-700 hover:bg-red-900/50 hover:text-red-400 text-slate-400 text-xs font-medium rounded-lg transition-all"
                    disabled={uninstalling === p.id}
                    onClick={() => uninstallPower(p.id, p.name)}
                  >
                    {uninstalling === p.id ? "Removing…" : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          ))}
      </div>
    </ChatBotLayout>
  );
}
