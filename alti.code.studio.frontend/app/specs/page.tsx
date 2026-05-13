"use client";

import React, { useState, useEffect, useCallback } from "react";

import ChatBotLayout from "@/components/ChatbotLayout";

// ─── Types ────────────────────────────────────────────────────────────────────

type SpecPhaseStatus = "pending" | "done" | "in-progress" | "failed";

interface SpecMeta {
  specId: string;
  title: string;
  type: "feature" | "bugfix" | "unknown";
  phases: {
    requirements?: SpecPhaseStatus;
    design?: SpecPhaseStatus;
    tasks?: SpecPhaseStatus;
    bugfix?: SpecPhaseStatus;
  };
  createdAt: string;
}

interface SpecDetail extends SpecMeta {
  requirements?: string;
  design?: string;
  tasks?: string;
  bugfix?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

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

// ─── Phase Badge ──────────────────────────────────────────────────────────────

const phaseBadge = (status?: SpecPhaseStatus) => {
  const map = {
    done: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    "in-progress":
      "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    failed: "bg-red-500/20 text-red-400 border border-red-500/30",
    pending: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
  };
  const label = {
    done: "✅ Done",
    "in-progress": "🔄 Running",
    failed: "❌ Failed",
    pending: "⬜ Pending",
  };
  const cls = map[status || "pending"];

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono ${cls}`}>
      {label[status || "pending"]}
    </span>
  );
};

// ─── Task Checklist (from tasks.md) ───────────────────────────────────────────

function TaskChecklist({
  specId,
  content,
  onRefresh,
}: {
  specId: string;
  content: string;
  onRefresh: () => void;
}) {
  const [running, setRunning] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tasks = content
    .split(/^## Task \d+:/m)
    .filter(Boolean)
    .map((block, i) => {
      const titleMatch = block.match(/^\s*(.+)/);
      const statusMatch = block.match(/\*\*Status\*\*:\s*(.+)/);

      return {
        index: i,
        title: titleMatch?.[1]?.trim() || `Task ${i + 1}`,
        status: statusMatch?.[1]?.trim() || "pending",
        body: block.trim(),
      };
    });

  const executeTask = async (idx: number) => {
    setRunning(idx);
    setError(null);
    try {
      await apiFetch(`/specs/${specId}/tasks/${idx}/execute`, {
        method: "POST",
      });
      onRefresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(null);
    }
  };

  if (tasks.length === 0) {
    return (
      <p className="text-slate-400 text-sm">
        No tasks parsed. Ensure tasks.md is properly formatted.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}
      {tasks.map((task) => (
        <div
          key={task.index}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex items-start gap-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-slate-200 font-medium text-sm">
                Task {task.index + 1}: {task.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-mono ${
                  task.status.includes("done") || task.status.includes("✅")
                    ? "bg-emerald-500/20 text-emerald-400"
                    : task.status.includes("in-progress") ||
                        task.status.includes("🔄")
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-slate-600/30 text-slate-400"
                }`}
              >
                {task.status}
              </span>
            </div>
          </div>
          <button
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-all"
            disabled={running === task.index}
            onClick={() => executeTask(task.index)}
          >
            {running === task.index ? "Running…" : "▶ Run"}
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Spec Detail View ─────────────────────────────────────────────────────────

function SpecDetailView({
  spec,
  onBack,
  onRefresh,
}: {
  spec: SpecDetail;
  onBack: () => void;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<"requirements" | "design" | "tasks">(
    "requirements",
  );
  const [generating, setGenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (phase: "design" | "tasks") => {
    setGenerating(phase);
    setError(null);
    try {
      await apiFetch(`/specs/${spec.specId}/${phase}`, { method: "POST" });
      onRefresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(null);
    }
  };

  const tabs = [
    {
      key: "requirements" as const,
      label: "📋 Requirements",
      status: spec.phases.requirements,
    },
    { key: "design" as const, label: "🏗️ Design", status: spec.phases.design },
    { key: "tasks" as const, label: "✅ Tasks", status: spec.phases.tasks },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          className="text-slate-400 hover:text-slate-200 transition-colors"
          onClick={onBack}
        >
          ← Back
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-100">{spec.title}</h2>
          <p className="text-slate-400 text-sm font-mono mt-0.5">
            {spec.specId}
          </p>
        </div>
        <span
          className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${spec.type === "bugfix" ? "bg-red-500/20 text-red-400" : "bg-indigo-500/20 text-indigo-400"}`}
        >
          {spec.type}
        </span>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-lg p-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Phase Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700/50 pb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
            onClick={() => setTab(t.key as typeof tab)}
          >
            {t.label}
            {phaseBadge(t.status)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {tab === "requirements" &&
          (spec.requirements ? (
            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {spec.requirements}
            </pre>
          ) : (
            <div className="text-slate-400 text-sm">
              No requirements generated yet.
            </div>
          ))}

        {tab === "design" &&
          (spec.design ? (
            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
              {spec.design}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-4">
              <p className="text-slate-400">Design not generated yet.</p>
              <button
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-all"
                disabled={!!generating}
                onClick={() => generate("design")}
              >
                {generating === "design"
                  ? "🔄 Generating…"
                  : "🏗️ Generate Design"}
              </button>
            </div>
          ))}

        {tab === "tasks" &&
          (spec.tasks ? (
            <TaskChecklist
              content={spec.tasks}
              specId={spec.specId}
              onRefresh={onRefresh}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-4">
              <p className="text-slate-400">
                Tasks not generated yet.{" "}
                {!spec.design && "(Generate design first)"}
              </p>
              <button
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-all"
                disabled={!!generating || !spec.design}
                onClick={() => generate("tasks")}
              >
                {generating === "tasks"
                  ? "🔄 Generating…"
                  : "✅ Generate Tasks"}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SpecsPage() {
  const [specs, setSpecs] = useState<SpecMeta[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<SpecDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newRequest, setNewRequest] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"feature" | "bugfix">("feature");
  const [bugDetails, setBugDetails] = useState({
    currentBehavior: "",
    expectedBehavior: "",
    stepsToReproduce: "",
  });

  const loadSpecs = useCallback(async () => {
    try {
      const data = await apiFetch("/specs");

      setSpecs(data.specs || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpecs();
  }, [loadSpecs]);

  const openSpec = async (specId: string) => {
    try {
      const data = await apiFetch(`/specs/${specId}`);

      setSelectedSpec(data.spec);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const refreshCurrentSpec = async () => {
    if (!selectedSpec) return;
    const data = await apiFetch(`/specs/${selectedSpec.specId}`);

    setSelectedSpec(data.spec);
    await loadSpecs();
  };

  const createSpec = async () => {
    if (!newRequest.trim()) return;
    setCreating(true);
    setError(null);
    try {
      if (mode === "feature") {
        const data = await apiFetch("/specs", {
          method: "POST",
          body: JSON.stringify({ request: newRequest }),
        });

        setShowNewForm(false);
        setNewRequest("");
        await loadSpecs();
        openSpec(data.specId);
      } else {
        const data = await apiFetch("/specs/bugfix/create", {
          method: "POST",
          body: JSON.stringify({ bugDescription: newRequest, ...bugDetails }),
        });

        setShowNewForm(false);
        setNewRequest("");
        await loadSpecs();
        openSpec(data.specId);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-6xl h-full flex flex-col">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              SpecKit
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Spec-driven development · Requirements → Design → Tasks
            </p>
          </div>
          {!selectedSpec && (
            <button
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              onClick={() => setShowNewForm(true)}
            >
              + New Spec
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-xl p-4 mb-4 text-sm">
            {error}
            <button
              className="ml-4 text-red-300 hover:text-red-100"
              onClick={() => setError(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* New Spec Form */}
        {showNewForm && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 mb-6 backdrop-blur-sm">
            <h3 className="text-slate-200 font-semibold mb-4">
              New Specification
            </h3>
            <div className="flex gap-3 mb-4">
              {["feature", "bugfix"].map((m) => (
                <button
                  key={m}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === m ? "bg-indigo-600 text-white" : "bg-slate-700 text-slate-400 hover:text-slate-200"}`}
                  onClick={() => setMode(m as typeof mode)}
                >
                  {m === "feature" ? "✨ Feature" : "🐛 Bug Fix"}
                </button>
              ))}
            </div>
            <textarea
              className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-200 p-3 text-sm resize-none focus:outline-none focus:border-indigo-500 mb-3"
              placeholder={
                mode === "feature"
                  ? "Describe the feature you want to build…"
                  : "Describe the bug…"
              }
              rows={3}
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
            />
            {mode === "bugfix" && (
              <div className="space-y-2 mb-3">
                {[
                  { key: "currentBehavior", label: "Current Behavior" },
                  { key: "expectedBehavior", label: "Expected Behavior" },
                  { key: "stepsToReproduce", label: "Steps to Reproduce" },
                ].map((f) => (
                  <input
                    key={f.key}
                    className="w-full bg-slate-900/60 border border-slate-600/50 rounded-xl text-slate-200 p-2.5 text-sm focus:outline-none focus:border-indigo-500"
                    placeholder={f.label}
                    value={bugDetails[f.key as keyof typeof bugDetails]}
                    onChange={(e) =>
                      setBugDetails((prev) => ({
                        ...prev,
                        [f.key]: e.target.value,
                      }))
                    }
                  />
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <button
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all"
                disabled={creating || !newRequest.trim()}
                onClick={createSpec}
              >
                {creating ? "Creating…" : "Create Spec"}
              </button>
              <button
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-lg transition-all"
                onClick={() => {
                  setShowNewForm(false);
                  setNewRequest("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Detail View */}
        {selectedSpec ? (
          <div className="flex-1 bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 overflow-auto backdrop-blur-sm">
            <SpecDetailView
              spec={selectedSpec}
              onBack={() => setSelectedSpec(null)}
              onRefresh={refreshCurrentSpec}
            />
          </div>
        ) : (
          /* Spec List */
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
              </div>
            ) : specs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-slate-400">
                <span className="text-4xl mb-3">📋</span>
                <p className="text-lg font-medium text-slate-300">
                  No specs yet
                </p>
                <p className="text-sm mt-1">
                  Create your first spec to get started
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {specs.map((spec) => (
                  <div
                    key={spec.specId}
                    className="bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/40 rounded-xl p-5 cursor-pointer transition-all group hover:bg-slate-800"
                    onClick={() => openSpec(spec.specId)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${spec.type === "bugfix" ? "bg-red-500/20 text-red-400" : "bg-indigo-500/20 text-indigo-400"}`}
                          >
                            {spec.type === "bugfix"
                              ? "🐛 Bug Fix"
                              : "✨ Feature"}
                          </span>
                          <span className="text-slate-500 text-xs font-mono">
                            {spec.specId.slice(-12)}
                          </span>
                        </div>
                        <h3 className="text-slate-200 font-semibold group-hover:text-white transition-colors truncate">
                          {spec.title}
                        </h3>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(spec.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {spec.type === "bugfix" ? (
                          phaseBadge(spec.phases.bugfix)
                        ) : (
                          <>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>Req</span>
                              {phaseBadge(spec.phases.requirements)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>Des</span>
                              {phaseBadge(spec.phases.design)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>Tasks</span>
                              {phaseBadge(spec.phases.tasks)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
