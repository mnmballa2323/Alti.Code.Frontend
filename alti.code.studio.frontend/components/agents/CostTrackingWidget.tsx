import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Icon } from "@iconify/react";
import { FormattedMessage } from "react-intl";

import { API_URL } from "@/lib/config";

interface CostMetrics {
  billing?: {
    plan: string;
    tokensUsed: number;
    tokensRemaining: number;
    monthlyAllowance: number;
  };
  modelsUsage: Array<{
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cost: number;
    invocations: number;
  }>;
}

export default function CostTrackingWidget() {
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const res = await fetch(`${API_URL}/api/v1/metrics/user/stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch AI Cost metrics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Poll every 10 seconds for real-time burn rate
    const interval = setInterval(fetchMetrics, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading && !metrics) {
    return (
      <Card className="w-full bg-black/40 backdrop-blur-xl border border-white/10 p-6 animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-4" />
        <div className="flex gap-4">
          <div className="h-16 flex-1 bg-white/5 rounded" />
          <div className="h-16 flex-1 bg-white/5 rounded" />
        </div>
      </Card>
    );
  }

  const modelsUsage = metrics?.modelsUsage || [];
  const billing = metrics?.billing;

  const totalCost = modelsUsage.reduce((acc, m) => acc + m.cost, 0);
  const totalTokens =
    billing?.tokensUsed ||
    modelsUsage.reduce((acc, m) => acc + m.totalTokens, 0);
  const totalInvocations = modelsUsage.reduce(
    (acc, m) => acc + m.invocations,
    0,
  );

  return (
    <Card className="w-full bg-black/40 backdrop-blur-xl border border-white/10 text-white">
      <CardHeader className="flex flex-col items-start gap-1 pb-2">
        <div className="flex items-center gap-2">
          <Icon
            className="text-secondary"
            icon="solar:wallet-money-bold-duotone"
            width={24}
          />
          <h3 className="text-lg font-bold">Enterprise Analytics</h3>
        </div>
        <p className="text-xs text-default-400">
          <FormattedMessage
            defaultMessage="Vertex AI Token Consumption"
            id="metrics.subtitle"
          />
        </p>
      </CardHeader>
      <CardBody className="py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-default-400 mb-1 tracking-wider uppercase">
              Estimated Cost
            </p>
            <p className="text-2xl font-mono font-semibold text-success">
              ${totalCost.toFixed(4)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-default-400 mb-1 tracking-wider uppercase">
              Total Tokens
            </p>
            <p className="text-xl font-mono">{totalTokens.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-default-400 mb-1 tracking-wider uppercase">
              Swarm Invocations
            </p>
            <p className="text-xl font-mono">{totalInvocations}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-default-400 mb-1 tracking-wider uppercase">
              Avg Latency
            </p>
            <p className="text-xl font-mono">N/A</p>
          </div>
        </div>

        {modelsUsage.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-default-500 uppercase mb-3 border-b border-white/10 pb-2">
              Top Models Used
            </p>
            <div className="space-y-2">
              {modelsUsage.map((m, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm p-2 rounded bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className="text-indigo-400"
                      icon="solar:server-square-cloud-bold"
                    />
                    <span className="font-semibold">{m.model}</span>
                  </div>
                  <div className="text-right font-mono text-default-400">
                    <span className="text-warning mr-3">
                      ${m.cost.toFixed(4)}
                    </span>
                    <span className="text-xs">
                      {m.totalTokens.toLocaleString()} tokens
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
