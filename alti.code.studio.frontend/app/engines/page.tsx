"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Cpu,
  Play,
  Terminal,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";
import { Button, Tooltip, Input, Card, Badge, Spinner } from "@heroui/react";

interface SpecialistEngine {
  name: string;
  description: string;
  capabilities: string[];
  queue: string;
  version: string;
  isPlugin: boolean;
}

const ENGINE_DISPLAY_NAMES: Record<string, string> = {
  jules: "Digital Swarm Dispatch Assistant",
  licenseGuardian: "Compliance Licensing Guard",
  diplomat: "Multi-Agent Protocol Negotiator",
  auditor: "Financial Activity Verifier",
  architect: "Systems Structure Planner",
  conductor: "Swarm Workflow Orchestrator",
  devops: "Systems Infrastructure Automation",
  zx: "Terminal Process Runner",
  octopus: "Multi-Task Pipeline Coordinator",
  specter: "Performance Footprint Monitor",
  centurion: "Deployment Gatekeeper",
  titan: "Compute Resource Allocator",
  nomad: "Workload Scheduler",
  audit: "Cryptographic Ledger Verifier",
  git: "Repository Version Control",
  refactor: "Codebase Structural Optimizer",
  security: "Systems Vulnerability Inspector",
  sandyaa: "Sandbox Environment Runner",
  qa: "Automated Test Validator",
  monitoring: "Live Health Telemetry",
  iac: "Infrastructure Configuration Designer",
  cicd: "Automated Delivery Pipeline",
  notification: "Real-Time Alerts Dispatcher",
  codeReview: "Architectural Code Evaluator",
  documentation: "Project Document Generator",
  debug: "Error Stack Tracer",
  architecture: "Component Design Advisor",
  database: "Query Tuning Manager",
  migration: "Database Schema Updates",
  performance: "Runtime Latency Analyzer",
  cost: "Cloud Budget Estimator",
  compliance: "Standard Security Checker",
  accessibility: "Inclusive Design Validator",
  dependency: "External Package Auditor",
  e2eTest: "User Flow Validator",
  release: "Deployment Package Builder",
  overseer: "Swarm Activity Supervisor",
  incident: "System Outage Responder",
  analytics: "Swarm Health Reporter",
  knowledge: "Enterprise Data Indexer",
  seo: "Search Visibility Optimizer",
  opencode: "Autonomous Code Generator",
  openspec: "Specification Design Planner",
  website_cloner: "Layout Template Generator",
  translation: "Multi-Language Localizer",
  onboarding: "Workspace Setup Assistant",
  apiDesign: "Endpoint Architecture Planner",
  gcp: "Cloud Compute Provider",
  python: "Scripting Execution Engine",
  typescript: "Typed Code Generator",
  rust: "Systems Safety Validator",
  golang: "Microservice Build Engine",
  linter: "Static Rules Evaluator",
  formatter: "Style Layout Adjuster",
  "background-agents": "Worker Loop Dispatcher",
  pentagi: "External Assessment Agent",
  fossflow: "Open Source Auditor",
  envValidator: "Secret Values Inspector",
  secretScanner: "Secret Token Detector",
  deadCode: "Redundant Logic Cleaner",
  importSorter: "Import Ordering Formatter",
  gcpSearch: "Cloud Documentation Indexer",
  surfer: "Web Research Explorer",
  siren: "Voice Telemetry Synthesizer",
  vector: "Semantic Memory Manager",
  engine: "Core Swarm Processor",
  strategist: "Logical Step Planner",
  critic: "Reasoning Quality Checker",
  regex: "Pattern Matching Evaluator",
  docker: "Isolated Container Manager",
  kubernetes: "Container Swarm Orchestrator",
  nginx: "Reverse Proxy Router",
  graphql: "Query Endpoint Designer",
  bash: "System Command Executor",
  cron: "Scheduled Job Runner",
  ffmpeg: "Multimedia Processing Tool",
  jwt: "Token Authentication Builder",
  threejs: "3D Render Engine",
  stripe: "Financial Payment Gateway",
  redis: "Memory Cache Manager",
  supabase: "Database Platform Assistant",
  chairman: "Swarm Governance Director",
  ceo: "Strategic Decision Authority",
  coo: "Operations Process Manager",
  cfo: "Financial Budget Director",
  cmo: "Marketing Campaign Manager",
  cro: "Revenue Stream Optimizer",
  lawyer: "Contract Agreement Reviewer",
  accountant: "Ledger Balance Auditor",
  pm: "Product Lifecycle Planner",
  scrum: "Scrum Cycle Organizer",
  designer: "Visual Interface Planner",
  frontend: "Visual Component Builder",
  backend: "Server Side Developer",
  dba: "Database Administrator",
  ai: "Model Tuning Advisor",
  writer: "Professional Content Copywriter",
  support: "Customer Service Agent",
  cto: "Technology Systems Director",
  ciso: "Information Security Officer",
  prisma: "Database Integration Mapper",
  webrtc: "Live Connection Streamer",
  solidity: "Smart Contract Developer",
  svelte: "Client Side Compiler",
  vue: "Reactive Interface Builder",
  storybook: "Design System Reviewer",
  opentelemetry: "Distributed Telemetry Collector",
  ansible: "Infrastructure Provisioning Manager",
  terraform: "Cloud Resource Configurator",
  langchain: "Model Swarm Builder",
  mlops: "Model Pipeline Manager",
  prompteng: "Prompt Design Specialist",
  reactnative: "Multi-Platform App Developer",
  flutter: "Client Layout Compiler",
  pwa: "Desktop Web Builder",
  vitest: "Fast Test Runner",
  playwright: "Browser Automation Tester",
  sql: "Database Query Generator",
  elasticsearch: "Fast Search Indexer",
  kafka: "Real-Time Event Streamer",
  pentest: "Security Penetration Tester",
  githubactions: "Workflow Pipeline Automator",
  figma: "Graphic Layout Importer",
  wasm: "Assembly Compiler Runner",
  deno: "Safe Runtime Processor",
  mongodb: "Document Storage Database",
  grpc: "High-Speed API Connector",
  tailwind: "Style Sheet Utility Compiler",
  i18n: "Language Translation Manager",
  websocket: "Real-Time Socket Connection",
  cloudflare: "Edge Protection Network",
  vercel: "Front-End Deployment Platform",
  netlify: "Static Site Deployer",
  digitalocean: "Virtual Server Cloud",
  oracle: "Database Platform Manager",
  ibmcloud: "Enterprise Cloud Provider",
  alibaba: "International Cloud Provider",
  hetzner: "Dedicated Server Cloud",
  flyio: "Global Microservice Deployer",
  railway: "Dynamic Deploy Hosting",
  render: "Fast App Deployer",
  linode: "Cloud Host Server",
  vultr: "High-Speed Virtual Servers",
  scaleway: "European Cloud Server",
  ovhcloud: "Dedicated Cloud Hosting",
  neon: "Serverless Database Provider",
  fastly: "Edge Delivery Cache",
  backblaze: "Secure Object Storage",
  heroku: "Managed Application Host",
  planetscale: "Scalable Database Platform",
  upcloud: "Premium Virtual Cloud",
  exoscale: "Swiss Cloud Server",
  civo: "Managed Kubernetes Cloud",
  coreweave: "High-Performance Compute Cloud",
  lambdalabs: "Model Training Cloud",
  runpod: "Model Container Cloud",
  paperspace: "Machine Learning Workspace",
  tencent: "Asian Cloud Platform",
  huawei: "Enterprise Cloud Service",
  baidu: "AI Search Cloud",
  yandex: "Search Infrastructure Cloud",
  equinix: "Bare Metal Cloud",
  cloudinary: "Media Asset Optimizer",
  snowflake: "Data Warehouse Analyzer",
  databricks: "Data Lakehouse Platform",
  denodeploy: "Global Edge Runner",
  turso: "Edge SQLite Database",
  akamai: "Global Content Guard",
  supabasecloud: "Managed Database Cloud",
  apprunner: "Containerized Application Host",
  contextEngineering: "Context Optimizer",
  deepResearch: "Web Neural Searcher",
  pageIndexRAG: "Local Documentation Searcher",
  nanoCodeAgent: "Micro Task SWE Agent",
  product_manager: "Product Requirement Planner",
  system_architect: "Systems Architecture Planner",
  gemini_coder: "Swarm Code Builder",
  cloud_run_deployer: "Serverless Container Deployer",
  stackdriver_analyst: "Cloud Log Telemetry Monitor",
  "videoGenerationAgent.name": "Video Clip Animator",
  "spatial3DNerfAgent.name": "3D Scene Reconstruction",
  "neuralBciParserAgent.name": "Brain Signal Decoder",
  "hapticKinematicsAgent.name": "Robotics Motion Controller",
  "omniAudioSynthesisAgent.name": "Voice Waveform Generator",
  "agentSAgent.name": "OS Action Agent",
  "browserUseAgent.name": "Web Automation Swarm",
  "fazmAgent.name": "Low-Code Logic Engine",
  "figmaExporterAgent.name": "Visual Design Asset Converter",
  "researchPaperScraperAgent.name": "Academic Document Harvester",
  "voiceDesktopLauncherAgent.name": "Voice Command System Controller",
  "spreadsheetFormatterAgent.name": "Automated Data Sheet Organizer",
  "socialMediaMonitorAgent.name": "Social Sentiment Analyst",
  "voiceMeetingMinuterAgent.name": "Meeting Transcript Summarizer",
  "desktopFileOrganizerAgent.name": "System Directory Cleaner",
  "webDependencyAuditorAgent.name": "Third-Party Package Inspector",
  "voiceEmailDictatorAgent.name": "Email Draft Dictation Assistant",
  "systemPreferencesTunerAgent.name": "OS Environment Tuner",
  "webPriceTrackerAgent.name": "Online Catalog Monitor",
  "voiceCalendarSchedulerAgent.name": "Voice Meeting Planner",
  "mulesoftAnypointAgent.name": "Enterprise Integration Connector",
  "servicenowItsmAgent.name": "IT Workflows Automator",
  "soxItgcComplianceAgent.name": "Security Control Auditor",
  "as400RpgleModernizerAgent.name": "Legacy Code Modernizer",
  "paloAltoPanosAgent.name": "Network Firewall Rule Administrator",
  "dynamics365ErpAgent.name": "Business Resource Planner",
  "databricksSparkAgent.name": "Large Scale Data Processor",
  "uipathRpaBotAgent.name": "Desktop Action Bot",
  "intuneMdmPolicyAgent.name": "Device Policy Administrator",
  "peoplesoftHcmBridgeAgent.name": "Corporate Directory Sync Connector",
  "cicero_law_enforcement": "Municipal Policy Legal Verifier",
};

