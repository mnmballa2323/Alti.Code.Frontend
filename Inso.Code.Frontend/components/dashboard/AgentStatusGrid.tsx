"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Chip,
} from "@heroui/react";
import axios from "axios";

import { API_URL } from "@/lib/config";
import { useSocket } from "@/hooks/useSocket";

type AgentStatusType = "online" | "working" | "offline" | "error";

interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatusType;
  currentTask?: string;
}

const FALLBACK_AGENTS: Agent[] = [
  {
    id: "architect",
    name: "The Architect",
    role: "Orchestrator",
    status: "online",
  },
  {
    id: "sentinel",
    name: "The Sentinel",
    role: "Security",
    status: "working",
    currentTask: "Scanning for vulnerabilities...",
  },
  { id: "weaver", name: "The Weaver", role: "Git Ops", status: "online" },
  { id: "auditor", name: "The Auditor", role: "Finance", status: "offline" },
];

export const AgentStatusGrid = () => {
  const socket = useSocket();
  const [agents, setAgents] = useState<Agent[]>(FALLBACK_AGENTS);

  useEffect(() => {
    // Fetch live agent data from backend
    const fetchAgents = async () => {
      try {
        const res = await axios.get(`${API_URL}/synapse/agents`);

        if (res.data?.success && Array.isArray(res.data.data)) {
          const mapped: Agent[] = res.data.data.map((a: any) => ({
            id: a.id || a.agentName || "unknown",
            name: a.name || a.agentName || "Agent",
            role: a.role || a.capabilities?.[0] || "General",
            status:
              a.status === "active"
                ? ("online" as AgentStatusType)
                : a.status === "error"
                  ? ("error" as AgentStatusType)
                  : ("offline" as AgentStatusType),
            currentTask: a.task || undefined,
          }));

          if (mapped.length > 0) setAgents(mapped);
        }
      } catch {
        // Keep fallback agents on error
      }
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    if (!socket || !(socket as any).on) return;

    (socket as any).on("agent:update", (updatedAgent: Agent) => {
      setAgents((prev) =>
        prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a)),
      );
    });

    return () => {
      (socket as any).off("agent:update");
    };
  }, [socket]);

  const getStatusColor = (status: AgentStatusType) => {
    switch (status) {
      case "online":
        return "success";
      case "working":
        return "warning";
      case "offline":
        return "default";
      case "error":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {agents.map((agent) => (
        <Card
          key={agent.id}
          className="max-w-[400px] hover:scale-105 transition-transform glass"
        >
          <CardHeader className="flex gap-3">
            <div
              className={`w-3 h-3 rounded-full bg-${getStatusColor(agent.status)}-500`}
            />
            <div className="flex flex-col">
              <p className="text-md font-bold">{agent.name}</p>
              <p className="text-small text-default-500">{agent.role}</p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-sm text-default-600 min-h-[40px]">
              {agent.status === "working"
                ? agent.currentTask
                : "Standing by ready for orders."}
            </p>
          </CardBody>
          <Divider />
          <CardFooter className="justify-between">
            <Chip color={getStatusColor(agent.status)} size="sm" variant="flat">
              {agent.status.toUpperCase()}
            </Chip>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
