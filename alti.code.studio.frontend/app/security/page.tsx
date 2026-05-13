"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@heroui/react";
import {
  ShieldAlert,
  ShieldCheck,
  Bug,
  Fingerprint,
  Lock,
  Search,
} from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";

export default function SecurityPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runScan = async () => {
    setIsScanning(true);
    setError(null);
    setScanData(null);

    try {
      const res = await fetch(
        "http://localhost:3000/api/v1/security/deepsec-scan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({ targetPath: "." }),
        },
      );

      const data = await res.json();

      if (data.success && data.results) {
        setScanData(data.results);
      } else {
        throw new Error(data.message || "Failed to run DeepSec scan.");
      }
    } catch (err: any) {
      console.error("DeepSec scan failed:", err);
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case "CRITICAL":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "HIGH":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "MEDIUM":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-white dark:bg-background flex flex-col h-full font-sans w-full">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-5 text-primary" />
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900">
                Zero-Trust Security & DLP
              </h1>
            </div>

            <Button
              className="h-8 px-4 bg-black text-white dark:bg-white dark:text-black text-xs font-bold rounded-lg"
              isLoading={isScanning}
              onClick={runScan}
            >
              <Search className="mr-1.5" size={14} /> Run DeepSec Audit
            </Button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-default-50/50">
          <div className="max-w-5xl mx-auto space-y-6">
            {!isScanning && !scanData && !error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Lock className="size-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-default-900">
                  Ready to Scan
                </h2>
                <p className="text-default-500 max-w-md">
                  Click 'Run DeepSec Audit' to launch our autonomous swarm. It
                  will traverse your AST, evaluate dependencies, and hunt for
                  PII leaks using heuristics and Vercel DeepSec models.
                </p>
              </div>
            )}

            {isScanning && (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in">
                <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                  <div className="absolute inset-2 rounded-full border-r-2 border-primary/50 animate-spin direction-reverse" />
                  <Fingerprint className="size-8 text-primary animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-default-900 mb-2">
                  Swarm is Active
                </h2>
                <p className="text-default-500 text-sm">
                  DeepSec agent is analyzing ASTs and traversing dependencies...
                </p>
              </div>
            )}

            {error && (
              <div className="p-6 bg-danger/10 border border-danger/20 rounded-xl text-center">
                <ShieldAlert className="size-8 text-danger mx-auto mb-3" />
                <h3 className="font-bold text-danger mb-1">Scan Failed</h3>
                <p className="text-sm text-danger/80">{error}</p>
              </div>
            )}

            {scanData && !isScanning && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-5 bg-white dark:bg-black border border-default-200 rounded-xl shadow-sm text-center">
                    <p className="text-xs font-bold text-default-400 uppercase tracking-widest mb-2">
                      Critical
                    </p>
                    <p className="text-4xl font-black text-red-500">
                      {scanData.summary?.critical || 0}
                    </p>
                  </div>
                  <div className="p-5 bg-white dark:bg-black border border-default-200 rounded-xl shadow-sm text-center">
                    <p className="text-xs font-bold text-default-400 uppercase tracking-widest mb-2">
                      High
                    </p>
                    <p className="text-4xl font-black text-orange-500">
                      {scanData.summary?.high || 0}
                    </p>
                  </div>
                  <div className="p-5 bg-white dark:bg-black border border-default-200 rounded-xl shadow-sm text-center">
                    <p className="text-xs font-bold text-default-400 uppercase tracking-widest mb-2">
                      Medium
                    </p>
                    <p className="text-4xl font-black text-yellow-500">
                      {scanData.summary?.medium || 0}
                    </p>
                  </div>
                  <div className="p-5 bg-white dark:bg-black border border-default-200 rounded-xl shadow-sm text-center">
                    <p className="text-xs font-bold text-default-400 uppercase tracking-widest mb-2">
                      Low
                    </p>
                    <p className="text-4xl font-black text-blue-500">
                      {scanData.summary?.low || 0}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3">
                  <Sparkles className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-primary mb-1">
                      AI Agent Summary
                    </h4>
                    <p className="text-xs text-primary/80 leading-relaxed">
                      {scanData.message}
                    </p>
                  </div>
                </div>

                {/* Findings List */}
                <div className="bg-white dark:bg-black border border-default-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-default-200 flex justify-between items-center">
                    <h3 className="font-bold text-default-900">
                      Security Findings
                    </h3>
                    <span className="text-xs font-bold bg-default-100 text-default-600 px-2 py-1 rounded-md">
                      {scanData.results?.length || 0} issues found
                    </span>
                  </div>

                  <div className="divide-y divide-default-100">
                    {scanData.results?.length === 0 ? (
                      <div className="p-12 text-center flex flex-col items-center justify-center">
                        <ShieldCheck className="size-12 text-success mb-3 opacity-80" />
                        <p className="font-bold text-success text-lg">
                          Zero Vulnerabilities Found
                        </p>
                        <p className="text-sm text-default-500 mt-1">
                          Your codebase complies with BFSI sovereign hard laws.
                        </p>
                      </div>
                    ) : (
                      scanData.results?.map((finding: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-5 hover:bg-default-50/50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getSeverityColor(finding.severity)}`}
                              >
                                {finding.severity}
                              </span>
                              <span className="font-mono text-xs font-bold text-default-600 bg-default-100 px-2 py-1 rounded">
                                {finding.id}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-default-400 flex items-center gap-1">
                              <Bug size={12} /> Confidence:{" "}
                              {(finding.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-sm text-default-600 mt-3 leading-relaxed whitespace-pre-wrap font-mono text-[12px] p-3 bg-default-50 rounded-lg border border-default-100">
                            {finding.description}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
