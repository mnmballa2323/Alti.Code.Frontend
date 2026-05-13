"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

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

interface Hunk {
  id: string;
  file: string;
  oldCode: string;
  newCode: string;
  status: "pending" | "approved" | "rejected";
}

interface Session {
  sessionId: string;
  mode: string;
  status: string;
  goal?: string;
  pendingChanges?: Hunk[];
  startedAt?: string;
}

interface CreditStats {
  totalTokens: number;
  estimatedCostUsd: number;
  calls: number;
  inputTokens: number;
  outputTokens: number;
}

export default function AutopilotPage() {
  const [mode, setMode] = useState<"autopilot" | "supervised">("autopilot");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [credits, setCredits] = useState<CreditStats | null>(null);
  const [goal, setGoal] = useState("");
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Load mode + sessions + credits ───────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      const [modeRes, sessRes, credRes] = await Promise.all([
        apiFetch("/autopilot/mode"),
        apiFetch("/autopilot/sessions"),
        apiFetch("/credits"),
      ]);

      setMode(modeRes.mode || "autopilot");
      setSessions(sessRes.sessions || []);
      setCredits(credRes.stats || null);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ─── Poll active session for supervised changes ───────────────────────────
  useEffect(() => {
    if (
      activeSession &&
      mode === "supervised" &&
      activeSession.status === "running"
    ) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await apiFetch(
            `/autopilot/sessions/${activeSession.sessionId}`,
          );

          setActiveSession(res.session);
          // Refresh credits while running
          const credRes = await apiFetch("/credits");

          setCredits(credRes.stats || null);
        } catch {}
      }, 2500);
      setPolling(true);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
      setPolling(false);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeSession?.sessionId, activeSession?.status, mode]);

  // ─── Launch session ────────────────────────────────────────────────────────
  const launchSession = async () => {
    if (!goal.trim()) return;
    setLaunching(true);
    setError(null);
    try {
      const res = await apiFetch("/autopilot/sessions", {
        method: "POST",
        body: JSON.stringify({ goal: goal.trim(), mode }),
      });

      setActiveSession(res.session);
      setGoal("");
      await loadAll();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLaunching(false);
    }
  };

  // ─── Hunk approval ────────────────────────────────────────────────────────
  const approveHunk = async (hunkId: string | "all") => {
    if (!activeSession) return;
    try {
      await apiFetch(`/autopilot/sessions/${activeSession.sessionId}/approve`, {
        method: "POST",
        body: JSON.stringify({ hunkIds: hunkId === "all" ? "all" : [hunkId] }),
      });
      const res = await apiFetch(
        `/autopilot/sessions/${activeSession.sessionId}`,
      );

      setActiveSession(res.session);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const rejectHunk = async (hunkId: string) => {
    if (!activeSession) return;
    try {
      await apiFetch(`/autopilot/sessions/${activeSession.sessionId}/reject`, {
        method: "POST",
        body: JSON.stringify({ hunkIds: [hunkId] }),
      });
      const res = await apiFetch(
        `/autopilot/sessions/${activeSession.sessionId}`,
      );

      setActiveSession(res.session);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const interruptSession = async () => {
    if (!activeSession) return;
    try {
      await apiFetch(
        `/autopilot/sessions/${activeSession.sessionId}/interrupt`,
        { method: "POST" },
      );
      setActiveSession((prev) =>
        prev ? { ...prev, status: "interrupted" } : null,
      );
    } catch (e: any) {
      setError(e.message);
    }
  };

  const revertSession = async () => {
    if (!activeSession) return;
    if (!confirm("Revert all changes from this session? (runs git stash)"))
      return;
    try {
      await apiFetch(`/autopilot/sessions/${activeSession.sessionId}/revert`, {
        method: "POST",
      });
      setActiveSession((prev) =>
        prev ? { ...prev, status: "reverted" } : null,
      );
    } catch (e: any) {
      setError(e.message);
    }
  };

  const setModeAPI = async (m: "autopilot" | "supervised") => {
    try {
      await apiFetch("/autopilot/mode", {
        method: "POST",
        body: JSON.stringify({ mode: m }),
      });
      setMode(m);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const pendingHunks =
    activeSession?.pendingChanges?.filter((h) => h.status === "pending") || [];

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-500">
            Autopilot
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            AI-driven autonomous & supervised execution
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-xl p-4 mb-4 text-sm flex justify-between">
            {error} <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="col-span-2 space-y-5">
            {/* Mode Toggle */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
              <h2 className="text-slate-200 font-semibold mb-3">Mode</h2>
              <div className="flex gap-3">
                {(["autopilot", "supervised"] as const).map((m) => (
                  <button
                    key={m}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                      mode === m
                        ? m === "autopilot"
                          ? "bg-violet-600 text-white"
                          : "bg-cyan-600 text-white"
                        : "bg-slate-700/50 text-slate-400 hover:text-slate-200"
                    }`}
                    onClick={() => setModeAPI(m)}
                  >
                    {m === "autopilot" ? "🚀 Autopilot" : "🔍 Supervised"}
                  </button>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-2">
                {mode === "autopilot"
                  ? "AI runs fully autonomously end-to-end. Interrupt or revert at any time."
                  : "AI yields a diff for every file change — you approve or reject each hunk."}
              </p>
            </div>

            {/* Launch Goal */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
              <h2 className="text-slate-200 font-semibold mb-3">New Mission</h2>
              <textarea
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-200 p-3 text-sm focus:outline-none focus:border-violet-500 resize-none"
                placeholder="Describe your goal… e.g. 'Implement JWT refresh tokens in the auth service'"
                rows={3}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              <div className="flex gap-2 mt-3">
                <button
                  className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all"
                  disabled={launching || !goal.trim()}
                  onClick={launchSession}
                >
                  {launching
                    ? "Launching…"
                    : `🚀 Launch ${mode === "supervised" ? "Supervised" : "Autopilot"} Mission`}
                </button>
              </div>
            </div>

            {/* Active Session — Supervised Diff View */}
            {activeSession && (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-slate-200 font-semibold">
                      Active Session
                    </h2>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {activeSession.sessionId} ·{" "}
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          activeSession.status === "running"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : activeSession.status === "done"
                              ? "bg-cyan-500/20 text-cyan-400"
                              : "bg-slate-600/40 text-slate-400"
                        }`}
                      >
                        {activeSession.status}
                      </span>
                      {polling && (
                        <span className="ml-2 text-xs text-violet-400 animate-pulse">
                          ● polling
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {activeSession.status === "running" && (
                      <button
                        className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 text-xs font-medium rounded-lg transition-all"
                        onClick={interruptSession}
                      >
                        ⏹ Stop
                      </button>
                    )}
                    <button
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 text-xs font-medium rounded-lg transition-all"
                      onClick={revertSession}
                    >
                      ↩ Revert All
                    </button>
                  </div>
                </div>

                {/* Supervised: Diff Hunks */}
                {mode === "supervised" && pendingHunks.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-slate-300 text-sm font-medium">
                        {pendingHunks.length} hunk(s) awaiting review
                      </p>
                      <button
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-all"
                        onClick={() => approveHunk("all")}
                      >
                        ✅ Approve All
                      </button>
                    </div>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {pendingHunks.map((hunk) => (
                        <div
                          key={hunk.id}
                          className="rounded-xl overflow-hidden border border-slate-700/50"
                        >
                          <div className="bg-slate-700/40 px-3 py-2 flex items-center justify-between">
                            <span className="text-slate-300 text-xs font-mono">
                              {hunk.file}
                            </span>
                            <div className="flex gap-2">
                              <button
                                className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/60 text-emerald-400 text-xs rounded-md"
                                onClick={() => approveHunk(hunk.id)}
                              >
                                ✅ Apply
                              </button>
                              <button
                                className="px-2 py-1 bg-red-600/30 hover:bg-red-600/60 text-red-400 text-xs rounded-md"
                                onClick={() => rejectHunk(hunk.id)}
                              >
                                ❌ Skip
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 text-xs font-mono">
                            <div className="bg-red-950/30 p-3 overflow-x-auto border-r border-slate-700/30">
                              <div className="text-red-400 mb-1 text-[10px] font-sans">
                                BEFORE
                              </div>
                              <pre className="text-red-300 whitespace-pre-wrap">
                                {hunk.oldCode || "(new file)"}
                              </pre>
                            </div>
                            <div className="bg-emerald-950/30 p-3 overflow-x-auto">
                              <div className="text-emerald-400 mb-1 text-[10px] font-sans">
                                AFTER
                              </div>
                              <pre className="text-emerald-300 whitespace-pre-wrap">
                                {hunk.newCode}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {mode === "supervised" &&
                  pendingHunks.length === 0 &&
                  activeSession.status !== "running" && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      {activeSession.status === "done"
                        ? "✅ All changes applied."
                        : "No pending changes."}
                    </div>
                  )}

                {mode === "autopilot" && (
                  <div className="text-slate-400 text-sm">
                    Running autonomously…{" "}
                    <span className="text-violet-400">
                      Use Stop or Revert to intervene.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Previous Sessions */}
            {sessions.length > 0 && (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
                <h2 className="text-slate-200 font-semibold mb-3">
                  Session History
                </h2>
                <div className="space-y-2">
                  {sessions.slice(0, 5).map((s) => (
                    <div
                      key={s.sessionId}
                      className="flex items-center justify-between bg-slate-900/40 rounded-xl p-3"
                    >
                      <div>
                        <p className="text-slate-300 text-sm font-mono truncate max-w-xs">
                          {s.sessionId}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {s.mode} ·{" "}
                          {s.startedAt
                            ? new Date(s.startedAt).toLocaleTimeString()
                            : ""}
                        </p>
                      </div>
                      <button
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-all"
                        onClick={() => setActiveSession(s)}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Credits */}
          <div className="space-y-4">
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
              <h2 className="text-slate-200 font-semibold mb-4">
                💰 Token Credits
              </h2>
              {credits ? (
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-violet-900/30 to-cyan-900/30 border border-violet-500/20 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-white">
                      {credits.totalTokens.toLocaleString()}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Total Tokens Used
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/40 rounded-xl p-3">
                      <p className="text-blue-400 font-semibold text-lg">
                        {credits.inputTokens.toLocaleString()}
                      </p>
                      <p className="text-slate-500 text-xs">Input</p>
                    </div>
                    <div className="bg-slate-900/40 rounded-xl p-3">
                      <p className="text-cyan-400 font-semibold text-lg">
                        {credits.outputTokens.toLocaleString()}
                      </p>
                      <p className="text-slate-500 text-xs">Output</p>
                    </div>
                  </div>
                  <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-3 text-center">
                    <p className="text-amber-400 font-bold text-xl">
                      ${credits.estimatedCostUsd.toFixed(4)}
                    </p>
                    <p className="text-slate-500 text-xs">
                      Estimated Cost (USD)
                    </p>
                  </div>
                  <div className="bg-slate-900/40 rounded-xl p-3 text-center">
                    <p className="text-emerald-400 font-semibold">
                      {credits.calls.toLocaleString()}
                    </p>
                    <p className="text-slate-500 text-xs">API Calls</p>
                  </div>
                  <button
                    className="w-full py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs rounded-xl transition-all"
                    onClick={loadAll}
                  >
                    ↻ Refresh Stats
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <div className="animate-spin h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-2" />
                  Loading…
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5">
              <h2 className="text-slate-200 font-semibold mb-3 text-sm">
                Quick Links
              </h2>
              <div className="space-y-2">
                {[
                  { label: "📋 Specs", href: "/specs" },
                  { label: "🪝 Hooks", href: "/hooks" },
                  { label: "🧭 Steering", href: "/steering" },
                  { label: "⚡ Powers", href: "/powers" },
                ].map(({ label, href }) => (
                  <a
                    key={href}
                    className="block py-2 px-3 bg-slate-900/40 hover:bg-slate-700/40 text-slate-300 hover:text-white text-sm rounded-xl transition-all"
                    href={href}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
