"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import ChatBotLayout from "@/components/ChatbotLayout";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";

export default function TestingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSprint, setActiveSprint] = useState<any>(null);

  const handleStartSprint = async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch("http://localhost:3000/api/v1/qa/sprint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setActiveSprint({
          id: data.data.sprintId || "SPRINT-TEST",
          title: prompt,
          status: "active",
          date: "Just now",
          content:
            "The Autonomous Self-Healing Sprint has launched. The swarm is pulling down AST trees, running tests, and autonomously patching code.",
        });
      } else {
        throw new Error(data.message || "Failed to launch sprint.");
      }
    } catch (error: any) {
      console.error("QA Sprint failed:", error);
      setActiveSprint({
        id: "SPRINT-ERROR",
        title: "Sprint Failed",
        status: "error",
        date: "Just now",
        content: `Failed to launch autonomous sprint:\n${error.message}`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-white dark:bg-background flex flex-col h-full font-sans w-full">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900">
                Continuous Testing & Self-Healing
              </h1>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {activeSprint ? (
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              <div className="py-2 animate-in fade-in duration-300">
                <div className="p-8 border border-default-200 rounded-xl shadow-sm bg-white dark:bg-content1">
                  <div className="mb-8 flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold mb-3">
                        {activeSprint.title}
                      </h2>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 text-xs font-bold bg-primary/10 text-primary rounded-md">
                          {activeSprint.id}
                        </span>
                        <span className="px-2 py-1 text-xs font-bold bg-success/10 text-success rounded-md uppercase tracking-wider">
                          {activeSprint.status}
                        </span>
                      </div>
                    </div>
                    {activeSprint.status === "active" && (
                      <div className="flex items-center gap-2 text-sm text-primary font-bold animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        Swarm is Active
                      </div>
                    )}
                  </div>

                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-lg text-default-600 mb-6">
                      {activeSprint.content}
                    </p>
                    {activeSprint.status === "active" && (
                      <div className="bg-default-50 p-6 rounded-lg font-mono text-xs text-default-600 shadow-inner">
                        &gt; INITIALIZING SURFER AGENT...
                        <br />
                        &gt; PULLING VITEST SNAPSHOTS...
                        <br />
                        &gt; EXECUTING QA LOOP...
                        <br />
                        &gt; WAITING FOR RESULTS...
                        <br />
                      </div>
                    )}
                  </div>

                  <div className="mt-12 flex gap-4 pt-6 border-t border-default-200">
                    <button
                      className="h-10 px-4 bg-default-100 hover:bg-default-200 rounded-lg text-sm font-medium transition-colors"
                      onClick={() => setActiveSprint(null)}
                    >
                      New Sprint
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden">
            <div className="flex w-full flex-col items-center gap-6 z-20 px-6 mt-[-5vh]">
              <div className="flex flex-col items-center text-center z-30 mb-6">
                <h1
                  className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
                  style={{ fontFamily: "var(--font-secondary)" }}
                >
                  Autonomous QA Loop
                </h1>
                <p className="text-default-500 mt-2 max-w-lg">
                  Launch the swarm to recursively execute tests, look up stack
                  traces on Google, and autonomously patch code until all tests
                  pass.
                </p>
              </div>

              <div className="flex w-full flex-col gap-4 max-w-2xl">
                <PromptInputFullLineWithBottomActions
                  hideAgents={true}
                  hideDropdown={true}
                  placeholder="E.g., Run frontend unit tests and fix any failing React hydration errors..."
                  onSend={handleStartSprint}
                />
              </div>
            </div>

            <p className="absolute bottom-8 text-xs font-medium text-default-400 opacity-60 z-20">
              We don&apos;t train on your data. Your chats stay private.
            </p>
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
