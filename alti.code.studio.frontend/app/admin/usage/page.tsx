"use client";

import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

import { API_URL } from "@/lib/config";

interface ModelUsage {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  invocations: number;
  priceIn?: string;
  priceOut?: string;
}

interface CostMetrics {
  billing?: {
    plan: string;
    tokensUsed: number;
    tokensRemaining: number;
    monthlyAllowance: number;
  };
  modelsUsage: ModelUsage[];
}

interface HistoryEntry {
  month: string;
  year: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  invocations: number;
}

const ALL_MODELS = [
  {
    id: "claude-fable-5",
    name: "Claude Fable 5",
    price: "$10.00 in / $50.00 out",
  },
  {
    id: "claude-opus-4.8",
    name: "Claude Opus 4.8",
    price: "$5.00 in / $25.00 out",
  },
  {
    id: "claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    price: "$3.00 in / $15.00 out",
  },
  {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    price: "$4.00 in / $18.00 out",
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    price: "$1.50 in / $9.00 out",
  },
];

export default function TokenUsagePage() {
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") || localStorage.getItem("token")
          : null;

      const res = await fetch(
        `${API_URL}/api/v1/metrics/user/stats?timeframe=current_month`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      const historyRes = await fetch(`${API_URL}/api/v1/metrics/user/history`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      const historyData = await historyRes.json();

      if (data.success) {
        setMetrics(data.data);
      }
      if (historyData.success) {
        setHistory(historyData.data);
      }
    } catch (error) {
      console.error("Failed to fetch user token metrics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMetrics();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="w-full h-full p-8 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <Icon
            className="text-4xl text-default-300 mb-4"
            icon="solar:chart-square-bold-duotone"
          />
          <p className="text-default-400">Loading Token Usage...</p>
        </div>
      </div>
    );
  }

  const modelsUsage = metrics?.modelsUsage || [];
  const billing = metrics?.billing;

  const mergeProviderModels = (keyword: string) => {
    const defaultsForProvider = ALL_MODELS.filter((m) =>
      m.id.toLowerCase().includes(keyword),
    );
    const apiModels = modelsUsage.filter((m) =>
      m.model.toLowerCase().includes(keyword),
    );

    const combined = [...apiModels];

    defaultsForProvider.forEach((def) => {
      if (!combined.some((m) => m.model === def.id || m.model === def.name)) {
        combined.push({
          model: def.name,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0,
          invocations: 0,
        });
      }
    });

    combined.sort((a, b) => {
      const idxA = ALL_MODELS.findIndex(
        (m) => m.id === a.model || m.name === a.model,
      );
      const idxB = ALL_MODELS.findIndex(
        (m) => m.id === b.model || m.name === b.model,
      );

      if (idxA === -1 && idxB === -1) return a.model.localeCompare(b.model);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;

      return idxA - idxB;
    });

    return combined.map((m) => {
      const def = ALL_MODELS.find(
        (d) => d.id === m.model || d.name === m.model,
      );

      const priceStr = def?.price || "Pricing N/A";
      const parts = priceStr.split(" / ");
      const priceIn = parts[0] ? parts[0].replace(" in", "") : "";
      const priceOut = parts[1] ? parts[1].replace(" out", "") : "";

      return {
        ...m,
        priceIn: priceIn || "N/A",
        priceOut: priceOut || "N/A",
      };
    });
  };

  const claudeModels = mergeProviderModels("claude");
  const geminiModels = mergeProviderModels("gemini");

  const currentModels = [...geminiModels, ...claudeModels];
  const totalTokens = currentModels.reduce((acc, m) => acc + m.totalTokens, 0);
  const totalCost = currentModels.reduce((acc, m) => acc + m.cost, 0);

  return (
    <div className="w-full flex-1 flex flex-col pt-6 pb-24">
      <div className="w-full flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-[25%_30%_30%_15%] px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl">
          <div>MODEL</div>
          <div>INPUT</div>
          <div>OUTPUT</div>
          <div className="text-right">COST</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-2 mt-4">
          {currentModels.map((m, idx) => (
            <UsageRow key={idx} model={m} />
          ))}
        </div>

        {/* Totals Bar */}
        <div className="flex items-center justify-between px-6 py-4 mt-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300">
          <div className="font-semibold text-neutral-900 dark:text-white">
            Total usage this month
          </div>
          <div className="flex gap-4 items-center">
            <div className="font-mono text-lg font-bold text-neutral-900 dark:text-white">
              ${totalCost.toFixed(2)}
            </div>
          </div>
        </div>

        {/* History Ledger */}
        {history.length > 0 && (
          <div className="mt-12 w-full flex-1 flex flex-col mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                History Ledger
              </h2>
            </div>
            <div className="grid grid-cols-[25%_25%_25%_25%] px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase tracking-wider bg-white dark:bg-neutral-900 rounded-t-xl">
              <div>MONTH</div>
              <div>REQUESTS</div>
              <div>TOKENS</div>
              <div className="text-right">COST</div>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {history.map((h, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[25%_25%_25%_25%] items-center px-6 h-[56px] bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                >
                  <div className="font-semibold text-neutral-900 dark:text-white">
                    {h.month}
                  </div>
                  <div className="text-neutral-500">
                    {h.invocations.toLocaleString()}
                  </div>
                  <div className="font-mono text-neutral-500">
                    {h.totalTokens.toLocaleString()} tkns
                  </div>
                  <div className="text-right font-mono text-neutral-900 dark:text-white font-bold">
                    ${h.cost.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UsageRow({ model }: { model: ModelUsage }) {
  const isClaude = model.model.toLowerCase().includes("claude");
  const isGemini = model.model.toLowerCase().includes("gemini");

  const iconName = isClaude
    ? "simple-icons:claude"
    : isGemini
      ? "simple-icons:googlegemini"
      : "solar:box-minimalistic-bold-duotone";
  const iconColor = isClaude
    ? "text-[#CC9980]"
    : isGemini
      ? "text-blue-500 dark:text-blue-400"
      : "text-neutral-500";

  return (
    <div className="grid grid-cols-[25%_30%_30%_15%] items-center px-6 py-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-sm transition-colors hover:border-neutral-300 dark:hover:border-neutral-700">
      <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
        <Icon className={`text-lg ${iconColor}`} icon={iconName} />
        {model.model}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm text-neutral-900 dark:text-white">
          {model.promptTokens.toLocaleString()}{" "}
          <span className="text-neutral-400">tkns</span>
        </span>
        <span className="text-[10px] text-neutral-500 font-mono">
          {model.priceIn} / 1M
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm text-neutral-900 dark:text-white">
          {model.completionTokens.toLocaleString()}{" "}
          <span className="text-neutral-400">tkns</span>
        </span>
        <span className="text-[10px] text-neutral-500 font-mono">
          {model.priceOut} / 1M
        </span>
      </div>
      <div className="text-right font-mono text-sm text-neutral-900 dark:text-white font-bold">
        ${model.cost.toFixed(2)}
      </div>
    </div>
  );
}
