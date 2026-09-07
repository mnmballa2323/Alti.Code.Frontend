"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Bot,
  FileCode2,
  Download,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export interface CompletedTask {
  id: string;
  title: string;
  description: string;
  agent: string;
  model: string;
  status: "success" | "failed" | "cancelled";
  completedAt: string;
  duration: string;
  artifacts: { name: string; type: string; size: string }[];
  summary: string;
}

export const MOCK_COMPLETED_TASKS: CompletedTask[] = [
  {
    id: "task-098",
    title: "Dependency Security Audit & Package Whitelisting",
    description:
      "Scanned all Node modules against sovereign registry service for MIT/Apache-2.0 compliance.",
    agent: "security-reviewer",
    model: "Gemini 3.6 Flash",
    status: "success",
    completedAt: "Today at 06:14 PM",
    duration: "02m 18s",
    artifacts: [
      { name: "audit_summary.json", type: "JSON", size: "14.2 KB" },
      { name: "license_whitelist_report.md", type: "Markdown", size: "8.6 KB" },
    ],
    summary:
      "Scanned 142 total dependencies. 0 prohibited licenses found. All packages whitelisted under Apache 2.0 & MIT rules.",
  },
  {
    id: "task-095",
    title: "Automated PR Code Quality & Refactor Review",
    description:
      "Evaluated PR #42 for immutability, deep nesting limits, and error handling coverage.",
    agent: "code-reviewer",
    model: "Claude Opus 4.6",
    status: "success",
    completedAt: "Yesterday at 04:30 PM",
    duration: "05m 40s",
    artifacts: [
      { name: "pr_42_review_notes.md", type: "Markdown", size: "18.1 KB" },
      { name: "coverage_diff.patch", type: "Patch", size: "32.4 KB" },
    ],
    summary:
      "Reviewed 18 modified files. Identified 2 potential memory leaks and auto-generated parameterized fixes.",
  },
  {
    id: "task-091",
    title: "Database Migration & Index Optimization",
    description:
      "Optimized PostgreSQL indexes across user workspace tables for high-throughput queries.",
    agent: "database-reviewer",
    model: "DeepSeek Coder V3",
    status: "failed",
    completedAt: "Aug 10, 2026",
    duration: "01m 05s",
    artifacts: [{ name: "error_traceback.log", type: "Log", size: "4.1 KB" }],
    summary:
      "Migration aborted: Table locks detected during index creation. Safe rollback executed cleanly.",
  },
];

export default function CompletedInboxView() {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("task-098");

  useEffect(() => {
    const handleSelectTask = (e: CustomEvent<string>) => {
      if (e.detail) {
        setSelectedTaskId(e.detail);
      }
    };

    window.addEventListener(
      "inso-select-inbox-task",
      handleSelectTask as EventListener,
    );

    return () => {
      window.removeEventListener(
        "inso-select-inbox-task",
        handleSelectTask as EventListener,
      );
    };
  }, []);

  const selectedTask =
    MOCK_COMPLETED_TASKS.find((t) => t.id === selectedTaskId) ||
    MOCK_COMPLETED_TASKS[0];

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Detail Inspector Panel */}
      {selectedTask && (
        <div className="w-full flex flex-col bg-zinc-950/90 border border-zinc-800/80 rounded-2xl p-6 shadow-xl gap-6 backdrop-blur-md">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {selectedTask.status === "success" ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Task Completed
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Task Failed
                  </span>
                )}

                <span className="text-xs text-zinc-500 font-mono">
                  {selectedTask.id} · {selectedTask.completedAt}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-wide mt-1">
                {selectedTask.title}
              </h2>
              <p className="text-xs text-zinc-400">
                {selectedTask.description}
              </p>
            </div>

            <button
              className="px-4 py-2 rounded-xl bg-[#0000ff]/20 text-blue-300 hover:bg-[#0000ff]/30 border border-[#0000ff]/50 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
              type="button"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-run Workflow</span>
            </button>
          </div>

          {/* Run Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                Assigned Agent
              </span>
              <span className="text-white font-semibold flex items-center gap-1.5 text-sm">
                <Bot className="w-4 h-4 text-blue-400" />
                {selectedTask.agent}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                Model Route Tier
              </span>
              <span className="text-white font-semibold flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                {selectedTask.model}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                Total Execution Time
              </span>
              <span className="text-white font-mono font-semibold text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                {selectedTask.duration}
              </span>
            </div>
          </div>

          {/* Execution Summary Box */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Execution Summary
            </h4>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 leading-relaxed font-mono">
              {selectedTask.summary}
            </div>
          </div>

          {/* Generated Artifacts List */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Output Artifacts ({selectedTask.artifacts.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedTask.artifacts.map((art, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <FileCode2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {art.name}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {art.type} · {art.size}
                      </span>
                    </div>
                  </div>

                  <button
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Download Artifact"
                    type="button"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
