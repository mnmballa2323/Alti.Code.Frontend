"use client";
import { SOCKET_URL } from "@/lib/config";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { BrainCircuit } from "lucide-react";

import { useAgentSwarm } from "../hooks/useAgentSwarm";

export const AgentCommandCenter = () => {
  // 1. Fetch live telemetry from the Swarm
  const swarm = useAgentSwarm(SOCKET_URL);

  // 2. Build Nodes dynamically based on the swarm telemetry state
  const nodes: Node[] = useMemo(() => {
    const centerNode: Node = {
      id: "orchestrator",
      position: { x: 400, y: 300 },
      data: {
        label: (
          <div className="text-center font-bold font-mono">
            🧠 Hive Mind
            <br />
            (Orchestrator)
          </div>
        ),
      },
      style: {
        background: "#4ade80",
        color: "#000",
        border: "2px solid #22c55e",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 0 20px #4ade8055",
      },
      type: "default",
    };

    const agentNodes: Node[] = Object.entries(swarm).map(
      ([key, state], index) => {
        const angle = (index / Object.keys(swarm).length) * 2 * Math.PI;
        const radius = 250;
        const x = 400 + radius * Math.cos(angle);
        const y = 300 + radius * Math.sin(angle);

        const isWorking = state.status === "working";
        const isError = state.status === "error";

        return {
          id: key,
          position: { x, y },
          data: {
            label: (
              <div className="flex flex-col items-center">
                <span className="uppercase font-bold text-xs">{key}</span>
                <span className="text-[10px] text-gray-500 truncate w-32 mt-1">
                  {isWorking
                    ? state.currentTask || "Processing..."
                    : state.status}
                </span>
              </div>
            ),
          },
          style: {
            background: "#111",
            color: "#fff",
            border: `1px solid ${isWorking ? "#eab308" : isError ? "#ef4444" : "#333"}`,
            borderRadius: "8px",
            padding: "10px",
            width: 150,
            boxShadow: isWorking ? "0 0 15px #eab30855" : "none",
          },
          sourcePosition: Position.Bottom, // Not strictly needed when nodes aren't rigid in layers
          targetPosition: Position.Top,
        };
      },
    );

    return [centerNode, ...agentNodes];
  }, [swarm]);

  // 3. Build Edges pointing from Orchestrator to Agents
  const edges: Edge[] = useMemo(() => {
    return Object.entries(swarm).map(([key, state]) => {
      return {
        id: `e-orchestrator-${key}`,
        source: "orchestrator",
        target: key,
        animated: state.status === "working", // Flow pulses when agent is working
        style: {
          stroke: state.status === "working" ? "#eab308" : "#333",
          strokeWidth: state.status === "working" ? 3 : 1,
        },
      };
    });
  }, [swarm]);

  return (
    <div className="w-full h-full min-h-[800px] flex flex-col p-6 relative">
      <div className="flex items-center justify-between mb-4 z-10">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            DYNAMIC SWARM TOPOLOGY
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Active Federation:{" "}
            <span className="text-green-400 font-mono">ONLINE</span> •{" "}
            {Object.keys(swarm).length} Agents Connected
          </p>
        </div>
        <div className="p-2 bg-white/5 rounded-full border border-white/10">
          <BrainCircuit className="text-purple-400 animate-pulse" size={24} />
        </div>
      </div>

      <div className="flex-1 w-full bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        <ReactFlow
          fitView
          className="bg-[#0a0a0a]"
          edges={edges}
          nodes={nodes}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#222" gap={16} />
          <Controls className="fill-white" />
        </ReactFlow>
      </div>
    </div>
  );
};