const getEngineDisplayName = (name: string): string => {
  return ENGINE_DISPLAY_NAMES[name] || name.replace(/_|-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

const FALLBACK_ENGINES: SpecialistEngine[] = [
  {
    name: "opencode",
    description: "Autonomous SWE Coding Agent — writes patches, runs builds, triages bugs, implements features.",
    capabilities: ["opencode", "coding-agent", "bug-fix", "patch-generation", "terminal-execution"],
    queue: "opencode-queue",
    version: "1.0.0",
    isPlugin: false,
  },
  {
    name: "openspec",
    description: "Spec-Driven Development Planner — proposes, validates, and archives project specs.",
    capabilities: ["openspec", "spec-driven-development", "sdd", "planning", "proposal", "validation"],
    queue: "openspec-queue",
    version: "1.0.0",
    isPlugin: false,
  },
  {
    name: "website_cloner",
    description: "AI Website Cloner — clones, scraps, and reverse-engineers target websites into Next.js/React templates.",
    capabilities: ["website-cloning", "scraping", "reverse-engineering", "asset-extraction"],
    queue: "cloner-queue",
    version: "1.0.0",
    isPlugin: false,
  },
  {
    name: "auditor",
    description: "Cloud FinOps Auditor — Monthly burn estimation and resource optimization for every mission.",
    capabilities: ["cost-audit", "finops", "resource-governance"],
    queue: "auditor-queue",
    version: "1.0.0",
    isPlugin: false,
  },
];

export default function EnginesPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [selectedEngine, setSelectedEngine] = useState<SpecialistEngine | null>(null);

  // Form State parameters
  const [opencodeAction, setOpencodeAction] = useState("runTask");
  const [opencodeTask, setOpencodeTask] = useState("");
  const [opencodeWorkspace, setOpencodeWorkspace] = useState("");

  const [openspecAction, setOpenspecAction] = useState("propose");
  const [openspecName, setOpenspecName] = useState("");
  const [openspecWorkspace, setOpenspecWorkspace] = useState("");

  const [clonerUrl, setClonerUrl] = useState("");
  const [clonerName, setClonerName] = useState("");
  const [clonerWorkspace, setClonerWorkspace] = useState("");

  const [genericQuery, setGenericQuery] = useState("");

  // Terminal Execution Log State
  const [executing, setExecuting] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [execStatus, setExecStatus] = useState<"idle" | "success" | "error">("idle");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

  // Listen to sidebar selection events
  useEffect(() => {
    const handleSelect = (e: any) => {
      if (e.detail) {
        setSelectedEngine(e.detail);
        setConsoleLogs([]);
        setExecStatus("idle");
      }
    };
    window.addEventListener("select-engine", handleSelect);
    return () => window.removeEventListener("select-engine", handleSelect);
  }, []);

  // Set default engine on page load
  useEffect(() => {
    if (!accessToken) return;
    
    const initDefault = async () => {
      try {
        const res = await axios.get(`${API_URL}/engines/list`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (res.data && res.data.success && res.data.data.length > 0) {
          const defaultEngine = res.data.data[0];
          setSelectedEngine(defaultEngine);
          window.dispatchEvent(new CustomEvent("select-engine", { detail: defaultEngine }));
        } else {
          setSelectedEngine(FALLBACK_ENGINES[0]);
          window.dispatchEvent(new CustomEvent("select-engine", { detail: FALLBACK_ENGINES[0] }));
        }
      } catch (err) {
        setSelectedEngine(FALLBACK_ENGINES[0]);
        window.dispatchEvent(new CustomEvent("select-engine", { detail: FALLBACK_ENGINES[0] }));
      }
    };
    initDefault();
  }, [accessToken]);

  const runEngineTask = async () => {
    if (!selectedEngine) return;
    setExecuting(true);
    setExecStatus("idle");
    setConsoleLogs([`⏳ Initializing execution thread for Engine: [${selectedEngine.name}]...`]);

    let requestBody: any = {
      action: "default",
      args: {},
    };

    if (selectedEngine.name === "opencode") {
      requestBody.action = opencodeAction;
      requestBody.args = {
        task: opencodeTask,
        workspace: opencodeWorkspace || undefined,
      };
      if (opencodeAction === "getTaskStatus") {
        requestBody.args = { sessionId: opencodeTask };
      }
    } else if (selectedEngine.name === "openspec") {
      requestBody.action = openspecAction;
      requestBody.args = {
        name: openspecName,
        workspace: openspecWorkspace || undefined,
      };
    } else if (selectedEngine.name === "website_cloner") {
      requestBody.action = "clone";
      requestBody.args = {
        targetUrl: clonerUrl,
        projectName: clonerName,
        workspace: clonerWorkspace || undefined,
      };
    } else {
      requestBody.action = "run";
      requestBody.args = {
        query: genericQuery,
      };
    }

    try {
      setConsoleLogs((prev) => [...prev, `📤 Sending payload to trigger console endpoint...`]);
      const res = await axios.post(`${API_URL}/engines/${selectedEngine.name}/run`, requestBody, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (res.data && res.data.success) {
        setExecStatus("success");
        setConsoleLogs((prev) => [
          ...prev,
          `✅ Execution Succeeded!`,
          `📝 Response Output:`,
          JSON.stringify(res.data.data, null, 2),
        ]);
      } else {
        throw new Error(res.data.message || "Failed response status");
      }
    } catch (err: any) {
      setExecStatus("error");
      setConsoleLogs((prev) => [
        ...prev,
        `❌ Execution Failed!`,
        `🚨 Error Details: ${err.response?.data?.message || err.message}`,
      ]);
    } finally {
      setExecuting(false);
    }
  };

  const currentDisplayName = selectedEngine ? getEngineDisplayName(selectedEngine.name) : "";

  return (
    <div className="flex-1 flex h-screen bg-[#fafafa] dark:bg-black text-foreground relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      {selectedEngine ? (
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden p-8 gap-8">
          
          {/* Engine Parameters & Controls Column */}
          <div className="w-full md:w-[380px] shrink-0 flex flex-col justify-between h-full space-y-6">
            
            {/* Header / Info details */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Cpu className="size-4" />
                  </div>
                  <h1 className="text-xl font-bold tracking-tight">{currentDisplayName}</h1>
                </div>
                <p className="text-[10px] text-default-400 font-mono">
                  Engine Registry ID: {selectedEngine.name} | Queue: {selectedEngine.queue}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-default-400 uppercase tracking-wider">Engine Purpose</h4>
                <p className="text-xs text-default-600 leading-relaxed bg-[#f4f4f5] dark:bg-default-50 p-4 rounded-2xl border border-default-100/50">
                  {selectedEngine.description}
                </p>
              </div>
            </div>

            {/* Config Forms Area */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              <h4 className="text-[10px] font-bold text-default-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="size-3 text-default-400" /> Configuration Parameters
              </h4>

              {selectedEngine.name === "opencode" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-default-600">Action Mode</label>
                    <select
                      className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      value={opencodeAction}
                      onChange={(e) => setOpencodeAction(e.target.value)}
                    >
                      <option value="runTask">Run Task (CLI fallback)</option>
                      <option value="getTaskStatus">Get Task Status</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-default-600">
                      {opencodeAction === "getTaskStatus" ? "Session ID" : "Task Instructions"}
                    </label>
                    <textarea
                      className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground h-20 resize-none"
                      placeholder={
                        opencodeAction === "getTaskStatus"
                          ? "Enter the Session ID to query status..."
                          : "Implement database logging middleware..."
                      }
                      value={opencodeTask}
                      onChange={(e) => setOpencodeTask(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-default-600">Workspace Path (Optional)</label>
                    <input
                      className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      placeholder="/Users/michaelmeram/workspace/..."
                      value={opencodeWorkspace}
                      onChange={(e) => setOpencodeWorkspace(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {selectedEngine.name === "openspec" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-default-600">OpenSpec Action</label>
                    <select
                      className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      value={openspecAction}
                      onChange={(e) => setOpenspecAction(e.target.value)}
                    >
                      <option value="propose">Propose Specification</option>
                      <option value="init">Initialize OpenSpec</option>
                      <option value="list">List Active Specs</option>
                      <option value="validate">Validate Specs</option>
                    </select>
                  </div>

                  {openspecAction === "propose" && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-semibold text-default-600">Proposal Name</label>
                      <input
                        className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        placeholder="database-logging-spec"
                        value={openspecName}
                        onChange={(e) => setOpenspecName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-default-600">Workspace Path (Optional)</label>
                    <input
                      className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      placeholder="/Users/michaelmeram/workspace/..."
                      value={openspecWorkspace}
                      onChange={(e) => setOpenspecWorkspace(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {selectedEngine.name === "website_cloner" && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-default-600">Target Website URL</label>
                    <input
                      className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      placeholder="https://example.com"
                      value={clonerUrl}
                      onChange={(e) => setClonerUrl(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-default-600">Project Directory Name</label>
                    <input
                      className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      placeholder="my-cloned-website"
                      value={clonerName}
                      onChange={(e) => setClonerName(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-default-600">Workspace Path (Optional)</label>
                    <input
                      className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                      placeholder="/Users/michaelmeram/workspace/..."
                      value={clonerWorkspace}
                      onChange={(e) => setClonerWorkspace(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {!["opencode", "openspec", "website_cloner"].includes(selectedEngine.name) && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-default-600">Task Query Instructions</label>
                  <textarea
                    className="w-full bg-[#f4f4f5] dark:bg-default-50 border border-default-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground h-28 resize-none"
                    placeholder={`Instruct the ${currentDisplayName}...`}
                    value={genericQuery}
                    onChange={(e) => setGenericQuery(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Run Button Footer */}
            <div className="pt-4 border-t border-default-100 bg-[#fafafa]/50 dark:bg-black/50">
              <Button
                color="primary"
                className="w-full font-semibold rounded-xl text-white flex items-center justify-center gap-2 h-11"
                isDisabled={executing}
                onClick={runEngineTask}
              >
                {executing ? (
                  <>
                    <Spinner size="sm" color="current" /> Running Task...
                  </>
                ) : (
                  <>
                    <Play className="size-4 shrink-0 fill-current" /> Trigger Engine Run
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Terminal Console Logs Output Column */}
          <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] dark:bg-black border border-default-100 rounded-2xl overflow-hidden shadow-2xl relative">
            {/* Header info */}
            <div className="px-6 py-4 border-b border-[#2d2d2d] bg-[#1a1a1a]/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono text-default-400 pl-2">bash-sandbox-session</span>
              </div>
              <div className="flex items-center gap-4">
                {executing && (
                  <span className="flex items-center gap-1.5 text-[9px] text-amber-500 font-semibold uppercase tracking-wider animate-pulse">
                    <Activity className="size-3" /> Processing
                  </span>
                )}
                {execStatus === "success" && (
                  <span className="flex items-center gap-1 text-[9px] text-green-500 font-bold uppercase tracking-wider">
                    <CheckCircle2 className="size-3" /> Completed
                  </span>
                )}
                {execStatus === "error" && (
                  <span className="flex items-center gap-1 text-[9px] text-rose-500 font-bold uppercase tracking-wider">
                    <AlertCircle className="size-3" /> Failed
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable logs area */}
            <div className="flex-1 p-6 font-mono text-xs text-green-400 overflow-y-auto space-y-3 leading-relaxed">
              {consoleLogs.length > 0 ? (
                consoleLogs.map((log, idx) => (
                  <div key={idx} className="whitespace-pre-wrap break-all">
                    {log}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#5c5c5c] space-y-3">
                  <Terminal className="size-10" />
                  <p className="text-[10px] uppercase tracking-wider">Standby: Engine execution output is empty</p>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-default-400 space-y-4">
          <Spinner size="lg" color="primary" />
          <span className="text-xs">Initializing Specialist Engine Interface...</span>
        </div>
      )}
    </div>
  );
}
