"use client";

import React, { useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom modern styles for nodes
const nodeStyles = {
  orchestrator: {
    background: "#4338ca",
    color: "#fff",
    border: "1px solid #3730a3",
    borderRadius: "12px",
    padding: "10px 15px",
    fontWeight: "bold",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  memory: {
    background: "#ea580c",
    color: "#fff",
    border: "1px solid #c2410c",
    borderRadius: "12px",
    padding: "10px 15px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  sandbox: {
    background: "#db2777",
    color: "#fff",
    border: "1px solid #be185d",
    borderRadius: "12px",
    padding: "10px 15px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  tool: {
    background: "#059669",
    color: "#fff",
    border: "1px solid #047857",
    borderRadius: "12px",
    padding: "10px 15px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  gateway: {
    background: "#475569",
    color: "#fff",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "10px 15px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
  observability: {
    background: "#0284c7",
    color: "#fff",
    border: "1px solid #0369a1",
    borderRadius: "12px",
    padding: "10px 15px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  },
};

const initialNodes: Node[] = [
  // Tier 1: Orchestration & UI
  {
    id: "mission-control",
    position: { x: 450, y: 0 },
    data: { label: "Mission Control UI" },
    style: nodeStyles.orchestrator,
  },
  {
    id: "temporal",
    position: { x: 250, y: 100 },
    data: { label: "Temporal (Durability)" },
    style: nodeStyles.orchestrator,
  },
  {
    id: "langgraph",
    position: { x: 650, y: 100 },
    data: { label: "LangGraph (State)" },
    style: nodeStyles.orchestrator,
  },

  // Tier 2: LLM Gateways
  {
    id: "kong",
    position: { x: 450, y: 150 },
    data: { label: "Kong API Gateway" },
    style: nodeStyles.gateway,
  },
  {
    id: "litellm",
    position: { x: 450, y: 250 },
    data: { label: "LiteLLM Routers" },
    style: nodeStyles.gateway,
  },
  {
    id: "ollama",
    position: { x: 750, y: 250 },
    data: { label: "Ollama (Local SLMs)" },
    style: nodeStyles.gateway,
  },

  // Tier 3: Memory & RAG
  {
    id: "mem0",
    position: { x: 150, y: 350 },
    data: { label: "Mem0 (Personalized)" },
    style: nodeStyles.memory,
  },
  {
    id: "qdrant",
    position: { x: 350, y: 350 },
    data: { label: "Qdrant (Vector DB)" },
    style: nodeStyles.memory,
  },
  {
    id: "haystack",
    position: { x: 250, y: 450 },
    data: { label: "Haystack Pipeline" },
    style: nodeStyles.memory,
  },
  {
    id: "unstructured",
    position: { x: 50, y: 450 },
    data: { label: "Unstructured.io ETL" },
    style: nodeStyles.memory,
  },

  // Tier 4: Autonomous Sandboxes
  {
    id: "openhands",
    position: { x: 650, y: 400 },
    data: { label: "OpenHands IDE" },
    style: nodeStyles.sandbox,
  },
  {
    id: "swekit",
    position: { x: 850, y: 400 },
    data: { label: "SWE-Kit" },
    style: nodeStyles.sandbox,
  },
  {
    id: "openinterpreter",
    position: { x: 650, y: 500 },
    data: { label: "Open Interpreter" },
    style: nodeStyles.sandbox,
  },

  // Tier 5: Web & Tools
  {
    id: "browseruse",
    position: { x: 150, y: 600 },
    data: { label: "Browser-Use" },
    style: nodeStyles.tool,
  },
  {
    id: "crawl4ai",
    position: { x: 350, y: 600 },
    data: { label: "Crawl4AI" },
    style: nodeStyles.tool,
  },
  {
    id: "searxng",
    position: { x: 550, y: 600 },
    data: { label: "SearXNG Privacy" },
    style: nodeStyles.tool,
  },
  {
    id: "mcp",
    position: { x: 750, y: 600 },
    data: { label: "MCP Universal Tools" },
    style: nodeStyles.tool,
  },

  // Observability & Evaluation

  {
    id: "prometheus",
    position: { x: 950, y: 180 },
    data: { label: "Prometheus+Grafana" },
    style: nodeStyles.observability,
  },
  {
    id: "promptfoo",
    position: { x: 950, y: 260 },
    data: { label: "Promptfoo Red-Team" },
    style: nodeStyles.observability,
  },

  // Extensions & Voice
  {
    id: "geminiext",
    position: { x: -50, y: 200 },
    data: { label: "Gemini Extensions" },
    style: nodeStyles.tool,
  },
  {
    id: "whisper",
    position: { x: -50, y: 100 },
    data: { label: "Whisper Dictation" },
    style: nodeStyles.tool,
  },
  {
    id: "tabby",
    position: { x: -50, y: 300 },
    data: { label: "Tabby Copilot" },
    style: nodeStyles.tool,
  },
  {
    id: "dspy",
    position: { x: 250, y: 250 },
    data: { label: "DSPy Optimizer" },
    style: nodeStyles.tool,
  },
];

const initialEdges: Edge[] = [
  {
    id: "e-ui-kong",
    source: "mission-control",
    target: "kong",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
  },
  {
    id: "e-ui-temp",
    source: "mission-control",
    target: "temporal",
    animated: true,
  },
  {
    id: "e-ui-lang",
    source: "mission-control",
    target: "langgraph",
    animated: true,
  },
  { id: "e-kong-litellm", source: "kong", target: "litellm", animated: true },
  { id: "e-litellm-ollama", source: "litellm", target: "ollama" },

  { id: "e-litellm-dspy", source: "litellm", target: "dspy" },

  // Memory edges
  { id: "e-lang-mem0", source: "langgraph", target: "mem0", animated: true },
  { id: "e-mem0-qdrant", source: "mem0", target: "qdrant" },
  { id: "e-qdrant-haystack", source: "qdrant", target: "haystack" },
  { id: "e-haystack-unstructured", source: "haystack", target: "unstructured" },

  // Execution edges
  {
    id: "e-lang-openhands",
    source: "langgraph",
    target: "openhands",
    animated: true,
  },
  { id: "e-openhands-swekit", source: "openhands", target: "swekit" },
  { id: "e-lang-interpreter", source: "langgraph", target: "openinterpreter" },

  // Tool edges
  {
    id: "e-lang-browser",
    source: "langgraph",
    target: "browseruse",
    animated: true,
  },
  { id: "e-lang-crawl", source: "langgraph", target: "crawl4ai" },
  { id: "e-lang-searxng", source: "langgraph", target: "searxng" },
  { id: "e-lang-mcp", source: "langgraph", target: "mcp" },

  // Observability edges (dash)

  {
    id: "e-kong-prom",
    source: "kong",
    target: "prometheus",
    animated: true,
    style: { strokeDasharray: "5 5" },
  },
  {
    id: "e-dspy-promptfoo",
    source: "dspy",
    target: "promptfoo",
    style: { strokeDasharray: "5 5" },
  },

  // Peripheral
  { id: "e-ui-whisper", source: "mission-control", target: "whisper" },
  { id: "e-ui-gemini", source: "mission-control", target: "geminiext" },
  { id: "e-ui-tabby", source: "mission-control", target: "tabby" },
];

export function AgentCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "#8b5cf6", strokeWidth: 2 },
          } as Edge,
          eds,
        ),
      ),
    [setEdges],
  );

  return (
    <div
      className="rounded-xl border border-white/10 bg-black/60 backdrop-blur-md shadow-2xl relative overflow-hidden"
      style={{ width: "100%", height: "100%", minHeight: "800px" }}
    >
      <ReactFlow
        fitView
        className="react-flow-dark"
        colorMode="dark"
        defaultEdgeOptions={{ type: "smoothstep" }}
        edges={edges}
        fitViewOptions={{ padding: 0.2 }}
        maxZoom={2}
        minZoom={0.2}
        nodes={nodes}
        onConnect={onConnect}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
      >
        <Controls className="bg-white/5 border border-white/10 fill-white text-white" />
        <MiniMap
          className="bg-black/50 border border-white/10 rounded-lg"
          maskColor="rgba(0, 0, 0, 0.7)"
          nodeColor={(n) => {
            if (n.style?.background) return n.style.background as string;

            return "#333";
          }}
          nodeStrokeColor={(n) => {
            if (n.style?.background) return n.style.background as string;

            return "#fff";
          }}
        />
        <Background color="#333" gap={16} size={1} />
      </ReactFlow>
      <div className="absolute top-4 left-4 p-4 rounded-xl bg-black/40 border border-white/10 text-white backdrop-blur-md z-10 pointer-events-none">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-1">
          Swarm Topology
        </h3>
        <p className="text-xs text-default-400">
          Interactive live routing of 30 AI Native microservices.
        </p>
      </div>
    </div>
  );
}

// Ensure default export exists just in case it was used previously
export default AgentCanvas;
