"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

import {
  GEMINI_EXTENSIONS,
  CATEGORIES,
  installCmd,
  type GeminiExtension,
  type ExtensionCategory,
} from "@/lib/gemini-extensions";

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Cloud: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Dev Tools": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Security: "bg-red-500/20 text-red-300 border-red-500/30",
  Databases: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "AI/ML": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Productivity: "bg-green-500/20 text-green-300 border-green-500/30",
  Integrations: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Frameworks: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Observability: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  Media: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  Other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

function CategoryBadge({ cat }: { cat: string }) {
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Other}`}
    >
      {cat}
    </span>
  );
}

function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className="px-3 py-1 rounded text-xs font-medium bg-[#1a73e8]/20 text-[#8ab4f8] border border-[#1a73e8]/30 hover:bg-[#1a73e8]/40 transition-all"
      onClick={copy}
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}

// ── Extension Card ────────────────────────────────────────────────────────────

function ExtensionCard({
  ext,
  onInstall,
  installing,
  installed,
}: {
  ext: GeminiExtension;
  onInstall: (ext: GeminiExtension) => void;
  installing: boolean;
  installed: boolean;
}) {
  const cmd = installCmd(ext);

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur hover:border-[#1a73e8]/50 hover:bg-white/8 transition-all duration-200">
      {/* Official badge */}
      {ext.official && (
        <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1a73e8]/30 text-[#8ab4f8] border border-[#1a73e8]/40">
          ✦ OFFICIAL
        </span>
      )}
      {/* Header */}
      <div className="pr-16">
        <p className="font-semibold text-sm text-white leading-tight">
          {ext.name}
        </p>
        <p className="text-[11px] text-white/50 mt-0.5 leading-snug line-clamp-2">
          {ext.description}
        </p>
      </div>
      {/* Category */}
      <CategoryBadge cat={ext.category} />
      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        <button
          className={`flex-1 text-xs py-1.5 rounded font-medium transition-all ${
            installed
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : installing
                ? "bg-white/10 text-white/40 border border-white/10 cursor-not-allowed"
                : "bg-[#1a73e8] hover:bg-[#1557b0] text-white"
          }`}
          disabled={installing || installed}
          onClick={() => onInstall(ext)}
        >
          {installed ? "✓ Installed" : installing ? "Installing…" : "Install"}
        </button>
        <CopyButton label="Copy" text={cmd} />
        <a
          className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
          href={ext.githubUrl}
          rel="noopener noreferrer"
          target="_blank"
          title="View on GitHub"
        >
          ↗
        </a>
      </div>
    </div>
  );
}

// ── Terminal Tab ──────────────────────────────────────────────────────────────

const QUICK_CMDS = [
  { label: "List Extensions", cmd: "extensions list" },
  { label: "Ask Gemini", cmd: "ask" },
  { label: "Help", cmd: "help" },
  { label: "Version", cmd: "--version" },
];

interface TerminalLine {
  type: "input" | "stdout" | "stderr" | "system" | "error";
  text: string;
  ts: string;
}

function TerminalTab({ accessToken }: { accessToken?: string }) {
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      type: "system",
      text: "Gemini CLI Terminal — Google Cloud Native",
      ts: new Date().toLocaleTimeString(),
    },
    {
      type: "system",
      text: 'Type a command or click a quick action. Prefix with "gemini" is added automatically.',
      ts: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const push = (type: TerminalLine["type"], text: string) =>
    setLines((prev) => [
      ...prev,
      { type, text, ts: new Date().toLocaleTimeString() },
    ]);

  const run = useCallback(async (rawInput: string) => {
    const trimmed = rawInput.trim();

    if (!trimmed) return;
    const parts = trimmed.split(" ");
    const command = parts[0];
    const args = parts.slice(1);

    push("input", `$ gemini ${trimmed}`);
    setHistory((h) => [trimmed, ...h.slice(0, 49)]);
    setHistIdx(-1);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gemini-cli/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ command, args }),
        },
      );
      const data = await res.json();

      if (data.success) {
        push("stdout", data.data || "(no output)");
      } else {
        push("error", `Error: ${data.message}`);
      }
    } catch (e: unknown) {
      push(
        "error",
        `Connection failed: ${e instanceof Error ? e.message : String(e)}`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);

      return;
    }
    if (e.key === "ArrowUp") {
      const idx = Math.min(histIdx + 1, history.length - 1);

      setHistIdx(idx);
      setInput(history[idx] ?? "");
    }
    if (e.key === "ArrowDown") {
      const idx = Math.max(histIdx - 1, -1);

      setHistIdx(idx);
      setInput(idx === -1 ? "" : history[idx]);
    }
  };

  const lineColor: Record<TerminalLine["type"], string> = {
    input: "text-[#8ab4f8]",
    stdout: "text-[#81c995]",
    stderr: "text-[#fdd663]",
    system: "text-white/40",
    error: "text-[#f28b82]",
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_CMDS.map((q) => (
          <button
            key={q.cmd}
            className="text-xs px-3 py-1 rounded-full border border-[#1a73e8]/30 bg-[#1a73e8]/10 text-[#8ab4f8] hover:bg-[#1a73e8]/25 transition-all"
            onClick={() => run(q.cmd)}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Terminal output */}
      <div
        className="flex-1 bg-[#0d1117] rounded-xl border border-white/10 p-4 font-mono text-xs overflow-auto cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((l, i) => (
          <div key={i} className="flex gap-2 leading-5 mb-0.5">
            <span className="text-white/20 select-none shrink-0">{l.ts}</span>
            <span
              className={`whitespace-pre-wrap break-all ${lineColor[l.type]}`}
            >
              {l.text}
            </span>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center mt-1 text-[#8ab4f8]/60">
            <span className="animate-pulse">▌</span>
            <span>Processing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2 bg-[#0d1117] rounded-xl border border-white/10 px-4 py-2">
        <span className="font-mono text-xs text-[#1a73e8] shrink-0">
          gemini›
        </span>
        <input
          ref={inputRef}
          autoFocus
          className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder:text-white/20"
          disabled={loading}
          placeholder='ask "What is Cloud Run?"'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          className="text-xs px-3 py-1 rounded bg-[#1a73e8] hover:bg-[#1557b0] text-white disabled:opacity-30 transition-all"
          disabled={loading || !input.trim()}
          onClick={() => run(input)}
        >
          Run
        </button>
        <button
          className="text-xs text-white/30 hover:text-white/60 transition-colors"
          onClick={() => setLines([])}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

// ── Marketplace Tab ───────────────────────────────────────────────────────────

function MarketplaceTab({ accessToken }: { accessToken?: string }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<
    ExtensionCategory | "All" | "Spotlight" | "Official"
  >("Spotlight");
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installed, setInstalled] = useState<Set<string>>(new Set());

  const filtered = GEMINI_EXTENSIONS.filter((ext) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      ext.name.toLowerCase().includes(q) ||
      ext.description.toLowerCase().includes(q);
    const matchCat =
      category === "All"
        ? true
        : category === "Spotlight"
          ? !!ext.spotlight
          : category === "Official"
            ? !!ext.official
            : ext.category === category;

    return matchSearch && matchCat;
  });

  const handleInstall = async (ext: GeminiExtension) => {
    setInstallingId(ext.name);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gemini-extensions/install`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ githubUrl: ext.githubUrl }),
        },
      );
      setInstalled((prev) => {
        const next = new Set(prev);

        next.add(ext.name);

        return next;
      });
    } catch {
      // Still mark for UX; real state is server side
    } finally {
      setInstallingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#1a73e8]/60 transition-colors"
          placeholder="Search 200+ extensions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-1 flex-wrap">
          {(["Spotlight", "Official", "All", ...CATEGORIES] as const).map(
            (c) => (
              <button
                key={c}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  category === c
                    ? "bg-[#1a73e8] border-[#1a73e8] text-white"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/30"
                }`}
                onClick={() => setCategory(c as typeof category)}
              >
                {c}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Stats row */}
      <p className="text-xs text-white/30">
        Showing <span className="text-[#8ab4f8]">{filtered.length}</span> of{" "}
        {GEMINI_EXTENSIONS.length} extensions
        {category === "Official" && (
          <span className="ml-2 text-[#8ab4f8]">
            ✦ Official Google extensions
          </span>
        )}
      </p>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
          {filtered.map((ext) => (
            <ExtensionCard
              key={ext.name + ext.githubUrl}
              ext={ext}
              installed={installed.has(ext.name)}
              installing={installingId === ext.name}
              onInstall={handleInstall}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-4 text-center py-16 text-white/30 text-sm">
              No extensions found for "
              <span className="text-white/50">{search}</span>"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Installed Tab ─────────────────────────────────────────────────────────────

function InstalledTab({ accessToken }: { accessToken?: string }) {
  const [extensions, setExtensions] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoking, setInvoking] = useState<string | null>(null);
  const [inputsMap, setInputsMap] = useState<Record<string, string>>({});
  const [outputs, setOutputs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/gemini-extensions/list`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
      .then((r) => r.json())
      .then((d) => setExtensions(Array.isArray(d.data) ? d.data : []))
      .catch(() => setExtensions([]))
      .finally(() => setLoading(false));
  }, []);

  const invoke = async (name: string) => {
    setInvoking(name);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gemini-extensions/invoke`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            extensionName: name,
            inputArgs: (inputsMap[name] || "").split(" ").filter(Boolean),
          }),
        },
      );
      const data = await res.json();

      setOutputs((prev) => ({
        ...prev,
        [name]: data.data || data.message || "Done.",
      }));
    } catch (e: unknown) {
      setOutputs((prev) => ({
        ...prev,
        [name]: `Error: ${e instanceof Error ? e.message : String(e)}`,
      }));
    } finally {
      setInvoking(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">
          {loading ? "Loading…" : `${extensions.length} extensions installed`}
        </p>
        <button
          className="text-xs text-[#8ab4f8] hover:underline"
          onClick={() => {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/gemini-extensions/list`, {
              headers: accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {},
            })
              .then((r) => r.json())
              .then((d) => setExtensions(d.data || []))
              .finally(() => setLoading(false));
          }}
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex gap-2 items-center text-white/30 text-sm">
          <span className="animate-spin">⟳</span> Querying gemini extensions
          list…
        </div>
      )}

      {!loading && extensions.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <p className="text-lg">No extensions installed</p>
          <p className="text-sm mt-1">
            Browse the Marketplace tab to install your first extension.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {extensions.map((ext) => (
          <div
            key={ext.name}
            className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{ext.name}</p>
              <span className="text-xs text-green-400 border border-green-500/30 bg-green-500/10 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-[#0d1117] border border-white/10 rounded px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-[#1a73e8]/50"
                placeholder="args…"
                value={inputsMap[ext.name] || ""}
                onChange={(e) =>
                  setInputsMap((prev) => ({
                    ...prev,
                    [ext.name]: e.target.value,
                  }))
                }
              />
              <button
                className="text-xs px-3 py-1 rounded bg-[#1a73e8] hover:bg-[#1557b0] text-white disabled:opacity-40 transition-all"
                disabled={invoking === ext.name}
                onClick={() => invoke(ext.name)}
              >
                {invoking === ext.name ? "…" : "Invoke"}
              </button>
            </div>
            {outputs[ext.name] && (
              <pre className="text-xs bg-[#0d1117] rounded p-2 text-[#81c995] whitespace-pre-wrap max-h-32 overflow-auto">
                {outputs[ext.name]}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Builder Tab ───────────────────────────────────────────────────────────────

const TEMPLATES = [
  "MCP Server",
  "Skill/Agent",
  "Custom Commands",
  "Raw Extension",
];

function BuilderTab() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [generated, setGenerated] = useState("");

  const generate = () => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const geminiMd = `# ${name}\n\n${desc}\n\n## Tools\n\n- list_${slug}: Lists items for ${name}\n- run_${slug}: Executes the main ${name} action\n`;
    const indexJs = `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";\nimport { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";\nimport { z } from "zod";\n\nconst server = new McpServer({ name: "${slug}", version: "1.0.0" });\n\nserver.tool("list_${slug}", "List ${name} items", {}, async () => ({\n  content: [{ type: "text", text: "Listing ${name} items..." }],\n}));\n\nconst transport = new StdioServerTransport();\nawait server.connect(transport);\n`;
    const pkg = `{\n  "name": "${slug}",\n  "version": "1.0.0",\n  "description": "${desc}",\n  "type": "module",\n  "main": "index.js",\n  "scripts": { "start": "node index.js" },\n  "dependencies": {\n    "@modelcontextprotocol/sdk": "^1.0.0",\n    "zod": "^3.0.0"\n  }\n}`;

    setGenerated(
      `/* ── GEMINI.md ── */\n${geminiMd}\n/* ── index.js ── */\n${indexJs}\n/* ── package.json ── */\n${pkg}\n\n/* Install command */\ngemini extensions install ./${slug}`,
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left: Form */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-white/50 block mb-1">
            Extension Name
          </label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#1a73e8]/60 transition-colors"
            placeholder="e.g. my-cloud-tool"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-1">
            Description
          </label>
          <textarea
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#1a73e8]/60 transition-colors resize-none h-24"
            placeholder="Describe what your extension does…"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-white/50 block mb-2">Template</label>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <button
                key={t}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  template === t
                    ? "bg-[#1a73e8] border-[#1a73e8] text-white"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                }`}
                onClick={() => setTemplate(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <button
            className="w-full py-2.5 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-sm font-medium disabled:opacity-30 transition-all"
            disabled={!name || !desc}
            onClick={generate}
          >
            Generate Extension Scaffold
          </button>
          <p className="text-[11px] text-white/30 mt-2 text-center">
            Generated code follows the{" "}
            <a
              className="text-[#8ab4f8] hover:underline"
              href="https://geminicli.com/docs/extensions/writing-extensions"
              rel="noreferrer"
              target="_blank"
            >
              official Gemini CLI extension spec
            </a>
          </p>
        </div>
      </div>

      {/* Right: Output */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">Generated Scaffold</span>
          {generated && <CopyButton label="Copy All" text={generated} />}
        </div>
        <pre className="flex-1 bg-[#0d1117] rounded-xl border border-white/10 p-4 text-xs text-[#81c995] font-mono whitespace-pre-wrap overflow-auto min-h-64">
          {generated || (
            <span className="text-white/20">
              Fill in the form and click Generate…
            </span>
          )}
        </pre>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type Tab = "terminal" | "marketplace" | "installed" | "builder";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "terminal", label: "Terminal", icon: "⌨" },
  { id: "marketplace", label: "Extensions", icon: "⬡" },
  { id: "installed", label: "Installed", icon: "✓" },
  { id: "builder", label: "Builder", icon: "⬢" },
];

export default function GeminiCliHub() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [tab, setTab] = useState<Tab>("terminal");

  return (
    <div
      className="flex flex-col h-full w-full bg-[#0f1215] text-white"
      style={{ fontFamily: "'Google Sans', Roboto, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-[#0d1117]">
        {/* Google Cloud + Gemini wordmark */}
        <div className="flex items-center gap-2">
          <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z"
              fill="#4285F4"
            />
            <path
              d="M12 2v10l8.66 5C18.54 19.39 15.47 21 12 21 6.48 21 2 16.52 2 11 2 6.48 6.48 2 12 2Z"
              fill="#34A853"
            />
            <path
              d="M2 12c0-2.76 1.12-5.26 2.93-7.07L12 12H2Z"
              fill="#FBBC05"
            />
            <path
              d="M19.07 4.93A9.97 9.97 0 0 1 22 12H12l7.07-7.07Z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-semibold text-white text-sm tracking-tight">
            Gemini CLI
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1a73e8]/20 text-[#8ab4f8] border border-[#1a73e8]/30 font-mono">
            Hub
          </span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <p className="text-xs text-white/40">
          {GEMINI_EXTENSIONS.length} extensions ·{" "}
          {GEMINI_EXTENSIONS.filter((e) => e.official).length} official Google
        </p>
        <div className="ml-auto">
          <a
            className="text-xs text-[#8ab4f8] hover:underline"
            href="https://geminicli.com/docs/extensions/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Docs ↗
          </a>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0 px-6 border-b border-white/10 bg-[#0d1117]">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
              tab === t.id
                ? "border-[#1a73e8] text-[#8ab4f8]"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden p-6">
        {tab === "terminal" && <TerminalTab accessToken={accessToken} />}
        {tab === "marketplace" && <MarketplaceTab accessToken={accessToken} />}
        {tab === "installed" && <InstalledTab accessToken={accessToken} />}
        {tab === "builder" && <BuilderTab />}
      </div>
    </div>
  );
}
