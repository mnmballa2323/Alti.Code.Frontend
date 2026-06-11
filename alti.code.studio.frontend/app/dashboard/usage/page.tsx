"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  Coins, 
  Activity, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  Zap, 
  Layers 
} from "lucide-react";
import { Button, Chip } from "@heroui/react";

// Types for Usage Stats
interface ModelUsageInfo {
  name: string;
  version: string;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  avgLatency: number;
  cost: number;
  pricingPer1MInput: number;
  pricingPer1MOutput: number;
}

interface ProviderUsageData {
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  successRate: string;
  models: ModelUsageInfo[];
  dailyUsage: { day: string; input: number; output: number }[];
  recentRequests: {
    id: string;
    timestamp: string;
    modelName: string;
    promptSnippet: string;
    tokens: number;
    latency: number;
    cost: number;
    status: "success" | "error";
  }[];
}

const initialUsageData: Record<string, ProviderUsageData> = {
  aws: {
    totalCost: 14.82,
    totalTokens: 3845000,
    totalRequests: 8432,
    successRate: "99.9%",
    models: [
      {
        name: "Claude 3.5 Sonnet",
        version: "v2 (Latest)",
        inputTokens: 2450000,
        outputTokens: 890000,
        requests: 7650,
        avgLatency: 820,
        cost: 11.80,
        pricingPer1MInput: 3.00,
        pricingPer1MOutput: 15.00,
      },
      {
        name: "Claude 3 Opus",
        version: "v1",
        inputTokens: 320000,
        outputTokens: 185000,
        requests: 782,
        avgLatency: 2100,
        cost: 3.02,
        pricingPer1MInput: 15.00,
        pricingPer1MOutput: 75.00,
      }
    ],
    dailyUsage: [
      { day: "Mon", input: 280000, output: 110000 },
      { day: "Tue", input: 350000, output: 140000 },
      { day: "Wed", input: 410000, output: 165000 },
      { day: "Thu", input: 320000, output: 120000 },
      { day: "Fri", input: 490000, output: 195000 },
      { day: "Sat", input: 180000, output: 65000 },
      { day: "Sun", input: 420000, output: 160000 },
    ],
    recentRequests: [
      {
        id: "req-aws-1",
        timestamp: "2 mins ago",
        modelName: "Claude 3.5 Sonnet",
        promptSnippet: "Explain clean architecture module dependencies in Kotlin KMP...",
        tokens: 1820,
        latency: 780,
        cost: 0.0078,
        status: "success",
      },
      {
        id: "req-aws-2",
        timestamp: "12 mins ago",
        modelName: "Claude 3.5 Sonnet",
        promptSnippet: "Refactor MonacoEditor.tsx component layout parameters...",
        tokens: 3450,
        latency: 950,
        cost: 0.0142,
        status: "success",
      },
      {
        id: "req-aws-3",
        timestamp: "1 hr ago",
        modelName: "Claude 3 Opus",
        promptSnippet: "Execute security scan rules auditor for Supabase postgres.sql...",
        tokens: 8900,
        latency: 2400,
        cost: 0.185,
        status: "success",
      },
    ]
  },
  gcp: {
    totalCost: 6.12,
    totalTokens: 5210000,
    totalRequests: 11203,
    successRate: "99.8%",
    models: [
      {
        name: "Gemini 1.5 Pro",
        version: "v1.5",
        inputTokens: 3100000,
        outputTokens: 710000,
        requests: 6920,
        avgLatency: 980,
        cost: 4.86,
        pricingPer1MInput: 1.25,
        pricingPer1MOutput: 5.00,
      },
      {
        name: "Gemini 1.5 Flash",
        version: "v1.5",
        inputTokens: 1100000,
        outputTokens: 300000,
        requests: 4283,
        avgLatency: 340,
        cost: 1.26,
        pricingPer1MInput: 0.075,
        pricingPer1MOutput: 0.30,
      }
    ],
    dailyUsage: [
      { day: "Mon", input: 390000, output: 95000 },
      { day: "Tue", input: 450000, output: 110000 },
      { day: "Wed", input: 520000, output: 125000 },
      { day: "Thu", input: 380000, output: 85000 },
      { day: "Fri", input: 610000, output: 140000 },
      { day: "Sat", input: 220000, output: 50000 },
      { day: "Sun", input: 530000, output: 105000 },
    ],
    recentRequests: [
      {
        id: "req-gcp-1",
        timestamp: "5 mins ago",
        modelName: "Gemini 1.5 Flash",
        promptSnippet: "Lookup clinical evidence pathogen classification ClinVar...",
        tokens: 950,
        latency: 280,
        cost: 0.0001,
        status: "success",
      },
      {
        id: "req-gcp-2",
        timestamp: "24 mins ago",
        modelName: "Gemini 1.5 Pro",
        promptSnippet: "Perform evolutionary conservation phyloP scores lookup UCSC...",
        tokens: 12400,
        latency: 1120,
        cost: 0.0182,
        status: "success",
      },
    ]
  },
  azure: {
    totalCost: 18.90,
    totalTokens: 6420000,
    totalRequests: 14502,
    successRate: "100.0%",
    models: [
      {
        name: "GPT-4o",
        version: "2024-05-13",
        inputTokens: 4120000,
        outputTokens: 1200000,
        requests: 10240,
        avgLatency: 720,
        cost: 16.60,
        pricingPer1MInput: 2.50,
        pricingPer1MOutput: 10.00,
      },
      {
        name: "GPT-4o-mini",
        version: "2024-07-18",
        inputTokens: 950000,
        outputTokens: 150000,
        requests: 4262,
        avgLatency: 280,
        cost: 2.30,
        pricingPer1MInput: 0.15,
        pricingPer1MOutput: 0.60,
      }
    ],
    dailyUsage: [
      { day: "Mon", input: 510000, output: 135000 },
      { day: "Tue", input: 620000, output: 160000 },
      { day: "Wed", input: 710000, output: 185000 },
      { day: "Thu", input: 590000, output: 150000 },
      { day: "Fri", input: 890000, output: 230000 },
      { day: "Sat", input: 310000, output: 80000 },
      { day: "Sun", input: 490000, output: 110000 },
    ],
    recentRequests: [
      {
        id: "req-az-1",
        timestamp: "Just now",
        modelName: "GPT-4o",
        promptSnippet: "Assemble dynamic view transitions layouts for admin routes...",
        tokens: 4320,
        latency: 680,
        cost: 0.0151,
        status: "success",
      },
      {
        id: "req-az-2",
        timestamp: "45 mins ago",
        modelName: "GPT-4o-mini",
        promptSnippet: "Form autofill handler autocomplete listeners implementation...",
        tokens: 820,
        latency: 250,
        cost: 0.0002,
        status: "success",
      },
    ]
  }
};

