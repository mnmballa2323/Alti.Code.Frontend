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

const INCLUSION_MODES = [
  {
    value: "always",
    label: "Always",
    description: "Injected into every prompt",
  },
  {
    value: "conditional",
    label: "Conditional",
    description: "When file matches pattern",
  },
  { value: "auto", label: "Auto", description: "AI decides by relevance" },
  { value: "manual", label: "Manual", description: "Only when @-referenced" },
];

const INCLUSION_COLORS: Record<string, string> = {
  always: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  conditional: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  auto: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  manual: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

interface SteeringFile {
  filename: string;
  name: string;
  scope: string;
  inclusion: string;
  filePatterns: string[];
  sizeBytes: number;
  updatedAt: string;
  preview: string;
}

interface SteeringDetail {
  filename: string;
  name: string;
  scope: string;
  inclusion: string;
  content: string;
}

export default function SteeringPage() {
  const [files, setFiles] = useState<SteeringFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SteeringDetail | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    scope: "workspace",
    inclusion: "always",
    filePatterns: "",
    content: "",
  });

  const loadFiles = useCallback(async () => {
    try {
      const data = await apiFetch("/steering");

      setFiles(data.files || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const openEdit = async (filename: string) => {
    const data = await apiFetch(`/steering/${filename}`);

    setEditing(data.file);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await apiFetch(`/steering/${editing.filename}`, {
        method: "PUT",
        body: JSON.stringify({ content: editing.content }),
      });
      setEditing(null);
      await loadFiles();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const createFile = async () => {
    setSaving(true);
    try {
      const patterns = form.filePatterns
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      await apiFetch("/steering", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          content: form.content,
          scope: form.scope,
          inclusion: form.inclusion,
          ...(patterns.length ? { filePatterns: patterns } : {}),
        }),
      });
      setShowForm(false);
      setForm({
        name: "",
        scope: "workspace",
        inclusion: "always",
        filePatterns: "",
        content: "",
      });
      await loadFiles();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteFile = async (filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    await apiFetch(`/steering/${filename}`, { method: "DELETE" });
    setFiles((prev) => prev.filter((f) => f.filename !== filename));
  };

  const initDefaults = async () => {
    setInitializing(true);
    try {
      await apiFetch("/steering/init-defaults", { method: "POST" });
      await loadFiles();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-purple-500">
              Steering Files
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Give the AI persistent knowledge about your workspace
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-xl transition-all"
              disabled={initializing}
              onClick={initDefaults}
            >
              {initializing ? "…" : "⚡ Init Defaults"}
            </button>
            <button
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all"
              onClick={() => setShowForm(true)}
            >
              + New File
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-xl p-4 mb-4 text-sm flex justify-between">
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Legend */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {INCLUSION_MODES.map((m) => (
            <div
              key={m.value}
              className={`rounded-xl p-3 border ${INCLUSION_COLORS[m.value]}`}
            >
              <p className="text-xs font-semibold">{m.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{m.description}</p>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b border-slate-700">
                <h3 className="text-slate-200 font-semibold">{editing.name}</h3>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg"
                    disabled={saving}
                    onClick={saveEdit}
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    className="px-4 py-1.5 bg-slate-700 text-slate-300 text-sm rounded-lg"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <textarea
                className="flex-1 bg-slate-950 text-slate-200 p-5 font-mono text-sm resize-none focus:outline-none rounded-b-2xl"
                value={editing.content}
                onChange={(e) =>
                  setEditing((p) =>
                    p ? { ...p, content: e.target.value } : null,
                  )
                }
              />
            </div>
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-6">
            <h3 className="text-slate-200 font-semibold mb-4">
              New Steering File
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                className="bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-200 p-2.5 text-sm focus:outline-none focus:border-violet-500"
                placeholder="Name (e.g. code-standards)"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
              <input
                className="bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-200 p-2.5 text-sm focus:outline-none focus:border-violet-500"
                placeholder="File patterns (*.ts, *.tsx) — for conditional"
                value={form.filePatterns}
                onChange={(e) =>
                  setForm((f) => ({ ...f, filePatterns: e.target.value }))
                }
              />
              <select
                className="bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-200 p-2.5 text-sm focus:outline-none focus:border-violet-500"
                value={form.inclusion}
                onChange={(e) =>
                  setForm((f) => ({ ...f, inclusion: e.target.value }))
                }
              >
                {INCLUSION_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                {["workspace", "global"].map((s) => (
                  <button
                    key={s}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${form.scope === s ? "bg-violet-600 text-white" : "bg-slate-700 text-slate-400"}`}
                    onClick={() => setForm((f) => ({ ...f, scope: s }))}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-200 p-3 text-sm font-mono resize-none focus:outline-none focus:border-violet-500 mb-4"
              placeholder="# Steering content (Markdown)..."
              rows={6}
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
            />
            <div className="flex gap-3">
              <button
                className="px-6 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
                disabled={saving || !form.name.trim() || !form.content.trim()}
                onClick={createFile}
              >
                {saving ? "Creating…" : "Create"}
              </button>
              <button
                className="px-6 py-2 bg-slate-700 text-slate-300 text-sm font-medium rounded-lg"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-slate-400">
            <span className="text-4xl mb-3">🧭</span>
            <p className="text-lg font-medium text-slate-300">
              No steering files
            </p>
            <p className="text-sm mt-1">
              Click "Init Defaults" for sensible defaults
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.filename}
                className="bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/40 rounded-xl p-5 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-slate-200 font-semibold">
                        {file.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium border ${INCLUSION_COLORS[file.inclusion] || ""}`}
                      >
                        {file.inclusion}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
                        {file.scope}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs font-mono line-clamp-2">
                      {file.preview}
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      {(file.sizeBytes / 1024).toFixed(1)} KB · Updated{" "}
                      {new Date(file.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      className="px-3 py-1.5 bg-slate-700 hover:bg-violet-600 text-slate-300 hover:text-white text-xs font-medium rounded-lg transition-all"
                      onClick={() => openEdit(file.filename)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="px-2 py-1.5 text-slate-500 hover:text-red-400 text-xs"
                      onClick={() => deleteFile(file.filename)}
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
