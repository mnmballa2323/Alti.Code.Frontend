"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  Coins, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  TrendingUp,
  FileText
} from "lucide-react";
import { Chip } from "@heroui/react";

// Types for simplified Model Usage
interface ModelUsageInfo {
  name: string;
  version: string;
  isPrimary: boolean;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  avgLatency: number;
  cost: number;
  pricingPer1MInput: number;
  pricingPer1MOutput: number;
  dailyUsage: { day: string; tokens: number }[];
  recentRequests: {
    id: string;
    timestamp: string;
    promptSnippet: string;
    tokens: number;
    latency: number;
    cost: number;
  }[];
}

interface ProviderUsageData {
  models: ModelUsageInfo[];
}

const initialUsageData: Record<string, ProviderUsageData> = {
  azure: {
    models: [
      {
        name: "GPT-4o",
        version: "2024-05-13",
        isPrimary: true,
        inputTokens: 4120000,
        outputTokens: 1200000,
        requests: 10240,
        avgLatency: 720,
        cost: 16.60,
        pricingPer1MInput: 2.50,
        pricingPer1MOutput: 10.00,
        dailyUsage: [
          { day: "Mon", tokens: 420000 },
          { day: "Tue", tokens: 510000 },
          { day: "Wed", tokens: 590000 },
          { day: "Thu", tokens: 480000 },
          { day: "Fri", tokens: 730000 },
          { day: "Sat", tokens: 260000 },
          { day: "Sun", tokens: 410000 },
        ],
        recentRequests: [
          {
            id: "req-gpt4o-1",
            timestamp: "Just now",
            promptSnippet: "Assemble dynamic view transitions layouts for admin routes...",
            tokens: 4320,
            latency: 680,
            cost: 0.0151,
          },
          {
            id: "req-gpt4o-2",
            timestamp: "18 mins ago",
            promptSnippet: "Optimize database connection pooling parameters for PostgreSQL...",
            tokens: 2840,
            latency: 750,
            cost: 0.0092,
          },
          {
            id: "req-gpt4o-3",
            timestamp: "1 hr ago",
            promptSnippet: "Translate system documentation translation assets for French localization...",
            tokens: 1850,
            latency: 620,
            cost: 0.0058,
          },
        ]
      },
      {
        name: "GPT-4o-mini",
        version: "2024-07-18",
        isPrimary: false,
        inputTokens: 950000,
        outputTokens: 150000,
        requests: 4262,
        avgLatency: 280,
        cost: 2.30,
        pricingPer1MInput: 0.15,
        pricingPer1MOutput: 0.60,
        dailyUsage: [
          { day: "Mon", tokens: 90000 },
          { day: "Tue", tokens: 110000 },
          { day: "Wed", tokens: 120000 },
          { day: "Thu", tokens: 110000 },
          { day: "Fri", tokens: 160000 },
          { day: "Sat", tokens: 50000 },
          { day: "Sun", tokens: 80000 },
        ],
        recentRequests: [
          {
            id: "req-gpt4omini-1",
            timestamp: "45 mins ago",
            promptSnippet: "Form autofill handler autocomplete listeners implementation...",
            tokens: 820,
            latency: 250,
            cost: 0.0002,
          },
          {
            id: "req-gpt4omini-2",
            timestamp: "2 hrs ago",
            promptSnippet: "Sanitize HTML string utility function input checks...",
            tokens: 450,
            latency: 220,
            cost: 0.0001,
          },
          {
            id: "req-gpt4omini-3",
            timestamp: "5 hrs ago",
            promptSnippet: "Fetch user profile status header check values...",
            tokens: 350,
            latency: 290,
            cost: 0.0001,
          },
        ]
      }
    ]
  },
  aws: {
    models: [
      {
        name: "Claude 3.5 Sonnet",
        version: "v2 (Latest)",
        isPrimary: true,
        inputTokens: 2450000,
        outputTokens: 890000,
        requests: 7650,
        avgLatency: 820,
        cost: 11.80,
        pricingPer1MInput: 3.00,
        pricingPer1MOutput: 15.00,
        dailyUsage: [
          { day: "Mon", tokens: 290000 },
          { day: "Tue", tokens: 360000 },
          { day: "Wed", tokens: 420000 },
          { day: "Thu", tokens: 330000 },
          { day: "Fri", tokens: 510000 },
          { day: "Sat", tokens: 190000 },
          { day: "Sun", tokens: 440000 },
        ],
        recentRequests: [
          {
            id: "req-claude-1",
            timestamp: "2 mins ago",
            promptSnippet: "Explain clean architecture module dependencies in Kotlin KMP...",
            tokens: 1820,
            latency: 780,
            cost: 0.0078,
          },
          {
            id: "req-claude-2",
            timestamp: "12 mins ago",
            promptSnippet: "Refactor MonacoEditor.tsx component layout parameters...",
            tokens: 3450,
            latency: 950,
            cost: 0.0142,
          },
          {
            id: "req-claude-3",
            timestamp: "2 hrs ago",
            promptSnippet: "Parse incoming git diff layout representation regex helper...",
            tokens: 1250,
            latency: 890,
            cost: 0.0049,
          },
        ]
      },
      {
        name: "Claude 3 Opus",
        version: "v1",
        isPrimary: false,
        inputTokens: 320000,
        outputTokens: 185000,
        requests: 782,
        avgLatency: 2100,
        cost: 3.02,
        pricingPer1MInput: 15.00,
        pricingPer1MOutput: 75.00,
        dailyUsage: [
          { day: "Mon", tokens: 50000 },
          { day: "Tue", tokens: 80000 },
          { day: "Wed", tokens: 90000 },
          { day: "Thu", tokens: 70000 },
          { day: "Fri", tokens: 110000 },
          { day: "Sat", tokens: 40000 },
          { day: "Sun", tokens: 65000 },
        ],
        recentRequests: [
          {
            id: "req-opus-1",
            timestamp: "1 hr ago",
            promptSnippet: "Execute security scan rules auditor for Supabase postgres.sql...",
            tokens: 8900,
            latency: 2400,
            cost: 0.185,
          },
          {
            id: "req-opus-2",
            timestamp: "4 hrs ago",
            promptSnippet: "Audit multi-agent coordination loop deadlocks and race conditions...",
            tokens: 12400,
            latency: 2800,
            cost: 0.245,
          },
        ]
      }
    ]
  },
  gcp: {
    models: [
      {
        name: "Gemini 1.5 Pro",
        version: "v1.5",
        isPrimary: true,
        inputTokens: 3100000,
        outputTokens: 710000,
        requests: 6920,
        avgLatency: 980,
        cost: 4.86,
        pricingPer1MInput: 1.25,
        pricingPer1MOutput: 5.00,
        dailyUsage: [
          { day: "Mon", tokens: 380000 },
          { day: "Tue", tokens: 420000 },
          { day: "Wed", tokens: 490000 },
          { day: "Thu", tokens: 350000 },
          { day: "Fri", tokens: 580000 },
          { day: "Sat", tokens: 210000 },
          { day: "Sun", tokens: 490000 },
        ],
        recentRequests: [
          {
            id: "req-gemini-1",
            timestamp: "24 mins ago",
            promptSnippet: "Perform evolutionary conservation phyloP scores lookup UCSC...",
            tokens: 12400,
            latency: 1120,
            cost: 0.0182,
          },
          {
            id: "req-gemini-2",
            timestamp: "1 hr ago",
            promptSnippet: "Resolve biological ontology terms resolution lookup EBI OLS...",
            tokens: 4120,
            latency: 890,
            cost: 0.0058,
          },
        ]
      },
      {
        name: "Gemini 1.5 Flash",
        version: "v1.5",
        isPrimary: false,
        inputTokens: 1100000,
        outputTokens: 300000,
        requests: 4283,
        avgLatency: 340,
        cost: 1.26,
        pricingPer1MInput: 0.075,
        pricingPer1MOutput: 0.30,
        dailyUsage: [
          { day: "Mon", tokens: 105000 },
          { day: "Tue", tokens: 140000 },
          { day: "Wed", tokens: 155000 },
          { day: "Thu", tokens: 120000 },
          { day: "Fri", tokens: 170000 },
          { day: "Sat", tokens: 60000 },
          { day: "Sun", tokens: 145000 },
        ],
        recentRequests: [
          {
            id: "req-flash-1",
            timestamp: "5 mins ago",
            promptSnippet: "Lookup clinical evidence pathogen classification ClinVar...",
            tokens: 950,
            latency: 280,
            cost: 0.0001,
          },
          {
            id: "req-flash-2",
            timestamp: "3 hrs ago",
            promptSnippet: "Check active server healthz ping route status check...",
            tokens: 120,
            latency: 110,
            cost: 0.00001,
          },
        ]
      }
    ]
  }
};

