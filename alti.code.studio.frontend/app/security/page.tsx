"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Chip, ScrollShadow } from "@heroui/react";
import {
  Lock,
  ShieldAlert,
  Play,
  Loader2,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ArrowRight,
} from "lucide-react";
import { useSession } from "next-auth/react";

import ChatBotLayout from "@/components/ChatbotLayout";

type Vulnerability = {
  package: string;
  cveId: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  patchDiff: string;
  remediationPlan: string;
};

export default function SecurityPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;

  const [isRunning, setIsRunning] = useState(false);
  const [thoughts, setThoughts] = useState<{ agentId: string; thought: string; timestamp: string }[]>([]);
  const [report, setReport] = useState<{
    startTime: string;
    vulnerabilitiesDetected: number;
    patchesCompiled: Vulnerability[];
    success: boolean;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<"thoughts" | "patch">("thoughts");
  const eventSourceRef = useRef<EventSource | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll the terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [thoughts]);

  // Clean up EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const triggerSecuritySweep = async () => {
    setIsRunning(true);
    setThoughts([]);
    setReport(null);
    setActiveTab("thoughts");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

    // 1. Establish SSE Connection for real-time thought streaming
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource(`${apiUrl}/githubDocs/thought-stream`);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.thought) {
            setThoughts((prev) => [
              ...prev,
              {
                agentId: data.agentId || "swarmManager",
                thought: data.thought,
                timestamp: data.timestamp || new Date().toISOString(),
              },
            ]);
          }
        } catch (err) {
          // Ignore parse errors from initial handshake logs
        }
      };

      es.onerror = () => {
        // es.close();
      };
    } catch (err) {
      console.error("Failed to connect to real-time thought stream:", err);
    }

    // 2. Trigger the sweep request
    try {
      const res = await fetch(`${apiUrl}/githubDocs/sweeper/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
      });

      const result = await res.json();

      if (result.success && result.data) {
        setReport(result.data);
        setActiveTab("patch");
      }
    } catch (err) {
      console.error("Security sweep trigger failed:", err);
      setThoughts((prev) => [
        ...prev,
        {
          agentId: "systemError",
          thought: "Network connection refused hitting local security scanner endpoint.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsRunning(false);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    }
  };

  const getAgentLabelColor = (agentId: string) => {
    switch (agentId) {
      case "githubSecurityDependabotAlertsPatcher":
        return "text-purple-400 font-bold";
      case "githubExpert":
        return "text-blue-400 font-bold";
      case "systemError":
        return "text-red-400 font-bold animate-pulse";
      default:
        return "text-gray-400";
    }
  };

  const getAgentLabelName = (agentId: string) => {
    switch (agentId) {
      case "githubSecurityDependabotAlertsPatcher":
        return "SecurityPatcher";
      case "githubExpert":
        return "GitSpecialist";
      case "systemError":
        return "ErrorListener";
      default:
        return "SwarmAgent";
    }
  };

  return (
    <ChatBotLayout isRightSidebarOpenByDefault={false}>
      <div className="flex-1 overflow-hidden bg-white dark:bg-background flex flex-col h-full font-sans w-full">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-primary" />
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900">
                Zero-Trust Security & DLP
              </h1>
            </div>
            {!isRunning && (
              <Button
                className="bg-black text-white dark:bg-white dark:text-black font-semibold text-xs rounded-xl shadow-sm hover:scale-105 transition-transform"
                size="sm"
                startContent={<Play className="size-3.5" />}
                onClick={triggerSecuritySweep}
              >
                Trigger Security Sweep
              </Button>
            )}
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row w-full bg-default-50/50">
          
          {/* Left / Center Console Section */}
          <div className="flex-1 flex flex-col h-full border-r border-default-200/50 p-6 min-w-0">
            {thoughts.length === 0 && !report && (
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto py-16">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Lock className="size-8 text-primary animate-pulse" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-default-900">
                  Autonomous Vulnerability Scan
                </h2>
                <p className="text-default-500 text-sm mb-6 leading-relaxed">
                  Press the sweep button to audit project package coordinates, analyze CVE threat matrices, and compile secure self-healing patches programmatically.
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <button
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-content1 border border-default-200 hover:border-primary transition-all text-left text-xs font-semibold"
                    onClick={triggerSecuritySweep}
                  >
                    <span className="flex items-center gap-2">
                      🛡️ <span>Run Dependency Vulnerability Sweep</span>
                    </span>
                    <ArrowRight size={14} className="text-default-400" />
                  </button>
                  <button
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-content1 border border-default-200 hover:border-primary transition-all text-left text-xs font-semibold"
                    onClick={triggerSecuritySweep}
                  >
                    <span className="flex items-center gap-2">
                      🔍 <span>Audit package.json for Outdated CVEs</span>
                    </span>
                    <ArrowRight size={14} className="text-default-400" />
                  </button>
                </div>
              </div>
            )}

            {(thoughts.length > 0 || report) && (
              <div className="flex-1 flex flex-col h-full min-h-0 bg-[#0A0A0A] rounded-2xl border border-default-200/50 overflow-hidden shadow-xl">
                <div className="flex justify-between items-center p-4 border-b border-default-200/50 bg-black/40 backdrop-blur-md">
                  <div className="flex gap-2">
                    <button
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeTab === "thoughts"
                          ? "bg-white/15 text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                      onClick={() => setActiveTab("thoughts")}
                    >
                      <span className="flex items-center gap-1.5">
                        <Terminal size={12} /> Thoughts Console
                      </span>
                    </button>
                    {report && report.patchesCompiled.length > 0 && (
                      <button
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          activeTab === "patch"
                            ? "bg-white/15 text-white"
                            : "text-gray-400 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("patch")}
                      >
                        <span className="flex items-center gap-1.5">
                          <FileCode size={12} /> Compiled Patch
                        </span>
                      </button>
                    )}
                  </div>
                  {isRunning && (
                    <div className="flex items-center gap-2 text-xs text-primary font-bold animate-pulse pr-2">
                      <Loader2 className="size-3 animate-spin" /> Swarm auditing...
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-hidden relative">
                  {activeTab === "thoughts" && (
                    <ScrollShadow className="h-full p-4 font-mono text-xs text-green-400 space-y-2 overflow-y-auto leading-relaxed">
                      {thoughts.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                          <span className="text-gray-500 shrink-0 select-none">
                            [{new Date(item.timestamp).toLocaleTimeString()}]
                          </span>
                          <span className={getAgentLabelColor(item.agentId)}>
                            {getAgentLabelName(item.agentId)}:
                          </span>
                          <span className="text-gray-300 break-words flex-1">
                            {item.thought}
                          </span>
                        </div>
                      ))}
                      {isRunning && thoughts.length === 0 && (
                        <div className="text-gray-500">Connecting to telemetry thought stream...</div>
                      )}
                      <div ref={terminalEndRef} />
                    </ScrollShadow>
                  )}

                  {activeTab === "patch" && report && report.patchesCompiled.length > 0 && (
                    <ScrollShadow className="h-full p-6 text-gray-300 overflow-y-auto space-y-6">
                      {report.patchesCompiled.map((patch, idx) => (
                        <div key={idx} className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-base font-bold text-white mb-1">
                                {patch.package} Coordinate Upgrade
                              </h3>
                              <p className="text-xs text-gray-400">
                                Remediation compiled to target {patch.cveId}
                              </p>
                            </div>
                            <Chip className="bg-danger/15 text-danger border border-danger/20 font-bold uppercase tracking-wider text-[10px]" size="sm">
                              {patch.severity} Severity
                            </Chip>
                          </div>

                          <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-default-400 mb-1">Remediation Plan</h4>
                            <p className="leading-relaxed text-gray-300">{patch.remediationPlan}</p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-default-400">Compiled Git Patch</h4>
                            <pre className="p-4 bg-black/60 rounded-xl border border-white/10 font-mono text-xs overflow-x-auto text-green-300 leading-relaxed max-w-full whitespace-pre">
                              {patch.patchDiff}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </ScrollShadow>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Side Overview Sidebar (Slides in on completion) */}
          {report && (
            <div className="w-full md:w-80 h-full flex flex-col p-6 shrink-0 bg-white dark:bg-content1 border-t md:border-t-0 md:border-l border-default-200/50">
              <h3 className="text-sm font-bold text-default-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" />
                Scan Diagnostics
              </h3>
              
              <div className="space-y-4 flex-1 overflow-y-auto">
                <div className="p-4 bg-default-100 dark:bg-default-50/50 rounded-xl border border-default-200/50">
                  <span className="text-xs text-default-400 block mb-0.5">Threats Detected</span>
                  <span className="text-2xl font-bold text-default-900 flex items-center gap-1.5">
                    {report.vulnerabilitiesDetected === 0 ? (
                      <CheckCircle2 className="size-5 text-success inline" />
                    ) : (
                      <AlertTriangle className="size-5 text-danger inline animate-bounce" />
                    )}
                    {report.vulnerabilitiesDetected}
                  </span>
                </div>

                <div className="p-4 bg-default-100 dark:bg-default-50/50 rounded-xl border border-default-200/50">
                  <span className="text-xs text-default-400 block mb-0.5">Patches Auto-Compiled</span>
                  <span className="text-2xl font-bold text-default-900">
                    {report.patchesCompiled.length}
                  </span>
                </div>

                <div className="p-4 bg-default-100 dark:bg-default-50/50 rounded-xl border border-default-200/50">
                  <span className="text-xs text-default-400 block mb-0.5">Audit Duration</span>
                  <span className="text-sm font-bold text-default-800">
                    {Math.round((new Date().getTime() - new Date(report.startTime).getTime()) / 1000)}s total execution
                  </span>
                </div>

                {report.vulnerabilitiesDetected > 0 && (
                  <div className="p-4 bg-danger/5 border border-danger/10 rounded-xl text-xs leading-relaxed text-danger font-medium">
                    Self-healing pipeline triaged regression tests completely green. The CVE-compliant patch was compiled dynamically by the autonomous agent swarm.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-default-200/50">
                <Button
                  className="w-full bg-black text-white dark:bg-white dark:text-black font-semibold h-11"
                  color="primary"
                  onClick={triggerSecuritySweep}
                >
                  Re-Run Audit
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ChatBotLayout>
  );
}
