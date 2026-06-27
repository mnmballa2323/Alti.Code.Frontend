"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Search,
  Cpu,
  Play,
  Terminal,
  ChevronRight,
  Info,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { Button, Tooltip, Input, Card, Badge, Spinner } from "@heroui/react";
import Link from "next/link";

interface SpecialistEngine {
  name: string;
  description: string;
  capabilities: string[];
  queue: string;
  version: string;
  isPlugin: boolean;
}

const FALLBACK_ENGINES: SpecialistEngine[] = [
  {
    name: "opencode",
    description: "Autonomous SWE Coding Agent — writes patches, runs builds, triages bugs, implements features.",
    capabilities: ["opencode", "coding-agent", "bug-fix", "patch-generation", "terminal-execution"],
    queue: "opencode-queue",
    version: "1.0.0",
    isPlugin: false,
  },
  {
    name: "openspec",
    description: "Spec-Driven Development Planner — proposes, validates, and archives project specs.",
    capabilities: ["openspec", "spec-driven-development", "sdd", "planning", "proposal", "validation"],
    queue: "openspec-queue",
    version: "1.0.0",
    isPlugin: false,
  },
  {
    name: "website_cloner",
    description: "AI Website Cloner — clones, scraps, and reverse-engineers target websites into Next.js/React templates.",
    capabilities: ["website-cloning", "scraping", "reverse-engineering", "asset-extraction"],
    queue: "cloner-queue",
    version: "1.0.0",
    isPlugin: false,
  },
  {
    name: "auditor",
    description: "Cloud FinOps Auditor — Monthly burn estimation and resource optimization for every mission.",
    capabilities: ["cost-audit", "finops", "resource-governance"],
    queue: "auditor-queue",
    version: "1.0.0",
    isPlugin: false,
  },
];

