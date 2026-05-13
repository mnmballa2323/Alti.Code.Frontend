"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

import { API_URL } from "@/lib/config";

/** Maximum log entries kept in history — prevents unbounded memory growth. */
const MAX_HISTORY = 500;

interface LogEntry {
  /** Unique key — using a counter instead of array index to avoid React key collisions. */
  id: number;
  type: "command" | "stdout" | "stderr" | "system";
  text: string;
}

interface AgentLog {
  name: string;
  status: string;
  userId: string;
  timestamp: string;
}

let _logCounter = 0;
const nextLogId = () => ++_logCounter;

export const Terminal = () => {
  const [history, setHistory] = useState<LogEntry[]>([
    {
      id: nextLogId(),
      type: "system",
      text: "Alti Code Studio Terminal v1.0.0",
    },
    { id: nextLogId(), type: "system", text: "Connected to Local Shell" },
  ]);
  const [mode, setMode] = useState<"SHELL" | "AGENT">("SHELL");
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);

  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isDebugProcessing, setIsDebugProcessing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Poll observability traces when in AGENT mode
  useEffect(() => {
    if (mode !== "AGENT") return;

    const fetchTraces = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;

        const res = await axios.get(`${API_URL}/observability/traces`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.data?.success && Array.isArray(res.data.data)) {
          // Map backend localTrace format to AgentLog format expected by the UI
          const traces = res.data.data.map((t: any) => ({
            name: t.name || "Unknown Trace",
            status: t.status || "ACTIVE",
            userId: t.userId || "system",
            timestamp: new Date(t.timestamp).toLocaleTimeString(),
          }));

          setAgentLogs(traces);
        }
      } catch (err) {
        // Silently ignore polling errors
      }
    };

    fetchTraces();
    const intervalId = setInterval(fetchTraces, 2000);

    return () => clearInterval(intervalId);
  }, [mode]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  /** Append entries to history, capping at MAX_HISTORY. */
  const appendHistory = useCallback((entries: Omit<LogEntry, "id">[]) => {
    setHistory((prev) => {
      const next = [
        ...prev,
        ...entries.map((e) => ({ ...e, id: nextLogId() })),
      ];

      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
    });
  }, []);

  // Detect errors in latest history entry
  useEffect(() => {
    const last = history[history.length - 1];

    if (
      last?.type === "stderr" ||
      (last?.type === "stdout" && /Error/i.test(last.text))
    ) {
      setLastError(last.text);
    }
  }, [history]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" || isProcessing || !input.trim()) return;

    const command = input.trim();

    setInput("");
    setIsProcessing(true);

    appendHistory([{ type: "command", text: `$ ${command}` }]);

    try {
      const res = await axios.post(`${API_URL}/code-editor/exec`, {
        command,
        // process.cwd() is always '/'; CWD must be tracked server-side per session
        cwd: undefined,
      });

      const { stdout, stderr } = res.data;
      const newEntries: Omit<LogEntry, "id">[] = [];

      if (stdout) newEntries.push({ type: "stdout", text: stdout });
      if (stderr) newEntries.push({ type: "stderr", text: stderr });
      if (newEntries.length) appendHistory(newEntries);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Command failed";

      appendHistory([{ type: "stderr", text: msg }]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  const handleDebug = async () => {
    if (!lastError) return;
    setIsDebugProcessing(true);

    // SSR-safe localStorage access
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    try {
      const response = await axios.post(
        `${API_URL}/debug-agent/debug`,
        { errorLog: lastError, stackTrace: lastError },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );

      if (response.data.success) {
        const analysis = response.data.data;

        appendHistory([
          { type: "system", text: "\n🤖 AI DEBUG ANALYSIS:" },
          { type: "system", text: `Analysis: ${analysis.analysis}` },
          { type: "system", text: `Fix: ${analysis.suggested_fix}` },
        ]);
      }
    } catch {
      appendHistory([{ type: "stderr", text: "Debug Agent check failed." }]);
    } finally {
      setIsDebugProcessing(false);
      setLastError(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] text-gray-300 font-mono text-sm border-t border-gray-800 relative">
      {lastError && (
        <div className="absolute top-2 right-4 z-10">
          <button
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded shadow-md flex items-center gap-2 animate-pulse"
            disabled={isDebugProcessing}
            onClick={handleDebug}
          >
            {isDebugProcessing ? "Debugging..." : "🐞 Debug Error"}
          </button>
        </div>
      )}

      <div className="flex items-center px-4 py-1 bg-[#161b22] border-b border-gray-800 text-xs font-semibold text-gray-400 select-none">
        <span>TERMINAL</span>
      </div>

      {mode === "SHELL" ? (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`
                ${entry.type === "command" ? "text-green-400" : ""}
                ${entry.type === "stderr" ? "text-red-400" : ""}
                ${entry.type === "system" ? "text-blue-400 italic" : ""}
              `}
            >
              {entry.text}
            </div>
          ))}
          <div className="flex items-center mt-2 group">
            <span className="text-green-400 mr-2">$</span>
            <input
              ref={inputRef}
              autoFocus
              autoComplete="off"
              className="flex-1 bg-transparent outline-none border-none text-gray-300 w-full"
              disabled={isProcessing}
              placeholder={isProcessing ? "Processing..." : "Enter command..."}
              spellCheck={false}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      ) : (
        /* AGENT MODE DASHBOARD */
        <div className="absolute inset-0 overflow-y-auto p-4 space-y-2 bg-[#0d1117] top-10">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
            <span>🟢 LIVE AGENT FEED (The Glass Cockpit)</span>
            <span>{agentLogs.length} Active Traces</span>
          </div>

          {agentLogs.length === 0 && (
            <div className="text-gray-600 italic">No active agents...</div>
          )}

          {agentLogs.map((log, i) => (
            <div
              key={i}
              className="bg-[#161b22] p-2 rounded border border-gray-800 text-xs"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-blue-400 font-bold">{log.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] ${log.status === "RUNNING" ? "bg-yellow-900 text-yellow-300" : "bg-green-900 text-green-300"}`}
                >
                  {log.status}
                </span>
              </div>
              <div className="text-gray-400">UserId: {log.userId}</div>
              <div className="text-gray-500 text-[10px] mt-1">
                {log.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mode Switcher */}
      <div className="absolute top-2 right-20 z-10 flex gap-2">
        <button
          className={`text-xs px-2 py-1 rounded border ${mode === "AGENT" ? "bg-purple-900 border-purple-500 text-white" : "bg-[#161b22] border-gray-700 text-gray-400"}`}
          onClick={() => setMode(mode === "SHELL" ? "AGENT" : "SHELL")}
        >
          {mode === "AGENT" ? "🔮 Agent View" : "💻 Shell View"}
        </button>
      </div>
    </div>
  );
};
