"use client";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bot, Sparkles, Send, CheckCircle2, Search, FileCode2 } from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import { AppDispatch, RootState } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";

// Mock Action Block component for UI demonstration
const ActionBlock = ({ action, status }: { action: string, status: "pending" | "done" }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl border ${status === 'pending' ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800 animate-pulse' : 'bg-gray-50 dark:bg-[#161b22] border-gray-100 dark:border-gray-800'}`}>
    {status === 'pending' ? (
      <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
    ) : (
      <CheckCircle2 size={16} className="text-green-500 shrink-0" />
    )}
    <span className={`text-[13px] ${status === 'pending' ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
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
  const [mockMessages, setMockMessages] = useState<{role: string, content: string, action?: string, actionStatus?: "pending"|"done"}[]>([]);

  // Reset mock messages when switching agents
  useEffect(() => {
    if (agentId) {
      setMockMessages([{ role: "assistant", content: `Hello! I am ${agentName}. How can I help you today?` }]);
    }
  }, [agentId, agentName]);

  const handleSend = (prompt: string) => {
    window.dispatchEvent(
      new CustomEvent("create-agent", { detail: prompt })
    );
    setInputValue("");
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    // Add user message
    setMockMessages(prev => [...prev, { role: "user", content: chatMessage }]);
    setChatMessage("");

    // Simulate Agent Background Work
    setTimeout(() => {
      setMockMessages(prev => [...prev, { role: "assistant", content: "", action: "Analyzing request...", actionStatus: "pending" }]);
      
      setTimeout(() => {
        setMockMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], actionStatus: "done" };
          return [...updated, { role: "assistant", content: "", action: "Searching codebase...", actionStatus: "pending" }];
        });
        
        setTimeout(() => {
           setMockMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], actionStatus: "done" };
            return [...updated, { role: "assistant", content: "I found the relevant files and have prepared a plan for you." }];
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
          <div className="relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden">
            <div className="flex w-full flex-col items-center gap-6 z-20 px-6 mt-[-5vh]">
              <div className="flex flex-col items-center text-center z-30 mb-6">
                <h1
                  className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80 animate-in fade-in duration-300"
                  style={{ fontFamily: "var(--font-secondary)" }}
                >
                  New Agent
                </h1>
              </div>

              <div className="flex w-full flex-col gap-4 max-w-2xl">
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  hideDropdown={true}
                  placeholder="Describe your agent..."
                  prompt={inputValue}
                  setPrompt={setInputValue}
                  onSend={handleSend}
                />
              </div>
            </div>
          </div>
        ) : (
          // Agent Chat Mode
          <div className="flex flex-col h-full w-full max-w-4xl mx-auto animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 py-6 px-8 border-b border-gray-100 dark:border-gray-800/60 bg-white/50 dark:bg-black/20 backdrop-blur-md sticky top-0 z-10">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Bot size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">{agentName}</h2>
                <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                  <Sparkles size={12} /> Prompt-Based Agent
                </span>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
              {mockMessages.map((msg, i) => (
                <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'user' ? (
                    <div className="bg-black dark:bg-white text-white dark:text-black px-5 py-3.5 rounded-2xl max-w-[75%] text-[15px] shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex flex-col max-w-[85%] gap-2">
                      {msg.action && (
                        <ActionBlock action={msg.action} status={msg.actionStatus as any} />
                      )}
                      {msg.content && (
                        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 px-5 py-3.5 rounded-2xl text-[15px] shadow-sm whitespace-pre-wrap">
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
              <form onSubmit={handleChatSend} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all p-2">
                  <input
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-[15px] text-gray-900 dark:text-white placeholder:text-gray-400"
                    placeholder="Message your agent..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={!chatMessage.trim()}
                    className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send size={18} className="ml-1" />
                  </button>
                </div>
              </form>
              <div className="text-center mt-3">
                <span className="text-[11px] text-gray-400 dark:text-gray-500">Agent execution is transparent. Watch action blocks for background tasks.</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </ChatBotLayout>
  );
}

export default function AgentArcadePage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-default-50 dark:bg-background" />}>
      <AgentPageContent />
    </Suspense>
  );
}
