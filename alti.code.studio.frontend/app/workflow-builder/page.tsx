"use client";

import React, {
  useCallback,
  useRef,
  useState,
  DragEvent,
  useEffect,
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  ReactFlowInstance,
  MarkerType,
  Position,
  Handle,
  NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Zap,
  Database,
  Globe,
  GitBranch,
  MessageSquare,
  Shield,
  Mail,
  FileText,
  Play,
  Sparkles,
  GripVertical,
  Trash2,
  ArrowRight,
  Layers,
  Bot,
  Webhook,
  Clock,
  Filter,
  Upload,
  X,
  Paperclip,
  BookOpen,
  ShieldCheck,
  Type,
  Plus,
  Check,
  Save,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@heroui/react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import ChatBotLayout from "@/components/ChatbotLayout";
import { API_URL } from "@/lib/config";

// ─── Node Type Definitions ──────────────────────────────────────────────────

const NODE_CATEGORIES = [
  {
    label: "Triggers",
    items: [
      {
        type: "trigger_http",
        label: "HTTP Request",
        icon: Globe,
        color: "#3b82f6",
        description: "Incoming API endpoint",
      },
      {
        type: "trigger_webhook",
        label: "Webhook",
        icon: Webhook,
        color: "#6366f1",
        description: "External webhook listener",
      },
      {
        type: "trigger_schedule",
        label: "Schedule",
        icon: Clock,
        color: "#8b5cf6",
        description: "Cron / timed trigger",
      },
      {
        type: "trigger_event",
        label: "Event",
        icon: Zap,
        color: "#f59e0b",
        description: "Event-driven trigger",
      },
    ],
  },
  {
    label: "Logic",
    items: [
      {
        type: "logic_condition",
        label: "Condition",
        icon: GitBranch,
        color: "#10b981",
        description: "If / else branching",
      },
      {
        type: "logic_filter",
        label: "Filter",
        icon: Filter,
        color: "#14b8a6",
        description: "Filter data stream",
      },
      {
        type: "logic_loop",
        label: "Loop",
        icon: ArrowRight,
        color: "#06b6d4",
        description: "Iterate over items",
      },
      {
        type: "logic_transform",
        label: "Transform",
        icon: Layers,
        color: "#0ea5e9",
        description: "Map / reshape data",
      },
    ],
  },
  {
    label: "Services",
    items: [
      {
        type: "service_api",
        label: "API Call",
        icon: Globe,
        color: "#f43f5e",
        description: "External REST/GraphQL call",
      },
      {
        type: "service_database",
        label: "Database",
        icon: Database,
        color: "#ec4899",
        description: "Read / write database",
      },
      {
        type: "service_ai",
        label: "AI Model",
        icon: Bot,
        color: "#7c3aed",
        description: "LLM / ML inference",
      },
      {
        type: "service_email",
        label: "Email",
        icon: Mail,
        color: "#f97316",
        description: "Send email notification",
      },
    ],
  },
  {
    label: "Output",
    items: [
      {
        type: "output_response",
        label: "Response",
        icon: MessageSquare,
        color: "#22c55e",
        description: "Return API response",
      },
      {
        type: "output_file",
        label: "File Output",
        icon: FileText,
        color: "#84cc16",
        description: "Generate file output",
      },
      {
        type: "output_auth",
        label: "Auth Gate",
        icon: Shield,
        color: "#ca8a04",
        description: "Auth validation step",
      },
    ],
  },
];

const ALL_NODE_DEFS = NODE_CATEGORIES.flatMap((c) => c.items);

// ─── Node Data Interface ────────────────────────────────────────────────────

interface WorkflowNodeData {
  label: string;
  nodeType: string;
  title: string;
  instructions: string;
  guardrails: string;
  documents: { name: string; size: string }[];
  [key: string]: unknown;
}

// ─── Custom Node Component ──────────────────────────────────────────────────

function WorkflowNode({ data, selected }: NodeProps) {
  const d = data as WorkflowNodeData;
  const def = ALL_NODE_DEFS.find((nd) => nd.type === d.nodeType);
  const IconComp = def?.icon || Zap;
  const color = def?.color || "#6366f1";
  const docCount = d.documents?.length || 0;
  const hasInstructions = !!d.instructions;
  const hasGuardrails = !!d.guardrails;

  return (
    <div
      className={`relative group rounded-xl border-2 transition-all duration-200 w-[210px] bg-white dark:bg-default-50
        ${selected ? "shadow-lg shadow-black/10 scale-[1.02]" : "shadow-md shadow-black/5 hover:shadow-lg"}`}
      style={{ borderColor: selected ? color : "rgba(0,0,0,0.08)" }}
    >
      <Handle
        className="!w-3 !h-3 !border-2 !border-default-300 !bg-default-100 hover:!bg-primary transition-all"
        position={Position.Top}
        type="target"
      />

      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-[10px]"
        style={{ background: `${color}10` }}
      >
        <div className="p-1.5 rounded-lg" style={{ background: `${color}18` }}>
          <IconComp size={13} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${hasInstructions && hasGuardrails ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-amber-400"}`}
              title={
                hasInstructions && hasGuardrails
                  ? "Ready"
                  : "Missing Configuration"
              }
            />
            <span className="text-[10px] font-bold text-default-400 uppercase tracking-wider truncate">
              {def?.label}
            </span>
          </div>
          <p className="text-[12px] font-semibold text-default-800 truncate leading-tight mt-0.5">
            {d.title || d.label}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="px-3 py-2 border-t border-default-100 flex flex-wrap gap-1">
        {docCount > 0 && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[9px] font-semibold">
            <Paperclip size={9} /> {docCount} file{docCount > 1 ? "s" : ""}
          </span>
        )}
        {hasInstructions && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[9px] font-semibold">
            <BookOpen size={9} /> Instructions
          </span>
        )}
        {hasGuardrails && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-semibold">
            <ShieldCheck size={9} /> Guardrails
          </span>
        )}
        {!docCount && !hasInstructions && !hasGuardrails && (
          <span className="text-[9px] text-default-300 italic">
            Click to configure
          </span>
        )}
      </div>

      <Handle
        className="!w-3 !h-3 !border-2 !border-default-300 !bg-default-100 hover:!bg-primary transition-all"
        position={Position.Bottom}
        type="source"
      />
    </div>
  );
}

