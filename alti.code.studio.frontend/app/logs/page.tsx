"use client";

import React, { useState, useEffect } from "react";
import { Button, ScrollShadow } from "@heroui/react";
import { Activity, Download } from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";

export default function LogsPage() {
  const [sessionTitle, setSessionTitle] = useState("Audit Logs");

  useEffect(() => {
    const handleSelectSession = (e: any) => {
      if (e.detail) {
        setSessionTitle(e.detail);
      }
    };

    window.addEventListener("select-log-session", handleSelectSession);

    return () => {
      window.removeEventListener("select-log-session", handleSelectSession);
    };
  }, []);

  const handleExportLogs = () => {
    // Collect the current static logs for export (will eventually tie into Redux state)
    const logData = `[10:48:12] [SYSTEM] OS-Bridge initialized successfully. Memory access granted.
[10:48:15] [MCP] Connected to local Composio orchestrator.
[10:49:01] [SWARM] Refactoring agent constructing context window (reading 4 files).
[10:49:03] [SECURITY] Intercepted unverified external network request. DLP enforced.
[10:49:04] [SYSTEM] Awaiting human-in-the-loop validation...`;

    const blob = new Blob([logData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `alti_audit_logs_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ChatBotLayout isRightSidebarOpenByDefault={false}>
      <div className="flex-1 overflow-hidden bg-background flex flex-col h-full font-mono">
        {/* Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-content1 font-sans flex items-center">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold tracking-tight">
                {sessionTitle}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {sessionTitle !== "Audit Logs" && (
                <Button
                  className="bg-black dark:bg-white text-white dark:text-black font-medium text-xs rounded-lg shadow-sm"
                  size="sm"
                  startContent={<Download className="size-3.5" />}
                  onPress={handleExportLogs}
                >
                  Export
                </Button>
              )}
            </div>
          </div>
        </div>

        {sessionTitle === "Audit Logs" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
            <Activity className="size-12 text-default-400 mb-4" />
            <h3 className="text-lg font-medium text-default-900">
              No Stream Selected
            </h3>
            <p className="text-sm text-default-500 mt-1 max-w-sm">
              Select a log session from the left sidebar to view real-time
              telemetry and background swarm activity.
            </p>
          </div>
        ) : (
          <ScrollShadow className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto space-y-2 text-sm animate-in fade-in duration-500">
              <div className="flex items-center gap-3 text-default-400 py-1">
                <span className="w-24 shrink-0 text-xs">10:48:12</span>
                <span className="text-blue-500">[SYSTEM]</span>
                <span className="text-default-700 dark:text-default-300">
                  OS-Bridge initialized successfully. Memory access granted.
                </span>
              </div>
              <div className="flex items-center gap-3 text-default-400 py-1">
                <span className="w-24 shrink-0 text-xs">10:48:15</span>
                <span className="text-purple-500">[MCP]</span>
                <span className="text-default-700 dark:text-default-300">
                  Connected to local Composio orchestrator.
                </span>
              </div>
              <div className="flex items-center gap-3 text-default-400 py-1">
                <span className="w-24 shrink-0 text-xs">10:49:01</span>
                <span className="text-warning">[SWARM]</span>
                <span className="text-default-700 dark:text-default-300">
                  Refactoring agent constructing context window (reading 4
                  files).
                </span>
              </div>
              <div className="flex items-center gap-3 text-default-400 py-1">
                <span className="w-24 shrink-0 text-xs">10:49:03</span>
                <span className="text-danger">[SECURITY]</span>
                <span className="text-default-700 dark:text-default-300">
                  Intercepted unverified external network request. DLP enforced.
                </span>
              </div>
              <div className="flex items-center gap-3 text-default-400 py-1">
                <span className="w-24 shrink-0 text-xs">10:49:04</span>
                <span className="text-blue-500">[SYSTEM]</span>
                <span className="text-default-700 dark:text-default-300">
                  Awaiting human-in-the-loop validation...
                </span>
              </div>
            </div>
          </ScrollShadow>
        )}
      </div>
    </ChatBotLayout>
  );
}
