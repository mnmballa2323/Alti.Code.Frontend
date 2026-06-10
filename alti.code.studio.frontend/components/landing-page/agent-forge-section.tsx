"use client";

import React, { useState, useEffect } from "react";
import { Play, Sparkles, Check, Loader2 } from "lucide-react";

interface Step {
  id: number;
  label: string;
  status: "idle" | "running" | "success";
  detail: string;
}

export default function AgentForgeSection() {
  const [isForging, setIsForging] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = React.useRef<HTMLDivElement>(null);
  const logIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const stepIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const restartTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const [steps, setSteps] = useState<Step[]>([
    { id: 1, label: "Extract Context & Specs", status: "idle", detail: "" },
    { id: 2, label: "Synthesize Agent Tools", status: "idle", detail: "" },
    { id: 3, label: "Execute Sandbox Tests", status: "idle", detail: "" },
    { id: 4, label: "Deploy to Swarm Mesh", status: "idle", detail: "" },
  ]);

  const runForgeSimulation = () => {
    if (logIntervalRef.current) clearInterval(logIntervalRef.current);
    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

    setIsForging(true);
    setLogs([]);
    setSteps((prev) => prev.map((s) => ({ ...s, status: "idle" })));

    let currentStep = 0;
    const logsList = [
      "Initializing Inso Agent Forge Engine...",
      "Analyzing workspace files: read 12 source files...",
      "Extracted 4 schemas and 18 route definitions.",
      "Generating agent prompt with Vertex AI Gemini 3.1 Pro...",
      "Prompt synthesized. Compiling specialized agent tools...",
      "Injecting safe file read/write guardrails...",
      "Running test suite: 18 unit tests created...",
      "Test 1-18 passed. 100% code coverage achieved.",
      "Generating unique cryptographic identifier...",
      "Broadcasting metadata to gossip mesh (active nodes: 50,000)...",
      "Agent Forge Complete. Agent online.",
    ];

    let logIndex = 0;

    logIntervalRef.current = setInterval(() => {
      if (logIndex < logsList.length) {
        setLogs((prev) => [...prev, logsList[logIndex]]);
        logIndex++;
      }
    }, 400);

    stepIntervalRef.current = setInterval(() => {
      if (currentStep < 4) {
        setSteps((prev) =>
          prev.map((s, idx) => {
            if (idx === currentStep) return { ...s, status: "running" };
            if (idx < currentStep) return { ...s, status: "success" };

            return s;
          }),
        );
        currentStep++;
      } else {
        if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
        if (logIntervalRef.current) clearInterval(logIntervalRef.current);
        setSteps((prev) => prev.map((s) => ({ ...s, status: "success" })));

        restartTimeoutRef.current = setTimeout(() => {
          setIsForging(false);
          runForgeSimulation();
        }, 3000);
      }
    }, 1200);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runForgeSimulation();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (logIntervalRef.current) clearInterval(logIntervalRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    };
  }, []);

  return (
    <section className="w-full py-32 bg-white text-black px-4 sm:px-6 lg:px-8 border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left Side: Copy */}
        <div className="flex flex-col gap-8 lg:order-2 lg:-translate-x-12">
          <div className="flex flex-col gap-6">
            <h3 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-black lg:whitespace-nowrap">
              Autonomous Agent Forge. <br />
              Self Expanding Swarm.
            </h3>
            <p className="text-xl text-gray-500 leading-relaxed font-medium">
              Need a specialized agent for a database migration, custom third
              party integration, or proprietary API? Specify your requirements
              and allow the forge to autonomously construct tools, execute test
              suites, apply strict execution guardrails, and deploy the new
              expert to your active swarm mesh in less than three seconds.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Panel */}
        <div className="w-full flex flex-col gap-4 lg:order-1">
          <div className="w-full max-w-[420px] mx-auto lg:ml-0 lg:mr-auto bg-gray-950 border border-gray-900 rounded-[32px] overflow-hidden shadow-2xl p-6 flex flex-col gap-5 text-white min-h-[370px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-bold text-zinc-400 ml-2 font-mono">
                  Inso Code
                </span>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
                disabled={isForging}
                onClick={runForgeSimulation}
              >
                {isForging ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Forging...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    Compile Agent
                  </>
                )}
              </button>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-auto md:h-[245px]">
              {/* Progress Steps */}
              <div className="md:col-span-6 flex flex-col gap-3 justify-center py-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex gap-4 items-center relative"
                  >
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all duration-300 ${
                          step.status === "success"
                             ? "bg-emerald-500 border-emerald-500 text-white"
                            : step.status === "running"
                              ? "bg-white border-white text-black animate-pulse"
                              : "bg-zinc-900 border-zinc-800 text-zinc-500"
                        }`}
                      >
                        {step.status === "success" ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : step.status === "running" ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          step.id
                        )}
                      </div>
                      {step.id < 4 && (
                        <div
                          className={`w-0.5 h-6 my-0.5 transition-colors duration-500 ${
                            step.status === "success"
                              ? "bg-emerald-500/50"
                              : "bg-zinc-800"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pb-3">
                      <p
                        className={`text-xs font-bold leading-none ${step.status === "running" ? "text-white" : step.status === "success" ? "text-zinc-300" : "text-zinc-500"}`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Console Output */}
              <div className="md:col-span-6 flex flex-col bg-black/40 border border-zinc-800/80 rounded-2xl p-4 font-mono text-[9px] text-zinc-400 select-none overflow-hidden h-[180px] md:h-full relative">
                <div className="absolute top-2 right-3 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded border border-zinc-800 text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                  <Sparkles className="w-2.5 h-2.5 text-zinc-500" />
                  Logs
                </div>
                <div
                  ref={logContainerRef}
                  className="flex-1 overflow-y-auto space-y-1.5 pr-2 pt-2 scrollbar-thin"
                >
                  {logs.length === 0 && (
                    <span className="text-zinc-600 block animate-pulse">
                      Waiting to start forge...
                    </span>
                  )}
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`leading-relaxed transition-all duration-300 ${
                        index === logs.length - 1
                          ? "text-emerald-400 font-bold"
                          : "text-zinc-400"
                      }`}
                    >
                      <span className="text-zinc-600 mr-1.5 select-none">
                        &gt;
                      </span>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