export default function ModelUsagePage() {
  const [activeTab, setActiveTab] = useState<"aws" | "gcp" | "azure">("aws");
  const data = initialUsageData[activeTab];

  // Colors for styling based on active cloud provider
  const getProviderTheme = () => {
    switch (activeTab) {
      case "aws":
        return {
          primary: "text-orange-500",
          bg: "bg-orange-500/10",
          border: "border-orange-500/20",
          accentBg: "bg-orange-500",
          hoverBg: "hover:bg-orange-600",
          gradient: "from-orange-500/5 to-transparent",
          progressColor: "bg-orange-500"
        };
      case "gcp":
        return {
          primary: "text-blue-500",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          accentBg: "bg-blue-500",
          hoverBg: "hover:bg-blue-600",
          gradient: "from-blue-500/5 to-transparent",
          progressColor: "bg-blue-500"
        };
      case "azure":
        return {
          primary: "text-teal-500",
          bg: "bg-teal-500/10",
          border: "border-teal-500/20",
          accentBg: "bg-teal-500",
          hoverBg: "hover:bg-teal-600",
          gradient: "from-teal-500/5 to-transparent",
          progressColor: "bg-teal-500"
        };
    }
  };

  const theme = getProviderTheme();

  // Helper to format token counts
  const formatTokens = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "k";
    }
    return num.toString();
  };

  // Helper for computing model percentage shares
  const totalModelTokens = data.models.reduce((acc, m) => acc + m.inputTokens + m.outputTokens, 0);

  return (
    <div className="w-screen min-h-screen p-10 bg-[#FFFFFF] dark:bg-[#0d1117] text-neutral-900 dark:text-neutral-100 overflow-y-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Model Usage</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5">
            Monitor API token consumption, routing costs, and performance statistics.
          </p>
        </div>
        <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab("aws")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "aws"
                ? "bg-white dark:bg-[#161b22] text-orange-500 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            AWS Bedrock
          </button>
          <button
            onClick={() => setActiveTab("gcp")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "gcp"
                ? "bg-white dark:bg-[#161b22] text-blue-500 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            GCP Vertex AI
          </button>
          <button
            onClick={() => setActiveTab("azure")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "azure"
                ? "bg-white dark:bg-[#161b22] text-teal-500 shadow-sm"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Azure OpenAI
          </button>
        </div>
      </div>

      {/* Grid of Key metrics (KPI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Cost KPI Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${theme.bg} ${theme.primary}`}>
            <Coins size={22} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Estimated Cost</span>
            <span className="text-2xl font-bold text-neutral-950 dark:text-white">${data.totalCost.toFixed(2)}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp size={10} /> Billing active
            </span>
          </div>
        </div>

        {/* Tokens Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${theme.bg} ${theme.primary}`}>
            <Cpu size={22} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Total Tokens</span>
            <span className="text-2xl font-bold text-neutral-950 dark:text-white">{formatTokens(data.totalTokens)}</span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block">
              In: {formatTokens(data.models.reduce((a, m) => a + m.inputTokens, 0))} | Out: {formatTokens(data.models.reduce((a, m) => a + m.outputTokens, 0))}
            </span>
          </div>
        </div>

        {/* Requests Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${theme.bg} ${theme.primary}`}>
            <Activity size={22} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">API Requests</span>
            <span className="text-2xl font-bold text-neutral-950 dark:text-white">{data.totalRequests.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
              <CheckCircle2 size={10} /> {data.successRate} Success
            </span>
          </div>
        </div>

        {/* Latency Card */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${theme.bg} ${theme.primary}`}>
            <Clock size={22} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Avg Latency</span>
            <span className="text-2xl font-bold text-neutral-950 dark:text-white">
              {(data.models.reduce((acc, m) => acc + (m.avgLatency * m.requests), 0) / data.totalRequests).toFixed(0)} ms
            </span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block">p95 Gateway Response</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left 2 Columns: Model breakdown & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Models Allocation & Comparison */}
          <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">Model Metrics Comparison</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">Resource distribution between your active models.</p>
            </div>

            {/* Visual Token share slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-neutral-800 dark:text-neutral-200">{data.models[0].name}</span>
                <span className="text-neutral-800 dark:text-neutral-200">{data.models[1].name}</span>
              </div>
              <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                <div 
                  className={`${theme.progressColor} h-full transition-all`} 
                  style={{ width: `${((data.models[0].inputTokens + data.models[0].outputTokens) / totalModelTokens * 100)}%` }}
                />
                <div 
                  className="bg-neutral-300 dark:bg-neutral-600 h-full flex-1 transition-all"
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase">
                <span>{((data.models[0].inputTokens + data.models[0].outputTokens) / totalModelTokens * 100).toFixed(0)}% Share</span>
                <span>{((data.models[1].inputTokens + data.models[1].outputTokens) / totalModelTokens * 100).toFixed(0)}% Share</span>
              </div>
            </div>

            {/* Model Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.models.map((model, idx) => {
                const modelTokens = model.inputTokens + model.outputTokens;
                return (
                  <div 
                    key={model.name}
                    className="border border-neutral-100 dark:border-neutral-850 rounded-2xl p-4 bg-neutral-50/40 dark:bg-neutral-900/10 space-y-4 hover:border-neutral-200 dark:hover:border-neutral-800 transition-colors"
                  >
                    <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-850 pb-2.5">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                          {model.name}
                          {idx === 0 && <Chip className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] border-none font-bold h-4" size="sm">Primary</Chip>}
                        </h4>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{model.version}</span>
                      </div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">${model.cost.toFixed(2)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">API Calls</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{model.requests.toLocaleString()}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Tokens Used</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{formatTokens(modelTokens)}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Avg Latency</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{model.avgLatency}ms</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">Model Rates</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-[10px]">
                          ${model.pricingPer1MInput.toFixed(2)} / ${model.pricingPer1MOutput.toFixed(2)} <span className="opacity-50">1M</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SVG Daily Chart */}
          <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">Daily Volume Trend</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">Token usage history over the last 7 days.</p>
            </div>

            {/* Custom Responsive SVG Bar Chart */}
            <div className="h-44 w-full flex items-end justify-between gap-1 pt-6 px-2 font-mono">
              {data.dailyUsage.map((dayData) => {
                const total = dayData.input + dayData.output;
                const maxVal = 700000; // max value for height scaling
                const heightPercentage = Math.min((total / maxVal) * 100, 100);
                const inputPercentage = (dayData.input / total) * 100;

                return (
                  <div key={dayData.day} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-2 bg-neutral-950 text-white text-[10px] rounded-lg p-2 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 shadow-md whitespace-nowrap leading-relaxed border border-neutral-800">
                      <p className="font-bold text-neutral-350">{dayData.day} Stats</p>
                      <p className="text-[9px]">Input: {formatTokens(dayData.input)}</p>
                      <p className="text-[9px]">Output: {formatTokens(dayData.output)}</p>
                      <p className="text-[9px] border-t border-neutral-800 mt-1 pt-0.5 font-bold">Total: {formatTokens(total)}</p>
                    </div>

                    {/* Stacked Chart Bar */}
                    <div 
                      style={{ height: `${heightPercentage}%` }}
                      className="w-8 rounded-lg overflow-hidden flex flex-col justify-end bg-neutral-100 dark:bg-neutral-850 hover:opacity-90 transition-all cursor-pointer"
                    >
                      <div className="bg-neutral-300 dark:bg-neutral-600 w-full" style={{ height: `${100 - inputPercentage}%` }} />
                      <div className={`${theme.progressColor} w-full`} style={{ height: `${inputPercentage}%` }} />
                    </div>

                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-2.5 block">{dayData.day}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Chart Legend */}
            <div className="flex items-center gap-4 justify-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-sm ${theme.progressColor}`} />
                <span>Input Tokens</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-sm bg-neutral-300 dark:bg-neutral-600" />
                <span>Output Tokens</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing details, Policy constraints & Recent requests */}
        <div className="space-y-6">
          {/* Policy Constraints info card */}
          <div className={`border ${theme.border} rounded-3xl p-6 shadow-sm bg-gradient-to-b ${theme.gradient} space-y-4`}>
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
              <Zap className={`${theme.primary} w-5 h-5`} />
              <h3 className="text-sm font-bold">Provider Gateway Guidelines</h3>
            </div>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
              Billing rate limits and latency guarantees are tied to the verified Tri-Cloud gateways. Enterprise support plans cover custom limits for concurrent client calls.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-neutral-400">Concurrent Limit</span>
                <span className="font-semibold text-neutral-800 dark:text-white">100 req/sec</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-neutral-400">Routing Policy</span>
                <span className="font-semibold text-neutral-800 dark:text-white text-right">Zero-Trust Latency Optimized</span>
              </div>
            </div>
          </div>

          {/* Recent API Requests Log */}
          <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-neutral-950 dark:text-white">Recent Requests</h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">Live feed of model completions.</p>
            </div>

            <div className="space-y-3.5">
              {data.recentRequests.map((req) => (
                <div key={req.id} className="text-xs border-b border-neutral-100 dark:border-neutral-850/60 pb-3 last:border-b-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      {req.modelName}
                    </span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{req.timestamp}</span>
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px] truncate opacity-90">
                    "{req.promptSnippet}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-medium">
                    <span>{req.tokens} t | {req.latency}ms</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-350">${req.cost.toFixed(4)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
