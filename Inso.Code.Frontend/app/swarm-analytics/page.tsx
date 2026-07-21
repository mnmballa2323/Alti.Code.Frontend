"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody, Chip } from "@heroui/react";

interface TelemetryData {
  agent: string;
  tokens: number;
  costUsd: number;
  latencyMs: number;
  circuitStatus: "CLOSED" | "OPEN" | "HALF_OPEN";
  timestamp: string;
}

export default function SwarmAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<TelemetryData[]>([]);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);

  useEffect(() => {
    // Phase 42: Connect to backend Swarm Events (assuming standard SSE URL)
    const eventSource = new EventSource(
      "http://localhost:3000/api/telemetry/stream",
    );

    eventSource.onmessage = (event) => {
      try {
        const data: TelemetryData = JSON.parse(event.data);

        if (data.agent) {
          setMetrics((prev) => {
            const updated = [data, ...prev].slice(0, 50); // Keep last 50 events

            return updated;
          });
          setTotalTokens((prev) => prev + (data.tokens || 0));
          setTotalCost((prev) => prev + (data.costUsd || 0));
        }
      } catch (err) {
        console.warn("Swarm Analytics Parse Error:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const agentLeaderboard = Object.entries(
    metrics.reduce(
      (acc, curr) => {
        if (!acc[curr.agent])
          acc[curr.agent] = { count: 0, cost: 0, tokens: 0 };
        acc[curr.agent].count += 1;
        acc[curr.agent].cost += curr.costUsd || 0;
        acc[curr.agent].tokens += curr.tokens || 0;

        return acc;
      },
      {} as Record<string, { count: number; cost: number; tokens: number }>,
    ),
  )
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Swarm Global Analytics
        </h1>
        <p className="text-default-500">
          Realtime telemetry, circuit caps, and cost metrics across the agent
          ecosystem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-background/60 dark:bg-default-100/50">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Total Swarm Tokens</p>
              <p className="text-small text-default-500">
                Live aggregated input/output
              </p>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-semibold">
              {totalTokens.toLocaleString()}
            </p>
          </CardBody>
        </Card>

        <Card className="bg-background/60 dark:bg-default-100/50">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Cumulative Cost</p>
              <p className="text-small text-default-500">Estimated USD</p>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-semibold text-success">
              ${totalCost.toFixed(4)}
            </p>
          </CardBody>
        </Card>

        <Card className="bg-background/60 dark:bg-default-100/50">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Swarm Pulse</p>
              <p className="text-small text-default-500">Events per minute</p>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-semibold text-primary">
              {
                metrics.filter(
                  (m) => Date.now() - new Date(m.timestamp).getTime() < 60000,
                ).length
              }
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-background/60 dark:bg-default-100/50 flex-1 h-[400px]">
          <CardHeader>
            <h3 className="text-lg font-bold">Agent Leaderboard (Top 10)</h3>
          </CardHeader>
          <CardBody className="overflow-y-auto">
            {agentLeaderboard.length === 0 ? (
              <p className="text-default-400 p-4">
                Awaiting swarm telemetry...
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {agentLeaderboard.map(([agent, stats], idx) => (
                  <div
                    key={agent}
                    className="flex justify-between items-center border-b border-divider pb-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-default-500">
                        #{idx + 1}
                      </span>
                      <span className="font-medium">{agent}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-default-500">
                      <span>{stats.count} calls</span>
                      <span>${stats.cost.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card className="bg-background/60 dark:bg-default-100/50 flex-1 h-[400px]">
          <CardHeader>
            <h3 className="text-lg font-bold">Live Execution Stream</h3>
          </CardHeader>
          <CardBody className="overflow-y-auto overflow-x-hidden">
            {metrics.length === 0 ? (
              <p className="text-default-400 p-4">No events captured yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {metrics.slice(0, 15).map((m, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1 text-sm bg-default-50 rounded-md p-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{m.agent}</span>
                      <Chip
                        color={
                          m.circuitStatus === "OPEN"
                            ? "danger"
                            : m.circuitStatus === "HALF_OPEN"
                              ? "warning"
                              : "success"
                        }
                        size="sm"
                        variant="flat"
                      >
                        {m.circuitStatus || "CLOSED"}
                      </Chip>
                    </div>
                    <div className="flex justify-between text-default-500 text-xs">
                      <span>Latency: {m.latencyMs || 0}ms</span>
                      <span>
                        Timestamp:{" "}
                        {new Date(
                          m.timestamp || Date.now(),
                        ).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
