"use client";

import React, { useState, useRef } from "react";

import ChatBotLayout from "@/components/ChatbotLayout";

// ─── System Cards ─────────────────────────────────────────────────────────────

const V6_SYSTEMS = [
  {
    id: "sprint",
    name: "Zero-Human Sprint",
    icon: "🏃",
    tagline: "Fully autonomous plan → implement → deploy",
    color: "from-violet-700/20 to-purple-700/20",
    border: "border-violet-500/30",
    accent: "text-violet-400",
    badge: "bg-violet-500/20 text-violet-300",
    apiEndpoint: "/api/v1/sprint/launch",
    capabilities: [
      "Goal → structured plan",
      "Guardian safety check",
      "Auto-branch creation",
      "Multi-step execution",
      "Code review gate",
      "Auto-commit & push",
    ],
    keyMethod: "POST /api/v1/sprint/launch",
    placeholder: "Add dark mode toggle to Settings page",
  },
  {
    id: "multi-repo",
    name: "Multi-Repo Orchestration",
    icon: "🔗",
    tagline: "Atomic changes across all repositories",
    color: "from-cyan-700/20 to-teal-700/20",
    border: "border-cyan-500/30",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/20 text-cyan-300",
    apiEndpoint: "/api/v1/multi-repo/run",
    capabilities: [
      "Parallel repo scanning",
      "LLM relevance detection",
      "Cross-repo change plan",
      "Atomic execution (all-or-nothing)",
      "Auto-rollback on failure",
      "Same-branch strategy",
    ],
    keyMethod: "POST /api/v1/multi-repo/run",
    placeholder: "Add JWT auth to backend and update all frontend API calls",
  },
  {
    id: "vision-ui",
    name: "Vision-to-UI",
    icon: "👁️",
    tagline: "Screenshot → production component code",
    color: "from-amber-700/20 to-orange-700/20",
    border: "border-amber-500/30",
    accent: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300",
    apiEndpoint: null,
    capabilities: [
      "Gemini Vision multimodal analysis",
      "NDVI / layout extraction",
      "React + TypeScript output",
      "SwiftUI (iOS 16+)",
      "Jetpack Compose (Material 3)",
      "WCAG 2.1 AA audit",
    ],
    keyMethod: "visionToUIAgent.generateFromImage()",
    placeholder:
      "Analyze this Figma export and generate a Next.js dashboard card component",
  },
  {
    id: "swarm",
    name: "Self-Expanding Swarm",
    icon: "🧬",
    tagline: "Detects gaps → synthesizes & hot-loads new agents",
    color: "from-emerald-700/20 to-green-700/20",
    border: "border-emerald-500/30",
    accent: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300",
    apiEndpoint: "/api/v1/multi-repo/swarm-report",
    capabilities: [
      "Gap detection (score threshold)",
      "LLM domain classification",
      "Full agent code synthesis",
      "Guardian safety vetting",
      "Dynamic disk write",
      "Hot-load via dynamic import",
    ],
    keyMethod: "selfExpandingSwarmService.maybeExpand()",
    placeholder: "What agents have been synthesized this session?",
  },
];

// ─── Sprint Launcher ──────────────────────────────────────────────────────────

