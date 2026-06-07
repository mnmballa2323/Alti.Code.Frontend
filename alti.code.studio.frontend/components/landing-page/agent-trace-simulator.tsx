"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, CheckCircle, Terminal, Cpu, Shield, Database } from "lucide-react";
import { Button } from "@heroui/react";

interface LogItem {
  text: string;
  type: "plan" | "run" | "audit" | "success" | "info";
  time: string;
}

interface Preset {
  id: string;
  title: string;
  icon: React.ReactNode;
  steps: Omit<LogItem, "time">[];
}

const PRESETS: Preset[] = [
  {
    id: "stripe",
    title: "Verify Stripe Webhooks",
    icon: <Shield className="w-4 h-4 text-emerald-500" />,
    steps: [
      { type: "plan", text: "Initializing sandbox environment for Stripe compliance scan." },
      { type: "info", text: "Scanning codebase for hardcoded webhook secret references." },
      { type: "run", text: "Verifying signature validation middleware in route: /api/webhooks." },
      { type: "audit", text: "Injecting mock payload to test replay attack protection." },
      { type: "success", text: "Audit Passed: Signature verification and IP checks conform to PCI-DSS." },
    ],
  },
  {
    id: "postgres",
    title: "Optimize Postgres Schema",
    icon: <Database className="w-4 h-4 text-sky-500" />,
    steps: [
      { type: "plan", text: "Analyzing query planner logs for slow database operations." },
      { type: "info", text: "Identified table scan bottleneck on 'orders' (user_id field)." },
      { type: "run", text: "Generating safe migration script: CREATE INDEX CONCURRENTLY idx_orders_user." },
      { type: "audit", text: "Running dry-run migration check on isolated database replica." },
      { type: "success", text: "Success: Query execution plan optimized. Est. query cost reduced by 85%." },
    ],
  },
  {
    id: "nextjs",
    title: "Generate Next.js Auth",
    icon: <Cpu className="w-4 h-4 text-purple-500" />,
    steps: [
      { type: "plan", text: "Structuring Next.js 15 App Router login views and middleware rules." },
      { type: "run", text: "Writing server actions for secure JWT sign-in & session management." },
      { type: "info", text: "Injecting CSRF tokens and setting HTTP-only cookie headers." },
      { type: "audit", text: "Executing TypeScript type checks and ESLint quality gates." },
      { type: "success", text: "Deployment Ready: Auth layout & actions compiled with zero errors." },
    ],
  },
];

export default function AgentTraceSimulator() {
  const [activePreset, setActivePreset] = useState<string>("stripe");
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const preset = PRESETS.find((p) => p.id === activePreset) || PRESETS[0];

  const resetLogs = () => {
    setLogs([]);
    setCurrentStep(0);
    setIsRunning(false);
  };

  const startSimulation = () => {
    setLogs([]);
    setCurrentStep(0);
    setIsRunning(true);
  };

  useEffect(() => {
    resetLogs();
  }, [activePreset]);

  useEffect(() => {
    if (!isRunning) return;

    if (currentStep < preset.steps.length) {
      const timer = setTimeout(() => {
        const date = new Date();
        const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}.${(date.getMilliseconds() / 10).toFixed(0).padStart(2, "0")}`;
        
        setLogs((prev) => [
          ...prev,
          {
            ...preset.steps[currentStep],
            time: timeStr,
          },
        ]);
        setCurrentStep((prev) => prev + 1);
      }, 900);

      return () => clearTimeout(timer);
    } else {
      setIsRunning(false);
    }
  }, [isRunning, currentStep, activePreset]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "plan":
        return "bg-neutral-800 text-neutral-400 border border-neutral-700";
      case "run":
        return "bg-sky-500/10 text-sky-400 border border-sky-500/25";
      case "audit":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/25";
      case "success":
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold";
      default:
        return "bg-neutral-800 text-neutral-400 border border-neutral-700";
    }
  };

  return (
    <div className="w-full max-w-3xl bg-neutral-950 border border-neutral-800/80 shadow-2xl rounded-2xl overflow-hidden font-mono flex flex-col h-[400px] text-left">
      {/* Console Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-semibold text-neutral-200">
            Agent Reasoning & Swarm Tracing Console
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
        </div>
      </div>

      {/* Preset Selector Panel */}
      <div className="flex flex-wrap gap-2 px-5 py-3.5 bg-neutral-900/40 border-b border-neutral-800/50">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            disabled={isRunning}
            onClick={() => setActivePreset(p.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              activePreset === p.id
                ? "bg-white text-black border-white shadow-md shadow-white/5"
                : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {p.icon}
            {p.title}
          </button>
        ))}
      </div>

      {/* Console Output Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3.5 select-none bg-neutral-950 scrollbar-thin scrollbar-thumb-neutral-800">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-500 text-xs py-10">
            <Cpu className="w-8 h-8 text-neutral-700 animate-pulse" />
            <span>Select a task from the presets above and trigger execution.</span>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-start gap-2 text-xs transition-opacity duration-300 animate-in fade-in slide-in-from-bottom-2"
            >
              <span className="text-neutral-600 select-none flex-shrink-0">
                [{log.time}]
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider flex-shrink-0 ${getBadgeStyle(
                  log.type
                )}`}
              >
                {log.type}
              </span>
              <span className="text-neutral-200 break-words leading-relaxed">
                {log.text}
              </span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>

      {/* Console Controls */}
      <div className="px-5 py-3.5 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest animate-pulse">
                Swarm Engine Executing...
              </span>
            </div>
          ) : currentStep === preset.steps.length && logs.length > 0 ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-semibold">
                Execution Completed
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
              Ready to execute
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <Button
              isIconOnly
              disabled={isRunning}
              onClick={resetLogs}
              size="sm"
              variant="bordered"
              className="border-neutral-800 text-neutral-400 hover:text-white bg-transparent"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            onClick={startSimulation}
            disabled={isRunning}
            className={`font-semibold rounded-full px-5 py-1 text-xs transition-all ${
              isRunning
                ? "bg-neutral-800 text-neutral-500 border border-neutral-700"
                : "bg-white text-black hover:bg-neutral-200"
            }`}
          >
            <Play className="w-3 h-3 mr-1" />
            Run Simulation
          </Button>
        </div>
      </div>
    </div>
  );
}
