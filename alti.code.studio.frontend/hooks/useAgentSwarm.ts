/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export type AgentEvent = {
  agent: string;
  type: "working" | "success" | "error" | "thought" | "action";
  timestamp: string;
  data?: any;
  jobId?: string;
  // Specific payloads
  instruction?: string;
  target?: string;
  file?: string;
  stack?: string;
  pipeline?: string;
  score?: number;
  status?: string;
  error?: string;
};

export type AgentState = {
  status: "idle" | "working" | "success" | "error";
  lastActivity: string; // ISO timestamp
  currentTask?: string;
  logs: AgentEvent[];
};

export type SwarmState = {
  [agentName: string]: AgentState;
};

const INITIAL_AGENTS = [
  "audit",
  "notification",
  "refactor",
  "security",
  "devops",
  "qa",
  "monitoring",
  "iac",
  "cicd",
];

export const useAgentSwarm = (serverUrl: string = "http://localhost:3000") => {
  // Default to localhost for dev
  const [swarm, setSwarm] = useState<SwarmState>(() => {
    const initial: SwarmState = {};

    INITIAL_AGENTS.forEach((agent) => {
      initial[agent] = {
        status: "idle",
        lastActivity: new Date().toISOString(),
        logs: [],
      };
    });

    return initial;
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize Socket
    socketRef.current = io(serverUrl);
    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("🧠 Synapse Connected");
    });

    // Listen for universal stream
    socket.on("agent:stream", (event: AgentEvent) => {
      setSwarm((prev) => {
        const agent = event.agent;
        const currentAgentState = prev[agent] || {
          status: "idle",
          lastActivity: "",
          logs: [],
        };

        let newStatus = currentAgentState.status;
        let currentTask = currentAgentState.currentTask;

        if (event.type === "working") {
          newStatus = "working";
          // Extract task description from various payload fields
          currentTask =
            event.instruction ||
            event.target ||
            event.file ||
            event.stack ||
            event.pipeline ||
            event.data?.type ||
            "Processing...";
        } else if (event.type === "success") {
          newStatus = "success";
          currentTask = undefined;
        } else if (event.type === "error") {
          newStatus = "error";
        }

        // Keep last 50 logs
        const newLogs = [event, ...currentAgentState.logs].slice(0, 50);

        return {
          ...prev,
          [agent]: {
            ...currentAgentState,
            status: newStatus,
            lastActivity: event.timestamp,
            currentTask,
            logs: newLogs,
          },
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  return swarm;
};
