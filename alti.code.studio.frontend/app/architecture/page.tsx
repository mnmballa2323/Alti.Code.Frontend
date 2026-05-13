"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button, ScrollShadow } from "@heroui/react";
import {
  Search,
  Filter,
  Layers,
  FileCode2,
  Cpu,
  Database,
  Cloud,
  X,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  ArrowUp,
  RefreshCcw,
} from "lucide-react";
import { useSession } from "next-auth/react";

import ChatBotLayout from "@/components/ChatbotLayout";

export default function ArchitecturePage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your architecture AI. I can explain how systems interact, trace dependencies, or tell you which files handle specific logic. What would you like to know?",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  // Map backend layers to nice colors and layout positions
  const getStyleForLayer = (layer: string, index: number) => {
    // Generate a simple circular/grid layout since backend doesn't provide positions
    const cols = 3;
    const x = (index % cols) * 250 + 100;
    const y = Math.floor(index / cols) * 150 + 100;

    let background = "#3b82f6";
    let shadowColor = "rgba(59, 130, 246, 0.5)";

    if (layer === "backend") {
      background = "#8b5cf6";
      shadowColor = "rgba(139, 92, 246, 0.5)";
    } else if (layer === "database") {
      background = "#10b981";
      shadowColor = "rgba(16, 185, 129, 0.5)";
    }

    return {
      position: { x, y },
      style: {
        background,
        color: "white",
        borderRadius: "8px",
        padding: "8px 12px",
        fontSize: "12px",
        fontWeight: "bold",
        boxShadow: `0 10px 25px -5px ${shadowColor}`,
        border: "none",
        width: 160,
        textAlign: "center",
      },
    };
  };

  const fetchGraph = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/architecture/graph?repoId=alti.code.studio`,
        {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        },
      );
      const data = await res.json();

      if (data.success && data.data) {
        const { nodes: backendNodes, edges: backendEdges } = data.data;

        const mappedNodes: Node[] = backendNodes.map(
          (n: any, index: number) => {
            const layout = getStyleForLayer(n.layer, index);

            return {
              id: n.id,
              position: layout.position,
              data: {
                label: n.name,
                layer: n.layer,
                path: n.path,
                summary: n.summary || "No summary available.",
              },
              style: layout.style as any,
            };
          },
        );

        const mappedEdges: Edge[] = backendEdges.map((e: any) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          animated: true,
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
          label: e.relationship_type,
          labelStyle: { fill: "#666", fontWeight: 700, fontSize: 10 },
          labelBgStyle: { fill: "white", fillOpacity: 0.8 },
        }));

        setNodes(mappedNodes);
        setEdges(mappedEdges);
      }
    } catch (err) {
      console.error("Failed to fetch graph:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [token]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    const userMsg = question;

    setQuestion("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsAsking(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/architecture/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ query: userMsg, repoId: "alti.code.studio" }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: data.data.answer },
        ]);
      }
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I could not connect to the architecture intelligence backend.",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const getLayerIcon = (layer: string) => {
    switch (layer) {
      case "api":
        return <Cloud className="size-5 text-blue-500" />;
      case "backend":
        return <Cpu className="size-5 text-purple-500" />;
      case "database":
        return <Database className="size-5 text-emerald-500" />;
      default:
        return <FileCode2 className="size-5 text-gray-500" />;
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-default-50 dark:bg-background flex flex-col h-full font-sans w-full">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900">
                System Architecture
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="h-7 px-3 bg-default-50 text-default-600 text-[11px] font-bold rounded-lg border border-default-200 hover:bg-default-100"
                isLoading={isLoading}
                size="sm"
                onClick={fetchGraph}
              >
                <RefreshCcw className="mr-1" size={12} /> Sync Spanner Graph
              </Button>
              <div className="bg-default-100 dark:bg-default-50/50 rounded-2xl p-1 flex items-center border border-default-200/50 ml-2">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 size-4 text-default-400" />
                  <input
                    className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs pl-9 pr-2 py-1.5 w-40 md:w-56 text-default-700 placeholder:text-default-400"
                    placeholder="Search codebase..."
                    type="text"
                  />
                </div>
                <div className="w-px h-4 bg-default-300 mx-1" />
                <Button
                  isIconOnly
                  className="rounded-xl h-7 w-7 min-w-7"
                  size="sm"
                  variant="light"
                >
                  <Filter className="size-3.5 text-default-500" />
                </Button>
                <Button
                  isIconOnly
                  className="rounded-xl h-7 w-7 min-w-7"
                  size="sm"
                  variant="light"
                >
                  <Layers className="size-3.5 text-default-500" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="relative flex flex-1 w-full bg-default-50 overflow-hidden">
          {/* Main Graph Area */}
          <div className="flex-1 flex flex-col relative h-full min-w-0">
            {/* React Flow Canvas */}
            <div className="flex-1 w-full h-full">
              {nodes.length > 0 ? (
                <ReactFlow
                  fitView
                  className="bg-default-50"
                  edges={edges}
                  fitViewOptions={{ padding: 0.2 }}
                  maxZoom={2}
                  minZoom={0.2}
                  nodes={nodes}
                  proOptions={{ hideAttribution: true }}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  onNodesChange={onNodesChange}
                >
                  <Background color="#ccc" gap={16} />
                  <Controls
                    className="bg-white dark:bg-black border-none shadow-md rounded-xl"
                    showInteractive={false}
                  />
                </ReactFlow>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
                  <Sparkles className="size-12 text-default-400 animate-pulse" />
                  <p className="text-sm font-semibold">
                    Generating Topography Map...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* AI Context Sidebar (Sliding in when node is selected) */}
          {selectedNode && (
            <div className="w-64 h-full bg-white dark:bg-black border-l border-default-200 shadow-2xl flex flex-col z-20 animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-default-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getLayerIcon(selectedNode.data.layer as string)}
                  <h3 className="font-semibold text-default-900 truncate">
                    {selectedNode.data.label as string}
                  </h3>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={() => setSelectedNode(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <ScrollShadow className="flex-1 p-5">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-default-400 uppercase tracking-wider mb-2">
                      Layer
                    </h4>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-default-100 text-default-700 capitalize">
                      {selectedNode.data.layer as string}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-default-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles className="size-3 text-primary" /> AI Summary
                    </h4>
                    <p className="text-sm text-default-600 leading-relaxed bg-primary/5 p-3 rounded-xl border border-primary/10">
                      {selectedNode.data.summary as string}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-default-400 uppercase tracking-wider mb-2">
                      Metadata
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-default-500">Path</span>
                        <span className="font-medium text-right break-all ml-4 text-[11px]">
                          {selectedNode.data.path as string}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollShadow>

              <div className="p-4 border-t border-default-200">
                <Button
                  className="w-full bg-black text-white rounded-xl h-11"
                  startContent={<FileCode2 className="size-4" />}
                >
                  Open in Editor
                </Button>
              </div>
            </div>
          )}

          {/* AI Assistant Chat Panel */}
          <div
            className={`shrink-0 h-full bg-white dark:bg-[#0A0A0A] border-l border-default-200 shadow-2xl flex flex-col z-20 transition-all duration-300 relative ${
              chatOpen ? "w-64" : "w-10"
            }`}
          >
            {chatOpen ? (
              <>
                <div className="p-4 border-b border-default-200 flex justify-between items-center bg-white/50 dark:bg-black/50 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-default-900">
                      Architecture Assistant
                    </h3>
                  </div>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onClick={() => setChatOpen(false)}
                  >
                    <PanelRightClose className="size-4" />
                  </Button>
                </div>

                <ScrollShadow className="flex-1 p-4 space-y-4">
                  {chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`${msg.role === "user" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-default-100 text-default-700"} rounded-2xl p-3 text-sm break-words min-w-0 flex-1`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isAsking && (
                    <div className="flex gap-3">
                      <div className="bg-default-100 rounded-2xl p-3 text-sm text-default-700 break-words flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  )}
                </ScrollShadow>

                <div className="p-4 border-t border-default-200 bg-white dark:bg-[#0A0A0A]">
                  <div className="relative flex items-center">
                    <textarea
                      className="w-full bg-default-100 border-none rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none min-h-[48px]"
                      placeholder="Ask about the architecture..."
                      rows={1}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAskQuestion();
                        }
                      }}
                    />
                    <button
                      className="absolute right-3 size-6 flex items-center justify-center rounded-full border-2 border-gray-300 bg-black p-0.5 text-white transition-transform hover:scale-110 active:scale-95"
                      onClick={handleAskQuestion}
                    >
                      <ArrowUp size={14} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center pt-4 border-l border-default-200">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={() => setChatOpen(true)}
                >
                  <PanelRightOpen className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
