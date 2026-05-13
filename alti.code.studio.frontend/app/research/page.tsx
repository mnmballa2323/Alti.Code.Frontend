"use client";

import React, { useState, useEffect } from "react";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Search, Zap, Cpu } from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import PromptInputFullLineWithBottomActions from "@/components/input-actions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ResearchPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeJob, setActiveJob] = useState<any>(null);

  // Form State
  const [objective, setObjective] = useState("");
  const [depth, setDepth] = useState("deep");

  useEffect(() => {
    const handleSelectSession = (e: any) => {
      const session = e.detail;

      if (session === null) {
        // "New Mission" clicked from sidebar + button
        setActiveJob(null);
        setObjective("");
      } else {
        // Mock loading an existing mission
        setActiveJob({
          id: session.id,
          title: session.name,
          status: "completed",
          date: "Archived",
          depth: "Deep Dive",
          content: `# Research Report: ${session.name}\n\nArchived report data loaded successfully.\n\n## Executive Summary\nThe swarm previously completed a full traverse of the requested scopes.\n\n## Technical Findings\n1. Component A is functioning nominally.\n2. Service B requires a patch.`,
        });
      }
    };

    window.addEventListener("select-research-session", handleSelectSession);

    return () =>
      window.removeEventListener(
        "select-research-session",
        handleSelectSession,
      );
  }, []);

  const handleStartResearch = async () => {
    if (!objective.trim()) return;
    setIsGenerating(true);

    try {
      // Execute Real Deep Research
      const res = await fetch("http://localhost:3000/api/v1/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Authorization headers would go here in production
        },
        body: JSON.stringify({ objective, depth }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setActiveJob(data.data);
      } else {
        throw new Error(data.message || "Failed to generate report.");
      }
    } catch (error: any) {
      console.error("Deep Research failed:", error);
      setActiveJob({
        id: "RES-ERROR",
        title: "Research Failed",
        status: "error",
        date: "Just now",
        depth,
        summary: "Failed to complete research.",
        content: `# Research Failed\n\nAn error occurred while executing Deep Research:\n${error.message}\n\nPlease try again or check backend connectivity.`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex flex-col w-full h-full bg-white dark:bg-[#0A0A0A] overflow-hidden">
        {/* Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-content1 font-sans flex items-center">
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold tracking-tight">
                Deep Research
              </h1>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        {!activeJob ? (
          <div className="relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden">
            <div className="flex w-full flex-col items-center gap-6 z-20 px-6 mt-[-5vh]">
              <div className="flex flex-col items-center text-center z-30 mb-6">
                <h1
                  className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
                  style={{ fontFamily: "var(--font-secondary)" }}
                >
                  Deep Research
                </h1>
              </div>

              <div className="flex w-full flex-col gap-4 max-w-2xl w-full">
                <PromptInputFullLineWithBottomActions
                  customActions={
                    <div className="flex gap-2 ml-1">
                      {[
                        {
                          id: "quick",
                          title: "Quick",
                          desc: "1-min execution",
                          icon: <Zap size={14} />,
                        },
                        {
                          id: "deep",
                          title: "Deep",
                          desc: "5-min crawling",
                          icon: <Search size={14} />,
                        },
                        {
                          id: "exhaustive",
                          title: "Exhaustive",
                          desc: "30+ min swarm",
                          icon: <Cpu size={14} />,
                          isDanger: true,
                        },
                      ].map((option) => (
                        <Tooltip key={option.id} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 border ${
                                depth === option.id
                                  ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/20"
                                  : "border-transparent bg-default-100 text-default-500 hover:bg-default-200"
                              }`}
                              type="button"
                              onClick={() => setDepth(option.id)}
                            >
                              {option.icon}
                              {option.title}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>{option.desc}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  }
                  hideAgents={true}
                  hideDropdown={true}
                  placeholder="E.g., Perform a zero-trust architecture audit on the payment gateway..."
                  value={objective}
                  onChange={setObjective}
                  onSend={handleStartResearch}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto">
              <div className="py-2 animate-in fade-in duration-300">
                <Card className="shadow-none border border-default-200">
                  <CardBody className="p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-3">
                        {activeJob.title}
                      </h2>
                      <div className="flex gap-2">
                        <Chip color="primary" size="sm" variant="flat">
                          {activeJob.id}
                        </Chip>
                        <Chip size="sm" variant="flat">
                          {activeJob.depth}
                        </Chip>
                      </div>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary">
                      {activeJob.content
                        .split("\n")
                        .map((line: string, i: number) => {
                          if (line.startsWith("## "))
                            return (
                              <h2 key={i} className="text-lg mt-6 mb-3">
                                {line.replace("## ", "")}
                              </h2>
                            );
                          if (line.startsWith("# ")) return null;
                          if (line.startsWith("- "))
                            return (
                              <li key={i} className="ml-4">
                                {line.replace("- ", "")}
                              </li>
                            );
                          if (line.trim() === "") return <br key={i} />;

                          return (
                            <p
                              key={i}
                              className="mb-2 text-default-600 dark:text-default-300"
                            >
                              {line}
                            </p>
                          );
                        })}
                    </div>

                    <div className="mt-12 flex gap-4 pt-6 border-t border-default-200">
                      <Button
                        className="font-medium"
                        color="secondary"
                        variant="flat"
                      >
                        Download PDF
                      </Button>
                      <Button
                        className="font-medium"
                        color="primary"
                        variant="flat"
                      >
                        Copy Markdown
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
