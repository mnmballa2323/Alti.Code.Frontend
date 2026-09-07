"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { FormattedMessage, useIntl } from "react-intl";
import io, { Socket } from "socket.io-client";
import { toast } from "sonner";

import { API_URL, SOCKET_URL } from "@/lib/config";

/** Maximum number of steps to display in the mission log. Prevents unbounded growth. */
const MAX_STEPS = 200;

/** Incrementing counter for unique step IDs — avoids Date.now() collisions. */
let _stepCounter = 0;
const nextStepId = () => ++_stepCounter;

type MissionStatus = "idle" | "planning" | "running" | "success" | "failed";

interface MissionStep {
  id: number;
  agent: string;
  status: "running" | "success" | "failed";
  output: string | object;
  error?: string;
}

export default function MissionControl() {
  const intl = useIntl();
  const [goal, setGoal] = useState("");
  const [missionStatus, setMissionStatus] = useState<MissionStatus>("idle");
  const [traceId, setTraceId] = useState<string | null>(null);
  const [steps, setSteps] = useState<MissionStep[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  /** Append a step to the log, capping at MAX_STEPS. */
  const appendStep = useCallback((step: Omit<MissionStep, "id">) => {
    setSteps((prev) => {
      const next = [...prev, { ...step, id: nextStepId() }];

      return next.length > MAX_STEPS ? next.slice(-MAX_STEPS) : next;
    });
  }, []);

  // Socket.io integration
  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", (reason) => {
      if (socketConnected) {
        toast.warning(
          intl.formatMessage({
            id: "mission_control.socket.disconnected",
            defaultMessage: "Swarm connection lost. Reconnecting...",
          }),
        );
      }
      setSocketConnected(false);
    });

    socket.on("connect_error", (error) => {
      setSocketConnected(false);
      // To avoid spamming, we rely on disconnect warning or a silent reconnect loop.
    });

    socket.on("agent:thought", (data: { message: string; agent?: string }) => {
      appendStep({
        agent: data.agent ?? "Orchestrator",
        status: "running",
        output: data.message,
      });
    });

    socket.on(
      "agent:action",
      (data: { agent?: string; action?: string; stepIndex?: number }) => {
        appendStep({
          agent: data.agent ?? "Orchestrator",
          status: "running",
          output: `Executing: ${data.action} (step ${data.stepIndex ?? "?"})`,
        });
      },
    );

    // OpenTelemetry Real-Time Streams
    socket.on(
      "span_started",
      (data: { spanId: string; name: string; attributes: any }) => {
        appendStep({
          agent: data.attributes?.agent || "AI Swarm",
          status: "running",
          output: `[Span: ${data.name}] Started executing sub-routine.`,
        });
      },
    );

    socket.on(
      "span_ended",
      (data: {
        spanId: string;
        name: string;
        success: boolean;
        timestamp: number;
      }) => {
        appendStep({
          agent: "System",
          status: data.success ? "success" : "failed",
          output: `[Span: ${data.name}] Concluded${data.success ? " successfully" : " with errors"}.`,
        });
      },
    );

    // OpenTelemetry Real-Time Streams
    socket.on(
      "span_started",
      (data: { spanId: string; name: string; attributes: any }) => {
        appendStep({
          agent: data.attributes?.agent || "AI Swarm",
          status: "running",
          output: `[Span: ${data.name}] Started executing sub-routine.`,
        });
      },
    );

    socket.on(
      "span_ended",
      (data: {
        spanId: string;
        name: string;
        success: boolean;
        timestamp: number;
      }) => {
        appendStep({
          agent: "System",
          status: data.success ? "success" : "failed",
          output: `[Span: ${data.name}] Concluded${data.success ? " successfully" : " with errors"}.`,
        });
      },
    );

    socket.on(
      "mission:complete",
      (data: { traceId?: string; results?: unknown[] }) => {
        setMissionStatus("success");
        if (data.results && Array.isArray(data.results)) {
          setSteps((prev) =>
            prev.map((s) => ({ ...s, status: "success" as const })),
          );
        }
      },
    );

    socket.on("mission:failed", (data: { error?: string }) => {
      setMissionStatus("failed");
      setError(data.error ?? "Mission failed");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [appendStep]);

  const startMission = async () => {
    if (!goal.trim()) return;

    setMissionStatus("planning");
    setError(null);
    setSteps([]);
    setTraceId(null);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      const res = await fetch(`${API_URL}/agents/mission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ goal }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (data.success) {
        setMissionStatus("running");
        if (data.data?.traceId) setTraceId(data.data.traceId);
      } else {
        setMissionStatus("failed");
        setError(data.message ?? "Mission failed to start");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Mission failed to start";

      setMissionStatus("failed");
      setError(msg);
    }
  };

  const resetMission = () => {
    setMissionStatus("idle");
    setSteps([]);
    setError(null);
    setTraceId(null);
  };

  const isActive = missionStatus === "planning" || missionStatus === "running";

  return (
    <Card className="w-full h-full bg-black/40 backdrop-blur-xl border border-white/10">
      <CardHeader className="flex flex-col gap-2 items-start pb-0">
        <div className="flex items-center gap-3 w-full">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            <Icon icon="solar:telescope-bold-duotone" width="24" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              <FormattedMessage
                defaultMessage="Mission Control"
                id="mission_control.title"
              />
            </h2>
            <p className="text-sm text-default-400">
              <FormattedMessage
                defaultMessage="Autonomous Orchestrator"
                id="mission_control.subtitle"
              />
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Socket connection indicator */}
            <span
              className={`w-2 h-2 rounded-full ${socketConnected ? "bg-success" : "bg-default-400"}`}
              title={
                socketConnected ? "Socket connected" : "Socket disconnected"
              }
            />
            {/* Mission status badge */}
            {missionStatus !== "idle" && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-semibold capitalize ${
                  missionStatus === "success"
                    ? "bg-success/20 text-success"
                    : missionStatus === "failed"
                      ? "bg-danger/20 text-danger"
                      : "bg-warning/20 text-warning animate-pulse"
                }`}
              >
                {missionStatus}
              </span>
            )}
          </div>
        </div>
        {traceId && (
          <p className="text-xs text-default-500 font-mono pl-1">
            TraceID: {traceId}
          </p>
        )}
      </CardHeader>

      <CardBody className="py-6 overflow-y-auto">
        <div className="flex flex-col gap-6">
          <div className="relative">
            <Textarea
              classNames={{
                input: "text-white",
                inputWrapper:
                  "bg-white/5 data-[hover=true]:bg-white/10 group-data-[focus=true]:bg-white/10 border-white/10",
              }}
              isDisabled={isActive}
              label={intl.formatMessage({
                id: "mission_control.objective.label",
                defaultMessage: "Mission Objective",
              })}
              minRows={3}
              placeholder={intl.formatMessage({
                id: "mission_control.objective.placeholder",
                defaultMessage:
                  "e.g. Audit the entire codebase and fix critical security issues...",
              })}
              value={goal}
              variant="bordered"
              onValueChange={setGoal}
            />
            <div className="absolute bottom-2 right-2 flex gap-2">
              {(missionStatus === "success" || missionStatus === "failed") && (
                <Button size="sm" variant="flat" onPress={resetMission}>
                  Reset
                </Button>
              )}
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                isDisabled={!goal.trim() || isActive}
                isLoading={isActive}
                size="sm"
                onPress={startMission}
              >
                <FormattedMessage
                  defaultMessage="Launch Mission"
                  id="mission_control.launch"
                />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-default-500 uppercase tracking-wider">
              <FormattedMessage
                defaultMessage="Mission Log"
                id="mission_control.log.title"
              />
              {steps.length > 0 && (
                <span className="ml-2 text-default-400 normal-case font-normal">
                  ({steps.length}
                  {steps.length >= MAX_STEPS ? "+" : ""} events)
                </span>
              )}
            </h3>

            {steps.length === 0 && missionStatus === "idle" && (
              <div className="text-center py-12 text-default-300 border-2 border-dashed border-white/5 rounded-xl">
                <Icon
                  className="mx-auto mb-2 opacity-50"
                  icon="solar:asteroid-bold-duotone"
                  width="48"
                />
                <p>
                  <FormattedMessage
                    defaultMessage="Ready for assignment"
                    id="mission_control.log.empty"
                  />
                </p>
              </div>
            )}

            <AnimatePresence>
              {steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-4"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0, x: -20 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                >
                  <div className="mt-1 shrink-0">
                    {step.status === "success" ? (
                      <Icon
                        className="text-success"
                        icon="solar:check-circle-bold"
                        width="20"
                      />
                    ) : step.status === "failed" ? (
                      <Icon
                        className="text-danger"
                        icon="solar:close-circle-bold"
                        width="20"
                      />
                    ) : (
                      <Icon
                        className="text-warning animate-pulse"
                        icon="solar:clock-circle-bold"
                        width="20"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-2">
                      <span className="font-semibold text-white text-sm truncate">
                        {step.agent}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-default-400 capitalize shrink-0">
                        {step.status}
                      </span>
                    </div>
                    <p className="text-sm text-default-300 bg-black/20 p-2 rounded font-mono break-words whitespace-pre-wrap">
                      {typeof step.output === "object"
                        ? JSON.stringify(step.output, null, 2)
                        : step.output}
                    </p>
                    {step.error && (
                      <p className="text-xs text-danger mt-1">
                        <FormattedMessage
                          defaultMessage="Error: {message}"
                          id="mission_control.error"
                          values={{ message: step.error }}
                        />
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {error && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger">
                <h4 className="font-bold mb-1">
                  <FormattedMessage
                    defaultMessage="Mission Failed"
                    id="mission_control.failed.title"
                  />
                </h4>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
