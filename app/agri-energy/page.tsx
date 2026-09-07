"use client";

import React, { useState } from "react";

import ChatBotLayout from "@/components/ChatbotLayout";

// ─── Tool definitions ─────────────────────────────────────────────────────────

const AGRITECH_TOOLS = [
  {
    id: "john-deere",
    name: "John Deere",
    icon: "🚜",
    tagline: "Operations Center API",
    color: "from-green-700/20 to-emerald-700/20",
    border: "border-green-500/30",
    accent: "text-green-400",
    badge: "bg-green-500/20 text-green-300",
    docs: "https://developer.deere.com",
    capabilities: [
      "Field boundaries (GeoJSON)",
      "Machine telemetry",
      "Prescription maps (ISOXML)",
      "As-applied maps",
      "Crop / season data",
      "OAuth 2.0 HATEOAS",
    ],
    category: "Precision Ag",
  },
  {
    id: "trimble-ag",
    name: "Trimble Ag",
    icon: "📡",
    tagline: "Precision Farm Data Platform",
    color: "from-teal-700/20 to-cyan-700/20",
    border: "border-teal-500/30",
    accent: "text-teal-400",
    badge: "bg-teal-500/20 text-teal-300",
    docs: "https://developer.trimble.com/docs/agriculture",
    capabilities: [
      "Farm/field GeoJSON",
      "Field operations log",
      "Variable-rate prescriptions",
      "Yield data",
      "RTK/GNSS positioning",
      "Farm Works sync",
    ],
    category: "Precision Ag",
  },
  {
    id: "climate-corp",
    name: "Climate FieldView",
    icon: "🌦️",
    tagline: "Digital Agronomy Platform",
    color: "from-sky-700/20 to-blue-700/20",
    border: "border-sky-500/30",
    accent: "text-sky-400",
    badge: "bg-sky-500/20 text-sky-300",
    docs: "https://platform.climate.com/documentation",
    capabilities: [
      "NDVI satellite imagery",
      "Weather & GDD",
      "Yield predictions (ML)",
      "Soil data",
      "Grower trials (A/B)",
      "FieldView Drive",
    ],
    category: "Digital Agronomy",
  },
];

const ENERGY_TOOLS = [
  {
    id: "mindsphere",
    name: "Siemens MindSphere",
    icon: "⚙️",
    tagline: "Industrial IoT Platform",
    color: "from-blue-700/20 to-indigo-700/20",
    border: "border-blue-500/30",
    accent: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-300",
    docs: "https://developer.mindsphere.io",
    capabilities: [
      "Asset management API",
      "IoT time series ingestion",
      "Event management",
      "Anomaly detection",
      "MindConnect (OPC-UA/PROFINET)",
      "Digital twin",
    ],
    category: "IIoT",
  },
  {
    id: "osdu",
    name: "OSDU",
    icon: "🛢️",
    tagline: "Open Subsurface Data Universe",
    color: "from-amber-700/20 to-orange-700/20",
    border: "border-amber-500/30",
    accent: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300",
    docs: "https://community.opengroup.org/osdu/documentation",
    capabilities: [
      "Storage & Search APIs",
      "Wellbore / WellLog schemas",
      "WITSML drilling data",
      "SEG-Y seismic",
      "Ingestion workflow",
      "Data partition management",
    ],
    category: "Oil & Gas",
  },
  {
    id: "ev-grid",
    name: "EV & Grid",
    icon: "⚡",
    tagline: "EV Charging + Smart Grid",
    color: "from-lime-700/20 to-green-700/20",
    border: "border-lime-500/30",
    accent: "text-lime-400",
    badge: "bg-lime-500/20 text-lime-300",
    docs: "https://www.openchargealliance.org",
    capabilities: [
      "OCPP 1.6 / 2.0.1",
      "OCPI 2.2.1 roaming",
      "OpenADR demand response",
      "EIA energy data API",
      "V2G (ISO 15118)",
      "Smart charging profiles",
    ],
    category: "Clean Energy",
  },
];

const AUTO_TOOLS = [
  {
    id: "automotive",
    name: "Automotive Digital",
    icon: "🚗",
    tagline: "Connected Vehicle & Manufacturing",
    color: "from-red-700/20 to-rose-700/20",
    border: "border-red-500/30",
    accent: "text-red-400",
    badge: "bg-red-500/20 text-red-300",
    docs: "https://developer.vwgroup.com",
    capabilities: [
      "VW WeConnect + Mercedes + BMW APIs",
      "OBD-II / J1939 CAN bus",
      "CATIA / SolidWorks PLM bridge",
      "OPC-UA MES integration",
      "Vehicle status & remote commands",
    ],
    category: "Auto / Manufacturing",
  },
];

const ALL_TOOLS = [...AGRITECH_TOOLS, ...ENERGY_TOOLS, ...AUTO_TOOLS];

// ─── Agent Chat Panel ──────────────────────────────────────────────────────────

