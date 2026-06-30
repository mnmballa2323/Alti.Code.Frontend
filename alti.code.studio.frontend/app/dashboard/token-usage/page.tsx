"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Icon } from "@iconify/react";

import { API_URL } from "@/lib/config";

interface ModelUsage {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  invocations: number;
  priceRate?: string;
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

type Provider = "GPT" | "Claude" | "Gemini";

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
  { id: "gpt-5.4", name: "GPT-5.4", price: "$2.50 in / $15.00 out" },
  { id: "gpt-5.4-mini", name: "GPT-5.4 Mini", price: "$0.75 in / $4.50 out" },
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
    price: "$12.00 in / $18.00 out",
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
  const [selectedProvider, setSelectedProvider] = useState<Provider>("GPT");

  const getProviderIcon = (p: Provider) => {
    switch (p) {
      case "GPT":
        return "simple-icons:openai";
      case "Claude":
        return "simple-icons:claude";
      case "Gemini":
        return "simple-icons:googlegemini";
      default:
        return "solar:box-minimalistic-bold-duotone";
    }
  };

  const getProviderColor = (p: Provider) => {
    switch (p) {
      case "GPT":
        return "text-black dark:text-white";
      case "Claude":
        return "text-[#CC9980]";
      case "Gemini":
        return "text-blue-500 dark:text-blue-400";
      default:
        return "";
    }
  };

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

      return {
        ...m,
        priceRate: def?.price || "Pricing N/A",
      };
    });
  };

  const gptModels = mergeProviderModels("gpt");
  const claudeModels = mergeProviderModels("claude");
  const geminiModels = mergeProviderModels("gemini");

  return (
    <div className="flex-1 bg-[#F4F4F6] dark:bg-background min-h-screen overflow-y-auto">
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-center mb-8">
          <div className="flex p-1 space-x-1 bg-default-200/50 dark:bg-default-50/10 rounded-xl shadow-inner">
            {(["GPT", "Claude", "Gemini"] as Provider[]).map((p) => (
              <button
                key={p}
                className={`px-8 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedProvider === p
                    ? "bg-white dark:bg-default-200 shadow-sm text-foreground"
                    : "text-default-500 hover:text-foreground hover:bg-default-200/50 dark:hover:bg-default-100/50"
                }`}
                onClick={() => setSelectedProvider(p)}
              >
                <Icon
                  className={`text-lg transition-colors ${selectedProvider === p ? getProviderColor(p) : ""}`}
                  icon={getProviderIcon(p)}
                />
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center mb-6">
          <h2 className="text-xl font-bold text-foreground">
            Current Month Usage
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          {selectedProvider === "GPT" && (
            <CategoryCard
              bg="bg-black/5 dark:bg-white/5"
              color="text-black dark:text-white"
              icon="simple-icons:openai"
              models={gptModels}
              title="GPT Models"
            />
          )}
          {selectedProvider === "Claude" && (
            <CategoryCard
              bg="bg-[#CC9980]/10"
              color="text-[#CC9980]"
              icon="simple-icons:claude"
              models={claudeModels}
              title="Claude Models"
            />
          )}
          {selectedProvider === "Gemini" && (
            <CategoryCard
              bg="bg-blue-500/10"
              color="text-blue-500 dark:text-blue-400"
              icon="simple-icons:googlegemini"
              models={geminiModels}
              title="Gemini Models"
            />
          )}
        </div>

        {history.length > 0 && (
          <div className="max-w-2xl mx-auto mt-12">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Monthly History Ledger
            </h2>
            <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm">
              <CardBody className="p-0">
                <ul className="divide-y divide-default-200 dark:divide-white/5">
                  {history.map((h, idx) => (
                    <li
                      key={idx}
                      className="p-4 hover:bg-default-100 dark:hover:bg-white/5 transition-colors flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-sm block">
                          {h.month}
                        </span>
                        <span className="text-xs text-default-500">
                          {h.invocations.toLocaleString()} requests
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-mono font-bold text-warning block">
                          ${h.cost.toFixed(4)}
                        </span>
                        <span className="text-xs text-default-400 font-mono">
                          {h.totalTokens.toLocaleString()} tkns
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryCard({
  title,
  icon,
  color,
  bg,
  models,
}: {
  title: string;
  icon: string;
  color: string;
  bg: string;
  models: ModelUsage[];
}) {
  const totalCategoryTokens = models.reduce((acc, m) => acc + m.totalTokens, 0);
  const totalCategoryCost = models.reduce((acc, m) => acc + m.cost, 0);

  return (
    <Card className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 text-foreground flex flex-col shadow-sm">
      <CardHeader
        className={`flex gap-3 items-center p-4 border-b border-default-200 dark:border-white/10 ${bg}`}
      >
        <Icon className={`text-2xl ${color}`} icon={icon} />
        <div className="flex-1">
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono font-bold">
            ${totalCategoryCost.toFixed(4)}
          </p>
          <p className="text-xs text-default-400">
            {totalCategoryTokens.toLocaleString()} tkns
          </p>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1">
        {models.length === 0 ? (
          <div className="p-8 flex flex-col justify-center items-center text-center text-default-400 opacity-50">
            <Icon className="text-3xl mb-2" icon="solar:ghost-bold-duotone" />
            <p className="text-sm">No usage recorded yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-default-200 dark:divide-white/5">
            {models.map((m, idx) => (
              <li
                key={idx}
                className="p-4 hover:bg-default-100 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">{m.model}</span>
                  <span className="text-xs font-mono text-warning">
                    ${m.cost.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-default-500 font-mono">
                  <span>{m.totalTokens.toLocaleString()} total tokens</span>
                  <span>{m.priceRate}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
