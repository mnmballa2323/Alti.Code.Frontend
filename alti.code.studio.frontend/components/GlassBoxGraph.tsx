"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";

// Dynamically import react-force-graph-3d to avoid SSR issues
const ForceGraph3D = dynamic(() => import("react-force-graph-3d"), {
  ssr: false,
});

export interface Node {
  id: string;
  name: string;
  group: number; // 1 = Code, 2 = Agent Identity, 3 = Prompt, 4 = Jira Epic, 5 = Security Policy
  val: number;
}

export interface Link {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export default function GlassBoxGraph({ data }: { data?: GraphData }) {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    if (data) {
      setGraphData(data);
    } else {
      // Generate some dummy cognitive trace data if none provided
      setGraphData({
        nodes: [
          { id: "epic-1", name: "Jira Epic: ENG-1234", group: 4, val: 20 },
          { id: "prompt-1", name: "Original LLM Prompt", group: 3, val: 15 },
          { id: "agent-1", name: "The Architect", group: 2, val: 25 },
          { id: "policy-1", name: "SOC2 Compliance Filter", group: 5, val: 20 },
          {
            id: "code-1",
            name: "src/app/modules/agents/neural.router.js",
            group: 1,
            val: 10,
          },
          {
            id: "code-2",
            name: "src/app/modules/agents/capability.router.js",
            group: 1,
            val: 10,
          },
        ],
        links: [
          { source: "epic-1", target: "prompt-1" },
          { source: "prompt-1", target: "agent-1" },
          { source: "agent-1", target: "policy-1" },
          { source: "policy-1", target: "code-1" },
          { source: "policy-1", target: "code-2" },
          { source: "agent-1", target: "code-1" },
          { source: "agent-1", target: "code-2" },
        ],
      });
    }
  }, [data]);

  return (
    <div className="w-full h-[600px] border border-white/10 rounded-2xl overflow-hidden bg-black flex relative">
      <div className="absolute top-4 left-4 z-10 bg-black/60 p-4 rounded-xl backdrop-blur-md border border-white/10 text-xs text-white">
        <h3 className="font-bold mb-2">Cognitive Traceability</h3>
        <ul>
          <li className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" /> Code
          </li>
          <li className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-purple-500" /> Agent
            Identity
          </li>
          <li className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-green-500" /> Prompt
          </li>
          <li className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-orange-500" /> Jira Epic
          </li>
          <li className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-red-500" /> Security Policy
          </li>
        </ul>
      </div>

      <ForceGraph3D
        backgroundColor="#000000"
        enableNodeDrag={false}
        graphData={graphData}
        linkColor={() => "rgba(255,255,255,0.2)"}
        linkWidth={1.5}
        nodeAutoColorBy="group"
        nodeColor={(node: any) => {
          switch (node.group) {
            case 1:
              return "#3b82f6"; // blue
            case 2:
              return "#a855f7"; // purple
            case 3:
              return "#22c55e"; // green
            case 4:
              return "#f97316"; // orange
            case 5:
              return "#ef4444"; // red
            default:
              return "#ffffff";
          }
        }}
        nodeLabel="name"
      />
    </div>
  );
}
