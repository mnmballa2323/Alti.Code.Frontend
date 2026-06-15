"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useDispatch } from "react-redux";
import { CheckCircle2, ArrowUp, Paperclip } from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import AgentCreationWizard from "@/components/agents/agent-creation-wizard";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import AgentRightSidebar from "@/components/agent-right-sidebar";
import AudioRecorder from "@/components/AudioRecorder";
import { AppDispatch } from "@/store";

// Mock Action Block component for UI demonstration
const ActionBlock = ({
  action,
  status,
}: {
  action: string;
  status: "pending" | "done";
}) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-xl border ${status === "pending" ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 animate-pulse" : "bg-gray-50 dark:bg-[#161b22] border-gray-100 dark:border-gray-800"}`}
  >
    {status === "pending" ? (
      <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
    ) : (
      <CheckCircle2 className="text-green-500 shrink-0" size={16} />
    )}
    <span
      className={`text-[13px] ${status === "pending" ? "text-blue-700 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}
    >
      {action}
    </span>
  </div>
);

function AgentPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agentId");
  const agentName = searchParams.get("name") || "Custom Agent";

  const [inputValue, setInputValue] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [mockMessages, setMockMessages] = useState<
    {
      role: string;
      content: string;
      action?: string;
      actionStatus?: "pending" | "done";
    }[]
  >([]);

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

  const handleChatSend = (e?: React.FormEvent, promptOverride?: string) => {
    if (e) e.preventDefault();
    const text = promptOverride || chatMessage;

    if (!text.trim()) return;

    // Add user message
    setMockMessages((prev) => [...prev, { role: "user", content: text }]);
    if (!promptOverride) setChatMessage("");

    // Simulate Agent Background Work
    setTimeout(() => {
      setMockMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          action: "Analyzing request...",
          actionStatus: "pending",
        },
      ]);

      setTimeout(() => {
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
              content: "",
              action: "Searching codebase...",
              actionStatus: "pending",
            },
          ];
        });

        setTimeout(() => {
          setMockMessages((prev) => {
            const updated = [...prev];

            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              actionStatus: "done",
            };

            // Remove action blocks since the final output is delivered
            const filtered = updated.filter((msg) => !msg.action);

            return [
              ...filtered,
              {
                role: "assistant",
                content:
                  "I found the relevant files and have prepared a plan for you.",
              },
            ];
          });
        }, 1500);
      }, 1500);
    }, 500);
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-transparent flex flex-col h-[calc(100vh-80px)] font-sans w-full relative">
        {!agentId ? (
          // Creation Mode
          <div className="relative flex flex-1 w-full h-full">
            <AgentCreationWizard
              onComplete={(data) => {
                console.log("Agent Created:", data);
                window.dispatchEvent(
                  new CustomEvent("create-agent", { detail: data }),
                );
              }}
            />
          </div>
        ) : (
          <div className="flex h-full w-full relative">
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {mockMessages.length === 0 ? (
                <div className="relative flex flex-1 w-full flex-col items-center justify-start pt-[35vh] overflow-hidden animate-in fade-in duration-300">
                  <div className="flex w-full flex-col items-center gap-6 z-20 px-6">
                    <div className="flex flex-col items-center text-center z-30 mb-6">
                      <h1
                        className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
                        style={{ fontFamily: "var(--font-secondary)" }}
                      >
                        {agentName}
                      </h1>
                    </div>

                    <div className="flex w-full flex-col gap-4 max-w-2xl">
                      <PromptInputFullLineWithBottomActions
                        hideAgents={true}
                        hideDropdown={true}
                        placeholder={`Message ${agentName}...`}
                        prompt={inputValue}
                        setPrompt={setInputValue}
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
                        className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
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
                  <div className="p-6 bg-transparent">
                    <form className="relative group" onSubmit={handleChatSend}>
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                      <div className="relative flex items-center bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all p-2 gap-1">
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
                          type="button"
                        >
                          <Paperclip size={20} />
                        </button>
                        <input
                          className="flex-1 bg-transparent border-none outline-none px-2 py-3 text-[15px] text-gray-900 dark:text-white placeholder:text-gray-400"
                          placeholder="Message your agent..."
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                        />
                         <ArrowUp
                          className="w-10 h-10 p-2 cursor-pointer rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center transition-opacity shrink-0 hover:opacity-80"
                          style={{ opacity: 1 }}
                          onClick={chatMessage ? (e: any) => handleChatSend(e) : undefined}
                        />
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
            <AgentRightSidebar />
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
