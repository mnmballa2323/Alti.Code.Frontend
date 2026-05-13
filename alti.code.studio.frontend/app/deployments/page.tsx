"use client";

import React, { useState } from "react";
import { Button, Chip, ScrollShadow, Progress, cn } from "@heroui/react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Play,
  RotateCcw,
  TerminalSquare,
  Cloud,
  Loader2,
  Terminal,
} from "lucide-react";
import { useSession } from "next-auth/react";

import ChatBotLayout from "@/components/ChatbotLayout";

type Deployment = {
  id: string;
  hash: string;
  message: string;
  author: string;
  time: string;
  env: string;
  status: "success" | "in_progress" | "failed";
  progress: number;
  log?: string;
};

const INITIAL_DEPLOYMENTS: Deployment[] = [
  {
    id: "dep-104",
    hash: "a4f9b2c",
    message: "feat: Sovereign agentic orchestration pipeline",
    author: "Alti Swarm",
    time: "2 mins ago",
    env: "Staging",
    status: "success",
    progress: 100,
  },
  {
    id: "dep-103",
    hash: "c7e2a11",
    message: "fix: Cosmos DB connection pooling limit",
    author: "michaelmeram",
    time: "4 hours ago",
    env: "Production",
    status: "success",
    progress: 100,
  },
];

