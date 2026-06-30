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

export default function TokenUsagePage() {
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") || localStorage.getItem("token")
          : null;
      
      const res = await fetch(`${API_URL}/api/v1/metrics/user/stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      const data = await res.json();

      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user token metrics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="w-full h-full p-8 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <Icon icon="solar:chart-square-bold-duotone" className="text-4xl text-white/20 mb-4" />
          <p className="text-white/50">Loading Token Usage...</p>
        </div>
      </div>
    );
  }

  const modelsUsage = metrics?.modelsUsage || [];
  const billing = metrics?.billing;

  // Group by specific categories: GPT, Claude, Gemini
  const gptModels = modelsUsage.filter((m) => m.model.toLowerCase().includes("gpt"));
  const claudeModels = modelsUsage.filter((m) => m.model.toLowerCase().includes("claude"));
  const geminiModels = modelsUsage.filter((m) => m.model.toLowerCase().includes("gemini"));

  return (
    <div className="flex-1 bg-gray-900 min-h-screen overflow-y-auto">
      <div className="p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <Icon icon="solar:activity-bold-duotone" className="text-3xl text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Token Usage</h1>
            <p className="text-sm text-default-400">Detailed breakdown of your model inference consumption</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPT Category */}
        <CategoryCard title="GPT Models" icon="solar:box-minimalistic-bold-duotone" color="text-emerald-400" bg="bg-emerald-500/10" models={gptModels} />
        
        {/* Claude Category */}
        <CategoryCard title="Claude Models" icon="solar:box-minimalistic-bold-duotone" color="text-amber-400" bg="bg-amber-500/10" models={claudeModels} />

        {/* Gemini Category */}
        <CategoryCard title="Gemini Models" icon="solar:box-minimalistic-bold-duotone" color="text-blue-400" bg="bg-blue-500/10" models={geminiModels} />
      </div>
      </div>
    </div>
  );
}

function CategoryCard({ title, icon, color, bg, models }: { title: string; icon: string; color: string; bg: string; models: ModelUsage[] }) {
  const totalCategoryTokens = models.reduce((acc, m) => acc + m.totalTokens, 0);
  const totalCategoryCost = models.reduce((acc, m) => acc + m.cost, 0);

  return (
    <Card className="bg-black/40 border border-white/10 text-white flex flex-col shadow-none">
      <CardHeader className={`flex gap-3 items-center p-4 border-b border-white/10 ${bg}`}>
        <Icon icon={icon} className={`text-2xl ${color}`} />
        <div className="flex-1">
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-xs text-default-400">{models.length} {models.length === 1 ? 'model' : 'models'} used</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono font-bold">${totalCategoryCost.toFixed(4)}</p>
          <p className="text-xs text-default-400">{totalCategoryTokens.toLocaleString()} tkns</p>
        </div>
      </CardHeader>
      <CardBody className="p-0 flex-1">
        {models.length === 0 ? (
          <div className="p-8 flex flex-col justify-center items-center text-center opacity-50">
            <Icon icon="solar:ghost-bold-duotone" className="text-3xl mb-2" />
            <p className="text-sm">No usage recorded yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {models.map((m, idx) => (
              <li key={idx} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">{m.model}</span>
                  <span className="text-xs font-mono text-warning">${m.cost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-default-500 font-mono">
                  <span>{m.totalTokens.toLocaleString()} total tokens</span>
                  <span>{m.invocations} calls</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
