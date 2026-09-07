"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileCode, BookOpen, GitBranch } from "lucide-react";

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
    <>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
      <section className="w-full py-24 md:py-32 bg-white text-black px-4 sm:px-6 lg:px-8  relative overflow-hidden">
        {/* Background glowing gradients */}

        <div className="max-w-7xl mx-auto flex flex-col gap-12 relative z-10 w-full">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center gap-4 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black leading-tight">
              Zero-Maintenance Wiki
            </h2>
            <p className="text-lg text-zinc-600 leading-relaxed font-medium max-w-3xl mx-auto">
              Documentation that evolves as fast as your code. OpenWiki analyzes
              git commits
              <br className="hidden md:block" />
              in real time, automatically compiling and committing updated
              markdown docs.
            </p>
          </div>

          {/* Unified Editor Window */}
          <div className="w-full max-w-5xl mx-auto mt-4 rounded-2xl overflow-hidden border border-zinc-200/20 shadow-2xl bg-[#0D0D12] flex flex-col relative group">
            {/* macOS Window Header */}
            <div className="h-12 bg-[#1A1A24] border-b border-zinc-800 flex items-center px-4 justify-between relative">
              <div className="flex items-center gap-2 z-10">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 bg-[#252532] px-3 py-1 rounded-md border border-zinc-700/50">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-medium text-zinc-300 font-mono tracking-wide">
                    openwiki-sync-daemon
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 z-10">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
            </div>

            {/* Split Pane Editor */}
            <div className="flex flex-col md:flex-row h-[380px] w-full">
              {/* Left: Git Diff */}
              <div className="flex-1 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col relative">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#14141C] border-b border-zinc-800/80">
                  <GitBranch className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs font-mono text-zinc-400">
                    auth.service.ts (Diff)
                  </span>
                </div>
                <div className="p-4 font-mono text-[13px] leading-loose overflow-hidden">
                  <div className="text-zinc-500 select-none">
                    @@ -12,4 +12,8 @@
                  </div>
                  <div className="text-zinc-400">
                    &nbsp; export class AuthService &#123;
                  </div>
                  <div className="text-rose-400/80 bg-rose-500/10 px-2 -mx-2 flex">
                    <span className="w-4 select-none">-</span>
                    <span>&nbsp;&nbsp;private key: string;</span>
                  </div>
                  <div className="text-emerald-400/90 bg-emerald-500/10 px-2 -mx-2 flex">
                    <span className="w-4 select-none">+</span>
                    <span>&nbsp;&nbsp;private readonly vault: HSMClient;</span>
                  </div>
                  <div className="text-emerald-400/90 bg-emerald-500/10 px-2 -mx-2 flex">
                    <span className="w-4 select-none">+</span>
                    <span />
                  </div>
                  <div className="text-emerald-400/90 bg-emerald-500/10 px-2 -mx-2 flex">
                    <span className="w-4 select-none">+</span>
                    <span>&nbsp;&nbsp;async verify(token: string) &#123;</span>
                  </div>
                  <div className="text-emerald-400/90 bg-emerald-500/10 px-2 -mx-2 flex">
                    <span className="w-4 select-none">+</span>
                    <span>
                      &nbsp;&nbsp;&nbsp;&nbsp;return
                      this.vault.verifyStrict(token);
                    </span>
                  </div>
                  <div className="text-emerald-400/90 bg-emerald-500/10 px-2 -mx-2 flex">
                    <span className="w-4 select-none">+</span>
                    <span>&nbsp;&nbsp;&#125;</span>
                  </div>
                  <div className="text-zinc-400">&nbsp; &#125;</div>
                </div>
              </div>

              {/* Right: Markdown Render */}
              <div className="flex-1 flex flex-col bg-[#0D0D12] relative overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#14141C] border-b border-zinc-800/80">
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-mono text-blue-400">
                    API_WIKI.md (Generated)
                  </span>
                </div>
                <div className="p-5 font-sans text-[14px] leading-relaxed text-zinc-300">
                  <h1 className="text-2xl font-bold text-white mb-4 border-b border-zinc-800 pb-2">
                    Authentication API
                  </h1>
                  <p className="mb-4 text-zinc-400">
                    The{" "}
                    <code className="bg-zinc-800/50 px-1.5 py-0.5 rounded text-blue-300">
                      AuthService
                    </code>{" "}
                    has been updated to enforce zero-trust cryptographic
                    verification.
                  </p>

                  <h2 className="text-lg font-bold text-zinc-100 mt-6 mb-2">
                    Token Verification
                  </h2>
                  <p className="mb-4 text-zinc-400">
                    Tokens are no longer verified via local string matching. All
                    requests are routed through the{" "}
                    <code className="bg-zinc-800/50 px-1.5 py-0.5 rounded text-blue-300">
                      HSMClient
                    </code>{" "}
                    using the{" "}
                    <code className="bg-zinc-800/50 px-1.5 py-0.5 rounded text-rose-300">
                      verifyStrict()
                    </code>{" "}
                    method.
                  </p>

                  <div className="bg-[#1A1A24] rounded-lg p-3 border border-zinc-800 mt-4">
                    <div className="text-[11px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
                      Security Note
                    </div>
                    <p className="text-zinc-300 text-sm">
                      This satisfies the mandatory Sovereign Execution
                      compliance check.
                    </p>
                  </div>
                </div>

                {/* Scanning Overlay Animation */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/10 to-blue-500/0 w-full h-[150%] -translate-y-full animate-[scan_3s_ease-in-out_infinite] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
