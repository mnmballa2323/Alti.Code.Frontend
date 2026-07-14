"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Input, ScrollShadow } from "@heroui/react";
import {
  Play,
  Check,
  CheckCircle,
  Loader2,
  Terminal as TerminalIcon,
  AlertCircle,
  Sparkles,
  Cpu,
  FolderOpen,
  ArrowRight,
  FileCode,
  BookOpen,
  Blocks,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ChatBotLayout from "@/components/ChatbotLayout";

interface Phase {
  id: number;
  title: string;
  subtitle: string;
  status: "IDLE" | "PROCESSING" | "COMPLETED" | "FAILED";
  message: string;
  data: any;
}

const INITIAL_PHASES: Phase[] = [
  {
    id: 1,
    title: "Analyze Codebase",
    subtitle: "Identify entrypoints, logic modules, and dependency topology",
    status: "IDLE",
    message: "Awaiting activation...",
    data: null,
  },
  {
    id: 2,
    title: "Design CLI Schema",
    subtitle: "Architect command groups, subcommands, inputs, and states",
    status: "IDLE",
    message: "Awaiting activation...",
    data: null,
  },
  {
    id: 3,
    title: "Implement Click Harness",
    subtitle: "Write Python Click CLI wrapper, state files, and undo/redo",
    status: "IDLE",
    message: "Awaiting activation...",
    data: null,
  },
  {
    id: 4,
    title: "Plan Tests",
    subtitle: "Map verification boundaries and edge-cases in TEST.md",
    status: "IDLE",
    message: "Awaiting activation...",
    data: null,
  },
  {
    id: 5,
    title: "Write Test Suite",
    subtitle: "Implement Python unit and mock E2E command validation",
    status: "IDLE",
    message: "Awaiting activation...",
    data: null,
  },
  {
    id: 6,
    title: "Document Capabilities",
    subtitle: "Generate dynamic agentic SKILL.md for prompt-swarm mapping",
    status: "IDLE",
    message: "Awaiting activation...",
    data: null,
  },
  {
    id: 7,
    title: "Publish Configuration",
    subtitle: "Construct setup.py package build for dynamic execution",
    status: "IDLE",
    message: "Awaiting activation...",
    data: null,
  },
];

export default function CliAnythingPage() {
  const [workspacePath, setWorkspacePath] = useState(
    "/Users/michaelmeram/workspace/alti.code.studio/alti.code.studio.backend",
  );
  const [appName, setAppName] = useState("inso-cli");
  const [compilingStatus, setCompilingStatus] = useState<
    "idle" | "compiling" | "done" | "error"
  >("idle");
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] CLI-Anything compiler engine ready. Select target codebase above to start compile.",
  ]);
  const [doneData, setDoneData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "harness" | "skill" | "test" | "setup" | "schema"
  >("harness");

  // Gap analysis and command refinement state
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [refining, setRefining] = useState(false);
  const [refinementOutput, setRefinementOutput] = useState<string | null>(null);

  // Live state execution metrics state
  const [customAction, setCustomAction] = useState("resize");
  const [customPayload, setCustomPayload] = useState('{"width": 1024}');
  const [executingCommand, setExecutingCommand] = useState(false);
  const [cliState, setCliState] = useState<any>({
    status: "idle",
    historyDepth: 0,
    historyPointer: -1,
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();

    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleReset = () => {
    setPhases(INITIAL_PHASES);
    setCompilingStatus("idle");
    setDoneData(null);
    setRefinementOutput(null);
    setLogs([
      "[SYSTEM] Compiler state reset. Ready for target codebase compilation.",
    ]);
    setCliState({
      status: "idle",
      historyDepth: 0,
      historyPointer: -1,
    });
  };

  const triggerCompile = async () => {
    if (!workspacePath.trim() || !appName.trim()) {
      addLog(
        "[ERROR] Workspace path and Application name are mandatory fields.",
      );

      return;
    }

    setCompilingStatus("compiling");
    setDoneData(null);
    setRefinementOutput(null);

    // Reset phases to IDLE and first to processing
    setPhases(
      INITIAL_PHASES.map((p, index) => ({
        ...p,
        status: index === 0 ? "PROCESSING" : "IDLE",
        message:
          index === 0
            ? "Initialing scanning engine..."
            : "Awaiting activation...",
      })),
    );

    addLog(`[SYSTEM] Starting compilation for workspace: ${workspacePath}`);
    addLog(`[SYSTEM] Building stateful agentic app structure: ${appName}`);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${apiUrl}/cli-anything/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspacePath,
          appName,
          stream: true,
        }),
      });

      if (!response.body) {
        throw new Error(
          "Unable to initialize response stream reader from server.",
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");

        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const rawData = line.slice(6).trim();

            if (!rawData) continue;

            try {
              const event = JSON.parse(rawData);

              if (event.type === "phase_update") {
                const { phase, status, message, data } = event;

                setPhases((prevPhases) =>
                  prevPhases.map((p) => {
                    if (p.id === phase) {
                      return { ...p, status, message, data: data || p.data };
                    }
                    if (p.id === phase + 1 && status === "COMPLETED") {
                      return {
                        ...p,
                        status: "PROCESSING",
                        message: "Activating phase...",
                      };
                    }

                    return p;
                  }),
                );

                addLog(`[PHASE ${phase}] ${status}: ${message}`);
              } else if (event.type === "done") {
                addLog(`[COMPILER] Done! ${event.message}`);
                setPhases((prev) =>
                  prev.map((p) => ({ ...p, status: "COMPLETED" })),
                );
                setDoneData(event.data);
                setCompilingStatus("done");

                // Auto-sync liveness status immediately
                setTimeout(() => {
                  fetch(`${apiUrl}/cli-anything/execute`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      workspacePath,
                      appName,
                      command: "status",
                      args: [],
                    }),
                  })
                    .then((res) => res.json())
                    .then((resJson) => {
                      if (resJson.success && resJson.data) {
                        setCliState({
                          status: resJson.data.status,
                          historyDepth: resJson.data.history_depth,
                          historyPointer: resJson.data.history_pointer,
                        });
                      }
                    })
                    .catch(() => {});
                }, 400);
              } else if (event.type === "error") {
                addLog(`[ERROR] Compile failure: ${event.message}`);
                setPhases((prev) =>
                  prev.map((p) =>
                    p.status === "PROCESSING"
                      ? { ...p, status: "FAILED", message: event.message }
                      : p,
                  ),
                );
                setCompilingStatus("error");
              }
            } catch (err) {
              console.error("Failed to parse SSE line:", rawData, err);
            }
          }
        }
      }
    } catch (err: any) {
      addLog(`[FATAL ERROR] Connection lost or aborted: ${err.message}`);
      setCompilingStatus("error");
      setPhases((prev) =>
        prev.map((p) =>
          p.status === "PROCESSING"
            ? { ...p, status: "FAILED", message: err.message }
            : p,
        ),
      );
    }
  };

  const runCLICommand = async (commandName: string, args: string[] = []) => {
    setExecutingCommand(true);
    addLog(
      `[EXECUTION] Invoking subcommand: '${commandName}' ${args.join(" ")}`,
    );

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${apiUrl}/cli-anything/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspacePath,
          appName,
          command: commandName,
          args,
        }),
      });

      const resJson = await response.json();

      if (resJson.success && resJson.data) {
        const payload = resJson.data;

        addLog(
          `[EXECUTION] Subcommand '${commandName}' executed successfully!`,
        );

        // Sync response payloads to local UI state values
        if (commandName === "status") {
          setCliState({
            status: payload.status,
            historyDepth: payload.history_depth,
            historyPointer: payload.history_pointer,
          });
        } else if (payload.status) {
          setCliState((prev: any) => ({
            ...prev,
            status: payload.status,
            historyPointer:
              payload.new_pointer !== undefined
                ? payload.new_pointer
                : prev.historyPointer,
            historyDepth: payload.executed_action
              ? prev.historyDepth + 1
              : prev.historyDepth,
          }));
        } else if (commandName === "undo" || commandName === "redo") {
          // If undo or redo completes, trigger status query in background to sync state values
          setTimeout(() => runCLICommand("status"), 200);
        } else if (commandName === "history") {
          addLog(
            `[EXECUTION HISTORY] Found ${Array.isArray(payload) ? payload.length : 0} actions recorded.`,
          );
        }
      } else {
        addLog(
          `[EXECUTION ERROR] ${resJson.message || "Failed to execute Click subcommand."}`,
        );
      }
    } catch (err: any) {
      addLog(`[EXECUTION FATAL] Connection lost: ${err.message}`);
    } finally {
      setExecutingCommand(false);
    }
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementPrompt.trim() || refining || !workspacePath) return;

    setRefining(true);
    addLog(
      `[REFINEMENT] Querying swarm refinement for prompt: "${refinementPrompt}"`,
    );

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const response = await fetch(`${apiUrl}/cli-anything/refine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspacePath,
          appName,
          prompt: refinementPrompt,
        }),
      });

      const resJson = await response.json();

      if (resJson.success) {
        addLog(
          "[REFINEMENT] Successfully completed gap analysis and extended Click commands!",
        );
        setRefinementOutput(
          resJson.data.explanation || "CLI Extended successfully.",
        );

        if (resJson.data.harnessCode) {
          setDoneData((prev: any) => ({
            ...prev,
            harnessCode: resJson.data.harnessCode,
            skillDoc: resJson.data.skillDoc || prev.skillDoc,
            cliSchema: resJson.data.cliSchema || prev.cliSchema,
          }));
        }
      } else {
        addLog(
          `[REFINEMENT ERROR] ${resJson.message || "Failed to refine CLI commands."}`,
        );
      }
    } catch (err: any) {
      addLog(`[REFINEMENT FATAL] Connection error: ${err.message}`);
    } finally {
      setRefining(false);
      setRefinementPrompt("");
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-background flex flex-col h-full font-sans">
        {/* Header */}
        <div className="flex-none h-[64px] px-8 border-b border-default-100 dark:border-white/5 bg-content1/50 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Blocks className="size-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                CLI-Anything
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium tracking-wide">
                  Swarm Compiler v1.1.0
                </span>
              </h1>
              <p className="text-[11px] text-default-400 font-normal">
                Autonomous target-codebase conversion to agent-native click
                CLIs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {compilingStatus !== "idle" && (
              <Button
                className="text-xs text-default-500 hover:text-foreground font-medium rounded-xl border border-default-100 dark:border-white/5 px-4"
                size="sm"
                startContent={<RefreshCw className="size-3.5" />}
                variant="light"
                onPress={handleReset}
              >
                Reset Engine
              </Button>
            )}
          </div>
        </div>

        {/* Dynamic Panels Layout */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
          {/* Left panel: Inputs, Controls & Vertical Stepper */}
          <div className="w-full lg:w-[460px] flex-none border-r border-default-100 dark:border-white/5 flex flex-col bg-content1/20 dark:bg-black/20 overflow-y-auto">
            {/* Project Settings panel */}
            <div className="p-6 border-b border-default-100 dark:border-white/5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-default-400">
                Compiler Configuration
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-default-500 mb-1 block">
                    Target Codebase Directory (Absolute Path)
                  </label>
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-default-100/50 dark:bg-white/5 border border-default-100 dark:border-white/10 hover:border-default-200 focus-within:border-primary/50",
                    }}
                    disabled={compilingStatus === "compiling"}
                    placeholder="/path/to/target/project"
                    radius="lg"
                    size="sm"
                    startContent={
                      <FolderOpen className="size-4 text-default-400 shrink-0 mr-1" />
                    }
                    value={workspacePath}
                    onChange={(e) => setWorkspacePath(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-default-500 mb-1 block">
                    Generated Application Executable Name
                  </label>
                  <Input
                    classNames={{
                      inputWrapper:
                        "bg-default-100/50 dark:bg-white/5 border border-default-100 dark:border-white/10 hover:border-default-200 focus-within:border-primary/50",
                    }}
                    disabled={compilingStatus === "compiling"}
                    placeholder="e.g. workspace-cli"
                    radius="lg"
                    size="sm"
                    startContent={
                      <Cpu className="size-4 text-default-400 shrink-0 mr-1" />
                    }
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="isolated-env-toggle"
                    className="rounded bg-default-100/50 dark:bg-white/5 border-default-200"
                    defaultChecked
                  />
                  <label htmlFor="isolated-env-toggle" className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Run in isolated Docker container (Pure Isolation)
                  </label>
                  
                  {/* Container Status Indicator (Mock representation) */}
                  <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Running
                  </span>
                </div>
              </div>

              {compilingStatus === "idle" ? (
                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-98 transition-all h-10 mt-2"
                  startContent={<Play className="size-4" />}
                  onPress={triggerCompile}
                >
                  Compile Codebase
                </Button>
              ) : compilingStatus === "compiling" ? (
                <Button
                  disabled
                  className="w-full bg-default-100 dark:bg-white/5 text-default-500 font-medium rounded-xl h-10 cursor-not-allowed mt-2 border border-default-200 dark:border-white/10"
                  startContent={
                    <Loader2 className="size-4 animate-spin text-primary" />
                  }
                >
                  Swarm Compiler Executing...
                </Button>
              ) : compilingStatus === "done" ? (
                <div className="p-3 bg-success/10 border border-success/20 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-success text-xs font-semibold">
                    <Check className="size-4 shrink-0" />
                    Compilation Complete!
                  </div>
                  <Button
                    className="text-xs font-medium h-7 rounded-lg"
                    color="success"
                    size="sm"
                    variant="light"
                    onPress={triggerCompile}
                  >
                    Re-Compile
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 text-danger text-xs font-semibold">
                    <AlertCircle className="size-4 shrink-0" />
                    Compilation Failed
                  </div>
                  <Button
                    className="text-xs font-medium h-7 rounded-lg"
                    color="danger"
                    size="sm"
                    variant="light"
                    onPress={triggerCompile}
                  >
                    Retry Compile
                  </Button>
                </div>
              )}
            </div>

            {/* Pipeline Stepper */}
            <div className="flex-1 p-6 space-y-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-default-400">
                Compiler Execution Phases
              </h3>

              <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-default-100 dark:before:bg-white/5">
                {phases.map((phase) => {
                  const isPending = phase.status === "IDLE";
                  const isProcessing = phase.status === "PROCESSING";
                  const isCompleted = phase.status === "COMPLETED";
                  const isFailed = phase.status === "FAILED";

                  return (
                    <div key={phase.id} className="flex gap-4 relative group">
                      {/* Step marker node */}
                      <div className="flex-none z-10">
                        {isCompleted ? (
                          <motion.div
                            animate={{ scale: 1 }}
                            className="size-9 rounded-full bg-success/20 dark:bg-success/15 border border-success text-success flex items-center justify-center shadow-lg shadow-success/10"
                            initial={{ scale: 0.8 }}
                          >
                            <Check className="size-4 stroke-[3]" />
                          </motion.div>
                        ) : isProcessing ? (
                          <motion.div
                            animate={{
                              boxShadow: [
                                "0 0 0 0px rgba(var(--primary-rgb), 0.2)",
                                "0 0 0 8px rgba(var(--primary-rgb), 0)",
                              ],
                            }}
                            className="size-9 rounded-full bg-primary/20 text-primary border border-primary flex items-center justify-center font-bold text-xs"
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            <Loader2 className="size-4 animate-spin" />
                          </motion.div>
                        ) : isFailed ? (
                          <motion.div
                            animate={{ scale: 1 }}
                            className="size-9 rounded-full bg-danger/25 text-danger border border-danger flex items-center justify-center"
                            initial={{ scale: 0.8 }}
                          >
                            <AlertCircle className="size-4 stroke-[2.5]" />
                          </motion.div>
                        ) : (
                          <div className="size-9 rounded-full bg-default-100 dark:bg-white/5 border border-default-200 dark:border-white/10 text-default-400 flex items-center justify-center font-bold text-xs">
                            {phase.id}
                          </div>
                        )}
                      </div>

                      {/* Step content */}
                      <div className="flex-1 pt-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-xs font-semibold transition-colors duration-300 ${
                              isCompleted
                                ? "text-foreground"
                                : isProcessing
                                  ? "text-primary"
                                  : isFailed
                                    ? "text-danger"
                                    : "text-default-400"
                            }`}
                          >
                            {phase.title}
                          </h4>
                          {isProcessing && (
                            <span className="text-[9px] font-bold text-primary tracking-wide uppercase px-2 py-0.5 rounded-full bg-primary/10 animate-pulse">
                              active
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[9px] font-semibold text-success tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-success/10">
                              done
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-default-400 font-normal leading-relaxed">
                          {phase.subtitle}
                        </p>

                        {/* Phase real-time logs message overlay */}
                        {(isProcessing || isCompleted || isFailed) && (
                          <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-1.5 p-2 rounded-lg text-[10px] font-mono leading-relaxed border ${
                              isFailed
                                ? "bg-danger/5 border-danger/10 text-danger/80"
                                : isProcessing
                                  ? "bg-primary/5 border-primary/10 text-primary/80"
                                  : "bg-default-50 dark:bg-white/5 border-default-100 dark:border-white/5 text-default-500"
                            }`}
                            initial={{ opacity: 0, y: -2 }}
                          >
                            {phase.message}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel: Tabbed Results Viewer OR Monospaced Compiler Console Logs */}
          <div className="flex-1 overflow-hidden flex flex-col bg-content1/10">
            {compilingStatus === "idle" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-75">
                <div className="p-4 rounded-full bg-primary/5 border border-primary/10 text-primary mb-6 animate-pulse">
                  <Blocks className="size-16" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  No Active Compilation Session
                </h2>
                <p className="text-sm text-default-500 mt-2 max-w-md mx-auto leading-relaxed">
                  Provide a target directory path and Click executable name in
                  the configuration sidebar to let the Swarm Compiler map,
                  design, and bootstrap your codebase into an agentic CLI.
                </p>
              </div>
            ) : compilingStatus === "compiling" ? (
              /* Streaming Log Terminal Terminal */
              <div className="flex-1 flex flex-col overflow-hidden bg-black font-mono">
                <div className="flex-none px-6 h-11 border-b border-white/5 flex items-center justify-between text-xs text-white/50 bg-neutral-900/50">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-yellow-500 animate-ping" />
                    <span>Real-time Swarm Compilation Console</span>
                  </div>
                  <span>Stdout/Stderr Stream</span>
                </div>
                <ScrollShadow className="flex-1 p-6 space-y-2 overflow-y-auto">
                  {logs.map((log, index) => {
                    let colorClass = "text-white/80";

                    if (log.includes("[ERROR]"))
                      colorClass = "text-red-400 font-bold";
                    else if (log.includes("[FATAL"))
                      colorClass = "text-red-500 font-black";
                    else if (log.includes("[SYSTEM]"))
                      colorClass = "text-blue-400";
                    else if (log.includes("[PHASE"))
                      colorClass = "text-teal-400";
                    else if (log.includes("PROCESSING"))
                      colorClass = "text-yellow-400/80";
                    else if (log.includes("COMPLETED"))
                      colorClass = "text-green-400";

                    return (
                      <div
                        key={index}
                        className={`text-xs leading-relaxed break-all ${colorClass}`}
                      >
                        {log}
                      </div>
                    );
                  })}
                  <div ref={logsEndRef} />
                </ScrollShadow>
              </div>
            ) : (
              /* Done / Finished State: Full-blown Code and Doc Browser */
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Result tabs */}
                <div className="flex-none border-b border-default-100 dark:border-white/5 bg-content1/30 flex items-center px-6 gap-2">
                  <button
                    className={`h-12 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
                      activeTab === "harness"
                        ? "border-primary text-primary"
                        : "border-transparent text-default-500 hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("harness")}
                  >
                    <FileCode className="size-3.5" />
                    cli_harness.py
                  </button>
                  <button
                    className={`h-12 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
                      activeTab === "skill"
                        ? "border-primary text-primary"
                        : "border-transparent text-default-500 hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("skill")}
                  >
                    <BookOpen className="size-3.5" />
                    SKILL.md
                  </button>
                  <button
                    className={`h-12 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
                      activeTab === "test"
                        ? "border-primary text-primary"
                        : "border-transparent text-default-500 hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("test")}
                  >
                    <CheckCircle className="size-3.5" />
                    TEST.md
                  </button>
                  <button
                    className={`h-12 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
                      activeTab === "setup"
                        ? "border-primary text-primary"
                        : "border-transparent text-default-500 hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("setup")}
                  >
                    <ArrowRight className="size-3.5" />
                    setup.py
                  </button>
                  <button
                    className={`h-12 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
                      activeTab === "schema"
                        ? "border-primary text-primary"
                        : "border-transparent text-default-500 hover:text-foreground"
                    }`}
                    onClick={() => setActiveTab("schema")}
                  >
                    <Cpu className="size-3.5" />
                    Schema.json
                  </button>
                </div>

                {/* Tab content viewer */}
                <div className="flex-1 overflow-hidden bg-neutral-950 flex flex-col font-mono text-xs">
                  <ScrollShadow className="flex-1 p-6 overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {activeTab === "harness" && (
                        <motion.pre
                          key="harness"
                          animate={{ opacity: 1 }}
                          className="text-white/90 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                        >
                          <code>
                            {doneData?.harnessCode ||
                              "# No CLI harness code generated."}
                          </code>
                        </motion.pre>
                      )}

                      {activeTab === "skill" && (
                        <motion.pre
                          key="skill"
                          animate={{ opacity: 1 }}
                          className="text-emerald-400/90 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                        >
                          <code>
                            {doneData?.skillDoc ||
                              "# No skill definition created."}
                          </code>
                        </motion.pre>
                      )}

                      {activeTab === "test" && (
                        <motion.pre
                          key="test"
                          animate={{ opacity: 1 }}
                          className="text-blue-400/90 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                        >
                          <code>
                            {doneData?.testDoc ||
                              "# No testing strategy planned."}
                          </code>
                        </motion.pre>
                      )}

                      {activeTab === "setup" && (
                        <motion.pre
                          key="setup"
                          animate={{ opacity: 1 }}
                          className="text-yellow-400/90 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                        >
                          <code>
                            {doneData?.setupPy ||
                              "# No publishing configuration configured."}
                          </code>
                        </motion.pre>
                      )}

                      {activeTab === "schema" && (
                        <motion.pre
                          key="schema"
                          animate={{ opacity: 1 }}
                          className="text-teal-400/90 leading-relaxed overflow-x-auto select-text whitespace-pre-wrap"
                          exit={{ opacity: 0 }}
                          initial={{ opacity: 0 }}
                        >
                          <code>
                            {doneData?.cliSchema
                              ? JSON.stringify(doneData.cliSchema, null, 2)
                              : '{\n  "schema": "Not generated"\n}'}
                          </code>
                        </motion.pre>
                      )}
                    </AnimatePresence>
                  </ScrollShadow>
                </div>

                {/* Bottom: Runtime Command Controller & Swarm Refinement */}
                <div className="flex-none border-t border-default-100 dark:border-white/5 bg-content1/20 p-6 space-y-6">
                  {/* Two column grid for Execution Console & Refinement Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Column 1: Stateful Command Execution Console */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs uppercase tracking-wide">
                          <Cpu className="size-4 text-primary animate-pulse" />
                          Stateful Execution Console
                        </div>

                        {/* Live status badge */}
                        <div className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-success/10 border border-success/20 text-success uppercase">
                          <span className="size-1.5 rounded-full bg-success animate-ping" />
                          status: {cliState.status}
                        </div>
                      </div>

                      {/* State status details */}
                      <div className="grid grid-cols-3 gap-3 p-3 bg-default-100/50 dark:bg-white/5 rounded-xl border border-default-100 dark:border-white/5 text-[11px] font-mono">
                        <div>
                          <span className="text-default-400 block text-[9px] uppercase tracking-wider">
                            State status
                          </span>
                          <span className="font-semibold text-foreground truncate block">
                            {cliState.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-default-400 block text-[9px] uppercase tracking-wider">
                            History depth
                          </span>
                          <span className="font-semibold text-foreground block">
                            {cliState.historyDepth} actions
                          </span>
                        </div>
                        <div>
                          <span className="text-default-400 block text-[9px] uppercase tracking-wider">
                            History pointer
                          </span>
                          <span className="font-semibold text-foreground block">
                            index {cliState.historyPointer}
                          </span>
                        </div>
                      </div>

                      {/* Operational buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          className="text-[11px] font-semibold flex-1 rounded-xl h-8 bg-default-100 dark:bg-white/5 border border-default-100 dark:border-white/5 hover:border-primary/50"
                          disabled={executingCommand}
                          size="sm"
                          startContent={
                            executingCommand ? (
                              <Loader2 className="size-3 animate-spin text-primary" />
                            ) : (
                              <RefreshCw className="size-3" />
                            )
                          }
                          variant="flat"
                          onPress={() => runCLICommand("status")}
                        >
                          Status
                        </Button>
                        <Button
                          className="text-[11px] font-semibold flex-1 rounded-xl h-8 bg-default-100 dark:bg-white/5 border border-default-100 dark:border-white/5 hover:border-primary/50"
                          disabled={
                            executingCommand || cliState.historyPointer < 0
                          }
                          size="sm"
                          startContent={
                            <ArrowRight className="size-3 rotate-180 text-warning" />
                          }
                          variant="flat"
                          onPress={() => runCLICommand("undo")}
                        >
                          Undo
                        </Button>
                        <Button
                          className="text-[11px] font-semibold flex-1 rounded-xl h-8 bg-default-100 dark:bg-white/5 border border-default-100 dark:border-white/5 hover:border-primary/50"
                          disabled={
                            executingCommand ||
                            cliState.historyPointer >= cliState.historyDepth - 1
                          }
                          size="sm"
                          startContent={
                            <ArrowRight className="size-3 text-success" />
                          }
                          variant="flat"
                          onPress={() => runCLICommand("redo")}
                        >
                          Redo
                        </Button>
                        <Button
                          className="text-[11px] font-semibold flex-1 rounded-xl h-8 bg-default-100 dark:bg-white/5 border border-default-100 dark:border-white/5 hover:border-primary/50"
                          disabled={executingCommand}
                          size="sm"
                          startContent={
                            <TerminalIcon className="size-3 text-primary" />
                          }
                          variant="flat"
                          onPress={() => runCLICommand("history")}
                        >
                          History
                        </Button>
                      </div>

                      {/* Custom action form */}
                      <div className="flex gap-2">
                        <Input
                          className="w-[120px] shrink-0"
                          classNames={{
                            inputWrapper:
                              "bg-default-100/50 dark:bg-white/5 border border-default-100 dark:border-white/10 hover:border-default-200 focus-within:border-primary/50",
                          }}
                          disabled={executingCommand}
                          placeholder="Action (e.g. resize)"
                          radius="lg"
                          size="sm"
                          value={customAction}
                          onChange={(e) => setCustomAction(e.target.value)}
                        />
                        <Input
                          classNames={{
                            inputWrapper:
                              "bg-default-100/50 dark:bg-white/5 border border-default-100 dark:border-white/10 hover:border-default-200 focus-within:border-primary/50",
                          }}
                          disabled={executingCommand}
                          placeholder="Payload JSON string"
                          radius="lg"
                          size="sm"
                          value={customPayload}
                          onChange={(e) => setCustomPayload(e.target.value)}
                        />
                        <Button
                          className="rounded-xl font-semibold px-4 h-9 shadow-md shadow-primary/10 shrink-0"
                          color="primary"
                          disabled={executingCommand || !customAction.trim()}
                          size="sm"
                          startContent={
                            executingCommand ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Play className="size-3.5" />
                            )
                          }
                          onPress={() =>
                            runCLICommand("execute", [
                              "--action",
                              customAction,
                              "--payload",
                              customPayload,
                            ])
                          }
                        >
                          Run Action
                        </Button>
                      </div>
                    </div>

                    {/* Column 2: Swarm Gap Analysis & Command Refinement Panel */}
                    <div className="space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs uppercase tracking-wide">
                          <Sparkles className="size-4 text-primary animate-pulse" />
                          Gap-Analysis & Command Refinement
                        </div>

                        <form className="flex gap-3" onSubmit={handleRefine}>
                          <Input
                            classNames={{
                              inputWrapper:
                                "bg-default-100/50 dark:bg-white/5 border border-default-100 dark:border-white/10 hover:border-default-200 focus-within:border-primary/50",
                            }}
                            disabled={refining}
                            placeholder="e.g. Add a scan command for SQL vulnerability markers or add test hooks..."
                            radius="lg"
                            size="sm"
                            value={refinementPrompt}
                            onChange={(e) =>
                              setRefinementPrompt(e.target.value)
                            }
                          />
                          <Button
                            className="rounded-xl px-6 font-semibold shadow-md shadow-primary/10 shrink-0 h-9"
                            color="primary"
                            disabled={refining}
                            size="sm"
                            startContent={
                              refining ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <MessageSquare className="size-3.5" />
                              )
                            }
                            type="submit"
                          >
                            {refining ? "Refining..." : "Refine Commands"}
                          </Button>
                        </form>
                      </div>

                      {refinementOutput && (
                        <motion.div
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 text-xs text-foreground/90 leading-relaxed space-y-1 font-sans animate-in slide-in-from-bottom-2 duration-300"
                          initial={{ opacity: 0, height: 0 }}
                        >
                          <div className="font-semibold text-primary flex items-center gap-1.5">
                            <Check className="size-3.5 font-bold" />
                            Refinement Expansion Explanation
                          </div>
                          <p>{refinementOutput}</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
