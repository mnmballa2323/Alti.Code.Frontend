"use client";

import React, { useEffect, useState, useRef } from "react";
import { Card, CardBody, Button, Input, Spinner } from "@heroui/react";
import {
  Terminal,
  Bot,
  Wand2,
  Activity,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { swarmAPI } from "@/lib/enterprise-api";

interface LogEntry {
  id: string;
  type: "info" | "success" | "warning" | "error" | "system";
  message: string;
  timestamp: Date;
}

export default function AgentSynthesisStudio() {
  const [domain, setDomain] = useState("");
  const [query, setQuery] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [report, setReport] = useState<any>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll terminal
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Connect to SSE Stream
  useEffect(() => {
    fetchReport();

    const connectSSE = () => {
      const source = new EventSource(swarmAPI.streamUrl);

      eventSourceRef.current = source;

      source.onopen = () => {
        addLog("system", "Connected to Swarm Synthesis Bus...");
      };

      source.addEventListener("synthesis_started", (e) => {
        const data = JSON.parse(e.data);

        addLog(
          "info",
          `Synthesis Commencing: Identifying pathways for [${data.domain}]...`,
        );
      });

      source.addEventListener("synthesis_blocked", (e) => {
        const data = JSON.parse(e.data);

        addLog("warning", `Guardian Audit Blocked Generation: ${data.reason}`);
        setIsSynthesizing(false);
      });

      source.addEventListener("agent_written", (e) => {
        const data = JSON.parse(e.data);

        addLog(
          "info",
          `Transcribing neurological pathways to disk: ${data.filePath}`,
        );
      });

      source.addEventListener("agent_registered", (e) => {
        const data = JSON.parse(e.data);

        addLog(
          "success",
          `Agent [${data.agentName}] successfully hot-loaded and registered in Capability Router!`,
        );
        setIsSynthesizing(false);
        fetchReport();
      });

      source.addEventListener("synthesis_failed", (e) => {
        const data = JSON.parse(e.data);

        addLog("error", `Synthesis aborted: ${data.error}`);
        setIsSynthesizing(false);
      });

      source.onerror = (e) => {
        console.error("SSE Error:", e);
      };
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const fetchReport = async () => {
    try {
      const res = await swarmAPI.synthesisReport();

      setReport(res.data);
    } catch {}
  };

  const addLog = (type: LogEntry["type"], message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        type,
        message,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSynthesize = async () => {
    if (!domain || !query) return;
    setIsSynthesizing(true);
    addLog("system", `Dispatching manual synthesis request for "${domain}"...`);
    try {
      await swarmAPI.synthesize({ domain, triggerQuery: query });
    } catch (e: any) {
      addLog(
        "error",
        `API Request Failed: ${e.response?.data?.error || e.message}`,
      );
      setIsSynthesizing(false);
    }
  };

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "info":
        return <Activity className="w-3.5 h-3.5 text-blue-400" />;
      case "success":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
      case "warning":
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      case "error":
        return <XCircle className="w-3.5 h-3.5 text-red-400" />;
      case "system":
        return <Terminal className="w-3.5 h-3.5 text-fuchsia-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-fuchsia-400" /> Agent Synthesis
            Studio
          </h2>
          <p className="text-sm text-default-400">
            Manually trigger the core LLM intelligence to synthesize, audit, and
            hot-load new specialist capabilities into the swarm.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-center">
            <div className="text-xs text-default-500 uppercase tracking-wider">
              Session Synthesized
            </div>
            <div className="font-mono text-xl text-fuchsia-400">
              {report?.agentsCreatedThisSession || 0}{" "}
              <span className="text-sm text-default-500">
                / {report?.maxPerSession || 10}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Pane: Request Controller */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-white/5 border border-white/10 shadow-lg">
            <CardBody className="p-6 space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-purple-600/20">
                  <Bot className="w-6 h-6 text-fuchsia-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Synthesis Directives</h3>
                  <p className="text-xs text-default-400">
                    Define the specialist parameters
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-default-400 flex items-center mb-1">
                    AGENT DOMAIN{" "}
                    <span className="text-fuchsia-400 ml-1">*</span>
                  </label>
                  <Input
                    classNames={{
                      input: "text-white font-mono",
                      inputWrapper:
                        "bg-black/30 border-white/10 data-[hover=true]:bg-black/40 group-data-[focus=true]:bg-black/50",
                    }}
                    disabled={isSynthesizing}
                    placeholder="e.g. quantum_computing, salesforce, bio_tech"
                    value={domain}
                    variant="bordered"
                    onValueChange={setDomain}
                  />
                </div>

                <div>
                  <label className="text-xs text-default-400 flex items-center mb-1">
                    TRIGGER QUERY / DESCRIPTION{" "}
                    <span className="text-fuchsia-400 ml-1">*</span>
                  </label>
                  <Input
                    classNames={{
                      input: "text-white",
                      inputWrapper:
                        "bg-black/30 border-white/10 data-[hover=true]:bg-black/40 group-data-[focus=true]:bg-black/50",
                    }}
                    disabled={isSynthesizing}
                    placeholder="e.g. Write a script to simulate Shor's algorithm"
                    value={query}
                    variant="bordered"
                    onValueChange={setQuery}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold tracking-wide shadow-lg shadow-fuchsia-500/20"
                    isLoading={isSynthesizing}
                    size="lg"
                    startContent={
                      !isSynthesizing && <Wand2 className="w-4 h-4" />
                    }
                    onPress={handleSynthesize}
                  >
                    {isSynthesizing ? "Synthesizing..." : "COMMENCE SYNTHESIS"}
                  </Button>
                </div>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-2">
                <h4 className="text-xs font-semibold text-default-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" /> Guardian Protected
                </h4>
                <p className="text-xs text-default-500 leading-relaxed">
                  Agents are generated entirely in isolation. The Guardian Agent
                  audits all synthesised code for malicious intentions prior to
                  execution and routing.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Pane: Live Console View */}
        <div className="lg:col-span-8 flex flex-col h-[600px]">
          <div className="bg-slate-950 rounded-t-xl border border-slate-800 p-3 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="ml-3 font-mono text-xs text-slate-500">
                swarm-synthesis-stream // root@alti.code.studio
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSynthesizing && <Spinner color="secondary" size="sm" />}
              <div className="text-[10px] uppercase font-bold text-fuchsia-500/50 bg-fuchsia-500/10 px-2.5 py-1 rounded-sm border border-fuchsia-500/20">
                LIVE
              </div>
            </div>
          </div>

          <div className="flex-1 bg-black/90 rounded-b-xl border-x border-b border-slate-800 p-4 font-mono text-xs overflow-y-auto w-full relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-fuchsia-900/5 pointer-events-none" />

            {logs.length === 0 ? (
              <div className="text-slate-600 h-full flex items-center justify-center italic">
                Waiting for connection...
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 relative z-10"
                  >
                    <div className="shrink-0 mt-0.5">
                      {getLogIcon(log.type)}
                    </div>
                    <div className="shrink-0 text-slate-500">
                      {log.timestamp.toLocaleTimeString(undefined, {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                    <div
                      className={`break-words ${
                        log.type === "error"
                          ? "text-red-400"
                          : log.type === "warning"
                            ? "text-amber-400"
                            : log.type === "success"
                              ? "text-green-400 font-bold"
                              : log.type === "system"
                                ? "text-fuchsia-300"
                                : "text-slate-300"
                      }`}
                    >
                      {log.message}
                    </div>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
