import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Icon } from "@iconify/react";
import { FormattedMessage } from "react-intl";

import { API_URL } from "@/lib/config";

interface CostMetrics {
  totals: {
    totalCost: number;
    totalTokens: number;
    totalInvocations: number;
    avgExecutionMs: number;
  };
  topAgents: Array<{ agent: string; cost: number; calls: number }>;
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
      const res = await fetch(`${API_URL}/metrics/mission-control/stats`, {
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

  const { totals, topAgents } = metrics || {
    totals: {
      totalCost: 0,
      totalTokens: 0,
      totalInvocations: 0,
      avgExecutionMs: 0,
    },
    topAgents: [],
  };

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
              ${totals.totalCost.toFixed(4)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-default-400 mb-1 tracking-wider uppercase">
              Total Tokens
            </p>
            <p className="text-xl font-mono">
              {totals.totalTokens.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-default-400 mb-1 tracking-wider uppercase">
              Swarm Invocations
            </p>
            <p className="text-xl font-mono">{totals.totalInvocations}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-default-400 mb-1 tracking-wider uppercase">
              Avg Latency
            </p>
            <p className="text-xl font-mono">
              {(totals.avgExecutionMs / 1000).toFixed(2)}s
            </p>
          </div>
        </div>

        {topAgents.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-semibold text-default-500 uppercase mb-3 border-b border-white/10 pb-2">
              Top Burning Agents
            </p>
            <div className="space-y-2">
              {topAgents.map((agent, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm p-2 rounded bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className="text-indigo-400"
                      icon="solar:cpu-bolt-bold"
                    />
                    <span className="font-semibold">{agent.agent}</span>
                  </div>
                  <div className="text-right font-mono text-default-400">
                    <span className="text-warning mr-3">
                      ${agent.cost.toFixed(4)}
                    </span>
                    <span className="text-xs">{agent.calls} calls</span>
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