function SprintLauncher() {
  const [goal, setGoal] = useState("");
  const [autoDeploy, setAutoDeploy] = useState(true);
  const [maxCost, setMaxCost] = useState(5);
  const [events, setEvents] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [launched, setLaunched] = useState(false);
  const evRef = useRef<EventSource | null>(null);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const launch = async () => {
    if (!goal.trim()) return;
    setRunning(true);
    setLaunched(true);
    setEvents(["🏃 Launching sprint…"]);

    try {
      await fetch(`${API}/api/v1/sprint/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, autoDeploy, maxCostUsd: maxCost }),
      });

      // Subscribe to SSE
      if (evRef.current) evRef.current.close();
      const es = new EventSource(`${API}/api/v1/sprint/events`);

      evRef.current = es;
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          const label = `[${data.event}] ${data.phase ?? data.status ?? data.reason ?? data.branchName ?? ""}`;

          setEvents((prev) => [...prev.slice(-49), label]);
          if (
            [
              "sprint:completed",
              "sprint:failed",
              "sprint:vetoed",
              "sprint:cancelled",
            ].includes(data.event)
          ) {
            setRunning(false);
            es.close();
          }
        } catch {}
      };
    } catch (err) {
      setEvents((prev) => [...prev, `Error: ${err}`]);
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 resize-none"
        placeholder="Describe the feature or change for the autonomous sprint…"
        rows={3}
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
      />
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            checked={autoDeploy}
            className="accent-violet-500"
            type="checkbox"
            onChange={(e) => setAutoDeploy(e.target.checked)}
          />
          Auto-deploy (commit + push)
        </label>
        <label className="flex items-center gap-2">
          Max cost: $
          <input
            className="w-14 bg-slate-800 border border-slate-700 rounded px-1 py-0.5 text-slate-200 text-xs"
            max={50}
            min={0.5}
            step={0.5}
            type="number"
            value={maxCost}
            onChange={(e) => setMaxCost(Number(e.target.value))}
          />
        </label>
      </div>
      <button
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
        disabled={running || !goal.trim()}
        onClick={launch}
      >
        {running ? "🏃 Sprint Running…" : "🚀 Launch Autonomous Sprint"}
      </button>

      {launched && (
        <div className="bg-slate-900/80 border border-slate-700/40 rounded-xl p-3 max-h-48 overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
          {events.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
          {running && (
            <div className="text-violet-400 animate-pulse">
              Listening for events…
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── System Detail Card ───────────────────────────────────────────────────────

function SystemCard({ system }: { system: (typeof V6_SYSTEMS)[0] }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  const ask = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      if (system.id === "swarm" && system.apiEndpoint) {
        const res = await fetch(`${API}${system.apiEndpoint}`);
        const data = await res.json();

        setAnswer(JSON.stringify(data.data, null, 2));
      } else {
        const res = await fetch(`${API}/api/swarm/dispatch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: `${system.name} ${question}` }),
        });
        const data = await res.json();

        setAnswer(data.data?.result || data.message || JSON.stringify(data));
      }
    } catch (e: any) {
      setAnswer(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${system.color} border ${system.border} p-5 flex flex-col gap-3`}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{system.icon}</span>
        <div className="flex-1">
          <h3 className={`font-bold ${system.accent}`}>{system.name}</h3>
          <p className="text-slate-400 text-xs mt-0.5">{system.tagline}</p>
          <code
            className={`text-xs mt-1 block ${system.badge.replace("bg-", "text-").split(" ")[0]} font-mono`}
          >
            {system.keyMethod}
          </code>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {system.capabilities.map((c) => (
          <span
            key={c}
            className={`text-xs px-1.5 py-0.5 rounded ${system.badge}`}
          >
            {c}
          </span>
        ))}
      </div>
      {answer && (
        <div className="bg-slate-900/70 rounded-lg p-2 max-h-32 overflow-y-auto">
          <pre className="text-xs text-slate-200 whitespace-pre-wrap">
            {answer}
          </pre>
        </div>
      )}
      <div className="flex gap-2 mt-auto">
        <input
          className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg text-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-slate-500"
          placeholder={system.placeholder}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && ask()}
        />
        <button
          className={`px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-40 text-white bg-gradient-to-r ${system.color.replace("/20", "")}`}
          disabled={loading || !question.trim()}
          onClick={ask}
        >
          {loading ? "…" : "→"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function V6AutonomousPage() {
  const [view, setView] = useState<"overview" | "sprint" | "systems">(
    "overview",
  );

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400">
                Fully Autonomous
              </h1>
            </div>
            <p className="text-slate-400 text-sm">
              Zero-Human Sprint · Multi-Repo Orchestration · Vision→UI ·
              Self-Expanding Swarm
            </p>
          </div>
          <div className="flex gap-2">
            {[
              ["overview", "🗺️ Overview"],
              ["sprint", "🏃 Launch Sprint"],
              ["systems", "⚙️ All Systems"],
            ].map(([v, label]) => (
              <button
                key={v}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === v ? "bg-violet-700/70 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                onClick={() => setView(v as any)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {view === "overview" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                {
                  label: "Sprint Steps",
                  value: "Up to 20",
                  sub: "per autonomous sprint",
                },
                {
                  label: "Repos Coordinated",
                  value: "4+",
                  sub: "backend, frontend, infra, mono",
                },
                {
                  label: "UI Targets",
                  value: "3",
                  sub: "React · SwiftUI · Compose",
                },
                {
                  label: "Swarm Cap",
                  value: "10/session",
                  sub: "new agents synthesized",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4"
                >
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-slate-300 text-xs font-medium">
                    {s.label}
                  </div>
                  <div className="text-slate-500 text-xs">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* System cards grid — overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {V6_SYSTEMS.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-2xl bg-gradient-to-br ${s.color} border ${s.border} p-5 cursor-pointer hover:scale-[1.01] transition-all group`}
                  onClick={() => setView("systems")}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{s.icon}</span>
                    <div className="flex-1">
                      <h3 className={`font-bold ${s.accent}`}>{s.name}</h3>
                      <p className="text-slate-400 text-xs">{s.tagline}</p>
                    </div>
                    <span className="text-slate-600 group-hover:text-slate-300 transition-colors">
                      →
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {s.capabilities.slice(0, 4).map((c) => (
                      <span
                        key={c}
                        className={`text-xs px-1.5 py-0.5 rounded ${s.badge}`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Architecture Note */}
            <div className="mt-8 bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6">
              <h3 className="text-slate-300 font-semibold mb-3">
                🏗️ Architecture
              </h3>
              <div className="font-mono text-xs text-slate-400 leading-6">
                <div>
                  Goal →{" "}
                  <span className="text-violet-400">
                    AutonomousSprintService
                  </span>{" "}
                  → [PLAN] → [GUARDIAN] → [BRANCH] → [EXECUTE × N] → [REVIEW] →
                  [DEPLOY]
                </div>
                <div className="mt-1">
                  Goal →{" "}
                  <span className="text-cyan-400">
                    MultiRepoOrchestrationService
                  </span>{" "}
                  → [SCAN all repos] → [PLAN cross-repo] → [ATOMIC EXECUTE] →
                  [ROLLBACK on failure]
                </div>
                <div className="mt-1">
                  Image →{" "}
                  <span className="text-amber-400">VisionToUIAgent</span> →
                  [Gemini Vision] → [requirements JSON] → [code gen] → [WCAG 2.1
                  audit]
                </div>
                <div className="mt-1">
                  Query (low score) →{" "}
                  <span className="text-emerald-400">
                    SelfExpandingSwarmService
                  </span>{" "}
                  → [classifyDomain] → [synthesize agent] → [guardian] → [write
                  + hot-load]
                </div>
              </div>
            </div>
          </>
        )}

        {view === "sprint" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-violet-700/20 to-purple-700/20 border border-violet-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">🏃</span>
                <div>
                  <h2 className="font-bold text-violet-400">
                    Zero-Human Sprint Launcher
                  </h2>
                  <p className="text-slate-400 text-xs">
                    Autonomously executes your goal end-to-end: plan → code →
                    commit → push
                  </p>
                </div>
              </div>
              <SprintLauncher />
            </div>
          </div>
        )}

        {view === "systems" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {V6_SYSTEMS.map((s) => (
              <SystemCard key={s.id} system={s} />
            ))}
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