const nodeTypes = { workflowNode: WorkflowNode };

// ─── Initial Nodes ──────────────────────────────────────────────────────────

const mkData = (
  label: string,
  nodeType: string,
  title = "",
): WorkflowNodeData => ({
  label,
  nodeType,
  title: title || label,
  instructions: "",
  guardrails: "",
  documents: [],
});

const initialNodes: Node[] = [
  {
    id: "1",
    type: "workflowNode",
    position: { x: 250, y: 0 },
    data: mkData("HTTP Request", "trigger_http", "User Signup Endpoint"),
  },
  {
    id: "2",
    type: "workflowNode",
    position: { x: 250, y: 160 },
    data: mkData("Auth Gate", "output_auth", "Validate JWT Token"),
  },
  {
    id: "3",
    type: "workflowNode",
    position: { x: 250, y: 320 },
    data: mkData("AI Model", "service_ai", "Process with Gemini"),
  },
  {
    id: "4",
    type: "workflowNode",
    position: { x: 250, y: 480 },
    data: mkData("Response", "output_response", "Return Result"),
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6" },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true,
    style: { stroke: "#ca8a04", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#ca8a04" },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    animated: true,
    style: { stroke: "#7c3aed", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#7c3aed" },
  },
];

// ─── Config Panel Component ─────────────────────────────────────────────────

function NodeConfigPanel({
  node,
  onUpdate,
  onClose,
  onDelete,
}: {
  node: Node;
  onUpdate: (id: string, data: Partial<WorkflowNodeData>) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const d = node.data as WorkflowNodeData;
  const def = ALL_NODE_DEFS.find((nd) => nd.type === d.nodeType);
  const color = def?.color || "#6366f1";
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newDocs = files.map((f) => ({
      name: f.name,
      size:
        f.size < 1024
          ? `${f.size}B`
          : f.size < 1048576
            ? `${(f.size / 1024).toFixed(1)}KB`
            : `${(f.size / 1048576).toFixed(1)}MB`,
    }));

    onUpdate(node.id, { documents: [...d.documents, ...newDocs] });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="w-[300px] shrink-0 border-l border-default-200 bg-white dark:bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-default-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md" style={{ background: `${color}15` }}>
            {def?.icon && <def.icon size={14} style={{ color }} />}
          </div>
          <span className="text-[11px] font-bold text-default-500 uppercase tracking-wider">
            Configure Node
          </span>
        </div>
        <button
          className="text-default-300 hover:text-default-600 transition-colors"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* Title */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-default-400 uppercase tracking-wider mb-1.5">
            <Type size={11} /> Title
          </label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-default-200 bg-default-50 text-sm text-default-800 placeholder:text-default-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
            placeholder="Name this step..."
            value={d.title}
            onChange={(e) => onUpdate(node.id, { title: e.target.value })}
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-default-400 uppercase tracking-wider mb-1.5">
            <BookOpen size={11} /> Instructions
          </label>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-default-200 bg-default-50 text-sm text-default-800 placeholder:text-default-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
            placeholder="What should the AI do at this step..."
            rows={3}
            value={d.instructions}
            onChange={(e) =>
              onUpdate(node.id, { instructions: e.target.value })
            }
          />
        </div>

        {/* Guardrails */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-default-400 uppercase tracking-wider mb-1.5">
            <ShieldCheck size={11} /> Guardrails
          </label>
          <textarea
            className="w-full px-3 py-2 rounded-lg border border-default-200 bg-default-50 text-sm text-default-800 placeholder:text-default-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 resize-none"
            placeholder="Constraints and rules for this step..."
            rows={3}
            value={d.guardrails}
            onChange={(e) => onUpdate(node.id, { guardrails: e.target.value })}
          />
        </div>

        {/* Documents */}
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-bold text-default-400 uppercase tracking-wider mb-1.5">
            <Paperclip size={11} /> Documents
          </label>

          {d.documents.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {d.documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-default-50 border border-default-100"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="text-default-400 shrink-0" size={12} />
                    <span className="text-[11px] text-default-600 truncate">
                      {doc.name}
                    </span>
                    <span className="text-[9px] text-default-300 shrink-0">
                      {doc.size}
                    </span>
                  </div>
                  <button
                    className="text-default-300 hover:text-danger transition-colors shrink-0 ml-1"
                    onClick={() =>
                      onUpdate(node.id, {
                        documents: d.documents.filter((_, j) => j !== i),
                      })
                    }
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            ref={fileRef}
            multiple
            className="hidden"
            type="file"
            onChange={handleFileUpload}
          />
          <Button
            className="w-full h-8 bg-default-50 border border-dashed border-default-300 text-default-500 text-[11px] font-medium rounded-lg hover:bg-default-100 hover:border-default-400"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-1.5" size={12} /> Upload Documents
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-default-100 space-y-2">
        <Button
          className="w-full h-9 bg-primary text-white text-[11px] font-bold rounded-lg hover:opacity-90 transition-opacity"
          size="sm"
          onClick={onClose}
        >
          <Check className="mr-1" size={12} /> Save & Close
        </Button>
        <Button
          className="w-full h-8 bg-danger-50 text-danger text-[11px] font-bold rounded-lg border border-danger-200 hover:bg-danger-100"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="mr-1" size={12} /> Delete Node
        </Button>
      </div>
    </div>
  );
}

// ─── Main Builder Component ─────────────────────────────────────────────────

let nodeIdCounter = 10;

function WorkflowBuilderInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNodePaletteOpen, setIsNodePaletteOpen] = useState(true);
  const [generationResult, setGenerationResult] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const [isBuilding, setIsBuilding] = useState(false);

  // New Workflow State
  const [currentWorkflowName, setCurrentWorkflowName] = useState("");

  useEffect(() => {
    const handler = (e: any) => {
      setCurrentWorkflowName(e.detail);
      // Reset canvas for new workflow
      setNodes([
        {
          id: "node_start",
          type: "workflowNode",
          position: {
            x: window.innerWidth / 2 - 120,
            y: window.innerHeight / 2 - 100,
          },
          data: mkData("Start Workflow", "trigger_http"),
        },
      ]);
      setEdges([]);
      setSelectedNodeId(null);
    };

    window.addEventListener("init-new-workflow", handler);

    return () => window.removeEventListener("init-new-workflow", handler);
  }, [setNodes, setEdges]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const createNewNode = useCallback(() => {
    const id = `node_${nodeIdCounter++}`;
    // Place in center of current viewport
    const center = rfInstance
      ? rfInstance.screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        })
      : { x: 250, y: nodes.length * 170 };

    setNodes((nds) =>
      nds.concat({
        id,
        type: "workflowNode",
        position: center,
        data: mkData("New Step", "service_api"),
      }),
    );
    setSelectedNodeId(id);
    setTimeout(() => rfInstance?.fitView({ padding: 0.2, duration: 300 }), 50);
  }, [rfInstance, setNodes, nodes.length]);

  const updateNodeData = useCallback(
    (id: string, partial: Partial<WorkflowNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...partial } } : n,
        ),
      );
    },
    [setNodes],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const src = nodes.find((n) => n.id === params.source);
      const def = ALL_NODE_DEFS.find(
        (d) => d.type === (src?.data as WorkflowNodeData)?.nodeType,
      );
      const color = def?.color || "#6366f1";

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: color, strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color },
          },
          eds,
        ),
      );
    },
    [nodes, setEdges],
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData("application/reactflow-type");
      const label = event.dataTransfer.getData("application/reactflow-label");

      if (!nodeType || !rfInstance) return;
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const id = `node_${nodeIdCounter++}`;

      setNodes((nds) =>
        nds.concat({
          id,
          type: "workflowNode",
          position,
          data: mkData(label, nodeType),
        }),
      );
      setSelectedNodeId(id);
      // Auto-fit view after adding a node so it stays visible
      setTimeout(() => rfInstance.fitView({ padding: 0.2, duration: 300 }), 50);
    },
    [rfInstance, setNodes],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId,
      ),
    );
    setSelectedNodeId(null);
  }, [selectedNodeId, setNodes, setEdges]);

  const handleGenerate = useCallback(async () => {
    if (!rfInstance) return;
    setIsGenerating(true);
    setGenerationResult(null);
    const flow = rfInstance.toObject();
    const workflow = {
      nodes: flow.nodes.map((n: any) => {
        const nd = n.data as WorkflowNodeData;

        return {
          id: n.id,
          type: nd.nodeType,
          title: nd.title,
          instructions: nd.instructions,
          guardrails: nd.guardrails,
          documents: nd.documents.map((doc: any) => doc.name),
        };
      }),
      edges: flow.edges.map((e: any) => ({
        source: e.source,
        target: e.target,
      })),
    };
    const desc = workflow.nodes
      .map((n: any, i: number) => {
        let line = `${i + 1}. [${n.type}] ${n.title}`;

        if (n.instructions) line += `\n   Instructions: ${n.instructions}`;
        if (n.guardrails) line += `\n   Guardrails: ${n.guardrails}`;
        if (n.documents.length)
          line += `\n   Documents: ${n.documents.join(", ")}`;

        return line;
      })
      .join("\n\n");
    const conns = workflow.edges
      .map((e: any) => {
        const s = workflow.nodes.find((n: any) => n.id === e.source);
        const t = workflow.nodes.find((n: any) => n.id === e.target);

        return `${s?.title} → ${t?.title}`;
      })
      .join("\n");

    await new Promise((r) => setTimeout(r, 2000));
    setGenerationResult(
      `## Workflow Blueprint\n\n### Steps:\n${desc}\n\n### Connections:\n${conns}`,
    );
    setIsGenerating(false);
  }, [rfInstance]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleBuildApplication = async () => {
    if (!rfInstance) return;
    setIsBuilding(true);
    toast.loading("Google Cloud: Compiling DAG into execution payload...");

    try {
      const flow = rfInstance.toObject();
      const workflow = {
        nodes: flow.nodes.map((n: any) => {
          const nd = n.data as WorkflowNodeData;

          return {
            id: n.id,
            type: nd.nodeType,
            title: nd.title,
            instructions: nd.instructions,
            guardrails: nd.guardrails,
          };
        }),
        edges: flow.edges.map((e: any) => ({
          source: e.source,
          target: e.target,
        })),
      };

      const res = await fetch(`${API_URL}/api/v1/workflows/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workflow),
      });

      const data = await res.json();

      toast.dismiss();

      if (data.success) {
        toast.success("✅ DAG Workflow deployed to the Swarm execution queue!");
      } else {
        toast.error(`Swarm deployment failed: ${data.message}`);
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(`Network Error: ${err.message}`);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: Node Palette */}
      <div
        className={`shrink-0 border-r border-default-200 bg-white dark:bg-black flex flex-col overflow-hidden transition-all duration-300 ${isNodePaletteOpen ? "w-[240px]" : "w-12"}`}
      >
        <div
          className={`h-[56px] flex items-center border-b border-default-200 ${isNodePaletteOpen ? "px-4 justify-between" : "px-0 justify-center"}`}
        >
          {isNodePaletteOpen && (
            <h2 className="text-[11px] font-bold text-default-500 uppercase tracking-[0.15em] whitespace-nowrap">
              Node Palette
            </h2>
          )}
          <Button
            isIconOnly
            className={
              isNodePaletteOpen
                ? "-mr-2 text-default-400 hover:text-default-600"
                : "text-default-400 hover:text-default-600"
            }
            size="sm"
            variant="light"
            onClick={() => setIsNodePaletteOpen(!isNodePaletteOpen)}
          >
            {isNodePaletteOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </Button>
        </div>

        {/* Inner Content - Hidden when collapsed */}
        <div
          className={`flex-col flex-1 overflow-hidden ${!isNodePaletteOpen ? "hidden" : "flex"}`}
        >
          <div className="px-3 py-3 border-b border-default-200 flex items-center">
            <div className="h-8 flex items-center">
              <p className="text-[10px] text-default-300">
                Drag nodes onto the canvas
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
            {NODE_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <p className="text-[9px] font-bold text-default-400 uppercase tracking-[0.2em] mb-2 px-1">
                  {cat.label}
                </p>
                <div className="space-y-1">
                  {cat.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.type}
                        draggable
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing bg-default-50 hover:bg-default-100 border border-transparent hover:border-default-200 transition-all duration-200 group select-none"
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/reactflow-type",
                            item.type,
                          );
                          e.dataTransfer.setData(
                            "application/reactflow-label",
                            item.label,
                          );
                          e.dataTransfer.effectAllowed = "move";
                        }}
                      >
                        <div
                          className="p-1.5 rounded-md"
                          style={{ background: `${item.color}15` }}
                        >
                          <Icon size={13} style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-default-700 truncate">
                            {item.label}
                          </p>
                          <p className="text-[9px] text-default-400 truncate">
                            {item.description}
                          </p>
                        </div>
                        <GripVertical
                          className="text-default-200 group-hover:text-default-400 transition-colors shrink-0"
                          size={12}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-[56px] px-4 flex items-center justify-between border-b border-default-200 bg-white dark:bg-black shrink-0">
          <div className="flex items-center gap-3">
            {currentWorkflowName && (
              <h1 className="text-sm font-bold text-default-700 flex items-center gap-2">
                <Layers className="text-primary" size={15} />{" "}
                {currentWorkflowName}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              className="h-7 px-3 bg-default-50 text-default-600 text-[11px] font-bold rounded-lg border border-default-200 hover:bg-default-100"
              size="sm"
              onClick={createNewNode}
            >
              <Plus className="mr-1" size={12} /> Create
            </Button>
            <Button
              className="h-7 px-3 bg-default-50 text-default-600 text-[11px] font-bold rounded-lg border border-default-200 hover:bg-default-100"
              isLoading={isSaving}
              size="sm"
              onClick={handleSave}
            >
              <Save className="mr-1" size={12} /> Save
            </Button>
            <Button
              className="h-7 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[11px] font-bold rounded-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
              isLoading={isGenerating}
              size="sm"
              onClick={handleGenerate}
            >
              <Sparkles className="mr-1.5" size={12} /> Generate
            </Button>
          </div>
        </div>

        {/* ReactFlow Canvas */}
        <div
          ref={reactFlowWrapper}
          className="flex-1 bg-default-50"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            fitView
            className="bg-default-50"
            defaultEdgeOptions={{
              animated: true,
              style: { strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed },
            }}
            edges={edges}
            fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
            nodeTypes={nodeTypes}
            nodes={nodes}
            proOptions={{ hideAttribution: true }}
            onConnect={onConnect}
            onEdgesChange={onEdgesChange}
            onInit={setRfInstance}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onNodesChange={onNodesChange}
            onPaneClick={() => setSelectedNodeId(null)}
          >
            <Background color="#d4d4d8" gap={20} size={1} />
            <Controls className="!bg-white !border-default-200 !rounded-xl !shadow-lg [&>button]:!bg-white [&>button]:!border-default-200 [&>button]:!text-default-500 [&>button:hover]:!bg-default-100" />
          </ReactFlow>
        </div>
      </div>

      {/* Right: Config Panel or Generation Result */}
      {selectedNode && !generationResult && (
        <NodeConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onDelete={deleteSelected}
          onUpdate={updateNodeData}
        />
      )}

      {generationResult && (
        <div className="w-[300px] shrink-0 border-l border-default-200 bg-white dark:bg-black flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-default-100 flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-default-500 uppercase tracking-[0.15em]">
              AI Blueprint
            </h2>
            <button
              className="text-default-300 hover:text-default-600 transition-colors"
              onClick={() => setGenerationResult(null)}
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-indigo-500" size={14} />
                <span className="text-[11px] font-bold text-indigo-600">
                  Workflow Analyzed
                </span>
              </div>
              <p className="text-[10px] text-default-500 leading-relaxed">
                Your workflow has been analyzed and is ready to be translated
                into a working application.
              </p>
            </div>
            <pre className="text-[10px] text-default-500 font-mono whitespace-pre-wrap leading-relaxed bg-default-50 rounded-lg p-3 border border-default-200">
              {generationResult}
            </pre>
            <Button
              className="w-full mt-4 h-9 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-[11px] font-bold rounded-lg"
              isLoading={isBuilding}
              size="sm"
              onClick={handleBuildApplication}
            >
              <Play className="mr-1.5" size={12} /> Build This Application
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Client Wrapper ───────────────────────────────────────────────────────────

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return <>{children}</>;
}

// ─── Page Wrapper ───────────────────────────────────────────────────────────

export default function WorkflowBuilderPage() {
  return (
    <ChatBotLayout>
      <ReactFlowProvider>
        <ClientOnly>
          <WorkflowBuilderInner />
        </ClientOnly>
      </ReactFlowProvider>
    </ChatBotLayout>
  );
}
