"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  Square,
  Terminal,
  Clock,
  Bot,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Cpu,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface OngoingTask {
  id: string;
  title: string;
  description: string;
  agent: string;
  status: "running" | "paused" | "waiting_input" | "errored";
  currentStep: number;
  totalSteps: number;
  stepDescription: string;
  elapsedTime: string;
  logs: string[];
}

const MOCK_ONGOING_TASKS: OngoingTask[] = [
  {
    id: "task-101",
    title: "Full Codebase Refactor & SAST Security Audit",
    description:
      "Scanning AST for SQL injections, parameterizing queries, and running automated test remediation.",
    agent: "security-reviewer",
    status: "running",
    currentStep: 4,
    totalSteps: 12,
    stepDescription:
      "Scanning AST parameterization & validating secret leaks...",
    elapsedTime: "04m 12s",
    logs: [
      "[INFO] Starting AST SAST Security Scan...",
      "[PASS] Checked 48 SQL query parameters - no injections detected.",
      "[WARN] Hardcoded secret pattern found in config.ts - refactoring to process.env...",
      "[RUNNING] Running sast-remediator-daemon on 14 modified files...",
    ],
  },
  {
    id: "task-102",
    title: "Continuous Integration & Test Expansion Loop",
    description:
      "Generating missing unit tests to push coverage above 80% threshold across auth services.",
    agent: "tdd-guide",
    status: "waiting_input",
    currentStep: 7,
    totalSteps: 10,
    stepDescription:
      "Awaiting confirmation: Proceed with mocking third-party OAuth provider?",
    elapsedTime: "12m 45s",
    logs: [
      "[INFO] Executing TDD Workflow for /store/messagesSlice.ts...",
      "[GREEN] 14 unit tests passed (84.2% coverage).",
      "[PROMPT] Third-party mock endpoint requested. Confirm mock payload schema?",
    ],
  },
];

export default function OngoingTasksView() {
  const [tasks, setTasks] = useState<OngoingTask[]>(MOCK_ONGOING_TASKS);
  const [expandedLogId, setExpandedLogId] = useState<string | null>("task-101");
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === "running" ? "paused" : "running";

          return { ...t, status: nextStatus };
        }

        return t;
      }),
    );
  };

  const killTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSendInput = (id: string) => {
    const input = taskInputs[id];

    if (!input?.trim()) return;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            status: "running",
            logs: [
              ...t.logs,
              `[USER INPUT]: ${input}`,
              "[RUNNING] Resuming task execution...",
            ],
            stepDescription: "Processing user input & continuing workflow...",
          };
        }

        return t;
      }),
    );

    setTaskInputs((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0000ff]/20 border border-[#0000ff]/60 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(0,0,255,0.4)]">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide">
              Active Workflow Hub
            </h2>
            <p className="text-xs text-zinc-400">
              {tasks.length} autonomous background tasks running
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Live Syncing
          </span>
        </div>
      </div>

      {/* Task Cards List */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/30 border border-zinc-800/50 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-zinc-600 mb-3" />
          <h3 className="text-sm font-semibold text-zinc-300">
            All Tasks Completed
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm">
            There are currently no active background tasks. Launch a new
            workflow from the Workflows tab or send a prompt below.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tasks.map((task) => {
            const isLogExpanded = expandedLogId === task.id;
            const progressPercent = Math.round(
              (task.currentStep / task.totalSteps) * 100,
            );

            return (
              <div
                key={task.id}
                className={cn(
                  "flex flex-col bg-zinc-950/80 border rounded-2xl overflow-hidden transition-all duration-200 shadow-lg",
                  task.status === "running"
                    ? "border-[#0000ff]/40 shadow-[0_0_15px_rgba(0,0,255,0.15)]"
                    : task.status === "waiting_input"
                      ? "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                      : "border-zinc-800",
                )}
              >
                {/* Main Card Content */}
                <div className="p-4 flex flex-col gap-3">
                  {/* Top Status Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Status Badge */}
                      {task.status === "running" && (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Running
                        </span>
                      )}
                      {task.status === "waiting_input" && (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          <AlertCircle className="w-3 h-3" />
                          Needs Input
                        </span>
                      )}
                      {task.status === "paused" && (
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                          <Pause className="w-3 h-3" />
                          Paused
                        </span>
                      )}

                      <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-blue-400" />
                        {task.agent}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.elapsedTime}
                      </span>

                      {/* Controls */}
                      <button
                        className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-colors"
                        title={
                          task.status === "running"
                            ? "Pause Task"
                            : "Resume Task"
                        }
                        type="button"
                        onClick={() => toggleTaskStatus(task.id)}
                      >
                        {task.status === "running" ? (
                          <Pause className="w-3.5 h-3.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                        title="Cancel Task"
                        type="button"
                        onClick={() => killTask(task.id)}
                      >
                        <Square className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Task Title & Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-wide">
                      {task.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {task.description}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-300 font-medium truncate max-w-[80%]">
                        {task.stepDescription}
                      </span>
                      <span className="text-zinc-400 font-mono">
                        Step {task.currentStep}/{task.totalSteps} (
                        {progressPercent}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-[#0000ff] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(0,0,255,0.6)]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stdin Input Banner if waiting for input */}
                {task.status === "waiting_input" && (
                  <div className="px-4 py-2.5 bg-amber-500/10 border-t border-b border-amber-500/20 flex items-center gap-2">
                    <input
                      className="flex-1 bg-zinc-900/90 border border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                      placeholder="Type your response to continue task..."
                      type="text"
                      value={taskInputs[task.id] || ""}
                      onChange={(e) =>
                        setTaskInputs((prev) => ({
                          ...prev,
                          [task.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendInput(task.id);
                      }}
                    />
                    <button
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors shadow-sm"
                      type="button"
                      onClick={() => handleSendInput(task.id)}
                    >
                      <Send className="w-3 h-3" />
                      <span>Submit</span>
                    </button>
                  </div>
                )}

                {/* Collapsible Terminal Logs Footer */}
                <div className="bg-zinc-900/90 border-t border-zinc-800/80">
                  <button
                    className="w-full px-4 py-2 flex items-center justify-between text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                    type="button"
                    onClick={() =>
                      setExpandedLogId(isLogExpanded ? null : task.id)
                    }
                  >
                    <span className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" />
                      Live Terminal Console ({task.logs.length} entries)
                    </span>
                    {isLogExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isLogExpanded && (
                    <div className="p-3 font-mono text-[11px] bg-black/90 text-zinc-300 flex flex-col gap-1 max-h-44 overflow-y-auto scrollbar-thin border-t border-zinc-800">
                      {task.logs.map((log, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "leading-relaxed",
                            log.startsWith("[FAIL]") ||
                              log.startsWith("[ERROR]")
                              ? "text-red-400 font-semibold"
                              : log.startsWith("[WARN]")
                                ? "text-amber-400"
                                : log.startsWith("[PASS]") ||
                                    log.startsWith("[GREEN]")
                                  ? "text-emerald-400"
                                  : log.startsWith("[USER INPUT]")
                                    ? "text-blue-400 font-bold"
                                    : "text-zinc-400",
                          )}
                        >
                          {log}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