export default function DeploymentsPage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;
  const [deployments, setDeployments] =
    useState<Deployment[]>(INITIAL_DEPLOYMENTS);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);

  const handleTriggerBuild = async () => {
    setIsDeploying(true);
    const newId = `dep-${Math.floor(Math.random() * 1000) + 200}`;
    const newDeployment: Deployment = {
      id: newId,
      hash: Math.random().toString(16).substring(2, 9),
      message: "auto: Cloud Run sovereign production deployment",
      author: "Autonomous Build Swarm",
      time: "Just now",
      env: "Production",
      status: "in_progress",
      progress: 10,
    };

    setDeployments((prev) => [newDeployment, ...prev]);

    // Simulate progress while waiting for API
    const progressInterval = setInterval(() => {
      setDeployments((prev) =>
        prev.map((d) =>
          d.id === newId && d.progress < 90
            ? { ...d, progress: d.progress + 15 }
            : d,
        ),
      );
    }, 800);

    try {
      const res = await fetch(
        "http://localhost:3000/api/v1/u-deployment/deploy",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({
            platform: "gcp",
            config: { serviceType: "cloudrun", path: "." },
          }),
        },
      );

      const result = await res.json();

      clearInterval(progressInterval);

      if (result.success && result.data?.success) {
        setDeployments((prev) =>
          prev.map((d) =>
            d.id === newId
              ? {
                  ...d,
                  status: "success",
                  progress: 100,
                  log: `Deployed Successfully to Cloud Run!\n\nURL: ${result.data.url}`,
                }
              : d,
          ),
        );
      } else {
        const errorMsg =
          result.data?.error ||
          result.message ||
          "Cloud Run deployment failed due to missing Google Application Credentials.";

        setDeployments((prev) =>
          prev.map((d) =>
            d.id === newId
              ? {
                  ...d,
                  status: "failed",
                  progress: 100,
                  log: `[ERROR] Deployment Failed.\n\nTrace: ${errorMsg}\n\nPlease ensure GOOGLE_APPLICATION_CREDENTIALS are set in your environment variables for sovereign GCP deployment.`,
                }
              : d,
          ),
        );
      }
    } catch (err: any) {
      clearInterval(progressInterval);
      setDeployments((prev) =>
        prev.map((d) =>
          d.id === newId
            ? {
                ...d,
                status: "failed",
                progress: 100,
                log: `[FATAL] Network error hitting uDeployment service: ${err.message}`,
              }
            : d,
        ),
      );
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRollback = async () => {
    setIsRollingBack(true);
    try {
      const res = await fetch(
        "http://localhost:3000/api/v1/u-deployment/rollback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
        },
      );
      const result = await res.json();

      const rollbackDep: Deployment = {
        id: `dep-${Math.floor(Math.random() * 1000) + 500}`,
        hash: "r0llb4ck",
        message: "sys: Reverting Cloud Run traffic to last stable revision",
        author: "Sentinel Security",
        time: "Just now",
        env: "Production",
        status: "success",
        progress: 100,
        log: result.message || "GCP Production Stability Restored.",
      };

      setDeployments((prev) => [rollbackDep, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <ChatBotLayout isRightSidebarOpenByDefault={false}>
      <div className="flex-1 overflow-hidden bg-background flex flex-col h-full font-sans">
        {/* Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-content1 flex items-center">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <Cloud className="size-5 text-blue-500" />
              <h1 className="text-base font-semibold tracking-tight">
                Universal Cloud Deployments (GCP)
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                className="font-medium text-xs rounded-lg bg-default-100 text-default-700"
                isDisabled={isDeploying || isRollingBack}
                size="sm"
                startContent={
                  isRollingBack ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="size-3.5" />
                  )
                }
                onClick={handleRollback}
              >
                Rollback
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-xs rounded-lg shadow-sm"
                isDisabled={isDeploying || isRollingBack}
                size="sm"
                startContent={
                  isDeploying ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Play className="size-3.5" />
                  )
                }
                onClick={handleTriggerBuild}
              >
                Trigger Build
              </Button>
            </div>
          </div>
        </div>

        <ScrollShadow className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8 flex gap-8 h-full">
            {/* Deployments List */}
            <section className="flex-1">
              <h2 className="text-sm font-semibold text-default-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TerminalSquare className="size-4" />
                Build History
              </h2>

              <div className="border border-default-200 rounded-2xl overflow-hidden bg-white dark:bg-default-50">
                {deployments.map((dep, idx) => (
                  <div
                    key={dep.id}
                    className={cn(
                      "p-5 flex items-center gap-6 transition-colors cursor-pointer",
                      idx !== deployments.length - 1 &&
                        "border-b border-default-200",
                      activeLogId === dep.id
                        ? "bg-primary/5 border-l-2 border-l-primary"
                        : "hover:bg-default-100",
                    )}
                    onClick={() => setActiveLogId(dep.id)}
                  >
                    <div className="shrink-0 w-8 flex justify-center">
                      {dep.status === "success" && (
                        <CheckCircle2 className="size-5 fill-green-500 text-white" />
                      )}
                      {dep.status === "in_progress" && (
                        <Clock className="size-5 fill-blue-500 text-white animate-pulse" />
                      )}
                      {dep.status === "failed" && (
                        <XCircle className="size-5 fill-red-500 text-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium truncate text-sm">
                          {dep.message}
                        </span>
                        <Chip
                          className={cn(
                            "text-[10px] uppercase font-bold tracking-wider",
                            dep.env === "Production"
                              ? "bg-blue-500/10 text-blue-500"
                              : "",
                          )}
                          size="sm"
                          variant="flat"
                        >
                          {dep.env}
                        </Chip>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-default-500">
                        <span className="font-mono bg-default-100 dark:bg-default-200 px-1.5 py-0.5 rounded">
                          {dep.hash}
                        </span>
                        <span>•</span>
                        <span>{dep.author}</span>
                        <span>•</span>
                        <span>{dep.time}</span>
                      </div>
                    </div>

                    <div className="w-48 shrink-0">
                      {dep.status === "in_progress" ? (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-primary font-bold tracking-widest uppercase">
                              Provisioning...
                            </span>
                            <span className="text-default-500 font-mono">
                              {dep.progress}%
                            </span>
                          </div>
                          <Progress
                            className="h-1.5"
                            color="primary"
                            size="sm"
                            value={dep.progress}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <span
                            className={cn(
                              "text-xs font-bold",
                              dep.status === "success"
                                ? "text-success"
                                : "text-danger",
                            )}
                          >
                            {dep.status === "success" ? "Stable" : "Failed"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Logs Viewer */}
            <section className="w-[400px] shrink-0 h-full flex flex-col">
              <h2 className="text-sm font-semibold text-default-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Terminal className="size-4" />
                Build Logs
              </h2>
              <div className="flex-1 bg-[#0A0A0A] rounded-2xl border border-default-200 p-4 font-mono text-xs overflow-y-auto text-green-400">
                {activeLogId ? (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {deployments.find((d) => d.id === activeLogId)?.log ||
                      "No logs available for this build phase. Infrastructure provisioned silently."}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-default-600 opacity-50">
                    Select a deployment to view logs
                  </div>
                )}
              </div>
            </section>
          </div>
        </ScrollShadow>
      </div>
    </ChatBotLayout>
  );
}
