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

const TRIGGER_TYPES = [
  { value: "file-save", label: "📁 File Save" },
  { value: "file-create", label: "➕ File Create" },
  { value: "file-delete", label: "🗑️ File Delete" },
  { value: "prompt-submit", label: "💬 Prompt Submit" },
  { value: "agent-turn-complete", label: "🤖 Agent Turn Complete" },
  { value: "before-tool", label: "⚙️ Before Tool" },
  { value: "after-tool", label: "⚙️ After Tool" },
  { value: "before-spec-task", label: "📋 Before Spec Task" },
  { value: "after-spec-task", label: "📋 After Spec Task" },
  { value: "manual", label: "🖱️ Manual Only" },
];

const ACTION_TYPES = [
  { value: "agent-prompt", label: "🤖 Agent Prompt" },
  { value: "shell-command", label: "💻 Shell Command" },
];

interface Hook {
  id: string;
  name: string;
  trigger: { type: string; filePattern?: string };
  action: { type: string; value: string };
  enabled: boolean;
  createdAt: string;
  lastFiredAt?: string;
  fireCount?: number;
}

export default function HooksPage() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firing, setFiring] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    triggerType: "file-save",
    filePattern: "",
    actionType: "agent-prompt",
    actionValue: "",
  });

  const loadHooks = useCallback(async () => {
    try {
      const data = await apiFetch("/agent-hooks");

      setHooks(data.hooks || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHooks();
  }, [loadHooks]);

  const createHook = async () => {
    if (!form.name.trim() || !form.actionValue.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/agent-hooks", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          trigger: {
            type: form.triggerType,
            filePattern: form.filePattern || undefined,
          },
          action: { type: form.actionType, value: form.actionValue },
          enabled: true,
        }),
      });
      setShowForm(false);
      setForm({
        name: "",
        triggerType: "file-save",
        filePattern: "",
        actionType: "agent-prompt",
        actionValue: "",
      });
      await loadHooks();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleHook = async (hook: Hook) => {
    try {
      await apiFetch(`/agent-hooks/${hook.id}`, {
        method: "PUT",
        body: JSON.stringify({ enabled: !hook.enabled }),
      });
      setHooks((prev) =>
        prev.map((h) => (h.id === hook.id ? { ...h, enabled: !h.enabled } : h)),
      );
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteHook = async (id: string) => {
    try {
      await apiFetch(`/agent-hooks/${id}`, { method: "DELETE" });
      setHooks((prev) => prev.filter((h) => h.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const fireHook = async (id: string) => {
    setFiring(id);
    try {
      await apiFetch(`/agent-hooks/${id}/fire`, { method: "POST" });
      await loadHooks();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setFiring(null);
    }
  };

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
              Agent Hooks
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Automate repetitive tasks with event-driven AI triggers
            </p>
          </div>
          <button
            className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-amber-500/20"
            onClick={() => setShowForm(true)}
          >
            + New Hook
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-xl p-4 mb-4 text-sm flex items-center justify-between">
            {error}
            <button
              className="text-red-300 hover:text-red-100"
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Create Hook Form */}
        {showForm && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <h3 className="text-slate-200 font-semibold mb-5">Create Hook</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">
                  Hook Name
                </label>
                <input
                  className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-200 p-2.5 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Auto generate tests on save"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">
                    Trigger Event
                  </label>
                  <select
                    className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-200 p-2.5 text-sm focus:outline-none focus:border-amber-500"
                    value={form.triggerType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, triggerType: e.target.value }))
                    }
                  >
                    {TRIGGER_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">
                    File Pattern (optional)
                  </label>
                  <input
                    className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-200 p-2.5 text-sm focus:outline-none focus:border-amber-500"
                    placeholder="e.g. *.ts or *.js"
                    value={form.filePattern}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, filePattern: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">
                  Action Type
                </label>
                <div className="flex gap-3">
                  {ACTION_TYPES.map((a) => (
                    <button
                      key={a.value}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.actionType === a.value ? "bg-amber-600 text-white" : "bg-slate-700 text-slate-400 hover:text-slate-200"}`}
                      onClick={() =>
                        setForm((f) => ({ ...f, actionType: a.value }))
                      }
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">
                  {form.actionType === "agent-prompt"
                    ? "Agent Prompt"
                    : "Shell Command"}
                </label>
                <textarea
                  className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-200 p-2.5 text-sm resize-none focus:outline-none focus:border-amber-500 font-mono"
                  placeholder={
                    form.actionType === "agent-prompt"
                      ? "e.g. Review the saved file and generate unit tests for all exported functions."
                      : "e.g. npm run lint"
                  }
                  rows={3}
                  value={form.actionValue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, actionValue: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                className="px-6 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all"
                disabled={
                  saving || !form.name.trim() || !form.actionValue.trim()
                }
                onClick={createHook}
              >
                {saving ? "Creating…" : "Create Hook"}
              </button>
              <button
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-all"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Hooks List */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full" />
          </div>
        ) : hooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-slate-400">
            <span className="text-4xl mb-3">🪝</span>
            <p className="text-lg font-medium text-slate-300">
              No hooks configured
            </p>
            <p className="text-sm mt-1">
              Create a hook to automate repetitive tasks
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {hooks.map((hook) => (
              <div
                key={hook.id}
                className={`bg-slate-800/50 border rounded-xl p-5 transition-all ${hook.enabled ? "border-slate-700/50" : "border-slate-700/30 opacity-60"}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${hook.enabled ? "bg-emerald-400" : "bg-slate-500"}`}
                      />
                      <h3 className="text-slate-200 font-semibold text-sm">
                        {hook.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-mono">
                        ON {hook.trigger.type}
                        {hook.trigger.filePattern
                          ? ` (${hook.trigger.filePattern})`
                          : ""}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-600/40 text-slate-400 rounded text-xs">
                        → {hook.action.type === "agent-prompt" ? "🤖" : "💻"}{" "}
                        {hook.action.type}
                      </span>
                      {hook.fireCount !== undefined && hook.fireCount > 0 && (
                        <span className="text-slate-500 text-xs">
                          Fired {hook.fireCount}× · Last:{" "}
                          {new Date(hook.lastFiredAt!).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-2 font-mono truncate max-w-md">
                      {hook.action.value}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      className="px-3 py-1.5 bg-slate-700 hover:bg-amber-600 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-all"
                      disabled={firing === hook.id}
                      onClick={() => fireHook(hook.id)}
                    >
                      {firing === hook.id ? "…" : "▶ Fire"}
                    </button>
                    <button
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${hook.enabled ? "bg-amber-500" : "bg-slate-600"}`}
                      onClick={() => toggleHook(hook)}
                    >
                      <span
                        className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${hook.enabled ? "translate-x-5" : "translate-x-1"}`}
                      />
                    </button>
                    <button
                      className="px-2 py-1.5 text-slate-500 hover:text-red-400 text-xs rounded-lg transition-all"
                      onClick={() => deleteHook(hook.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
