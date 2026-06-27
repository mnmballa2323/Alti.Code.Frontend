"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { Button } from "@heroui/button";
import { 
  Play, Save, Trash2, Code, FileCode, Plus, Loader2, Sparkles, 
  Terminal, ShieldAlert, BookOpen, Clock, Cpu, Search, ChevronRight 
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";

import ChatBotLayout from "@/components/ChatbotLayout";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface ServerlessFunc {
  id: string;
  name: string;
  description: string;
  code: string;
  language: string;
  createdAt: string;
}

interface ExecutionResult {
  success: boolean;
  result?: string;
  error?: string;
  logs: string[];
  duration: number;
}

// Visual code templates
const TEMPLATES = [
  {
    name: "JSON Formatter",
    description: "Parses, maps, and returns customized JSON attributes.",
    code: `// Preset: JSON Formatter & Sanitizer
function processPayload() {
  console.log("Parsing incoming payload...");
  const rawInput = {
    userId: "usr_9983",
    raw_score: "89.4",
    roles: ["USER", "DEVELOPER"],
    meta: { ip: "127.0.0.1", active: true }
  };

  console.log("Formatting attributes...");
  return {
    id: rawInput.userId,
    score: parseFloat(rawInput.raw_score),
    isAdmin: rawInput.roles.includes("ADMIN"),
    lastSeen: new Date().toISOString()
  };
}

processPayload();`
  },
  {
    name: "RAG Context Filter",
    description: "Filters retrieved text chunks by size and confidence threshold.",
    code: `// Preset: RAG Context Filter
function filterChunks() {
  console.log("Evaluating retrieved RAG blocks...");
  const chunks = [
    { id: 1, text: "System auth validation routes", confidence: 0.94 },
    { id: 2, text: "Mock sandbox data models", confidence: 0.42 },
    { id: 3, text: "Keycloak OIDC auth middleware", confidence: 0.88 }
  ];

  const threshold = 0.80;
  console.log("Applying confidence threshold: " + threshold);

  const matched = chunks.filter(c => c.confidence >= threshold);
  console.log(\`Matched \${matched.length} RAG chunks\`);

  return matched;
}

filterChunks();`
  },
  {
    name: "Webhook payload mapper",
    description: "Simulates incoming payment events and formats data.",
    code: `// Preset: Stripe webhook payload translator
function handleStripeEvent() {
  console.log("Received incoming Stripe transaction event...");
  const stripeEvent = {
    id: "evt_1093282",
    type: "charge.succeeded",
    data: {
      object: {
        amount: 4900, // in cents
        receipt_email: "client@company.com"
      }
    }
  };

  console.log("Translating payload to local schema...");
  return {
    eventId: stripeEvent.id,
    amountUSD: stripeEvent.data.object.amount / 100,
    email: stripeEvent.data.object.receipt_email,
    processedAt: new Date().toISOString()
  };
}

handleStripeEvent();`
  }
];

const DEFAULT_CODE = `// Alti Secure Sandbox Serverless Function
// Write your sandboxed code here and click "Run Code"

function main() {
  console.log("Initializing secure execution sandbox...");
  
  const greeting = "Hello, World!";
  console.log("Output variable validation: " + greeting);
  
  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    message: greeting
  };
}

main();`;

function FunctionsPageContent() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;

  const [functions, setFunctions] = useState<ServerlessFunc[]>([]);
  const [selectedFunc, setSelectedFunc] = useState<ServerlessFunc | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);

  // Fetch functions list
  const fetchFunctions = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/function`, { headers });
      if (res.data?.success) {
        const list = res.data.data || [];
        setFunctions(list);
        if (list.length > 0 && !selectedFunc) {
          selectFunc(list[0]);
        }
      }
    } catch (err) {
      toast.error("Failed to load serverless functions.");
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedFunc]);

  useEffect(() => {
    if (token) fetchFunctions();
  }, [token, fetchFunctions]);

  const selectFunc = (func: ServerlessFunc) => {
    setSelectedFunc(func);
    setName(func.name);
    setDescription(func.description || "");
    setCode(func.code);
    setExecResult(null);
  };

  const handleNew = () => {
    setSelectedFunc(null);
    setName("");
    setDescription("");
    setCode(DEFAULT_CODE);
    setExecResult(null);
  };

  const applyTemplate = (templateCode: string) => {
    setCode(templateCode);
    setExecResult(null);
    toast.info("Template loaded to sandbox.");
  };

  const handleExecute = async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    const toastId = toast.loading("Deploying sandbox and executing script...");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `${API_BASE_URL}/function/execute`,
        { code },
        { headers }
      );
      if (res.data?.success) {
        setExecResult(res.data.data);
        if (res.data.data.success) {
          toast.success("Execution completed successfully.", { id: toastId });
        } else {
          toast.error("Execution failed. Review sandbox errors.", { id: toastId });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Execution timeout or sandbox crash.", { id: toastId });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Function name is required.");
      return;
    }

    setIsSaving(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payload = { name, description, code, language: "javascript" };

      if (selectedFunc) {
        const res = await axios.put(
          `${API_BASE_URL}/function/${selectedFunc.id}`,
          payload,
          { headers }
        );
        if (res.data?.success) {
          toast.success("Function updated successfully.");
          fetchFunctions();
        }
      } else {
        const res = await axios.post(
          `${API_BASE_URL}/function`,
          payload,
          { headers }
        );
        if (res.data?.success) {
          toast.success("Function created successfully.");
          setSelectedFunc(res.data.data);
          fetchFunctions();
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save function.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFunc) return;

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.delete(
        `${API_BASE_URL}/function/${selectedFunc.id}`,
        { headers }
      );
      if (res.data?.success) {
        toast.success("Function deleted successfully.");
        handleNew();
        fetchFunctions();
      }
    } catch (err) {
      toast.error("Failed to delete function.");
    }
  };

  const filteredFunctions = functions.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate simple line numbers for visual code decoration
  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 15) }, (_, i) => i + 1);

  return (
    <ChatBotLayout>
      <div className="flex flex-1 h-full font-sans bg-[#F4F4F6] dark:bg-background overflow-hidden">
        {/* Left Sidebar Pane */}
        <div className="w-80 border-r border-default-200/50 dark:border-gray-800 bg-white dark:bg-[#161b22]/40 flex flex-col h-full shrink-0">
          <div className="p-4 border-b border-default-200/50 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Functions Center</span>
            </div>
            <button
              onClick={handleNew}
              className="p-1.5 hover:bg-default-100 dark:hover:bg-default-800 rounded-xl text-primary transition-all"
              title="Create New Function"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3 border-b border-default-200/50 dark:border-gray-800">
            <div className="bg-default-50 dark:bg-default-100 rounded-xl px-3 py-2 flex items-center gap-2 border border-default-200/50 dark:border-gray-800 shadow-inner">
              <Search className="w-3.5 h-3.5 text-default-400" />
              <input
                type="text"
                placeholder="Search functions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-foreground placeholder-gray-400 w-full"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : filteredFunctions.length === 0 ? (
              <p className="text-center text-xs text-default-400 py-12">No functions found.</p>
            ) : (
              filteredFunctions.map((func) => (
                <div
                  key={func.id}
                  onClick={() => selectFunc(func)}
                  className={`w-full p-3.5 rounded-xl cursor-pointer text-left transition-all border flex items-center justify-between gap-3 ${
                    selectedFunc?.id === func.id
                      ? "bg-white dark:bg-[#161b22] border-default-200 dark:border-gray-800 shadow-sm"
                      : "border-transparent hover:bg-default-50/50 dark:hover:bg-default-50/10"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileCode className="w-4 h-4 text-primary shrink-0" />
                    <div className="overflow-hidden">
                      <h3 className="text-xs font-semibold text-foreground truncate">{func.name}</h3>
                      <p className="text-[10px] text-default-400 truncate mt-0.5">{func.description || "No description"}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-default-400 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Editor & Console Pane */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* Action Bar */}
          <div className="px-6 py-4 bg-white dark:bg-[#161b22]/40 border-b border-default-200/50 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-lg flex flex-col gap-1">
              <input
                type="text"
                placeholder="Function Name (e.g. formatPaymentLogs)..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-base text-foreground placeholder-gray-400 w-full"
              />
              <input
                type="text"
                placeholder="Add optional function description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-default-400 placeholder-gray-400 w-full"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Templates menu */}
              <div className="relative group mr-2">
                <Button className="bg-default-100 dark:bg-default-800 text-foreground rounded-xl text-xs px-3.5">
                  <BookOpen className="w-3.5 h-3.5 mr-1" /> Presets
                </Button>
                <div className="absolute right-0 top-9 z-50 w-64 bg-white dark:bg-[#161b22] border border-default-200/50 dark:border-gray-800 rounded-xl shadow-xl hidden group-hover:block hover:block py-1.5 animate-in fade-in duration-200">
                  {TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyTemplate(tmpl.code)}
                      className="w-full px-4 py-2.5 hover:bg-default-50 dark:hover:bg-default-50/10 text-left flex flex-col gap-0.5 border-b last:border-0 border-default-100 dark:border-gray-800/50"
                    >
                      <span className="text-xs font-semibold text-foreground">{tmpl.name}</span>
                      <span className="text-[10px] text-default-400 leading-normal">{tmpl.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedFunc && (
                <Button
                  onClick={handleDelete}
                  variant="light"
                  color="danger"
                  className="rounded-xl px-3.5 text-xs min-w-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                className="bg-default-100 dark:bg-default-800 text-foreground rounded-xl text-xs px-4 font-medium"
              >
                <Save className="w-3.5 h-3.5 mr-1" /> Save
              </Button>
              <Button
                onClick={handleExecute}
                isLoading={isExecuting}
                className="bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs px-4 font-semibold shadow-md"
              >
                <Play className="w-3.5 h-3.5 mr-1" /> Run Code
              </Button>
            </div>
          </div>

          {/* Code Editor and Console Grid */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[#FAFAFA] dark:bg-background">
            {/* Syntax Editor Box */}
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-default-400">Sandbox Code Editor</span>
                </div>
                <span className="text-[10px] text-default-400 font-mono bg-default-100 dark:bg-default-800/50 px-2 py-0.5 rounded-lg">
                  javascript (vm-isolated)
                </span>
              </div>
              
              <div className="flex-1 flex bg-white dark:bg-[#0d1117] border border-default-200/50 dark:border-gray-800 rounded-2xl overflow-hidden shadow-inner relative">
                {/* Visual Line Number gutter */}
                <div className="w-12 bg-gray-50/50 dark:bg-gray-800/10 border-r border-default-100 dark:border-gray-800/50 py-4 font-mono text-[10px] text-default-300 text-right pr-3 select-none overflow-hidden h-full">
                  {lineNumbers.map(n => (
                    <div key={n} className="leading-normal h-[18px]">{n}</div>
                  ))}
                </div>
                
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  className="flex-1 p-4 pl-2 bg-transparent border-none text-[11px] font-mono outline-none resize-none overflow-y-auto leading-normal tracking-wide text-gray-800 dark:text-gray-200 selection:bg-primary/20"
                  style={{ lineHeight: "18px" }}
                />
              </div>
            </div>

            {/* Logs Console Container */}
            <div className="w-full lg:w-[420px] border-t lg:border-t-0 lg:border-l border-default-200/50 dark:border-gray-800 bg-[#F4F4F6] dark:bg-[#161b22]/10 flex flex-col min-h-0 p-4 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-default-400">Sandbox Console Output</span>
              </div>

              {/* Console logs body */}
              <div className="flex-1 bg-white dark:bg-[#0d1117] border border-default-200/50 dark:border-gray-800 rounded-2xl p-4 overflow-y-auto font-mono text-[10px] flex flex-col gap-3 shadow-inner">
                {isExecuting ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-default-400 gap-3">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <span className="text-[11px]">Executing script in E2B VM sandbox...</span>
                  </div>
                ) : execResult ? (
                  <div className="flex flex-col gap-4">
                    {/* Execution Telemetry Badges */}
                    <div className="grid grid-cols-2 gap-2 border-b border-default-100 dark:border-gray-800/80 pb-3">
                      <div className="bg-default-50 dark:bg-default-800/20 p-2 rounded-xl flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-[8px] text-default-400 uppercase">STATUS</span>
                          <span className={`text-[10px] font-bold ${execResult.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {execResult.success ? 'SUCCESS' : 'FAILED'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-default-50 dark:bg-default-800/20 p-2 rounded-xl flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-[8px] text-default-400 uppercase">DURATION</span>
                          <span className="text-[10px] font-bold text-foreground">{execResult.duration} ms</span>
                        </div>
                      </div>
                    </div>

                    {/* Standard Output (stdout) logs */}
                    {execResult.logs.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] uppercase text-default-400 font-bold tracking-wider">Console Logs (stdout)</span>
                        <div className="flex flex-col gap-1.5 text-gray-700 dark:text-gray-300 pl-3 border-l-2 border-primary/20 bg-gray-50/50 dark:bg-gray-800/10 p-2.5 rounded-lg">
                          {execResult.logs.map((log, index) => (
                            <div key={index} className="whitespace-pre-wrap leading-relaxed">{log}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Return result display */}
                    {execResult.success ? (
                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] uppercase text-default-400 font-bold tracking-wider">Return Value</span>
                        <pre className="bg-emerald-50/20 dark:bg-emerald-500/5 p-3 rounded-xl overflow-x-auto text-emerald-500 font-semibold border border-emerald-500/15 whitespace-pre-wrap leading-relaxed shadow-sm">
                          {execResult.result}
                        </pre>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 text-rose-500">
                        <span className="text-[9px] uppercase text-rose-500 font-bold tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 shrink-0" /> Exception Trace
                        </span>
                        <pre className="bg-rose-500/10 p-3 rounded-xl overflow-x-auto font-bold border border-rose-500/15 whitespace-pre-wrap leading-relaxed">
                          {execResult.error}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-default-400 text-center px-4 gap-2">
                    <Terminal className="w-6 h-6 text-default-300" />
                    <span className="text-[11px] leading-normal">
                      Select a Preset template or write custom code, then click "Run Code" to execute securely.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}

export default function FunctionsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full bg-[#F4F4F6] dark:bg-background" />
      }
    >
      <FunctionsPageContent />
    </Suspense>
  );
}
