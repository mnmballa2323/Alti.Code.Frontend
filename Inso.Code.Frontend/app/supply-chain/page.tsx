"use client";

import React, { useState } from "react";

import ChatBotLayout from "@/components/ChatbotLayout";

// ─── Tool definitions ─────────────────────────────────────────────────────────

const SUPPLY_CHAIN_TOOLS = [
  {
    id: "fedex",
    name: "FedEx",
    icon: "✈️",
    tagline: "Express & Ground Shipping API",
    color: "from-purple-600/20 to-indigo-600/20",
    border: "border-purple-500/30",
    accent: "text-purple-400",
    badge: "bg-purple-500/20 text-purple-300",
    docs: "https://developer.fedex.com",
    capabilities: [
      "Rate quotes",
      "Shipment creation",
      "Tracking (real-time)",
      "Address validation",
      "Pickup scheduling",
      "PDF/ZPL labels",
    ],
    category: "Carrier",
  },
  {
    id: "shipbob",
    name: "ShipBob",
    icon: "📦",
    tagline: "3PL Ecommerce Fulfillment",
    color: "from-teal-600/20 to-emerald-600/20",
    border: "border-teal-500/30",
    accent: "text-teal-400",
    badge: "bg-teal-500/20 text-teal-300",
    docs: "https://developer.shipbob.com",
    capabilities: [
      "Order fulfillment",
      "Inventory management",
      "Returns portal",
      "Webhooks",
      "Multi-channel (Shopify / Amazon)",
    ],
    category: "Fulfillment",
  },
  {
    id: "flexport",
    name: "Flexport",
    icon: "🚢",
    tagline: "Global Freight Forwarding",
    color: "from-sky-600/20 to-blue-600/20",
    border: "border-sky-500/30",
    accent: "text-sky-400",
    badge: "bg-sky-500/20 text-sky-300",
    docs: "https://api.flexport.com/docs",
    capabilities: [
      "Ocean / Air / Truck bookings",
      "Container tracking",
      "Milestone events",
      "Incoterms guidance",
      "Carbon footprint data",
      "Documents (BoL, CI)",
    ],
    category: "Freight",
  },
  {
    id: "sap-ariba",
    name: "SAP Ariba",
    icon: "🏢",
    tagline: "Enterprise Procurement Network",
    color: "from-amber-600/20 to-orange-600/20",
    border: "border-amber-500/30",
    accent: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300",
    docs: "https://developer.ariba.com",
    capabilities: [
      "Purchase orders",
      "Invoice processing",
      "Supplier onboarding",
      "Ariba Discovery",
      "Spend analytics",
      "SAP BTP integration",
    ],
    category: "Procurement",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Carrier: "bg-purple-500/20 text-purple-300",
  Fulfillment: "bg-teal-500/20 text-teal-300",
  Freight: "bg-sky-500/20 text-sky-300",
  Procurement: "bg-amber-500/20 text-amber-300",
};

// ─── Stat card component ───────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: string;
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-2xl font-black text-slate-100">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

// ─── Agent Chat Panel ──────────────────────────────────────────────────────────

function AgentChat({ tool }: { tool: (typeof SUPPLY_CHAIN_TOOLS)[0] }) {
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
      className={`rounded-xl bg-gradient-to-br ${tool.color} border ${tool.border} p-5 h-full flex flex-col`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{tool.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-base ${tool.accent}`}>
              {tool.name}
            </h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[tool.category]}`}
            >
              {tool.category}
            </span>
          </div>
          <p className="text-slate-400 text-xs">{tool.tagline}</p>
        </div>
        <a
          className="text-slate-500 hover:text-slate-300 text-xs transition-colors shrink-0"
          href={tool.docs}
          rel="noopener noreferrer"
          target="_blank"
        >
          Docs ↗
        </a>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {tool.capabilities.map((c) => (
          <span
            key={c}
            className={`text-xs px-2 py-0.5 rounded-full ${tool.badge}`}
          >
            {c}
          </span>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
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
                Consulting {tool.name} expert…
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <input
            className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg text-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-slate-500"
            placeholder={`Ask ${tool.name} anything…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          />
          <button
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 text-white bg-gradient-to-r ${tool.color.replace("/20", "").replace("from-", "from-").replace("to-", "to-")}`}
            disabled={loading || !input.trim()}
            onClick={sendMessage}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SupplyChainPage() {
  const [view, setView] = useState<"overview" | "console">("overview");

  const quickActions = [
    { label: "Generate FedEx rate quote + label in TypeScript", tool: "fedex" },
    {
      label: "Create ShipBob fulfillment order from Shopify webhook",
      tool: "shipbob",
    },
    {
      label: "Set up Flexport ocean freight booking with Incoterms FOB",
      tool: "flexport",
    },
    {
      label: "Create SAP Ariba PO with line items and cost center codes",
      tool: "sap-ariba",
    },
    {
      label: "Build webhook handler for ShipBob order_shipped events",
      tool: "shipbob",
    },
    {
      label: "Track FedEx shipment and send customer email on delivery",
      tool: "fedex",
    },
    {
      label: "Calculate Flexport shipment carbon footprint and offset",
      tool: "flexport",
    },
    {
      label: "Onboard a new supplier in SAP Ariba with UNSPSC codes",
      tool: "sap-ariba",
    },
  ];

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-blue-400 to-indigo-400">
              Supply Chain
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              Shipping · 3PL Fulfillment · Freight Forwarding · Procurement
            </p>
          </div>
          <div className="flex gap-2">
            {["overview", "console"].map((v) => (
              <button
                key={v}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${view === v ? "bg-teal-600/70 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
                onClick={() => setView(v as any)}
              >
                {v === "overview" ? "🗺️ Overview" : "🤖 Agent Console"}
              </button>
            ))}
          </div>
        </div>

        {view === "overview" ? (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon="✈️"
                label="Carrier APIs"
                sub="FedEx Express & Ground"
                value="1"
              />
              <StatCard
                icon="📦"
                label="Fulfillment"
                sub="ShipBob 3PL"
                value="1"
              />
              <StatCard
                icon="🚢"
                label="Freight"
                sub="Flexport Ocean/Air/Truck"
                value="1"
              />
              <StatCard
                icon="🏢"
                label="Procurement"
                sub="SAP Ariba Network"
                value="1"
              />
            </div>

            {/* Tool cards */}
            <h2 className="text-slate-300 font-semibold text-sm mb-4 uppercase tracking-widest">
              Integrated Platforms
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {SUPPLY_CHAIN_TOOLS.map((tool) => (
                <div
                  key={tool.id}
                  className={`rounded-2xl bg-gradient-to-br ${tool.color} border ${tool.border} p-6 cursor-pointer hover:scale-[1.01] transition-all group`}
                  onClick={() => setView("console")}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl">{tool.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold text-lg ${tool.accent}`}>
                          {tool.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[tool.category]}`}
                        >
                          {tool.category}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{tool.tagline}</p>
                    </div>
                    <span className="text-slate-600 group-hover:text-slate-300 transition-colors">
                      →
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tool.capabilities.map((c) => (
                      <span
                        key={c}
                        className={`text-xs px-2 py-0.5 rounded-full ${tool.badge}`}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((q) => (
                  <button
                    key={q.label}
                    className="text-left px-4 py-3 bg-slate-800/60 border border-slate-700/50 hover:border-slate-600 rounded-xl text-slate-300 text-sm transition-all hover:text-white group"
                    onClick={() => setView("console")}
                  >
                    <span className="text-slate-500 group-hover:text-teal-400 transition-colors mr-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SUPPLY_CHAIN_TOOLS.map((tool) => (
              <AgentChat key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
