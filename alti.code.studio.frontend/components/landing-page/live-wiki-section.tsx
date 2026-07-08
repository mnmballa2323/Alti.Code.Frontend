"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileCode, BookOpen, GitBranch, RefreshCw, Check } from "lucide-react";

interface Commit {
  id: string;
  file: string;
  linesAdded: number;
  linesRemoved: number;
  author: string;
  timestamp: string;
}

interface DocSection {
  title: string;
  content: string;
  status: "stale" | "updating" | "synced";
}

const mockCommits: Commit[] = [
  {
    id: "c4f9a12",
    file: "src/services/auth.service.ts",
    linesAdded: 32,
    linesRemoved: 4,
    author: "sarah.dev",
    timestamp: "Just now",
  },
  {
    id: "f2b8e34",
    file: "src/app/routes/billing.route.ts",
    linesAdded: 18,
    linesRemoved: 0,
    author: "michael.dev",
    timestamp: "2m ago",
  },
  {
    id: "a8d3c56",
    file: "src/models/user.model.ts",
    linesAdded: 8,
    linesRemoved: 2,
    author: "david.dev",
    timestamp: "5m ago",
  },
];

export default function LiveWikiSection() {
  const [commits, setCommits] = useState<Commit[]>(mockCommits);
  const [activeCommitIdx, setActiveCommitIdx] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [wikiDocs, setWikiDocs] = useState<Record<string, DocSection>>({
    "API_WIKI.md": {
      title: "Authentication API Documentation",
      content:
        "# Authentication API\n\nSecure zero-trust endpoint schema and validation flows for user validation.\n\n## Endpoints\n\n### POST /api/v1/auth/login\nAuthenticates user credentials and signs JWT tokens.",
      status: "synced",
    },
    "BILLING.md": {
      title: "Billing Route Integration Details",
      content:
        "# Billing Services\n\nSovereign billing orchestrator using Stripe connections.\n\n## Routes\n\n*(Stale documentation - waiting for synchronization)*",
      status: "stale",
    },
  });

  const [activeDocKey, setActiveDocKey] = useState("API_WIKI.md");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync simulation loop
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIsProcessing(true);
      setProgress(0);

      // Animate progress bar
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 5;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(progressInterval);
          setIsProcessing(false);

          // Update documentation contents based on commit index
          setWikiDocs((prev) => {
            const nextDocs = { ...prev };

            if (activeCommitIdx === 0) {
              nextDocs["API_WIKI.md"] = {
                title: "Authentication API Documentation",
                content:
                  "# Authentication API\n\nSecure zero-trust endpoint schema and validation flows for user validation.\n\n## Endpoints\n\n### POST /api/v1/auth/login\nAuthenticates user credentials and signs JWT tokens.\n\n### POST /api/v1/auth/mfa-verify\n[NEW] Verifies multi-factor token credentials using sovereign secure vault keyring.",
                status: "synced",
              };
            } else if (activeCommitIdx === 1) {
              nextDocs["BILLING.md"] = {
                title: "Billing Route Integration Details",
                content:
                  "# Billing Services\n\nSovereign billing orchestrator using Stripe connections.\n\n## Routes\n\n### POST /api/v1/payment/webhook\nProcesses incoming payment events from Stripe.\n\n### GET /api/v1/billing/subscriptions\nRetrieves subscription tier details for organization.",
                status: "synced",
              };
            }

            return nextDocs;
          });

          // Move to next commit in loop
          setActiveCommitIdx((prev) => (prev + 1) % mockCommits.length);
        }
      }, 100);
    }, 6000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeCommitIdx]);

  // Set active doc when commit index changes to show relevant update
  useEffect(() => {
    if (activeCommitIdx === 0) {
      setActiveDocKey("API_WIKI.md");
      setWikiDocs((prev) => ({
        ...prev,
        "API_WIKI.md": { ...prev["API_WIKI.md"], status: "updating" },
      }));
    } else if (activeCommitIdx === 1) {
      setActiveDocKey("BILLING.md");
      setWikiDocs((prev) => ({
        ...prev,
        "BILLING.md": { ...prev["BILLING.md"], status: "updating" },
      }));
    }
  }, [activeCommitIdx]);

  return (
    <section className="w-full py-24 md:py-32 bg-[#030014] text-white px-4 sm:px-6 lg:px-8 border-t border-white/5 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto flex flex-col gap-16 relative z-10 w-full">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center gap-4 max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight">
            Zero-Maintenance Wiki
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-medium max-w-3xl">
            Documentation that evolves as fast as your code. OpenWiki analyzes
            git commits in real time, automatically compiling and committing
            markdown docs.
          </p>
        </div>

        {/* Interactive Sync Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full max-w-5xl mx-auto">
          {/* Left Panel: Git Commits */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-5 p-5 xl:p-6 rounded-[24px] bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-sm tracking-tight text-white">
                  Active Commits
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 tracking-wider">
                main
              </span>
            </div>

            <div className="flex flex-col gap-3 flex-1">
              {commits.map((commit, idx) => {
                const isActive = idx === activeCommitIdx;

                return (
                  <div
                    key={commit.id}
                    className={`p-3 rounded-xl border transition-all duration-500 ${
                      isActive
                        ? "bg-blue-950/20 border-blue-500/50 shadow-lg shadow-blue-500/5"
                        : "bg-white/[0.01] border-white/5 opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-blue-400" />
                        <span className="font-mono text-xs text-zinc-300 font-semibold">
                          {commit.file}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {commit.id}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3">
                      Modified structure matching custom schema changes.
                    </p>
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-emerald-400">
                          +{commit.linesAdded}
                        </span>
                        <span className="text-rose-500">
                          -{commit.linesRemoved}
                        </span>
                      </div>
                      <span className="text-zinc-500 font-medium">
                        {commit.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Connector: OpenWiki engine */}
          <div className="col-span-12 lg:col-span-2 flex lg:flex-col items-center justify-center gap-4 lg:py-12">
            <div className="w-full lg:w-0.5 h-0.5 lg:h-24 bg-gradient-to-r lg:bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500/0" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-xl group hover:border-blue-500/50 transition-all duration-300">
              <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-md group-hover:bg-blue-500/20 transition-all duration-300" />
              <RefreshCw
                className={`w-8 h-8 text-blue-400 relative z-10 ${isProcessing ? "animate-spin" : ""}`}
              />
            </div>

            {/* Sync Progress Bar */}
            <div className="flex-1 lg:flex-none w-full max-w-[140px] flex flex-col gap-1.5 text-center mt-2">
              <div className="h-1 bg-white/5 rounded-full overflow-hidden w-full">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-100 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                {isProcessing ? "Parsing AST..." : "Synced"}
              </span>
            </div>
            <div className="w-full lg:w-0.5 h-0.5 lg:h-24 bg-gradient-to-r lg:bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500/0" />
          </div>

          {/* Right Panel: Wiki Output */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-5 p-5 xl:p-6 rounded-[24px] bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-sm tracking-tight text-white">
                  Project Wiki
                </span>
              </div>
              <div className="flex items-center gap-2">
                {Object.keys(wikiDocs).map((docKey) => (
                  <button
                    key={docKey}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all duration-300 ${
                      activeDocKey === docKey
                        ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                        : "bg-white/5 border border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                    onClick={() => setActiveDocKey(docKey)}
                  >
                    {docKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Mock Markdown Document Viewer */}
            <div className="flex-1 bg-[#050015] border border-blue-900/30 rounded-xl p-3.5 font-mono text-xs text-zinc-400 flex flex-col gap-4 shadow-inner min-h-[160px] max-h-[260px] overflow-y-auto select-none relative">
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
                {wikiDocs[activeDocKey].status === "synced" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                      Synced
                    </span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                    <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                      Syncing...
                    </span>
                  </>
                )}
              </div>

              <div className="flex-1 whitespace-pre-wrap leading-relaxed text-zinc-300">
                {wikiDocs[activeDocKey].content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
