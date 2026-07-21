"use client";

import { useState, useEffect } from "react";
import {
  Server,
  Rocket,
  Database,
  CloudLightning,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GenesisEvent {
  genesisId: string;
  status: string;
  message: string;
  feature?: string;
  totalPhases?: number;
  provider?: string;
  url?: string;
  timestamp: number;
}

export default function GenesisPage() {
  const [prompt, setPrompt] = useState("");
  const [repoName, setRepoName] = useState("");
  const [isIgniting, setIsIgniting] = useState(false);
  const [events, setEvents] = useState<GenesisEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource;

    if (isIgniting) {
      const token = localStorage.getItem("accessToken");

      eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/genesis/stream?token=${token}`,
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.status === "CONNECTED") return;
        setEvents((prev) => [...prev, data]);
        if (data.status === "GENESIS_FAILED") {
          setError(data.message);
          setIsIgniting(false);
          eventSource.close();
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE Error:", err);
      };
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [isIgniting]);

  const handleIgnite = async () => {
    if (!prompt || !repoName) return;
    setIsIgniting(true);
    setEvents([]);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/genesis/ignite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ prompt, repoName, isPrivate: true }),
        },
      );

      if (!res.ok) {
        const data = await res.json();

        throw new Error(data.message || "Failed to ignite Genesis");
      }
    } catch (e: any) {
      setError(e.message);
      setIsIgniting(false);
    }
  };

  return (
    <div className="flex h-screen bg-black/95 text-green-500 font-mono p-6">
      {/* Left Panel - Control Matrix */}
      <div className="w-1/3 border-r border-green-900/50 pr-6 flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-400 uppercase tracking-widest flex items-center gap-3">
            <Server className="w-8 h-8" />
            The Genesis Engine
          </h1>
          <p className="text-green-700 mt-2 text-sm leading-relaxed">
            End-to-End Autonomy Protocol. Provide a conceptual directive and a
            repository destination. The Swarm will autonomously scaffold,
            architect, and deploy the entire system to production.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-green-600 font-bold uppercase tracking-wider mb-2 block">
              Target Repository
            </label>
            <Input
              className="bg-black/50 border-green-900/50 text-green-400 placeholder:text-green-900"
              disabled={isIgniting}
              placeholder="e.g. quantum-ledger-api"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-green-600 font-bold uppercase tracking-wider mb-2 block">
              System Directive
            </label>
            <Textarea
              className="h-48 bg-black/50 border-green-900/50 text-green-400 placeholder:text-green-900 resize-none"
              disabled={isIgniting}
              placeholder="Describe the application. E.g., 'Build a high-frequency trading dashboard with real-time websocket streams, user auth, and postgres persistence.'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <Button
            className="w-full bg-green-900/20 hover:bg-green-800/40 text-green-400 border border-green-800/50 hover:border-green-500 h-12 uppercase tracking-[0.2em]"
            disabled={!prompt || !repoName || isIgniting}
            onClick={handleIgnite}
          >
            {isIgniting ? (
              <span className="flex items-center gap-2 animate-pulse">
                <ShieldCheck className="w-5 h-5" /> Orchestrating Genesis...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Rocket className="w-5 h-5" /> Ignite Engine
              </span>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-950/30 border border-red-900/50 text-red-500 text-sm mt-4">
              [CRITICAL ERROR] {error}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Telemetry & Output */}
      <div className="w-2/3 pl-6 flex flex-col">
        <h2 className="text-sm font-bold text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" /> Live Creation Telemetry
        </h2>

        <div className="flex-1 bg-black/80 border border-green-900/30 rounded p-4 font-mono text-xs overflow-auto">
          {events.length === 0 && !isIgniting && (
            <div className="h-full flex items-center justify-center text-green-900/50">
              [ WAITING FOR DIRECTIVE ]
            </div>
          )}

          <div className="space-y-3">
            {events.map((ev, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 border-b border-green-900/20 pb-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-green-700">
                    [{new Date(ev.timestamp).toLocaleTimeString()}]
                  </span>
                  <span
                    className={`font-bold ${ev.status === "PHASE_START" ? "text-blue-400" : "text-green-400"}`}
                  >
                    {ev.status === "PHASE_START"
                      ? "▶ INITIATING"
                      : "✓ COMPLETED"}
                    : {ev.message}
                  </span>
                </div>

                {ev.feature && (
                  <div className="pl-[7rem] text-green-500/80">
                    Arch Synthesis: {ev.feature}
                  </div>
                )}
                {ev.totalPhases && (
                  <div className="pl-[7rem] text-green-500/80">
                    Epic Generator: {ev.totalPhases} sprints injected to backlog
                  </div>
                )}
                {ev.url && (
                  <div className="pl-[7rem] text-green-400 flex items-center gap-2 mt-1">
                    <CloudLightning className="w-3 h-3 text-yellow-500" />
                    <strong>Production Deployment Active:</strong>
                    <a
                      className="underline hover:text-green-300"
                      href={ev.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {ev.url}
                    </a>
                  </div>
                )}
              </div>
            ))}

            {isIgniting &&
              events.length > 0 &&
              events[events.length - 1].status !== "GENESIS_FAILED" && (
                <div className="flex items-center gap-2 text-green-500/50 animate-pulse mt-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Swarm analyzing and executing subroutine...</span>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