// Unified black, white, gray, and royal blue theme tokens
const theme = {
  primary: "text-blue-600 dark:text-blue-400",
  bg: "bg-blue-50/70 dark:bg-blue-950/15",
  border: "border-neutral-200 dark:border-neutral-800/80",
  accentBg: "bg-blue-600 dark:bg-blue-500",
  hoverBg: "hover:bg-blue-700 dark:hover:bg-blue-600",
  gradient: "from-blue-600/5 to-transparent",
  progressColor: "bg-blue-600 dark:bg-blue-500"
};

export default function ModelUsagePage() {
  const [activeTab, setActiveTab] = useState<"aws" | "gcp" | "azure">("azure");
  const data = initialUsageData[activeTab];

  // Format tokens display helper
  const formatTokens = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "k";
    }
    return num.toString();
  };

  return (
    <div className="w-full flex flex-col h-full justify-start pt-6 max-w-5xl mx-auto">
      <div className="space-y-6">
        {/* Centered Provider Toggle Header */}
        <div className="flex justify-center w-full border-b border-neutral-100 dark:border-neutral-800/80 pb-6 mb-2">
          <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 shrink-0 shadow-sm">
            <button
              onClick={() => setActiveTab("azure")}
              className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "azure"
                  ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              GPT
            </button>
            <button
              onClick={() => setActiveTab("aws")}
              className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "aws"
                  ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Claude
            </button>
            <button
              onClick={() => setActiveTab("gcp")}
              className={`px-6 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === "gcp"
                  ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              Gemini
            </button>
          </div>
        </div>

        {/* Side-by-side Model Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.models.map((model) => {
            const modelTokens = model.inputTokens + model.outputTokens;
            
            // Find max daily tokens for chart height scaling
            const maxDailyTokens = Math.max(...model.dailyUsage.map((u) => u.tokens), 100000);

            return (
              <div 
                key={model.name}
                className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6 flex flex-col justify-between"
              >
                {/* 1. Header Info */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-neutral-100 dark:border-neutral-850 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        {model.name}
                        {model.isPrimary && (
                          <Chip className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] border-none font-bold h-4" size="sm">
                            Primary
                          </Chip>
                        )}
                      </h3>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Version: {model.version}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-neutral-950 dark:text-white">${model.cost.toFixed(2)}</span>
                      <p className="text-[9px] text-neutral-400 dark:text-neutral-500">
                        ${model.pricingPer1MInput.toFixed(2)} / ${model.pricingPer1MOutput.toFixed(2)} <span className="opacity-60">1M t</span>
                      </p>
                    </div>
                  </div>

                  {/* 2. Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* API Requests */}
                    <div className="bg-neutral-50/40 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-850 p-3 rounded-2xl flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme.bg} ${theme.primary}`}>
                        <Activity size={14} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">API Calls</span>
                        <span className="text-xs font-bold text-neutral-850 dark:text-neutral-250">{model.requests.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Latency */}
                    <div className="bg-neutral-50/40 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-850 p-3 rounded-2xl flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme.bg} ${theme.primary}`}>
                        <Clock size={14} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">Avg Latency</span>
                        <span className="text-xs font-bold text-neutral-850 dark:text-neutral-250">{model.avgLatency}ms</span>
                      </div>
                    </div>

                    {/* Total Tokens */}
                    <div className="bg-neutral-50/40 dark:bg-neutral-900/10 border border-neutral-100 dark:border-neutral-850 p-3 rounded-2xl flex items-center gap-3 col-span-2">
                      <div className={`p-2 rounded-lg ${theme.bg} ${theme.primary}`}>
                        <Cpu size={14} />
                      </div>
                      <div className="flex-1 flex justify-between items-center pr-2">
                        <div>
                          <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase block">Tokens Processed</span>
                          <span className="text-xs font-bold text-neutral-850 dark:text-neutral-250">{formatTokens(modelTokens)}</span>
                        </div>
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium">
                          In: {formatTokens(model.inputTokens)} | Out: {formatTokens(model.outputTokens)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Daily Usage Spark Chart */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">7-Day Volume Trend</span>
                    <div className="h-24 w-full flex items-end justify-between gap-1 pb-1 pt-4 font-mono border-b border-neutral-100 dark:border-neutral-850">
                      {model.dailyUsage.map((dayData) => {
                        const heightPercentage = Math.min((dayData.tokens / maxDailyTokens) * 100, 100);
                        return (
                          <div key={dayData.day} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Bar Tooltip */}
                            <div className="absolute bottom-full mb-1 bg-neutral-950 text-white text-[9px] rounded-lg p-1.5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-20 shadow-md border border-neutral-800">
                              <p className="font-bold text-neutral-350">{dayData.day}</p>
                              <p>{formatTokens(dayData.tokens)} tokens</p>
                            </div>
                            {/* Simple Royal Blue Bar */}
                            <div 
                              style={{ height: `${heightPercentage}%` }}
                              className={`${theme.progressColor} w-full rounded-t-sm hover:opacity-80 transition-all cursor-pointer`}
                            />
                            <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 mt-1.5 block">{dayData.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Recent Logs for this specific model */}
                <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={10} /> Model Activity Log
                  </span>
                  
                  <div className="space-y-2.5">
                    {model.recentRequests.map((req) => (
                      <div key={req.id} className="text-xs border-b border-neutral-100/50 dark:border-neutral-850/40 pb-2 last:border-b-0 last:pb-0 space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <p className="text-neutral-500 dark:text-neutral-400 truncate flex-1 pr-4">
                            "{req.promptSnippet}"
                          </p>
                          <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono shrink-0">{req.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-neutral-400 font-medium">
                          <span>{req.tokens} t | {req.latency}ms</span>
                          <span className="font-bold text-neutral-800 dark:text-neutral-350">${req.cost.toFixed(4)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
