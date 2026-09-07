"use client";

import React, { useState } from "react";
import { Plug, Check, ArrowRight, Zap, Shield, Globe } from "lucide-react";

const EXAMPLE_MCPS = [
  { name: "GitHub", url: "https://mcp.github.com/sse", icon: "GH" },
  { name: "Slack", url: "https://mcp.slack.dev/sse", icon: "SL" },
  { name: "Jira", url: "https://mcp.atlassian.com/sse", icon: "JR" },
  { name: "Notion", url: "https://mcp.notion.so/sse", icon: "NT" },
  { name: "Figma", url: "https://mcp.figma.com/sse", icon: "FG" },
];

export default function BringYourOwnMcpSection() {
  const [inputValue, setInputValue] = useState("");
  const [connected, setConnected] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleConnect = (url: string, name: string) => {
    if (connected.includes(name)) return;
    setIsConnecting(name);
    setTimeout(() => {
      setConnected((prev) => [...prev, name]);
      setIsConnecting(null);
    }, 1200);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const name = inputValue
      .trim()
      .replace(/https?:\/\//, "")
      .split("/")[0];

    handleConnect(inputValue, name);
    setInputValue("");
  };

  return (
    <section className="w-full py-32 bg-white text-black px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        {/* Left Side: Interactive Card */}
        <div className="w-full flex flex-col gap-4 lg:order-2">
          <div
            className="w-full max-w-[480px] mx-auto lg:ml-auto lg:mr-0 bg-zinc-100 hover:bg-zinc-50 hover:-translate-y-1 transition-all duration-300 rounded-[32px] overflow-hidden p-6 flex flex-col gap-5 text-black min-h-[400px] relative group border"
            style={{
              borderColor: "#8B5CF6",
              boxShadow: "0 4px 20px rgba(139, 92, 246, 0.12)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-bold text-zinc-600 ml-2 font-mono">
                  MCP Harness
                </span>
              </div>
              {connected.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 rounded-lg border border-violet-200">
                  <Plug className="w-3 h-3 text-violet-600" />
                  <span className="text-[10px] font-bold text-violet-600 uppercase tracking-wider">
                    {connected.length} Connected
                  </span>
                </div>
              )}
            </div>

            {/* Quick Connect Grid */}
            <div className="flex flex-col gap-2 relative z-10">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Paste any MCP endpoint
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {EXAMPLE_MCPS.map((mcp) => {
                  const isConnected = connected.includes(mcp.name);
                  const isLoading = isConnecting === mcp.name;

                  return (
                    <button
                      key={mcp.name}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-300 border ${
                        isConnected
                          ? "bg-emerald-50 border-emerald-200"
                          : isLoading
                            ? "bg-violet-50 border-violet-200 animate-pulse"
                            : "bg-zinc-50 border-zinc-100 hover:bg-zinc-100 hover:border-zinc-200"
                      }`}
                      disabled={isConnected || isLoading}
                      onClick={() => handleConnect(mcp.url, mcp.name)}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isConnected
                            ? "bg-emerald-500 text-white"
                            : "bg-zinc-200 text-zinc-600"
                        }`}
                      >
                        {isConnected ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          mcp.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-800">
                          {mcp.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 truncate font-mono">
                          {mcp.url}
                        </p>
                      </div>
                      {!isConnected && !isLoading && (
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <form className="relative z-10" onSubmit={handleCustomSubmit}>
              <div className="flex items-center gap-2 bg-zinc-100 rounded-xl px-3 py-2.5 border border-zinc-200">
                <Plug className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <input
                  className="flex-1 bg-transparent text-xs text-zinc-800 placeholder-zinc-400 outline-none font-mono"
                  placeholder="https://your-mcp-server.com/sse"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button
                  className="px-2.5 py-1 bg-violet-600 text-white text-[10px] font-bold rounded-lg hover:bg-violet-700 transition-colors shrink-0"
                  type="submit"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Copy */}
        <div className="flex flex-col gap-8 lg:order-1">
          <div className="flex flex-col gap-6">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.1] text-black">
              Bring Your Own MCP. <br />
              Your Tools. Your Stack.
            </h3>
            <p className="text-lg text-zinc-600 leading-relaxed font-medium max-w-xl">
              We built the universal harness. You bring the tools. Paste any
              <br />
              MCP server endpoint and it&apos;s live in your workspace
              instantly.
              <br />
              No marketplace. No vendor lock-in. Your curated stack, your way.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-black">
                  Universal Protocol
                </p>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Any MCP-compliant server works instantly. Connect GitHub,
                  Slack,
                  <br />
                  Jira, Notion, Figma, databases, or your own internal tools.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-black">
                  Sovereign by Default
                </p>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Your connections stay private. No data passes through
                  <br />
                  our infrastructure. Direct client-to-server only.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-black">Zero Maintenance</p>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  No catalog to keep updated. The MCP ecosystem grows
                  <br />
                  on its own and your harness connects to all of it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
