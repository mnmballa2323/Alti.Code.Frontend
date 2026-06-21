"use client";

/**
 * Studio Code Browser Page — v6.7.0
 *
 * Three-pane layout:
 *   LEFT   — File browser: sprint selector + file list with CREATED/MODIFIED badges
 *   CENTER — Monaco Editor: view/edit selected file + Diff toggle + AI Suggest
 *   BOTTOM — Terminal: secured shell (allowlisted commands)
 *
 * API calls:
 *   GET  /api/v1/code-browser/sprint/:id/files  → file list
 *   GET  /api/v1/code-browser/file?path=        → file content + language
 *   GET  /api/v1/code-browser/diff?path=        → git diff string
 *   POST /api/v1/code-browser/patch             → push edited content (Guardian-gated)
 *   POST /api/v1/code-browser/suggest           → inline Gemini suggestion on selection
 *   POST /api/v1/code-editor/exec               → terminal command (allowlisted)
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";

import { API_URL } from "@/lib/config";
import GlassBoxGraph from "@/components/GlassBoxGraph";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface FileEntry {
  path: string;
  status: "CREATED" | "MODIFIED" | "HEALED" | "FAILED" | "CHANGED" | "DELETED";
}
interface TerminalLine {
  id: number;
  type:
    | "command"
    | "stdout"
    | "stderr"
    | "system"
    | "agent_message"
    | "tool_call"
    | "tool_result";
  text: string;
  toolData?: any;
}

let _lineId = 0;
const nid = () => ++_lineId;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

const STATUS_COLORS: Record<string, string> = {
  CREATED: "bg-green-500/20 text-green-400",
  MODIFIED: "bg-blue-500/20 text-blue-400",
  HEALED: "bg-orange-500/20 text-orange-400",
  FAILED: "bg-red-500/20 text-red-400",
  DELETED: "bg-red-500/20 text-red-300 line-through",
  CHANGED: "bg-purple-500/20 text-purple-400",
};

// ─────────────────────────────────────────────────────────────────────────────
// File Browser Panel
// ─────────────────────────────────────────────────────────────────────────────
function FileBrowser({
  files,
  selectedPath,
  onSelect,
}: {
  files: FileEntry[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-r border-white/10">
      <div className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider border-b border-white/10">
        Sprint Files ({files.length})
      </div>
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <p className="text-xs text-white/20 italic p-3">
            No files — select a sprint above
          </p>
        ) : (
          files.map((f) => (
            <button
              key={f.path}
              className={`w-full text-left px-3 py-2 text-xs font-mono hover:bg-white/5 transition-colors border-b border-white/5 ${selectedPath === f.path ? "bg-indigo-600/20" : ""}`}
              onClick={() => onSelect(f.path)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/70 truncate">
                  {f.path.split("/").pop()}
                </span>
                <span
                  className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-semibold ${STATUS_COLORS[f.status] ?? "bg-white/10 text-white/50"}`}
                >
                  {f.status}
                </span>
              </div>
              <span className="text-white/25 text-[10px] truncate block">
                {f.path}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Terminal Panel
// ─────────────────────────────────────────────────────────────────────────────
function TerminalPanel() {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: nid(),
      type: "system",
      text: "Inso Code Terminal v6.7.0 · Secured Shell",
    },
    {
      id: nid(),
      type: "system",
      text: "Allowed: npm test, npm run lint, git status, npx vitest, ls, pwd",
    },
  ]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  const run = async (cmd: string) => {
    setLines((p) => [...p, { id: nid(), type: "command", text: `$ ${cmd}` }]);
    setRunning(true);
    try {
      const r = await api("/api/v1/code-browser/exec", "POST", {
        command: cmd,
      });

      if (r.stdout)
        setLines((p) => [...p, { id: nid(), type: "stdout", text: r.stdout }]);
      if (r.stderr)
        setLines((p) => [...p, { id: nid(), type: "stderr", text: r.stderr }]);
    } catch (e: any) {
      setLines((p) => [...p, { id: nid(), type: "stderr", text: e.message }]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] font-mono text-sm">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1">
        {lines.map((l) => (
          <div
            key={l.id}
            className={
              l.type === "command"
                ? "text-green-400"
                : l.type === "stderr"
                  ? "text-red-400"
                  : l.type === "system"
                    ? "text-blue-400 italic text-xs"
                    : "text-white/70"
            }
          >
            {l.text}
          </div>
        ))}
      </div>
      <div className="flex items-center border-t border-white/10 px-3 py-2">
        <span className="text-green-400 mr-2">$</span>
        <input
          autoFocus
          className="flex-1 bg-transparent outline-none text-white/80 text-sm"
          disabled={running}
          placeholder={running ? "Running…" : "Enter command…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim() && !running) {
              run(input.trim());
              setInput("");
            }
          }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Co-Work Chat Panel (Open-Claude Integration)
// ─────────────────────────────────────────────────────────────────────────────
function CoWorkChatPanel() {
  const [messages, setMessages] = useState<TerminalLine[]>([
    {
      id: nid(),
      type: "system",
      text: "Open-Claude Co-Work Nexus · Connected to Swarm",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (text: string) => {
    setMessages((p) => [...p, { id: nid(), type: "command", text }]);
    setLoading(true);
    // Simulate streaming and visual tool cards
    setTimeout(() => {
      setMessages((p) => [
        ...p,
        {
          id: nid(),
          type: "agent_message",
          text: "I'll fetch that Jira ticket and update Notion for you right now.",
        },
        {
          id: nid(),
          type: "tool_call",
          text: "Executed Jira.GetTicket",
          toolData: {
            app: "Jira",
            action: "GetTicket",
            params: { issue: "PROJ-123" },
          },
        },
      ]);
      setTimeout(() => {
        setMessages((p) => [
          ...p,
          {
            id: nid(),
            type: "tool_result",
            text: "Ticket found. Updating Notion.",
            toolData: {
              app: "Notion",
              action: "AppendBlock",
              status: "Success",
            },
          },
          {
            id: nid(),
            type: "agent_message",
            text: "✅ Done! The Notion doc has been updated with the latest Jira status.",
          },
        ]);
        setLoading(false);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] font-sans text-sm">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.type === "command" ? "items-end" : "items-start"}`}
          >
            {m.type === "command" && (
              <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                {m.text}
              </div>
            )}
            {m.type === "system" && (
              <div className="text-xs text-white/40 italic flex w-full justify-center my-2">
                {m.text}
              </div>
            )}
            {m.type === "agent_message" && (
              <div className="bg-[#2a2a3e] border border-white/5 text-white/90 px-4 py-2 rounded-2xl rounded-bl-sm max-w-[80%] shadow-lg">
                <div className="text-[10px] text-indigo-400 font-bold mb-1 tracking-wider uppercase">
                  Claude 3.5 Sonnet
                </div>
                {m.text}
              </div>
            )}
            {(m.type === "tool_call" || m.type === "tool_result") &&
              m.toolData && (
                <div className="w-full max-w-[80%] mt-2 border border-white/10 bg-[#0d1117] rounded-lg overflow-hidden shadow-2xl">
                  <div className="bg-white/5 px-3 py-1.5 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${m.type === "tool_call" ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}
                      />
                      <span className="text-xs font-mono text-white/60">
                        {m.toolData.app} · {m.toolData.action}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase text-white/30 tracking-widest">
                      Local Router
                    </span>
                  </div>
                  <div className="p-3 text-xs font-mono text-white/50">
                    {JSON.stringify(
                      m.toolData.params || { result: m.toolData.status },
                      null,
                      2,
                    )}
                  </div>
                </div>
              )}
          </div>
        ))}
      </div>
      <div className="flex items-center bg-[#2a2a3e] p-2 m-3 rounded-xl border border-white/10 focus-within:border-indigo-500/50 transition-colors shadow-lg">
        <input
          className="flex-1 bg-transparent outline-none text-white/90 text-sm px-2"
          disabled={loading}
          placeholder={
            loading
              ? "Claude is working..."
              : "Ask Claude to perform a task (e.g. check Jira)..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim() && !loading) {
              send(input.trim());
              setInput("");
            }
          }}
        />
        <button
          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg p-1.5 px-3 transition-colors disabled:opacity-50"
          disabled={loading || !input.trim()}
          onClick={() => {
            if (input.trim() && !loading) {
              send(input.trim());
              setInput("");
            }
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenWork Subagent Panel (Phase 12)
// ─────────────────────────────────────────────────────────────────────────────
function OpenWorkPanel() {
  const [tasks, setTasks] = useState<
    {
      id: number;
      title: string;
      status: "pending" | "running" | "done";
      subagent: string;
    }[]
  >([
    {
      id: 1,
      title: "Analyze existing codebase schema",
      status: "done",
      subagent: "ArchitectAgent",
    },
    {
      id: 2,
      title: "Draft API routing table for Subagents",
      status: "running",
      subagent: "PlannerAgent",
    },
    {
      id: 3,
      title: "Execute refactor sequence",
      status: "pending",
      subagent: "SurgeonAgent",
    },
  ]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e2e] font-sans text-sm p-4 overflow-y-auto">
      <div className="text-xs text-white/50 mb-4 uppercase tracking-wider font-semibold">
        LangChain deepagentsjs Execution Matrix
      </div>
      <div className="space-y-3">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between bg-[#2a2a3e] p-3 rounded-xl border border-white/5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${t.status === "done" ? "bg-emerald-500" : t.status === "running" ? "bg-amber-500 animate-pulse" : "bg-white/20"}`}
              />
              <div>
                <div className="text-white/90 text-sm font-medium">
                  {t.title}
                </div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">
                  Assigned: {t.subagent}
                </div>
              </div>
            </div>
            <div className="text-xs font-mono text-white/50">
              {t.status === "done"
                ? "[COMPLETED]"
                : t.status === "running"
                  ? "[EXECUTING...]"
                  : "[QUEUED]"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Open-Inspect Multiplayer Background Session (Phase 2 & 3)
// ─────────────────────────────────────────────────────────────────────────────
function OpenInspectSessionPanel() {
  const [messages, setMessages] = useState<TerminalLine[]>([
    {
      id: nid(),
      type: "system",
      text: "Open-Inspect Multiplayer Background Session · Cloudflare Control Plane",
    },
    {
      id: nid(),
      type: "system",
      text: "Type /dispatch to start a new background agent session on Modal.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (text: string) => {
    setMessages((p) => [...p, { id: nid(), type: "command", text }]);
    setLoading(true);

    if (text.startsWith("/dispatch")) {
      setTimeout(() => {
        setMessages((p) => [
          ...p,
          {
            id: nid(),
            type: "agent_message",
            text: "Dispatching sandbox environment to Modal architecture...",
          },
          {
            id: nid(),
            type: "system",
            text: "Status: Provisioning isolated Docker environment.",
          },
        ]);
        setTimeout(() => {
          setMessages((p) => [
            ...p,
            {
              id: nid(),
              type: "agent_message",
              text: "✅ Modal Container Ready. Multiplayer session established.",
            },
            {
              id: nid(),
              type: "system",
              text: "WebSocket connected. You can now chat in real-time.",
            },
          ]);
          setLoading(false);
        }, 1500);
      }, 1000);

      return;
    }

    setTimeout(() => {
      setMessages((p) => [
        ...p,
        {
          id: nid(),
          type: "agent_message",
          text: "Analyzing task in background sandbox...",
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] font-sans text-sm">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.type === "command" ? "items-end" : "items-start"}`}
          >
            {m.type === "command" && (
              <div className="bg-sky-600 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                {m.text}
              </div>
            )}
            {m.type === "system" && (
              <div className="text-xs text-white/40 italic flex w-full justify-center my-2">
                {m.text}
              </div>
            )}
            {m.type === "agent_message" && (
              <div className="bg-[#1f2937] border border-white/5 text-white/90 px-4 py-2 rounded-2xl rounded-bl-sm max-w-[80%] shadow-lg">
                <div className="text-[10px] text-sky-400 font-bold mb-1 tracking-wider uppercase">
                  Background Agent
                </div>
                {m.text}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center bg-[#1f2937] p-2 m-3 rounded-xl border border-white/10 focus-within:border-sky-500/50 transition-colors shadow-lg">
        <input
          className="flex-1 bg-transparent outline-none text-white/90 text-sm px-2"
          disabled={loading}
          placeholder={
            loading
              ? "Background agent is working..."
              : "Send a message to the shared session (or type /dispatch)..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim() && !loading) {
              send(input.trim());
              setInput("");
            }
          }}
        />
        <button
          className="bg-sky-600 hover:bg-sky-500 text-white rounded-lg p-1.5 px-3 transition-colors disabled:opacity-50"
          disabled={loading || !input.trim()}
          onClick={() => {
            if (input.trim() && !loading) {
              send(input.trim());
              setInput("");
            }
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PentAGI Security Session (Phase 3)
// ─────────────────────────────────────────────────────────────────────────────
function PentagiSessionPanel() {
  const [messages, setMessages] = useState<TerminalLine[]>([
    {
      id: nid(),
      type: "system",
      text: "PentAGI Autonomous Security Engine · Isolated Docker Sandbox",
    },
    {
      id: nid(),
      type: "system",
      text: "Type a target or objective (e.g. 'Scan backend for OWASP Top 10 vulnerabilities' or a URL).",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (text: string) => {
    setMessages((p) => [...p, { id: nid(), type: "command", text }]);
    setLoading(true);

    setTimeout(() => {
      setMessages((p) => [
        ...p,
        {
          id: nid(),
          type: "agent_message",
          text: `Dispatching penetration testing flow for objective: "${text}"`,
        },
        {
          id: nid(),
          type: "system",
          text: "Status: Orchestrator is provisioning pgvector and scraper agents.",
        },
      ]);
      setTimeout(() => {
        setMessages((p) => [
          ...p,
          {
            id: nid(),
            type: "agent_message",
            text: "✅ PentAGI flow running. Live report streaming enabled.",
          },
        ]);
        setLoading(false);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] font-sans text-sm">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.type === "command" ? "items-end" : "items-start"}`}
          >
            {m.type === "command" && (
              <div className="bg-red-900/60 border border-red-500/30 text-white px-4 py-2 rounded-2xl rounded-br-sm max-w-[80%]">
                {m.text}
              </div>
            )}
            {m.type === "system" && (
              <div className="text-xs text-white/40 italic flex w-full justify-center my-2">
                {m.text}
              </div>
            )}
            {m.type === "agent_message" && (
              <div className="bg-[#1f2937] border border-red-500/30 text-white/90 px-4 py-2 rounded-2xl rounded-bl-sm max-w-[80%] shadow-lg">
                <div className="text-[10px] text-red-500 font-bold mb-1 tracking-wider uppercase">
                  PentAGI Orchestrator
                </div>
                {m.text}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center bg-[#1f2937] p-2 m-3 rounded-xl border border-white/10 focus-within:border-red-500/50 transition-colors shadow-lg">
        <input
          className="flex-1 bg-transparent outline-none text-white/90 text-sm px-2"
          disabled={loading}
          placeholder={
            loading
              ? "Securing perimeter..."
              : "Enter penetration test target or objective..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim() && !loading) {
              send(input.trim());
              setInput("");
            }
          }}
        />
        <button
          className="bg-red-600 hover:bg-red-500 text-white rounded-lg p-1.5 px-3 transition-colors disabled:opacity-50 flex items-center gap-2"
          disabled={loading || !input.trim()}
          onClick={() => {
            if (input.trim() && !loading) {
              send(input.trim());
              setInput("");
            }
          }}
        >
          <span>Exploit</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FossFLOW Architecture Designer (Phase 5)
// ─────────────────────────────────────────────────────────────────────────────
function FossflowSessionPanel() {
  return (
    <div className="flex flex-col h-full w-full bg-[#111827] relative">
      <iframe
        className="w-full h-full border-none"
        src="http://localhost:8090"
        title="FossFLOW Dashboard"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function StudioFilesPage() {
  const [sprintId, setSprintId] = useState("latest");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [diffContent, setDiffContent] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [showGlassBox, setShowGlassBox] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [activePane, setActivePane] = useState<
    "terminal" | "cowork" | "openwork" | "openinspect" | "pentagi" | "fossflow"
  >("terminal");

  const [showClawHubModal, setShowClawHubModal] = useState(false);
  const [showMoltworkerModal, setShowMoltworkerModal] = useState(false);
  const [moltworkerUrl, setMoltworkerUrl] = useState("");
  const [moltworkerToken, setMoltworkerToken] = useState("");
  const [clawHubSkills, setClawHubSkills] = useState<any[]>([]);
  const [clawHubLoading, setClawHubLoading] = useState(false);
  const [hitlAlert, setHitlAlert] = useState<{
    action: string;
    risk: string;
    reason: string;
  } | null>(null);

  const editorRef = useRef<any>(null);

  const openClawHub = async () => {
    setShowClawHubModal(true);
    if (clawHubSkills.length === 0) {
      setClawHubLoading(true);
      try {
        if ((window as any).electron?.invoke) {
          const res = await (window as any).electron.invoke(
            "openclaw:fetch-skills",
          );

          if (res.success) setClawHubSkills(res.data);
          else toast.error("Failed to fetch skills: " + res.error);
        }
      } catch (e: any) {
        toast.error("Error communicating with Electron Main: " + e.message);
      } finally {
        setClawHubLoading(false);
      }
    }
  };

  const installSkill = async (skill: any) => {
    // Optimistic UI Update Mock
    setClawHubSkills((prev) =>
      prev.map((s) => (s.id === skill.id ? { ...s, installed: true } : s)),
    );
    const loadingToast = toast.loading(
      `Installing ${skill.name} into Moltbot...`,
    );

    try {
      if ((window as any).electron?.invoke) {
        const res = await (window as any).electron.invoke(
          "openclaw:install-skill",
          skill,
        );

        if (res.success) {
          toast.success(res.message);
        } else {
          toast.error("Installation failed.");
          // Revert on fail
          setClawHubSkills((prev) =>
            prev.map((s) =>
              s.id === skill.id ? { ...s, installed: false } : s,
            ),
          );
        }
      }
    } catch (e) {
      // Revert on fail
      setClawHubSkills((prev) =>
        prev.map((s) => (s.id === skill.id ? { ...s, installed: false } : s)),
      );
    } finally {
      toast.dismiss(loadingToast);
    }
  };



  const saveMoltworkerConfig = async () => {
    try {
      const r = await api("/api/v1/openclaw/config", "POST", {
        url: moltworkerUrl,
        token: moltworkerToken,
      });

      if (r.success) {
        toast.success(r.message);
        setShowMoltworkerModal(false);
      } else {
        toast.error("Failed to reconfigure OpenClaw target.");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    // Listen for HITL alerts from the main process
    if ((window as any).electron?.receive) {
      (window as any).electron.receive("openwork:hitl-alert", (data: any) => {
        setHitlAlert(data);
      });
    }
  }, []);

  const resolveHitl = (approved: boolean) => {
    if ((window as any).electron?.send) {
      (window as any).electron.send("openwork:hitl-resolve", { approved });
      toast(approved ? "HITL action approved." : "HITL action rejected.");
    }
    setHitlAlert(null);
  };

  // Load sprint files
  const loadFiles = useCallback(async (sid: string) => {
    const r = await api(`/api/v1/code-browser/sprint/${sid}/files`).catch(
      () => null,
    );

    setFiles(r?.data ?? []);
  }, []);

  useEffect(() => {
    loadFiles(sprintId);
  }, [sprintId, loadFiles]);

  // Load file on selection
  const selectFile = useCallback(async (filePath: string) => {
    setSelectedPath(filePath);
    setShowDiff(false);
    setShowGlassBox(false);
    setSuggestion(null);
    const r = await api(
      `/api/v1/code-browser/file?path=${encodeURIComponent(filePath)}`,
    ).catch(() => null);

    if (r?.success) {
      setFileContent(r.data.content);
      setLanguage(r.data.language);
    } else toast.error("Failed to read file");
  }, []);

  // Load diff
  const loadDiff = useCallback(async () => {
    if (!selectedPath) return;
    const r = await api(
      `/api/v1/code-browser/diff?path=${encodeURIComponent(selectedPath)}`,
    ).catch(() => null);

    setDiffContent(r?.data ?? "(diff unavailable)");
    setShowDiff(true);
  }, [selectedPath]);

  // Save patch
  const savePatch = useCallback(async () => {
    if (!selectedPath) return;
    setIsSaving(true);
    try {
      const r = await api("/api/v1/code-browser/patch", "POST", {
        filePath: selectedPath,
        content: fileContent,
      });

      if (r.success)
        toast.success(`Patch applied (Guardian score: ${r.data.auditScore})`);
      else toast.error(`Patch rejected: ${r.message}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  }, [selectedPath, fileContent]);

  // Inline LLM suggest on selection
  const handleSuggest = useCallback(async () => {
    if (!instruction.trim()) return toast.error("Enter an instruction first.");
    const editor = editorRef.current;
    const selectedCode = editor?.getSelection
      ? (editor.getModel()?.getValueInRange(editor.getSelection()) ??
        fileContent)
      : fileContent;

    setIsSuggesting(true);
    setSuggestion(null);
    try {
      const r = await api("/api/v1/code-browser/suggest", "POST", {
        code: selectedCode,
        instruction,
        language,
      });

      if (r.success) setSuggestion(r.data.suggestion);
      else toast.error(r.message);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSuggesting(false);
    }
  }, [instruction, fileContent, language]);

  const applySuggestion = () => {
    if (suggestion) {
      setFileContent(suggestion);
      setSuggestion(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#050510] text-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 bg-[#0d1117] shrink-0">
        <h1 className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Studio · Code Browser
        </h1>
        <div className="flex items-center gap-2">
          <label className="text-xs text-white/40">Sprint ID:</label>
          <input
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white w-32 focus:outline-none focus:border-indigo-500"
            value={sprintId}
            onBlur={() => loadFiles(sprintId)}
            onChange={(e) => setSprintId(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            className="text-xs px-3 py-1 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/30 rounded-lg transition-colors ml-4"
            onClick={openClawHub}
          >
            🧩 ClawHub Skills
          </button>
          <button
            className="text-xs px-3 py-1 bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/30 rounded-lg transition-colors"
            onClick={() => setShowMoltworkerModal(true)}
          >
            ☁️ Moltworker Edge
          </button>

        </div>

        {selectedPath && (
          <>
            <span className="text-xs text-white/40 font-mono truncate max-w-xs">
              {selectedPath}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${showGlassBox ? "bg-purple-600 text-white" : "bg-white/10 hover:bg-white/20"}`}
                onClick={() => {
                  setShowGlassBox(!showGlassBox);
                  setShowDiff(false);
                }}
              >
                {showGlassBox ? "Hide Trace" : "Glass Box Trace"}
              </button>
              <button
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${showDiff ? "bg-indigo-600 text-white" : "bg-white/10 hover:bg-white/20"}`}
                onClick={() => {
                  setShowDiff(!showDiff);
                  setShowGlassBox(false);
                }}
              >
                {showDiff ? "Hide Diff" : "Show Diff"}
              </button>
              {!showDiff && !showGlassBox && (
                <button
                  className="text-xs px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                  onClick={loadDiff}
                >
                  Load Diff
                </button>
              )}
              <button
                className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
                disabled={isSaving}
                onClick={savePatch}
              >
                {isSaving ? "Saving…" : "💾 Save Patch"}
              </button>
            </div>
          </>
        )}
      </div>



      {/* ClawHub Marketplace Modal */}
      {showClawHubModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-[#1e1e2e] border border-white/10 rounded-2xl p-6 shadow-2xl w-[900px] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
                  🧩 OpenClaw Skills (ClawHub)
                </h2>
                <p className="text-sm text-white/50 mt-1">
                  Install community extensions into your local Moltbot surrogate
                  directly from the awesome registry.
                </p>
              </div>
              <button
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white/60"
                onClick={() => setShowClawHubModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {clawHubLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-white/40">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
                  Fetching the awesome list from GitHub...
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {clawHubSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="bg-[#2a2a3e] border border-white/5 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/30 transition-colors group"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3
                            className="font-semibold text-white/90 truncate mr-2"
                            title={skill.name}
                          >
                            {skill.name}
                          </h3>
                          <span className="text-[10px] uppercase font-mono tracking-widest bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded shrink-0">
                            {skill.category}
                          </span>
                        </div>
                        <p
                          className="text-xs text-white/60 line-clamp-2 mb-4"
                          title={skill.description}
                        >
                          {skill.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <a
                          className="text-[10px] text-blue-400 hover:underline"
                          href={skill.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          View Repository
                        </a>
                        <button
                          className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-all ${
                            skill.installed
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 pointer-events-none"
                              : "bg-white/10 hover:bg-cyan-600 hover:text-white border border-white/10 hover:border-cyan-500 text-white/70"
                          }`}
                          disabled={skill.installed}
                          onClick={() => installSkill(skill)}
                        >
                          {skill.installed ? "Installed ✓" : "Add to Moltbot"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Moltworker Edge Configuration Modal */}
      {showMoltworkerModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e1e2e] border border-orange-500/20 rounded-xl p-6 shadow-2xl w-[450px]">
            <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2 mb-2">
              <span className="text-2xl">☁️</span> Cloudflare Moltworker
            </h2>
            <p className="text-xs text-white/50 mb-4">
              Switch the internal Swarm Surrogate target from your localhost
              environment to a remotely hosted Cloudflare Worker edge function.
            </p>

            <label className="text-xs text-white/40 mb-1 block">
              Worker Edge URL (https://...)
            </label>
            <input
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 mb-4"
              placeholder="Leave blank to revert to localhost"
              type="text"
              value={moltworkerUrl}
              onChange={(e) => setMoltworkerUrl(e.target.value)}
            />

            <label className="text-xs text-white/40 mb-1 block">
              Cloudflare Access Token (Optional)
            </label>
            <input
              className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 mb-6"
              placeholder="Bearer Token for Zero Trust Access"
              type="password"
              value={moltworkerToken}
              onChange={(e) => setMoltworkerToken(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-1.5 text-xs text-white/60 hover:text-white transition-colors"
                onClick={() => setShowMoltworkerModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1.5 text-xs bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 border border-orange-500/30 rounded-lg transition-colors"
                onClick={saveMoltworkerConfig}
              >
                Configure Edge Proxy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HITL Alert Modal */}
      {hitlAlert && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-[#1e1e2e] border border-red-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)] w-[500px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <span className="text-xl">🛡️</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-400">
                  Human-in-the-Loop Intercept
                </h2>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-red-500/80 bg-red-500/10 px-2 py-0.5 rounded">
                  Risk Level: {hitlAlert.risk}
                </span>
              </div>
            </div>

            <p className="text-sm text-white/80 mb-4">
              The local OpenWork Engine (LangChain) has requested to execute a
              potentially dangerous system action. Your explicit approval is
              required to proceed.
            </p>

            <div className="bg-black/50 p-4 rounded-xl border border-white/5 mb-4 font-mono text-xs">
              <div className="text-white/40 mb-1">Requested Action:</div>
              <div className="text-amber-400 break-all">{hitlAlert.action}</div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex gap-3 items-start mb-6">
              <span className="text-red-400">⚠️</span>
              <p className="text-xs text-red-200 mt-0.5">{hitlAlert.reason}</p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                className="px-5 py-2 text-sm font-semibold bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
                onClick={() => resolveHitl(false)}
              >
                Reject Execution
              </button>
              <button
                className="px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors shadow-lg shadow-red-500/20"
                onClick={() => resolveHitl(true)}
              >
                I Understand, Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File browser — left column */}
        <div className="w-64 shrink-0">
          <FileBrowser
            files={files}
            selectedPath={selectedPath}
            onSelect={selectFile}
          />
        </div>

        {/* Editor + Terminal — center/right */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* AI Suggest bar */}
          {selectedPath && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border-b border-white/10 shrink-0">
              <span className="text-xs text-white/40 shrink-0">
                ✨ AI Suggest:
              </span>
              <input
                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="e.g. Add error handling, optimize the loop, add JSDoc…"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSuggest();
                }}
              />
              <button
                className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                disabled={isSuggesting}
                onClick={handleSuggest}
              >
                {isSuggesting ? "Thinking…" : "Ask Gemini"}
              </button>
            </div>
          )}

          {/* Suggestion overlay */}
          {suggestion && (
            <div className="bg-purple-900/30 border border-purple-500/30 px-3 py-2 flex items-start gap-3 shrink-0">
              <pre className="text-xs text-purple-200 flex-1 overflow-x-auto max-h-24">
                {suggestion.substring(0, 500)}
                {suggestion.length > 500 ? "…" : ""}
              </pre>
              <div className="flex gap-2 shrink-0">
                <button
                  className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded transition-colors"
                  onClick={applySuggestion}
                >
                  Apply
                </button>
                <button
                  className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                  onClick={() => setSuggestion(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Monaco or Diff — 60% height */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {!selectedPath ? (
              <div className="h-full flex items-center justify-center text-white/20 text-sm italic">
                Select a sprint and a file to start editing
              </div>
            ) : showGlassBox ? (
              <div className="h-full w-full">
                <GlassBoxGraph />
              </div>
            ) : showDiff ? (
              <pre className="h-full overflow-auto p-4 text-xs font-mono bg-[#0d1117] text-white/70">
                {diffContent ?? "Loading diff…"}
              </pre>
            ) : (
              <Editor
                height="100%"
                language={language}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "Fira Code, monospace",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
                theme="vs-dark"
                value={fileContent}
                onChange={(val) => setFileContent(val ?? "")}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            )}
          </div>

          {/* Bottom Pane (Terminal / Co-Work) — 40% height */}
          <div className="h-64 border-t border-white/10 shrink-0 flex flex-col bg-[#0d1117]">
            <div className="flex items-center border-b border-white/10 px-2 pt-2 bg-[#050505]">
              <button
                className={`px-4 py-1.5 text-xs font-mono rounded-t-lg transition-colors ${activePane === "terminal" ? "bg-[#0d1117] text-white border-t border-l border-r border-white/10" : "text-white/40 hover:text-white/70"}`}
                onClick={() => setActivePane("terminal")}
              >
                Secure Shell
              </button>
              <button
                className={`px-4 py-1.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${activePane === "cowork" ? "bg-[#1e1e2e] text-indigo-400 border-t border-l border-r border-indigo-500/30" : "text-white/40 hover:text-white/70"}`}
                onClick={() => setActivePane("cowork")}
              >
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Open-Claude Co-Work
              </button>
              <button
                className={`px-4 py-1.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${activePane === "openwork" ? "bg-[#1e1e2e] text-emerald-400 border-t border-l border-r border-emerald-500/30" : "text-white/40 hover:text-white/70"}`}
                onClick={() => setActivePane("openwork")}
              >
                <div className="w-2 h-2 rounded-sm bg-emerald-500" />
                OpenWork Engine
              </button>
              <button
                className={`px-4 py-1.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${activePane === "openinspect" ? "bg-[#1f2937] text-sky-400 border-t border-l border-r border-sky-500/30" : "text-white/40 hover:text-white/70"}`}
                onClick={() => setActivePane("openinspect")}
              >
                <div className="w-2 h-2 rounded-sm bg-sky-500" />
                Open-Inspect Session
              </button>
              <button
                className={`px-4 py-1.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${activePane === "pentagi" ? "bg-[#1f2937] text-red-500 border-t border-l border-r border-red-500/50" : "text-white/40 hover:text-white/70"}`}
                onClick={() => setActivePane("pentagi")}
              >
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                PentAGI Security
              </button>
              <button
                className={`px-4 py-1.5 text-xs font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${activePane === "fossflow" ? "bg-[#1f2937] text-orange-400 border-t border-l border-r border-orange-500/50" : "text-white/40 hover:text-white/70"}`}
                onClick={() => setActivePane("fossflow")}
              >
                <div className="w-2 h-2 rounded-sm bg-orange-500" />
                FossFLOW Design
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              {activePane === "terminal" ? (
                <TerminalPanel />
              ) : activePane === "cowork" ? (
                <CoWorkChatPanel />
              ) : activePane === "openwork" ? (
                <OpenWorkPanel />
              ) : activePane === "openinspect" ? (
                <OpenInspectSessionPanel />
              ) : activePane === "pentagi" ? (
                <PentagiSessionPanel />
              ) : (
                <FossflowSessionPanel />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
