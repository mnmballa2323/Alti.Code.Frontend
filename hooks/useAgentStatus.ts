import { useState, useEffect } from "react";
import axios from "axios";

import { API_URL } from "@/lib/config";

export interface AgentStatus {
  id: string;
  name: string;
  status: "idle" | "watching" | "active" | "error";
  task: string;
}

export const useAgentStatus = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: "guardian",
      name: "Guardian Agent",
      status: "idle",
      task: "Connecting...",
    },
    {
      id: "synapse",
      name: "Synapse (A2A)",
      status: "idle",
      task: "Connecting...",
    },
    {
      id: "mcp",
      name: "Universe (MCP)",
      status: "idle",
      task: "Connecting...",
    },
  ]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // 1. Git Agent Status
        const gitRes = await axios.get(`${API_URL}/git-agent/status`);
        const gitStatus = gitRes.data.data.isWatching ? "watching" : "idle";

        // 2. Synapse Agents (Mock implementation as endpoint might list peers)
        // const synapseRes = await axios.get(`${API_URL}/synapse/agents`);

        setAgents((prev) =>
          prev.map((a) => {
            if (a.id === "guardian")
              return {
                ...a,
                status: gitStatus,
                task: gitStatus === "watching" ? "Monitoring src/" : "Paused",
              };
            // Simulate others for now as we don't have direct status endpoints on them yet
            if (a.id === "synapse")
              return {
                ...a,
                status: "active",
                task: "Listening for broadcasts",
              };
            if (a.id === "mcp")
              return { ...a, status: "active", task: "Ready for connections" };

            return a;
          }),
        );
      } catch (error) {
        console.error("Failed to fetch agent status", error);
        setAgents((prev) =>
          prev.map((a) => ({
            ...a,
            status: "error",
            task: "Connection Failed",
          })),
        );
      }
    };

    const interval = setInterval(fetchStatus, 3000);

    fetchStatus(); // Initial call

    return () => clearInterval(interval);
  }, []);

  return agents;
};