export default function EnginesPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [engines, setEngines] = useState<SpecialistEngine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<SpecialistEngine | null>(null);

  // Form State parameters
  const [opencodeAction, setOpencodeAction] = useState("runTask");
  const [opencodeTask, setOpencodeTask] = useState("");
  const [opencodeWorkspace, setOpencodeWorkspace] = useState("");

  const [openspecAction, setOpenspecAction] = useState("propose");
  const [openspecName, setOpenspecName] = useState("");
  const [openspecWorkspace, setOpenspecWorkspace] = useState("");

  const [clonerUrl, setClonerUrl] = useState("");
  const [clonerName, setClonerName] = useState("");
  const [clonerWorkspace, setClonerWorkspace] = useState("");

  const [genericQuery, setGenericQuery] = useState("");

  // Terminal Execution Log State
  const [executing, setExecuting] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [execStatus, setExecStatus] = useState<"idle" | "success" | "error">("idle");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  const fetchEngines = async () => {
    try {
      const res = await axios.get(`${API_URL}/engines/list`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (res.data && res.data.success) {
        setEngines(res.data.data);
      } else {
        setEngines(FALLBACK_ENGINES);
      }
    } catch (err) {
      console.error("Failed to fetch engines from API, using fallback data", err);
      setEngines(FALLBACK_ENGINES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngines();
  }, [accessToken]);

  const filteredEngines = engines.filter((e) => {
    const query = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query) ||
      e.capabilities.some((c) => c.toLowerCase().includes(query))
    );
  });

  const runEngineTask = async () => {
    if (!selectedEngine) return;
    setExecuting(true);
    setExecStatus("idle");
    setConsoleLogs([`⏳ Initializing execution thread for Engine: [${selectedEngine.name}]...`]);

    let requestBody: any = {
      action: "default",
      args: {},
    };

    if (selectedEngine.name === "opencode") {
      requestBody.action = opencodeAction;
      requestBody.args = {
        task: opencodeTask,
        workspace: opencodeWorkspace || undefined,
      };
      if (opencodeAction === "getTaskStatus") {
        requestBody.args = { sessionId: opencodeTask }; // sessionId stored in task input field for status lookup
      }
    } else if (selectedEngine.name === "openspec") {
      requestBody.action = openspecAction;
      requestBody.args = {
        name: openspecName,
        workspace: openspecWorkspace || undefined,
      };
    } else if (selectedEngine.name === "website_cloner") {
      requestBody.action = "clone";
      requestBody.args = {
        targetUrl: clonerUrl,
        projectName: clonerName,
        workspace: clonerWorkspace || undefined,
      };
    } else {
      requestBody.action = "run";
      requestBody.args = {
        query: genericQuery,
      };
    }

    try {
      setConsoleLogs((prev) => [...prev, `📤 Sending payload to trigger console endpoint...`]);
      const res = await axios.post(`${API_URL}/engines/${selectedEngine.name}/run`, requestBody, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (res.data && res.data.success) {
        setExecStatus("success");
        setConsoleLogs((prev) => [
          ...prev,
          `✅ Execution Succeeded!`,
          `📝 Response Output:`,
          JSON.stringify(res.data.data, null, 2),
        ]);
      } else {
        throw new Error(res.data.message || "Failed response status");
      }
    } catch (err: any) {
      setExecStatus("error");
      setConsoleLogs((prev) => [
        ...prev,
        `❌ Execution Failed!`,
        `🚨 Error Details: ${err.response?.data?.message || err.message}`,
      ]);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafa] dark:bg-black text-foreground relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {/* Sidebar / Engines Main View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-default-100 p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Cpu className="size-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Workspace Engines</h1>
            </div>
            <p className="text-sm text-default-500">
              Directly supervise and execute registered Swe/Sdd specialist agents on your workspace directory.
            </p>
          </div>
          <Badge variant="flat" color="primary" className="font-bold">
            {engines.length || 216} Engines Available
          </Badge>
        </div>

        {/* Search & Stats Bar */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-default-400" />
            <input
              className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 focus:border-primary/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all text-foreground"
              placeholder="Search by engine name, capabilities, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Engines Grid list */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size="lg" color="primary" label="Loading engine registries..." />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
            {filteredEngines.map((engine) => (
              <Card
                key={engine.name}
                className={`p-6 border border-default-100 hover:border-primary/30 dark:bg-default-50/50 hover:bg-white dark:hover:bg-default-50 transition-all duration-200 flex flex-col justify-between cursor-pointer rounded-2xl group ${
                  selectedEngine?.name === engine.name ? "ring-2 ring-primary border-transparent" : ""
                }`}
                onClick={() => {
                  setSelectedEngine(engine);
                  setConsoleLogs([]);
                  setExecStatus("idle");
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                        <Cpu className="size-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm capitalize group-hover:text-primary transition-colors">
                          {engine.name.replace("_", " ")}
                        </h3>
                        <p className="text-[10px] text-default-400">Queue: {engine.queue}</p>
                      </div>
                    </div>
                    <Badge variant="flat" color="success" size="sm" className="font-semibold uppercase tracking-wider text-[9px]">
                      Standby
                    </Badge>
                  </div>

                  <p className="text-xs text-default-500 line-clamp-2 leading-relaxed">
                    {engine.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-default-100/50 mt-4">
                  <div className="flex flex-wrap gap-1">
                    {engine.capabilities.slice(0, 3).map((cap) => (
                      <span
                        key={cap}
                        className="text-[9px] px-2 py-0.5 rounded-full bg-default-100 dark:bg-default-200 text-default-600 font-semibold"
                      >
                        {cap}
                      </span>
                    ))}
                    {engine.capabilities.length > 3 && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-default-50 text-default-400 font-bold">
                        +{engine.capabilities.length - 3}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="size-4 text-default-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Side-Panel execution Console */}
      <div
        className={`w-[450px] border-l border-default-100 dark:bg-default-50/20 backdrop-blur-md h-full flex flex-col justify-between transition-all duration-300 transform ${
          selectedEngine ? "translate-x-0" : "translate-x-full absolute right-0"
        }`}
      >
        {selectedEngine ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Console Header */}
            <div className="p-6 border-b border-default-100 flex items-center justify-between bg-white/50 dark:bg-default-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/15 text-primary">
                  <Sliders className="size-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm capitalize">{selectedEngine.name.replace("_", " ")} Control Panel</h2>
                  <p className="text-[10px] text-default-400">Trigger sandbox tasks directly</p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => setSelectedEngine(null)}
              >
                <ArrowLeft className="size-4" />
              </Button>
            </div>

            {/* Config Forms Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-default-400 uppercase tracking-wider">Engine Description</h4>
                <p className="text-xs text-default-600 leading-relaxed bg-[#f4f4f5] dark:bg-default-50 p-3.5 rounded-xl border border-default-100">
                  {selectedEngine.description}
                </p>
              </div>

              {/* Dynamic Parameter Options Inputs depending on Engine */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-default-400 uppercase tracking-wider">Execution Arguments</h4>

                {selectedEngine.name === "opencode" && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-default-600">Action Mode</label>
                      <select
                        className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        value={opencodeAction}
                        onChange={(e) => setOpencodeAction(e.target.value)}
                      >
                        <option value="runTask">Run Task (CLI fallback)</option>
                        <option value="getTaskStatus">Get Task Status</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-default-600">
                        {opencodeAction === "getTaskStatus" ? "Session ID" : "Task Instructions / Prompt"}
                      </label>
                      <textarea
                        className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground h-20"
                        placeholder={
                          opencodeAction === "getTaskStatus"
                            ? "Enter the Session ID to query status..."
                            : "Implement database logging middleware..."
                        }
                        value={opencodeTask}
                        onChange={(e) => setOpencodeTask(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-default-600">Workspace Directory Path (Optional)</label>
                      <input
                        className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        placeholder="/Users/michaelmeram/workspace/..."
                        value={opencodeWorkspace}
                        onChange={(e) => setOpencodeWorkspace(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {selectedEngine.name === "openspec" && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-default-600">OpenSpec Action</label>
                      <select
                        className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        value={openspecAction}
                        onChange={(e) => setOpenspecAction(e.target.value)}
                      >
                        <option value="propose">Propose Specification</option>
                        <option value="init">Initialize OpenSpec</option>
                        <option value="list">List Active Specs</option>
                        <option value="validate">Validate Specs</option>
                      </select>
                    </div>

                    {openspecAction === "propose" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-default-600">Proposal Name</label>
                        <input
                          className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                          placeholder="database-logging-spec"
                          value={openspecName}
                          onChange={(e) => setOpenspecName(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-default-600">Workspace Directory Path (Optional)</label>
                      <input
                        className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        placeholder="/Users/michaelmeram/workspace/..."
                        value={openspecWorkspace}
                        onChange={(e) => setOpenspecWorkspace(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {selectedEngine.name === "website_cloner" && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-default-600">Target Website URL</label>
                      <input
                        className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        placeholder="https://example.com"
                        value={clonerUrl}
                        onChange={(e) => setClonerUrl(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-default-600">Project Directory Name</label>
                      <input
                        className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        placeholder="my-cloned-website"
                        value={clonerName}
                        onChange={(e) => setClonerName(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-default-600">Workspace Directory Path (Optional)</label>
                      <input
                        className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        placeholder="/Users/michaelmeram/workspace/..."
                        value={clonerWorkspace}
                        onChange={(e) => setClonerWorkspace(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {!["opencode", "openspec", "website_cloner"].includes(selectedEngine.name) && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-default-600">Task Query Instructions</label>
                    <textarea
                      className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground h-24"
                      placeholder="Instruct the engine..."
                      value={genericQuery}
                      onChange={(e) => setGenericQuery(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Execution Console Terminal Logs View */}
              {consoleLogs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-default-400 uppercase tracking-wider">Console Terminal</h4>
                    {execStatus === "success" && (
                      <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
                        <CheckCircle2 className="size-3" /> COMPLETED
                      </span>
                    )}
                    {execStatus === "error" && (
                      <span className="flex items-center gap-1 text-[10px] text-rose-500 font-bold">
                        <AlertCircle className="size-3" /> FAILED
                      </span>
                    )}
                  </div>
                  <div className="bg-[#1e1e1e] dark:bg-black border border-default-100 rounded-2xl p-4 font-mono text-[10px] text-green-400 space-y-2 max-h-48 overflow-y-auto w-full leading-relaxed shadow-inner">
                    {consoleLogs.map((log, idx) => (
                      <div key={idx} className="whitespace-pre-wrap break-all">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Run Button Footer */}
            <div className="p-6 border-t border-default-100 bg-white/50 dark:bg-default-50/50 flex gap-4">
              <Button
                color="primary"
                className="flex-1 font-semibold rounded-xl text-white flex items-center justify-center gap-2 h-11"
                isDisabled={executing}
                onClick={runEngineTask}
              >
                {executing ? (
                  <>
                    <Spinner size="sm" color="current" /> Running Task...
                  </>
                ) : (
                  <>
                    <Play className="size-4 shrink-0 fill-current" /> Trigger Engine Run
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-default-400 space-y-4">
            <Terminal className="size-8" />
            <span className="text-xs">Select an engine from the catalog list to configure parameters and trigger execution.</span>
          </div>
        )}
      </div>
    </div>
  );
}
