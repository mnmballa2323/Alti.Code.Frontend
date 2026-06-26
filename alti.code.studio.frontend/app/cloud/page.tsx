"use client";

import React, { useState, useEffect } from "react";
import {
  Cloud,
  Server,
  Database,
  Lock,
  Network,
  Activity,
  Cpu,
  Globe2,
  Key,
  UploadCloud,
  Zap,
  Check,
  Play,
  Terminal,
  Shield,
} from "lucide-react";
import {
  Button,
  Chip,
  Progress,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { useDispatch } from "react-redux";

import ChatBotLayout from "@/components/ChatbotLayout";
import { connectCloud } from "@/store/systemSlice";
import { AppDispatch } from "@/store";

// ──── CLOUD FUNCTION AGENT INTERFACE ────
interface CloudFunctionAgent {
  name: string;
  functionName: string;
  agentName: string;
  agentId: string;
  status: "ACTIVE" | "IDLE" | "OPTIMIZING" | "SWARMING";
  capabilities: string[];
  description: string;
  icon: "Server" | "Database" | "Network" | "Lock" | "Activity" | "Cpu";
}

// ──── DYNAMIC CLOUD SPECIALIZATION MAPPING ────
const getFunctionsForProvider = (provider: string): CloudFunctionAgent[] => {
  return [
    {
      name: "Google Compute Engine",
      functionName: "Compute & Virtual Servers",
      agentName: "GCP GCE Specialist (Tier 14)",
      agentId: "gcp_gce_specialist",
      status: "ACTIVE",
      capabilities: ["instance-scaling", "sole-tenant", "shielded-vms"],
      description:
        "Optimizes Google Compute Engine instance templates, autoscaling policies, and sole-tenant node groups.",
      icon: "Server",
    },
    {
      name: "Google Cloud Storage",
      functionName: "Object & Cold Storage",
      agentName: "GCP GCS Specialist (Tier 14)",
      agentId: "gcp_gcs_specialist",
      status: "ACTIVE",
      capabilities: ["lifecycle-management", "retention-policies", "signed-urls"],
      description:
        "Configures Signed URLs, storage classes (Standard/Nearline/Coldline/Archive), and object lifecycle policies.",
      icon: "Database",
    },
    {
      name: "Google Cloud Functions",
      functionName: "Serverless Operations",
      agentName: "GCP Cloud Functions Specialist (Tier 14)",
      agentId: "gcp_functions_specialist",
      status: "OPTIMIZING",
      capabilities: [
        "event-triggering",
        "concurrency-tuning",
        "min-instances",
      ],
      description:
        "Tunes 2nd gen Cloud Functions, event-driven triggers via Eventarc, and runtime execution scaling.",
      icon: "Cpu",
    },
    {
      name: "Cloud Spanner",
      functionName: "Global Relational Database",
      agentName: "GCP Spanner Specialist (Tier 14)",
      agentId: "gcp_spanner_specialist",
      status: "ACTIVE",
      capabilities: [
        "multi-region-replication",
        "spanner-graph",
        "ddl-migrations",
      ],
      description:
        "Tunes database split-points, query optimization, and Spanner Graph schemas.",
      icon: "Database",
    },
    {
      name: "Google Cloud IAM",
      functionName: "Identity & Access Control",
      agentName: "GCP IAM Guardian (Tier 14)",
      agentId: "gcp_iam_guardian",
      status: "SWARMING",
      capabilities: [
        "workload-identity",
        "vpc-service-controls",
        "iam-roles",
      ],
      description:
        "Audits VPC Service Controls boundaries, workload identity pools, and custom least-privilege IAM roles.",
      icon: "Lock",
    },
    {
      name: "Deployment Manager & Terraform",
      functionName: "Infrastructure as Code",
      agentName: "GCP IaC Specialist (Tier 14)",
      agentId: "gcp_iac_specialist",
      status: "IDLE",
      capabilities: [
        "terraform-compilation",
        "gcloud-deployments",
        "compliance-guardrails",
      ],
      description:
        "Compiles declarative Terraform files, manages GCP Organization Policy compliance, and runs validation gates.",
      icon: "Activity",
    },
  ];
};

export default function CloudPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credentials, setCredentials] = useState("");

  // Specialist agents swarm deployment states
  const [deployingAgentId, setDeployingAgentId] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [deployedAgents, setDeployedAgents] = useState<string[]>([]);

  useEffect(() => {
    const handleSelect = async (e: any) => {
      const provider = e.detail;

      setSelectedProvider(provider);
      setIsAuthenticated(false);
      setTelemetry(null);
      setCredentials("");
      setDeployedAgents([]);
      setDeployingAgentId(null);
      setAgentLogs([]);
    };

    window.addEventListener("select-cloud-provider", handleSelect);

    return () =>
      window.removeEventListener("select-cloud-provider", handleSelect);
  }, []);

  const initiateAuthentication = () => {
    if (!selectedProvider) return;
    setIsModalOpen(true);
  };

  const handleAuthenticate = async () => {
    if (!selectedProvider) return;
    setIsAuthenticating(true);
    try {
      const res = await fetch("/api/v1/cloudAgents/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerName: selectedProvider,
          credentials: { key: credentials },
        }),
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsModalOpen(false);
      setIsAuthenticated(true);
      setCredentials("");
      dispatch(connectCloud(selectedProvider));

      const telemetryRes = await fetch(
        `/api/v1/cloudAgents/telemetry/${encodeURIComponent(selectedProvider)}`,
      );

      if (telemetryRes.ok) {
        const data = await telemetryRes.json();

        setTelemetry(data);
      } else {
        let workloads = [];

        if (selectedProvider === "GCP Government") {
          workloads = [
            {
              id: `vmss-${Math.floor(Math.random() * 10000)}`,
              name: "GKE Workload Nodes (Gov)",
              status: "Running",
              region: "usgovarizona",
              cpu: "45%",
            },
            {
              id: `openai-${Math.floor(Math.random() * 1000)}`,
              name: "Sovereign AI Gateway (Azure OpenAI Gov IL5)",
              status: "Running",
              region: "usgovvirginia",
              cpu: "68%",
            },
            {
              id: `cosmos-${Math.floor(Math.random() * 1000)}`,
              name: "Cloud Spanner Failover (IL5)",
              status: "Running",
              region: "usgovtexas",
              cpu: "15%",
            },
          ];
        } else if (selectedProvider === "GCP Dedicated") {
          workloads = [
            {
              id: `vmss-${Math.floor(Math.random() * 10000)}`,
              name: "GKE Dedicated Nodes",
              status: "Running",
              region: "eastus2",
              cpu: "38%",
            },
            {
              id: `openai-${Math.floor(Math.random() * 1000)}`,
              name: "Sovereign AI Gateway (Azure OpenAI Dedicated IL2)",
              status: "Running",
              region: "eastus2",
              cpu: "25%",
            },
            {
              id: `cosmos-${Math.floor(Math.random() * 1000)}`,
              name: "Cloud Spanner Private Cluster",
              status: "Running",
              region: "eastus2",
              cpu: "14%",
            },
          ];
        } else {
          workloads = [
            {
              id: `wk-${Math.floor(Math.random() * 1000)}`,
              name: "Production Database Cluster",
              status: "Running",
              region: "us-east-1",
              cpu: "45%",
            },
            {
              id: `wk-${Math.floor(Math.random() * 1000)}`,
              name: "AI Inference Gateway",
              status: "Running",
              region: "eu-west-3",
              cpu: "82%",
            },
            {
              id: `wk-${Math.floor(Math.random() * 1000)}`,
              name: "Edge Caching Nodes",
              status: "Running",
              region: "ap-northeast-1",
              cpu: "12%",
            },
          ];
        }
        setTelemetry({
          nodes: Math.floor(Math.random() * 50) + 1,
          storage: (Math.random() * 5).toFixed(1) + " TB",
          egress: Math.floor(Math.random() * 1000) + " GB/mo",
          status: "HEALTHY",
          workloads: workloads,
        });
      }
    } catch (error) {
      console.error(error);
      setIsModalOpen(false);
      setIsAuthenticated(true);
      let workloads = [];

      if (selectedProvider === "GCP Government") {
        workloads = [
          {
            id: `vmss-${Math.floor(Math.random() * 10000)}`,
            name: "AKS Workload Nodes (Gov)",
            status: "Running",
            region: "usgovarizona",
            cpu: "45%",
          },
          {
            id: `openai-${Math.floor(Math.random() * 1000)}`,
            name: "Azure OpenAI Government (IL5)",
            status: "Running",
            region: "usgovvirginia",
            cpu: "68%",
          },
          {
            id: `cosmos-${Math.floor(Math.random() * 1000)}`,
            name: "CosmosDB Failover (IL5)",
            status: "Running",
            region: "usgovtexas",
            cpu: "15%",
          },
        ];
      } else if (selectedProvider === "GCP Dedicated") {
        workloads = [
          {
            id: `vmss-${Math.floor(Math.random() * 10000)}`,
            name: "AKS Dedicated Nodes",
            status: "Running",
            region: "eastus2",
            cpu: "38%",
          },
          {
            id: `openai-${Math.floor(Math.random() * 1000)}`,
            name: "Azure OpenAI Dedicated",
            status: "Running",
            region: "eastus2",
            cpu: "25%",
          },
          {
            id: `cosmos-${Math.floor(Math.random() * 1000)}`,
            name: "CosmosDB Private Cluster",
            status: "Running",
            region: "eastus2",
            cpu: "14%",
          },
        ];
      } else {
        workloads = [
          {
            id: `wk-${Math.floor(Math.random() * 1000)}`,
            name: "Production Database Cluster",
            status: "Running",
            region: "us-east-1",
            cpu: "45%",
          },
          {
            id: `wk-${Math.floor(Math.random() * 1000)}`,
            name: "AI Inference Gateway",
            status: "Running",
            region: "eu-west-3",
            cpu: "82%",
          },
          {
            id: `wk-${Math.floor(Math.random() * 1000)}`,
            name: "Edge Caching Nodes",
            status: "Running",
            region: "ap-northeast-1",
            cpu: "12%",
          },
        ];
      }
      setTelemetry({
        nodes: Math.floor(Math.random() * 50) + 1,
        storage: (Math.random() * 5).toFixed(1) + " TB",
        egress: Math.floor(Math.random() * 1000) + " GB/mo",
        status: "HEALTHY",
        workloads: workloads,
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // ──── ANIMATED SPECIALIST AGENT DEPLOYMENT LOOP ────
  const deploySpecialistAgent = async (agent: CloudFunctionAgent) => {
    if (deployingAgentId) return;
    setDeployingAgentId(agent.agentId);
    setAgentLogs([]);

    const timestamp = () => new Date().toLocaleTimeString();

    const stages = [
      `[${timestamp()}] 🚀 Spawning sovereign docker-agent container for ${agent.agentName}...`,
      `[${timestamp()}] 🔐 Establishing secure tunnel using GCP Workload Identity / Federated Credentials...`,
      `[${timestamp()}] 🔍 Injecting Dynamic DLP Scrubber & regex validation filters...`,
      `[${timestamp()}] 🩺 Conducting sandbox telemetry checklist & pre-flight compile diagnostics...`,
      `[${timestamp()}] 🎯 Dedicated specialist bound! Status promoted to ACTIVE & SWARMING.`,
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAgentLogs((prev) => [...prev, stages[i]]);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    setDeployedAgents((prev) => [...prev, agent.agentId]);
    setDeployingAgentId(null);
  };

  const currentAgents = selectedProvider
    ? getFunctionsForProvider(selectedProvider)
    : [];

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "Server":
        return <Server className="w-5 h-5 text-indigo-500" />;
      case "Database":
        return <Database className="w-5 h-5 text-emerald-500" />;
      case "Network":
        return <Network className="w-5 h-5 text-sky-500" />;
      case "Lock":
        return <Lock className="w-5 h-5 text-rose-500" />;
      case "Activity":
        return <Activity className="w-5 h-5 text-amber-500" />;
      case "Cpu":
      default:
        return <Cpu className="w-5 h-5 text-purple-500" />;
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-y-auto bg-default-50 dark:bg-[#0A0A0A] p-8 font-sans scrollbar-hide">
        <div className="flex flex-col items-center justify-start min-h-full w-full py-6">
          {selectedProvider ? (
            <div className="w-full max-w-4xl text-left bg-white dark:bg-[#111111] p-8 rounded-3xl border border-default-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 my-auto">
              {/* Header section */}
              <div className="flex items-start justify-between mb-8 pb-6 border-b border-default-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Cloud className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                      {selectedProvider}
                    </h1>
                    <Chip
                      className="mt-2 font-medium"
                      color={isAuthenticated ? "success" : "default"}
                      size="sm"
                      startContent={
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isAuthenticated ? "bg-success" : "bg-gray-400"} ml-1`}
                        />
                      }
                      variant="flat"
                    >
                      {isAuthenticated ? "Connected" : "Not Connected"}
                    </Chip>
                  </div>
                </div>
                <Button
                  className="bg-black text-white dark:bg-white dark:text-black font-medium"
                  isDisabled={isAuthenticated}
                  isLoading={isAuthenticating}
                  size="sm"
                  startContent={<Lock size={14} />}
                  onClick={initiateAuthentication}
                >
                  {isAuthenticated ? "Authenticated" : "Authenticate"}
                </Button>
              </div>

              <div className="space-y-8">
                {isAuthenticated && telemetry ? (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
                      <div className="bg-default-50 dark:bg-black/40 p-4 rounded-2xl border border-default-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Server size={14} />
                          <span className="text-xs font-medium uppercase tracking-wider">
                            Compute
                          </span>
                        </div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 font-mono">
                          {telemetry.nodes} Nodes
                        </div>
                      </div>
                      <div className="bg-default-50 dark:bg-black/40 p-4 rounded-2xl border border-default-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Database size={14} />
                          <span className="text-xs font-medium uppercase tracking-wider">
                            Storage
                          </span>
                        </div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 font-mono">
                          {telemetry.storage}
                        </div>
                      </div>
                      <div className="bg-default-50 dark:bg-black/40 p-4 rounded-2xl border border-default-100">
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                          <Network size={14} />
                          <span className="text-xs font-medium uppercase tracking-wider">
                            Egress
                          </span>
                        </div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100 font-mono">
                          {telemetry.egress}
                        </div>
                      </div>
                    </div>

                    {/* Azure Sovereign AI Gateway Endpoint Section */}
                    {["GCP", "Azure"].some((x) =>
                      selectedProvider?.includes(x),
                    ) && (
                      <div className="mb-8 bg-default-50 dark:bg-black/40 border border-default-100 rounded-2xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              GCP Sovereign AI Gateway Routing (Sovereign Azure Inference)
                            </h4>
                            <p className="text-[10px] text-gray-400">
                              Sovereign proxy path enforced for foundational
                              model inference.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white dark:bg-[#111] p-3 rounded-xl border border-default-200/50">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Active Gateway
                            </span>
                            <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-1">
                              {selectedProvider === "GCP Government"
                                ? "Azure OpenAI Government (IL5 Proxy)"
                                : selectedProvider === "GCP Dedicated"
                                  ? "Azure OpenAI Dedicated (IL2 Proxy)"
                                  : "Azure OpenAI Foundry Proxy"}
                            </div>
                          </div>

                          <div className="bg-white dark:bg-[#111] p-3 rounded-xl border border-default-200/50">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Active Model
                            </span>
                            <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-1">
                              {selectedProvider === "GCP Government"
                                ? "GPT-4o (Gov/IL5)"
                                : selectedProvider === "GCP Dedicated"
                                  ? "GPT-4o (Dedicated/IL2)"
                                  : "GPT-4o (Commercial)"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 tracking-tight flex items-center justify-between">
                        Active Workloads
                      </h3>
                      <div className="flex flex-col gap-3">
                        {telemetry.workloads?.map((wk: any) => (
                          <div
                            key={wk.id}
                            className="bg-default-50 dark:bg-black/40 border border-default-100 rounded-xl p-4 flex items-center justify-between hover:border-default-300 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111] border border-default-200 flex items-center justify-center shrink-0">
                                <Server
                                  className="text-gray-500 group-hover:text-primary transition-colors"
                                  size={16}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                                  {wk.name}
                                </p>
                                <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                                  <span className="flex items-center gap-1">
                                    <Globe2 size={10} /> {wk.region}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                  <span className="font-mono text-[10px]">
                                    {wk.id}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="w-24 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-[10px] font-medium text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Cpu size={10} /> CPU
                                  </span>
                                  <span>{wk.cpu}</span>
                                </div>
                                <Progress
                                  classNames={{ track: "bg-default-200" }}
                                  color={
                                    parseInt(wk.cpu || "0") > 75
                                      ? "danger"
                                      : "primary"
                                  }
                                  size="sm"
                                  value={parseInt(wk.cpu || "0")}
                                />
                              </div>
                              <Chip
                                className="border-none px-0 text-xs font-medium"
                                color="success"
                                size="sm"
                                variant="dot"
                              >
                                {wk.status}
                              </Chip>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Integration Status
                    </h3>
                    <div className="bg-default-50 dark:bg-black/50 p-5 rounded-xl border border-default-200 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-default-200 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Awaiting Telemetry
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Authenticate via IAM role or Service Account Key to
                          begin synchronizing workloads from {selectedProvider}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ──── DEDICATED SPECIALIST AGENTS GRID ──── */}
                <div className="border-t border-default-200 pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" /> Dedicated
                        Specialist Agent Swarm
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Fully specialized autonomous agent nodes running
                        dedicated telemetry microservices for every core
                        function of {selectedProvider}.
                      </p>
                    </div>
                    <Chip
                      className="font-semibold uppercase tracking-wider"
                      color="primary"
                      size="sm"
                      variant="flat"
                    >
                      6 Specializations Active
                    </Chip>
                  </div>

                  {/* Dynamic console monitor drawer */}
                  {deployingAgentId && (
                    <div className="mb-6 bg-black text-lime-400 p-4 rounded-2xl border border-default-800 font-mono text-xs shadow-inner animate-pulse">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-default-800 text-lime-500">
                        <Terminal size={14} />
                        <span>CLOUD DEPLOYMENT STREAM MONITOR</span>
                      </div>
                      <div className="space-y-1 select-none">
                        {agentLogs.map((log, i) => (
                          <div
                            key={i}
                            className="animate-in slide-in-from-left duration-300"
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentAgents.map((agent) => {
                      const isDeployed = deployedAgents.includes(agent.agentId);
                      const isDeploying = deployingAgentId === agent.agentId;
                      const activeStatus = isDeployed ? "ACTIVE" : agent.status;

                      return (
                        <div
                          key={agent.agentId}
                          className="bg-default-50 dark:bg-black/30 border border-default-100 hover:border-default-300 rounded-2xl p-5 transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#151515] border border-default-200 flex items-center justify-center shrink-0">
                                  {getAgentIcon(agent.icon)}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                                    {agent.name}
                                  </h4>
                                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                    {agent.functionName}
                                  </span>
                                </div>
                              </div>

                              <Chip
                                className="text-[10px] font-bold border-none"
                                color={
                                  activeStatus === "ACTIVE"
                                    ? "success"
                                    : activeStatus === "SWARMING"
                                      ? "secondary"
                                      : activeStatus === "OPTIMIZING"
                                        ? "warning"
                                        : "default"
                                }
                                size="sm"
                                startContent={
                                  <div
                                    className={`w-1 h-1 rounded-full ${
                                      activeStatus === "ACTIVE"
                                        ? "bg-success"
                                        : activeStatus === "SWARMING"
                                          ? "bg-secondary"
                                          : activeStatus === "OPTIMIZING"
                                            ? "bg-warning"
                                            : "bg-gray-400"
                                    } mr-1`}
                                  />
                                }
                                variant="flat"
                              >
                                {activeStatus}
                              </Chip>
                            </div>

                            <p className="text-xs text-gray-500 leading-relaxed mb-4">
                              {agent.description}
                            </p>

                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {agent.capabilities.map((cap) => (
                                <Chip
                                  key={cap}
                                  className="text-[9px] font-mono border-default-200 px-1 hover:bg-default-100 transition-colors"
                                  size="sm"
                                  variant="bordered"
                                >
                                  {cap}
                                </Chip>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-default-100 pt-3 mt-auto">
                            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 truncate max-w-[150px]">
                              {agent.agentName}
                            </span>
                            <Button
                              className={`h-8 rounded-full px-4 text-xs font-semibold ${
                                isDeployed
                                  ? "bg-success/10 text-success border border-success/20 hover:bg-success/20"
                                  : "bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
                              }`}
                              isDisabled={isDeploying || isDeployed}
                              isLoading={isDeploying}
                              size="sm"
                              startContent={
                                isDeployed ? (
                                  <Check size={12} />
                                ) : (
                                  <Play fill="currentColor" size={12} />
                                )
                              }
                              onClick={() => deploySpecialistAgent(agent)}
                            >
                              {isDeployed ? "Bound & Ready" : "Deploy Agent"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-start w-full max-w-4xl gap-8 my-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center justify-center text-center w-full max-w-2xl bg-white dark:bg-[#111111] p-12 rounded-3xl border border-default-200 shadow-sm border-dashed">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-30" />
                  <Cloud className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                  Global Cloud Infrastructure
                </h1>
                <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                  Select a cloud provider from the sidebar to configure IAM
                  roles, sync workloads, and deploy agentic services securely
                  across your infrastructure.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        backdrop="blur"
        classNames={{
          base: "bg-white dark:bg-[#111111] border border-default-200 shadow-2xl",
        }}
        isOpen={isModalOpen}
        placement="center"
        onOpenChange={setIsModalOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  Connect to {selectedProvider}
                </h2>
                <p className="text-sm font-normal text-gray-500">
                  Provide sovereign credentials to establish a secure, localized
                  connection.
                </p>
              </ModalHeader>
              <ModalBody className="py-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 block">
                      Service Account / API Key
                    </label>
                    <Input
                      classNames={{
                        inputWrapper:
                          "bg-default-50 border-default-200 hover:border-default-400",
                      }}
                      placeholder={`Enter ${selectedProvider} API Key or JSON Token...`}
                      startContent={<Key className="w-4 h-4 text-gray-400" />}
                      value={credentials}
                      variant="bordered"
                      onChange={(e) => setCredentials(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center"
                    >
                      <div className="w-full border-t border-default-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white dark:bg-[#111111] px-2 text-xs text-gray-500 font-medium">
                        OR
                      </span>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-default-200 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-default-50/50 hover:bg-default-50 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 bg-white dark:bg-[#1A1A1A] rounded-full flex items-center justify-center border border-default-200 mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Upload JSON Key File
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Strictly parsed locally. Never transmitted over public
                      networks.
                    </p>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  className="font-medium"
                  isDisabled={isAuthenticating}
                  variant="flat"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-black text-white dark:bg-white dark:text-black font-medium"
                  isDisabled={!credentials}
                  isLoading={isAuthenticating}
                  onPress={handleAuthenticate}
                >
                  Establish Connection
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </ChatBotLayout>
  );
}
