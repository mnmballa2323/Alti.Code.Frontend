"use client";

import React from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 0 },
    data: { label: "index.js (Entry)" },
    style: {
      background: "#3b82f6",
      color: "white",
      borderRadius: "8px",
      border: "none",
    },
  },
  {
    id: "2",
    position: { x: 100, y: 100 },
    data: { label: "auth.route.js" },
    style: {
      background: "#8b5cf6",
      color: "white",
      borderRadius: "8px",
      border: "none",
    },
  },
  {
    id: "3",
    position: { x: 400, y: 100 },
    data: { label: "user.route.js" },
    style: {
      background: "#8b5cf6",
      color: "white",
      borderRadius: "8px",
      border: "none",
    },
  },
  {
    id: "4",
    position: { x: 100, y: 200 },
    data: { label: "auth.controller.js" },
    style: {
      background: "#ec4899",
      color: "white",
      borderRadius: "8px",
      border: "none",
    },
  },
  {
    id: "5",
    position: { x: 400, y: 200 },
    data: { label: "user.controller.js" },
    style: {
      background: "#ec4899",
      color: "white",
      borderRadius: "8px",
      border: "none",
    },
  },
  {
    id: "6",
    position: { x: 250, y: 300 },
    data: { label: "user.model.js (DB)" },
    style: {
      background: "#10b981",
      color: "white",
      borderRadius: "8px",
      border: "none",
    },
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#8b5cf6" },
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    animated: true,
    style: { stroke: "#8b5cf6" },
  },
  { id: "e2-4", source: "2", target: "4", style: { stroke: "#ec4899" } },
  { id: "e3-5", source: "3", target: "5", style: { stroke: "#ec4899" } },
  {
    id: "e4-6",
    source: "4",
    target: "6",
    animated: true,
    style: { stroke: "#10b981" },
  },
  {
    id: "e5-6",
    source: "5",
    target: "6",
    animated: true,
    style: { stroke: "#10b981" },
  },
];

export const AstGraphView = () => {
  return (
    <div
      className="rounded-lg overflow-hidden border border-gray-700 bg-black/50"
      style={{ width: "100%", height: "400px" }}
    >
      <ReactFlow
        fitView
        edges={initialEdges}
        nodes={initialNodes}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={16} />
        <Controls className="fill-white" />
      </ReactFlow>
    </div>
  );
};
