"use client";

import React, { useState } from "react";

import ChatBotLayout from "@/components/ChatbotLayout";

// ─── Tool definitions ─────────────────────────────────────────────────────────

const DEVSECOPS_TOOLS = [
  {
    id: "snyk",
    name: "Snyk",
    icon: "🛡️",
    tagline: "Dependency & SAST Scanning",
    color: "from-violet-600/20 to-purple-600/20",
    border: "border-violet-500/30",
    accent: "text-violet-400",
    badge: "bg-violet-500/20 text-violet-300",
    docs: "https://docs.snyk.io",
    capabilities: [
      "SCA (Open Source)",
      "SAST (Code)",
      "Container Scan",
      "IaC Scan",
      "snyk fix auto-remediation",
    ],
    keywords: ["snyk", "dependency vulnerability", "sca scan"],
  },
  {
    id: "semgrep",
    name: "Semgrep",
    icon: "🔍",
    tagline: "Semantic SAST & Custom Rules",
    color: "from-sky-600/20 to-blue-600/20",
    border: "border-sky-500/30",
    accent: "text-sky-400",
    badge: "bg-sky-500/20 text-sky-300",
    docs: "https://semgrep.dev/docs",
    capabilities: [
      "Custom rule authoring (YAML)",
      "Taint analysis",
      "p/owasp-top-ten, p/nodejs",
      "autofix support",
      "CI/CD integration",
    ],
    keywords: ["semgrep", "sast", "static analysis"],
  },
  {
    id: "sonarqube",
    name: "SonarQube",
    icon: "📊",
    tagline: "Code Quality & Quality Gates",
    color: "from-blue-600/20 to-indigo-600/20",
    border: "border-blue-500/30",
    accent: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-300",
    docs: "https://docs.sonarsource.com/sonarqube",
    capabilities: [
      "Quality gates",
      "Coverage tracking",
      "Code smells & bugs",
      "PR decoration",
      "Hotspot security review",
    ],
    keywords: ["sonarqube", "sonarcloud", "code quality"],
  },
  {
    id: "owasp-zap",
    name: "OWASP ZAP",
    icon: "⚡",
    tagline: "Dynamic Application Security Testing",
    color: "from-amber-600/20 to-orange-600/20",
    border: "border-amber-500/30",
    accent: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300",
    docs: "https://www.zaproxy.org/docs",
    capabilities: [
      "Passive (baseline) scan",
      "Active full scan",
      "API scan (OpenAPI)",
      "AJAX Spider (SPA)",
      "Alert triage & remediation",
    ],
    keywords: ["owasp zap", "dast", "dynamic analysis"],
  },
  {
    id: "veracode",
    name: "Veracode",
    icon: "🔒",
    tagline: "Enterprise AppSec Platform",
    color: "from-red-600/20 to-rose-600/20",
    border: "border-red-500/30",
    accent: "text-red-400",
    badge: "bg-red-500/20 text-red-300",
    docs: "https://docs.veracode.com",
    capabilities: [
      "SAST + DAST + SCA",
      "Pipeline Scan (CI)",
      "Greenlight IDE scan",
      "Results API v2",
      "Compliance: SOC2, PCI, HIPAA",
    ],
    keywords: ["veracode", "appsec scan", "pipeline scan veracode"],
  },
];

