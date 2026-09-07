"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { CheckCircle2, Paperclip, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";

import { cn } from "@/lib/utils";
import ChatBotLayout from "@/components/ChatbotLayout";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

const CODE_MODELS = [
  {
    id: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash High",
    description: "Google Cloud · Vertex AI",
  },
  {
    id: "gemini-3.1-pro",
    label: "Gemini 3.1 Pro",
    description: "Google Cloud · Vertex AI",
  },
  {
    id: "gemini-3.0-ultra",
    label: "Gemini 3.0 Ultra",
    description: "Google Cloud · Vertex AI",
  },
  {
    id: "claude-opus-4.6",
    label: "Claude Opus 4.6",
    description: "Google Cloud · Vertex AI Model Garden",
  },
  {
    id: "claude-sonnet-4.5",
    label: "Claude Sonnet 4.5",
    description: "Google Cloud · Vertex AI Model Garden",
  },
  {
    id: "claude-haiku-4",
    label: "Claude Haiku 4",
    description: "Google Cloud · Vertex AI Model Garden",
  },
  {
    id: "deepseek-coder-v3",
    label: "DeepSeek Coder V3",
    description: "Google Cloud · Vertex AI Model Garden",
  },
  {
    id: "qwen-3-coder",
    label: "Qwen 3 Coder",
    description: "Google Cloud · Vertex AI Model Garden",
  },
  {
    id: "phi-4",
    label: "Phi-4",
    description: "Google Cloud · Vertex AI Model Garden",
  },
];

