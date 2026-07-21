"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import {
  Bot,
  Search,
  Plus,
  Play,
  Pencil,
  Trash2,
  Loader2,
  Activity,
  Clock,
  Shield,
  Code,
  FileText,
  Gauge,
  TestTube,
} from "lucide-react";

import { API_URL } from "@/lib/config";

interface Agent {
  id: string;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  lastRun: string;
  runCount: number;
  icon: string;
}

const TYPE_COLORS: Record<string, string> = {
  code: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  security: "bg-red-500/10 text-red-600 dark:text-red-400",
  testing: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  docs: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  perf: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  research: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  code: Code,
  security: Shield,
  testing: TestTube,
  docs: FileText,
  perf: Gauge,
  research: Search,
};

const MOCK_AGENTS: Agent[] = [
  {
    id: "1",
    name: "Code Architect",
    type: "code",
    status: "active",
    lastRun: "2 min ago",
    runCount: 142,
    icon: "code",
  },
  {
    id: "2",
    name: "Security Auditor",
    type: "security",
    status: "active",
    lastRun: "15 min ago",
    runCount: 87,
    icon: "security",
  },
  {
    id: "3",
    name: "Test Generator",
    type: "testing",
    status: "active",
    lastRun: "5 min ago",
    runCount: 234,
    icon: "testing",
  },
  {
    id: "4",
    name: "Doc Writer",
    type: "docs",
    status: "inactive",
    lastRun: "2 days ago",
    runCount: 45,
    icon: "docs",
  },
  {
    id: "5",
    name: "API Designer",
    type: "code",
    status: "active",
    lastRun: "30 min ago",
    runCount: 63,
    icon: "code",
  },
  {
    id: "6",
    name: "Performance Analyzer",
    type: "perf",
    status: "active",
    lastRun: "1 hour ago",
    runCount: 112,
    icon: "perf",
  },
];

export default function AdminAiAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("token");
        const headers: HeadersInit = { "Content-Type": "application/json" };

        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}/agents`, { headers });

        if (res.ok) {
          const json = await res.json();

          if (json.data?.length) setAgents(json.data);
        }
      } catch {
        /* mock fallback */
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F4F6] dark:bg-background min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-default-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F4F4F6] dark:bg-background min-h-screen overflow-y-auto">
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">AI Agents</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-default-400" />
              <input
                className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-64"
                placeholder="Search agents..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              <Plus className="w-4 h-4" /> New Agent
            </button>
          </div>
        </div>

        {/* Orchestration Status */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Active Pipelines", value: "2", color: "text-blue-500" },
            { label: "Queued Tasks", value: "5", color: "text-amber-500" },
            {
              label: "Agents Running",
              value: "3 / 10",
              color: "text-emerald-500",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm"
            >
              <CardBody className="p-4 text-center">
                <p className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-default-500 mt-1">{stat.label}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => {
            const TypeIcon = TYPE_ICONS[agent.type] || Bot;

            return (
              <Card
                key={agent.id}
                className="bg-white dark:bg-black/40 border border-default-200 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardBody className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${TYPE_COLORS[agent.type] || "bg-default-100"}`}
                      >
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          {agent.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[agent.type] || "bg-default-100 text-default-500"}`}
                        >
                          {agent.type}
                        </span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${agent.status === "active" ? "bg-emerald-500 animate-pulse" : agent.status === "error" ? "bg-red-500" : "bg-default-300"}`}
                      />
                      <span className="text-xs text-default-400 capitalize">
                        {agent.status}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-default-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {agent.lastRun}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" /> {agent.runCount} runs
                    </span>
                  </div>

                  <div className="flex items-center gap-2 border-t border-default-100 dark:border-white/5 pt-3">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      <Play className="w-3.5 h-3.5" /> Run
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium bg-default-100 dark:bg-default-50/10 text-default-500 hover:bg-default-200 transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button className="flex items-center justify-center p-1.5 rounded-lg text-xs text-default-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