function AgentChat({ tool }: { tool: (typeof ALL_TOOLS)[0] }) {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>(
    [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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
        body: JSON.stringify({ query: `${tool.name} ${userMsg}` }),
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
      className={`rounded-xl bg-gradient-to-br ${tool.color} border ${tool.border} p-5 flex flex-col h-full`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{tool.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-sm ${tool.accent}`}>{tool.name}</h3>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${tool.badge}`}
            >
              {tool.category}
            </span>
          </div>
          <p className="text-slate-400 text-xs">{tool.tagline}</p>
        </div>
        <a
          className="text-slate-500 hover:text-slate-300 text-xs"
          href={tool.docs}
          rel="noopener noreferrer"
          target="_blank"
        >
          Docs ↗
        </a>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {tool.capabilities.slice(0, 4).map((c) => (
          <span
            key={c}
            className={`text-xs px-1.5 py-0.5 rounded ${tool.badge}`}
          >
            {c}
          </span>
        ))}
      </div>
      {messages.length > 0 && (
        <div className="bg-slate-900/60 rounded-lg p-2 mb-3 space-y-2 max-h-36 overflow-y-auto">
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
              Consulting…
            </div>
          )}
        </div>
      )}
      <div className="flex gap-2 mt-auto">
        <input
          className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg text-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-slate-500"
          placeholder={`Ask ${tool.name}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
        />
        <button
          className={`px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-40 text-white bg-gradient-to-r ${tool.color.replace("/20", "")}`}
          disabled={loading || !input.trim()}
          onClick={sendMessage}
        >
          →
        </button>
      </div>
    </div>
  );
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
  sub,
}: {
  icon: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-8">
      <span className="text-2xl">{icon}</span>
      <div>
        <h2 className="text-slate-200 font-bold">{label}</h2>
        <p className="text-slate-500 text-xs">{sub}</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AgriEnergyPage() {
  const [view, setView] = useState<"overview" | "console">("overview");

  const quickActions = [
    {
      label:
        "Build John Deere field data pipeline (OAuth + boundaries + telemetry)",
    },
    { label: "Generate NDVI satellite imagery overlay with FieldView API" },
    {
      label:
        "Compute GDD accumulation for corn from Climate FieldView weather data",
    },
    { label: "Create Siemens MindSphere asset + ingest vibration time series" },
    {
      label:
        "Write OSDU Wellbore record with WGS84 coordinates and total depth",
    },
    { label: "Build OCPP 1.6 Central System WebSocket server in Node.js" },
    { label: "Implement OpenADR VEN client for demand response events" },
    { label: "Decode OBD-II PID 0x0C (RPM) and 0x0D (speed) from CAN frame" },
    { label: "Set up OPC-UA client to read spindle speed from CNC machine" },
  ];

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-teal-400 to-blue-400">
              Agriculture & Energy
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              AgriTech · Precision Farming · Industrial IoT · EV / Grid · Energy
              Data · Auto/Manufacturing
            </p>
          </div>
          <div className="flex gap-2">
            {["overview", "console"].map((v) => (
              <button
                key={v}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${view === v ? "bg-teal-700/70 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                onClick={() => setView(v as any)}
              >
                {v === "overview" ? "🗺️ Overview" : "🤖 Agent Console"}
              </button>
            ))}
          </div>
        </div>

        {view === "overview" ? (
          <>
            {/* AgriTech */}
            <SectionHeader
              icon="🚜"
              label="AgriTech"
              sub="Precision agriculture · Field data · Crop analytics"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              {AGRITECH_TOOLS.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-xl bg-gradient-to-br ${t.color} border ${t.border} p-5 cursor-pointer hover:scale-[1.01] transition-all group`}
                  onClick={() => setView("console")}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <h3 className={`font-bold text-sm ${t.accent}`}>
                        {t.name}
                      </h3>
                      <p className="text-slate-400 text-xs">{t.tagline}</p>
                    </div>
                    <span className="ml-auto text-slate-600 group-hover:text-slate-400">
                      →
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.capabilities.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className={`text-xs px-1.5 py-0.5 rounded ${t.badge}`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Energy */}
            <SectionHeader
              icon="⚡"
              label="Energy & Clean Tech"
              sub="IIoT · Oil & Gas · EV charging · Smart grid"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              {ENERGY_TOOLS.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-xl bg-gradient-to-br ${t.color} border ${t.border} p-5 cursor-pointer hover:scale-[1.01] transition-all group`}
                  onClick={() => setView("console")}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <h3 className={`font-bold text-sm ${t.accent}`}>
                        {t.name}
                      </h3>
                      <p className="text-slate-400 text-xs">{t.tagline}</p>
                    </div>
                    <span className="ml-auto text-slate-600 group-hover:text-slate-400">
                      →
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.capabilities.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className={`text-xs px-1.5 py-0.5 rounded ${t.badge}`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Auto */}
            <SectionHeader
              icon="🚗"
              label="Automotive & Manufacturing"
              sub="Connected vehicles · CAN bus · PLM · OPC-UA"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {AUTO_TOOLS.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-xl bg-gradient-to-br ${t.color} border ${t.border} p-5 cursor-pointer hover:scale-[1.01] transition-all group`}
                  onClick={() => setView("console")}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <h3 className={`font-bold text-sm ${t.accent}`}>
                        {t.name}
                      </h3>
                      <p className="text-slate-400 text-xs">{t.tagline}</p>
                    </div>
                    <span className="ml-auto text-slate-600 group-hover:text-slate-400">
                      →
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.capabilities.map((c) => (
                      <span
                        key={c}
                        className={`text-xs px-1.5 py-0.5 rounded ${t.badge}`}
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
                ⚡ Quick Integration Guides
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {quickActions.map((q) => (
                  <button
                    key={q.label}
                    className="text-left px-3 py-2.5 bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-xl text-slate-300 text-xs transition-all hover:text-white group"
                    onClick={() => setView("console")}
                  >
                    <span className="text-slate-500 group-hover:text-teal-400 mr-1.5">
                      ▶
                    </span>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Agent Console — all 7 tools in grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ALL_TOOLS.map((t) => (
              <AgentChat key={t.id} tool={t} />
            ))}
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
