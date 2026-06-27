"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { Button } from "@heroui/button";
import { Play, Save, Trash2, Code, FileCode, Plus, Loader2, Sparkles, Terminal, ShieldAlert } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);

  // 1. Fetch Functions
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

  // 2. Execute / Run code in Sandbox
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

  // 3. Save Function to Database
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
        // Update
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
        // Create new
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

  // 4. Delete Function
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

  return (
    <ChatBotLayout>
      <div className="flex flex-1 h-full font-sans bg-[#F4F4F6] dark:bg-background overflow-hidden">
        {/* Left Side: Functions List Panel */}
        <div className="w-80 border-r border-default-200/50 dark:border-gray-800 bg-white dark:bg-[#161b22]/50 flex flex-col h-full shrink-0">
          <div className="p-4 border-b border-default-200/50 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Functions Center</span>
            </div>
            <button
              onClick={handleNew}
              className="p-1 hover:bg-default-100 dark:hover:bg-default-800 rounded-lg text-primary transition-all"
              title="Create New Function"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            ) : functions.length === 0 ? (
              <p className="text-center text-xs text-default-400 py-12">No functions created yet.</p>
            ) : (
              functions.map((func) => (
                <div
                  key={func.id}
                  onClick={() => selectFunc(func)}
                  className={`w-full p-3 rounded-xl cursor-pointer text-left transition-all border flex items-center gap-3 ${
                    selectedFunc?.id === func.id
                      ? "bg-white dark:bg-[#161b22] border-default-200 dark:border-gray-800 shadow-sm"
                      : "border-transparent hover:bg-default-50/50 dark:hover:bg-default-50/10"
                  }`}
                >
                  <FileCode className="w-4 h-4 text-primary/70 shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-xs font-semibold text-foreground truncate">{func.name}</h3>
                    <p className="text-[10px] text-default-400 truncate">{func.description || "No description"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Main Editor & Logs Dashboard */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* Menu Actions */}
          <div className="px-6 py-3 bg-white dark:bg-[#161b22]/50 border-b border-default-200/50 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 max-w-lg">
              <input
                type="text"
                placeholder="Function Name (e.g. formatLogPayload)..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-sm text-foreground placeholder-gray-400 w-full"
              />
            </div>
            <div className="flex gap-2">
              {selectedFunc && (
                <Button
                  onClick={handleDelete}
                  variant="light"
                  color="danger"
                  className="rounded-xl px-3 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                onClick={handleSave}
                isLoading={isSaving}
                className="bg-default-100 dark:bg-default-800 text-foreground rounded-xl text-xs px-4"
              >
                <Save className="w-3.5 h-3.5 mr-1" /> Save
              </Button>
              <Button
                onClick={handleExecute}
                isLoading={isExecuting}
                className="bg-primary text-white rounded-xl text-xs px-4 font-semibold shadow-md"
              >
                <Play className="w-3.5 h-3.5 mr-1" /> Run Code
              </Button>
            </div>
          </div>

          {/* Description Block */}
          <div className="px-6 py-2.5 bg-white dark:bg-[#161b22]/30 border-b border-default-200/50 dark:border-gray-800">
            <input
              type="text"
              placeholder="Add optional function description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-default-400 placeholder-gray-400 w-full"
            />
          </div>

          {/* Split Pane: Code Editor + Logs console */}
          <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-[#FAFAFA] dark:bg-background">
            {/* Code Field */}
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-default-400">Sandbox Code Editor</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 w-full p-4 rounded-2xl bg-white dark:bg-[#0d1117] border border-default-200/50 dark:border-gray-800 text-xs font-mono outline-none resize-none shadow-inner leading-relaxed"
              />
            </div>

            {/* Console output logs */}
            <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-default-200/50 dark:border-gray-800 bg-[#F4F4F6] dark:bg-[#161b22]/20 flex flex-col min-h-0 p-4 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-default-400">Sandbox Console Output</span>
              </div>

              <div className="flex-1 bg-white dark:bg-[#0d1117] border border-default-200/50 dark:border-gray-800 rounded-2xl p-4 overflow-y-auto font-mono text-[10px] flex flex-col gap-2 shadow-inner">
                {isExecuting ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-default-400 gap-2">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span>Executing script in E2B sandbox...</span>
                  </div>
                ) : execResult ? (
                  <>
                    {/* Execution Meta */}
                    <div className="border-b border-default-100 dark:border-gray-800 pb-2 mb-1 flex items-center justify-between text-[9px] text-default-400">
                      <span>Status: {execResult.success ? (
                        <span className="text-emerald-500 font-bold">SUCCESS</span>
                      ) : (
                        <span className="text-rose-500 font-bold">FAILED</span>
                      )}</span>
                      <span>Duration: {execResult.duration}ms</span>
                    </div>

                    {/* Console Logs */}
                    {execResult.logs.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] uppercase text-default-400 font-bold">Standard Output (stdout)</span>
                        <div className="flex flex-col gap-1 text-gray-700 dark:text-gray-300 pl-2 border-l border-default-200 dark:border-gray-800">
                          {execResult.logs.map((log, index) => (
                            <div key={index} className="whitespace-pre-wrap leading-normal">{log}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Output Return Value */}
                    {execResult.success ? (
                      <div className="flex flex-col gap-1.5 mt-2">
                        <span className="text-[9px] uppercase text-default-400 font-bold">Return Value</span>
                        <pre className="bg-default-50 dark:bg-default-800/30 p-2.5 rounded-lg overflow-x-auto text-emerald-500 font-semibold leading-relaxed leading-normal whitespace-pre-wrap">
                          {execResult.result}
                        </pre>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 mt-2 text-rose-500">
                        <span className="text-[9px] uppercase text-default-400 font-bold flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Exception Trace
                        </span>
                        <pre className="bg-rose-500/10 p-2.5 rounded-lg overflow-x-auto font-bold border border-rose-500/20 whitespace-pre-wrap">
                          {execResult.error}
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-default-400 text-center px-4">
                    Click "Run Code" to execute this function in a secure, sandboxed container.
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
