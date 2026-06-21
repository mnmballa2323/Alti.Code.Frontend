"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, cn } from "@heroui/react";
import {
  Blocks,
  Copy,
  Check,
  Terminal,
  Code2,
  ShieldCheck,
  Download,
} from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import { AppDispatch } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";
import { AgentCommandCenter } from "@/components/AgentCommandCenter";

type LanguageTab = "node" | "python" | "go";

export default function SdkPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<LanguageTab>("node");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));
  }, [dispatch]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sdkContent = {
    node: {
      install: "npm install @alti/sdk-core",
      code: `import { AltiClient } from "@alti/sdk-core";

// Initialize the enterprise client
const alti = new AltiClient({
  apiKey: process.env.ALTI_API_KEY, // Set from API Keys panel
  workspace: "alti.code.studio"
});

// Run a swarm-orchestrated code review task
const response = await alti.agents.execute({
  agent: "code-reviewer",
  input: {
    repoPath: "./src",
    depth: "detailed"
  }
});

console.log("Analysis results:", response.summary);`,
    },
    python: {
      install: "pip install alti-sdk",
      code: `from alti import AltiClient
import os

# Initialize the enterprise client
client = AltiClient(
    api_key=os.environ.get("ALTI_API_KEY"), # Set from API Keys panel
    workspace="alti.code.studio"
)

# Query the vectorized knowledge bases
results = client.knowledge.search(
    query="MIT and Apache-2.0 licenses compliance rules",
    limit=5
)

for doc in results:
    print(f"[{doc.score}] {doc.title}: {doc.snippet}")`,
    },
    go: {
      install: "go get github.com/alti/sdk-go",
      code: `package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/alti/sdk-go/alti"
)

func main() {
	// Initialize the client
	client, err := alti.NewClient(
		alti.WithAPIKey(os.Getenv("ALTI_API_KEY")),
		alti.WithWorkspace("alti.code.studio"),
	)
	if err != nil {
		log.Fatalf("Failed to initialize client: %v", err)
	}

	// Trigger a compliance audit on active repository
	ctx := context.Background()
	report, err := client.Compliance.Audit(ctx, "repo-id-123")
	if err != nil {
		log.Fatalf("Audit failed: %v", err)
	}

	fmt.Printf("Audit Status: %s. Issues Found: %d\\n", report.Status, len(report.Issues))
}`,
    },
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-y-auto bg-transparent flex flex-col h-full font-sans text-foreground">
        <div className="relative flex flex-col w-full items-center justify-start py-12 px-6 md:px-12">
          {/* Abstract overlay */}
          <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none blur-sm mix-blend-screen">
            <AgentCommandCenter />
          </div>

          <div className="flex w-full max-w-4xl flex-col gap-8 z-10">
            {/* Header section */}
            <div className="flex flex-col gap-2 border-b border-default-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Blocks className="size-6" />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  SDK Packages
                </h1>
              </div>
              <p className="text-sm text-default-500 max-w-2xl mt-1">
                Install and configure the native client SDKs to query corporate
                knowledge, programmatically manage guardrail rules, and invoke
                specialized agent swarms directly from your source code.
              </p>
            </div>

            {/* Main Tabs Selection */}
            <div className="flex border-b border-default-200 gap-6">
              {(["node", "python", "go"] as LanguageTab[]).map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    "pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all capitalize focus:outline-none",
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-default-400 hover:text-default-700",
                  )}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "node" ? "Node.js" : tab}
                </button>
              ))}
            </div>

            {/* Tab Panel Content */}
            <div className="flex flex-col gap-6">
              {/* Installation Command Block */}
              <div className="bg-[#FCFCFD] dark:bg-default-50/50 border border-default-200/60 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-default-500 uppercase tracking-wider">
                  <Terminal className="size-4 text-default-400" />
                  Installation
                </div>
                <div className="flex items-center gap-2 bg-default-100 dark:bg-default-50 border border-default-200 rounded-xl p-3 font-mono text-sm overflow-x-auto">
                  <span className="flex-1 text-foreground select-all">
                    $ {sdkContent[activeTab].install}
                  </span>
                  <Button
                    isIconOnly
                    className="shrink-0"
                    size="sm"
                    variant="flat"
                    onPress={() =>
                      handleCopy(sdkContent[activeTab].install, "install")
                    }
                  >
                    {copiedText === "install" ? (
                      <Check className="size-3.5 text-success" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Code Snippet Block */}
              <div className="bg-white dark:bg-default-50 border border-default-200/60 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="px-6 py-4 border-b border-default-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-default-500 uppercase tracking-wider">
                    <Code2 className="size-4 text-default-400" />
                    Boilerplate Initialization
                  </div>
                  <Button
                    className="font-medium text-xs border border-default-200 hover:bg-default-100 rounded-lg h-8 px-3"
                    size="sm"
                    startContent={
                      copiedText === "code" ? (
                        <Check className="size-3.5 text-success" />
                      ) : (
                        <Copy className="size-3.5" />
                      )
                    }
                    variant="light"
                    onPress={() =>
                      handleCopy(sdkContent[activeTab].code, "code")
                    }
                  >
                    {copiedText === "code" ? "Copied" : "Copy Snippet"}
                  </Button>
                </div>
                <pre className="p-6 font-mono text-xs overflow-x-auto text-default-800 dark:text-default-200 bg-default-50/20 leading-relaxed">
                  <code>{sdkContent[activeTab].code}</code>
                </pre>
              </div>
            </div>

            {/* Additional documentation cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="border border-default-200/60 rounded-2xl p-6 bg-white dark:bg-default-50 flex flex-col gap-3 shadow-sm">
                <div className="p-2 bg-success/10 text-success rounded-lg w-fit">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Secure Credentials
                </h3>
                <p className="text-xs text-default-500 leading-relaxed">
                  Never commit raw API keys to version control. Initialize the
                  client using environment variables (`ALTI_API_KEY`) or access
                  them at runtime from a secure secrets manager.
                </p>
              </div>

              <div className="border border-default-200/60 rounded-2xl p-6 bg-white dark:bg-default-50 flex flex-col gap-3 shadow-sm">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg w-fit">
                  <Download className="size-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Advanced SDK Features
                </h3>
                <p className="text-xs text-default-500 leading-relaxed">
                  Explore full features such as custom tool definition,
                  asynchronous webhook callbacks, streaming agent token
                  responses, and custom model routing mappings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