interface CustomAgent {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

// Mock Action Block component for UI demonstration
const ActionBlock = ({
  action,
  status,
}: {
  action: string;
  status: "pending" | "done";
}) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-xl border ${
      status === "pending"
        ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 animate-pulse"
        : "bg-gray-50 dark:bg-[#161b22] border-gray-100 dark:border-gray-800"
    }`}
  >
    {status === "pending" ? (
      <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
    ) : (
      <CheckCircle2 className="text-green-500 shrink-0" size={16} />
    )}
    <span
      className={`text-[13px] ${
        status === "pending"
          ? "text-blue-700 dark:text-blue-400 font-medium"
          : "text-gray-600 dark:text-gray-400"
      }`}
    >
      {action}
    </span>
  </div>
);

function AgentPageContent() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId");
  const agentName = searchParams.get("name") || "Custom Agent";

  const [inputValue, setInputValue] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [currentAgent, setCurrentAgent] = useState<CustomAgent | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mockMessages, setMockMessages] = useState<
    {
      role: string;
      content: string;
      action?: string;
      actionStatus?: "pending" | "done";
    }[]
  >([]);

  const [selectedModel, setSelectedModel] = useState("");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (isModelDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [isModelDropdownOpen]);

  const getSelectedModelLabel = () => {
    if (!selectedModel) return "Select Model";

    return (
      CODE_MODELS.find((m) => m.id === selectedModel)?.label || "Select Model"
    );
  };

  const renderLeftActions = (
    <div className="flex items-center gap-2">
      <button
        className="inso-paperclip-btn bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 border border-transparent dark:border-white/5 h-[28px] w-[28px] flex items-center justify-center rounded-md transition-all shrink-0 cursor-pointer"
        type="button"
        onClick={() => {
          const fileInput = document.querySelector(
            'input[type="file"]',
          ) as HTMLInputElement;

          if (fileInput) fileInput.click();
        }}
      >
        <Paperclip className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
      </button>

      {/* Model Picker Dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          ref={buttonRef}
          className={cn(
            "flex items-center gap-1.5 px-2.5 h-[28px] rounded-md text-[12px] font-normal transition-all cursor-pointer",
            "bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border border-transparent dark:border-white/5",
            "hover:bg-gray-200 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white",
          )}
          type="button"
          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
        >
          {getSelectedModelLabel()}
          <ChevronDown
            className={cn(
              "w-3 h-3 transition-transform duration-200",
              isModelDropdownOpen && "rotate-180",
            )}
          />
        </button>

        {isModelDropdownOpen && dropdownPosition && (
          <div
            className="fixed w-[240px] bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              zIndex: 99999,
            }}
          >
            <div className="p-1.5 max-h-[220px] overflow-y-auto scrollbar-thin">
              {CODE_MODELS.map((model) => (
                <button
                  key={model.id}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-left transition-all cursor-pointer text-[12px] font-medium flex flex-col gap-0.5",
                    selectedModel === model.id
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5",
                  )}
                  type="button"
                  onClick={() => {
                    setSelectedModel(model.id);
                    setIsModelDropdownOpen(false);
                  }}
                >
                  <span>{model.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Fetch current agent details on load or query param change
  useEffect(() => {
    if (!agentId) {
      setCurrentAgent(null);
      setSuggestions([]);

      return;
    }

    const fetchAgentDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/agents/custom`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.data?.success) {
          const list = res.data.data || [];
          const found = list.find((a: any) => a.id === agentId);

          if (found) {
            setCurrentAgent(found);
            // Setup suggestions based on ID
            if (found.id === "google-adk-agent") {
              setSuggestions([
                "Configure modular agent pipeline",
                "Optimize custom system instructions",
                "Debug compilation & build warnings",
              ]);
            } else if (found.id === "google-a2a-agent") {
              setSuggestions([
                "Setup multi-agent communication",
                "Structure secure state handoffs",
                "Verify A2A handshake signature",
              ]);
            } else {
              setSuggestions([
                "Explain your capabilities",
                "Help me write instructions",
                "How do I customize you?",
              ]);
            }
          }
        }
      } catch {
        // Fallback silently
      }
    };

    fetchAgentDetails();
  }, [agentId, token]);

  // Reset mock messages when switching agents
  useEffect(() => {
    if (agentId) {
      setMockMessages([]);
    }
  }, [agentId, agentName]);

  const handleSend = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("create-agent", { detail: prompt }));
    setInputValue("");
  };

  const handleChatSend = async (
    e?: React.FormEvent,
    promptOverride?: string,
  ) => {
    if (e) e.preventDefault();
    const text = promptOverride || chatMessage;

    if (!text.trim()) return;

    // Add user message
    setMockMessages((prev) => [...prev, { role: "user", content: text }]);
    if (!promptOverride) setChatMessage("");

    // Indicate processing
    setMockMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        action: "Consulting agent...",
        actionStatus: "pending",
      },
    ]);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/agents/custom/chat`,
        {
          agentId: agentId,
          prompt: text,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      setMockMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          actionStatus: "done",
        };

        return [
          ...updated,
          {
            role: "assistant",
            content:
              res.data?.data ||
              res.data?.response ||
              res.data?.message ||
              "Agent responded.",
          },
        ];
      });
    } catch (err: any) {
      setMockMessages((prev) => {
        const updated = [...prev];

        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          actionStatus: "done",
        };

        return [
          ...updated,
          {
            role: "assistant",
            content: `Error communicating with agent: ${err.message}`,
          },
        ];
      });
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-default-100 dark:bg-default-50 flex flex-col h-[calc(100vh-80px)] font-sans w-full relative">
        {!agentId ? (
          // Creation Mode
          <div className="relative flex flex-1 w-full flex-col items-center justify-start pt-[35vh] overflow-hidden animate-in fade-in duration-300">
            <div className="flex w-full flex-col items-center gap-6 z-20 px-6 md:px-12 lg:px-16">
              <div className="flex flex-col items-center text-center z-30 mb-6">
                <h1
                  className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80 animate-in fade-in duration-300"
                  style={{ fontFamily: "var(--font-secondary)" }}
                >
                  Build Your Agent
                </h1>
              </div>

              <div className="flex w-full flex-col gap-4 max-w-2xl lg:max-w-3xl">
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  leftActionsOverride={renderLeftActions}
                  placeholder="Enter prompt here..."
                  prompt={inputValue}
                  setPrompt={setInputValue}
                  showModelDropdown={true}
                  onSend={handleSend}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full relative">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {mockMessages.length === 0 ? (
                <div className="relative flex flex-1 w-full flex-col items-center justify-start pt-[25vh] overflow-hidden animate-in fade-in duration-300">
                  <div className="flex w-full flex-col items-center gap-6 z-20 px-6 md:px-12 lg:px-16 text-center">
                    <div className="flex flex-col items-center z-30">
                      <h1
                        className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
                        style={{ fontFamily: "var(--font-secondary)" }}
                      >
                        {agentName}
                      </h1>
                      {currentAgent?.description && (
                        <p className="text-sm text-default-400 mt-3 max-w-lg leading-relaxed animate-in fade-in duration-500">
                          {currentAgent.description}
                        </p>
                      )}
                    </div>

                    {/* Suggestions chips */}
                    {suggestions.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-2 mt-2 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            className="px-3.5 py-2 text-xs rounded-full border border-default-200 dark:border-default-100 bg-white dark:bg-[#161b22] text-default-600 dark:text-default-300 hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-95 duration-200"
                            onClick={() => handleChatSend(undefined, s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex w-full flex-col gap-4 mt-6 max-w-2xl lg:max-w-3xl">
                      <PromptInputFullLineWithBottomActions
                        hideAgents={true}
                        leftActionsOverride={renderLeftActions}
                        placeholder={`Message ${agentName}...`}
                        prompt={inputValue}
                        setPrompt={setInputValue}
                        showModelDropdown={true}
                        onSend={(prompt) => {
                          handleChatSend(undefined, prompt);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Agent Chat Mode
                <div className="flex flex-col h-full w-full max-w-4xl mx-auto animate-in fade-in duration-300">
                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
                    {mockMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex w-full ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <div className="bg-black dark:bg-white text-white dark:text-black px-5 py-3.5 rounded-2xl max-w-[75%] text-[15px] shadow-sm">
                            {msg.content}
                          </div>
                        ) : (
                          <div className="flex flex-col max-w-[85%] gap-2">
                            {msg.action && (
                              <ActionBlock
                                action={msg.action}
                                status={msg.actionStatus as any}
                              />
                            )}
                            {msg.content && (
                              <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 px-5 py-3.5 rounded-2xl text-[15px] shadow-sm whitespace-pre-wrap">
                                {msg.content}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="p-6 bg-transparent w-full">
                    <PromptInputFullLineWithBottomActions
                      hideAgents={true}
                      leftActionsOverride={renderLeftActions}
                      placeholder={`Message ${agentName}...`}
                      prompt={chatMessage}
                      setPrompt={setChatMessage}
                      showModelDropdown={true}
                      onSend={(prompt) => {
                        handleChatSend(undefined, prompt);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}

export default function AgentArcadePage() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full bg-default-50 dark:bg-background" />
      }
    >
      <AgentPageContent />
    </Suspense>
  );
}