const SEVERITY_COLORS = {
  Critical: "text-red-400 bg-red-500/10 border-red-500/30",
  High: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  Medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Low: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

// ─── Agent Chat Panel ──────────────────────────────────────────────────────────

function AgentChat({ tool }: { tool: (typeof DEVSECOPS_TOOLS)[0] }) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();

    setInput("");
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/swarm/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `${tool.keywords[0]} ${userMsg}`,
          directAgentName: tool.name,
        }),
      });
      const data = await res.json();

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: data.data?.result || data.message || "No response.",
        },
      ]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: `Error: ${e.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${tool.color} border ${tool.border} p-5`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{tool.icon}</span>
        <div>
          <h3 className={`font-bold text-base ${tool.accent}`}>{tool.name}</h3>
          <p className="text-slate-400 text-xs">{tool.tagline}</p>
        </div>
        <a
          className="ml-auto text-slate-500 hover:text-slate-300 text-xs transition-colors"
          href={tool.docs}
          rel="noopener noreferrer"
          target="_blank"
        >
          Docs ↗
        </a>
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tool.capabilities.map((c) => (
          <span
            key={c}
            className={`text-xs px-2 py-0.5 rounded-full border ${tool.badge} border-transparent`}
          >
            {c}
          </span>
        ))}
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="bg-slate-900/60 rounded-lg p-3 mb-3 space-y-2 max-h-48 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`text-xs ${msg.role === "user" ? "text-slate-300" : "text-slate-200"}`}
            >
              <span
                className={`font-semibold ${msg.role === "user" ? "text-slate-500" : tool.accent}`}
              >
                {msg.role === "user" ? "You: " : `${tool.name}: `}
              </span>
              <span className="whitespace-pre-wrap">{msg.text}</span>
            </div>
          ))}
          {loading && (
            <div className={`text-xs ${tool.accent} animate-pulse`}>
              Thinking…
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg text-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-slate-500"
          placeholder={`Ask ${tool.name} anything…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
        />
        <button
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 text-white bg-gradient-to-r ${tool.color.replace("/20", "")}`}
          disabled={loading || !input.trim()}
          onClick={sendMessage}
        >
          →
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DevSecOpsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [view, setView] = useState<"dashboard" | "tools">("dashboard");

  // Mock severity summary (replace with real scan API calls)
  const severitySummary = [
    { label: "Critical", count: 3, icon: "🔴" },
    { label: "High", count: 12, icon: "🟠" },
    { label: "Medium", count: 47, icon: "🟡" },
    { label: "Low", count: 134, icon: "🔵" },
  ];

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-amber-400">
                DevSecOps
              </h1>
              <p className="text-slate-400 mt-1 text-sm">
                Security scanning · SAST · DAST · SCA · Code quality · CI/CD
                gates
              </p>
            </div>
            <div className="flex gap-2">
              {["dashboard", "tools"].map((v) => (
                <button
                  key={v}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${view === v ? "bg-red-600/80 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                  onClick={() => setView(v as any)}
                >
                  {v === "dashboard" ? "📊 Dashboard" : "🤖 Agent Console"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === "dashboard" ? (
          <>
            {/* Severity Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {severitySummary.map((s) => (
                <div
                  key={s.label}
                  className={`rounded-xl border p-4 ${SEVERITY_COLORS[s.label as keyof typeof SEVERITY_COLORS]}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{s.icon}</span>
                    <span className="font-semibold text-sm">{s.label}</span>
                  </div>
                  <p className="text-3xl font-black">{s.count}</p>
                  <p className="text-xs opacity-60 mt-0.5">open findings</p>
                </div>
              ))}
            </div>

            {/* Tool Cards — overview grid */}
            <h2 className="text-slate-300 font-semibold text-sm mb-4 uppercase tracking-widest">
              Security Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              {DEVSECOPS_TOOLS.map((tool) => (
                <div
                  key={tool.id}
                  className={`rounded-xl bg-gradient-to-br ${tool.color} border ${tool.border} p-5 cursor-pointer hover:scale-[1.01] transition-all group`}
                  onClick={() => {
                    setSelectedTool(tool.id);
                    setView("tools");
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{tool.icon}</span>
                    <div>
                      <h3 className={`font-bold ${tool.accent}`}>
                        {tool.name}
                      </h3>
                      <p className="text-slate-400 text-xs">{tool.tagline}</p>
                    </div>
                    <span className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors text-sm">
                      →
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tool.capabilities.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className={`text-xs px-1.5 py-0.5 rounded ${tool.badge}`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6">
              <h3 className="text-slate-300 font-semibold mb-4">
                🚀 Quick CI/CD Integration Guides
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: "Generate Snyk GitHub Actions workflow",
                    tool: "snyk",
                  },
                  { label: "Write Semgrep custom SAST rule", tool: "semgrep" },
                  {
                    label: "Configure SonarCloud quality gate",
                    tool: "sonarqube",
                  },
                  {
                    label: "Set up OWASP ZAP baseline scan in CI",
                    tool: "owasp-zap",
                  },
                  {
                    label: "Integrate Veracode Pipeline Scan",
                    tool: "veracode",
                  },
                  {
                    label: "Build DevSecOps shift-left strategy",
                    tool: "snyk",
                  },
                ].map((q) => (
                  <button
                    key={q.label}
                    className="text-left px-4 py-3 bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-xl text-slate-300 text-sm transition-all hover:text-white group"
                    onClick={() => {
                      setSelectedTool(q.tool);
                      setView("tools");
                    }}
                  >
                    <span className="text-slate-500 group-hover:text-orange-400 transition-colors mr-2">
                      ▶
                    </span>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Agent Console */
          <div>
            {/* Tool selector tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {DEVSECOPS_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    selectedTool === tool.id
                      ? `bg-gradient-to-r ${tool.color} border ${tool.border} ${tool.accent}`
                      : "bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:text-slate-200"
                  }`}
                  onClick={() => setSelectedTool(tool.id)}
                >
                  {tool.icon} {tool.name}
                </button>
              ))}
            </div>
            {/* Active tool chat */}
            {selectedTool ? (
              <AgentChat
                tool={DEVSECOPS_TOOLS.find((t) => t.id === selectedTool)!}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEVSECOPS_TOOLS.map((tool) => (
                  <AgentChat key={tool.id} tool={tool} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
