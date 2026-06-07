"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Shield, Zap, RefreshCw } from "lucide-react";

export default function LiveTelemetryWidget() {
  const [tokensPerSec, setTokensPerSec] = useState(14280);
  const [activeThreads, setActiveThreads] = useState(42);
  const [secChecks, setSecChecks] = useState(9842);
  const [ping, setPing] = useState(18);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate minor telemetry changes to make it look alive
      setTokensPerSec((prev) => prev + Math.floor(Math.random() * 21) - 10);
      setActiveThreads((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newVal = prev + change;
        return newVal >= 35 && newVal <= 50 ? newVal : prev;
      });
      setSecChecks((prev) => prev + Math.floor(Math.random() * 3));
      setPing((prev) => {
        const change = Math.floor(Math.random() * 3) - 1;
        const newVal = prev + change;
        return newVal >= 12 && newVal <= 25 ? newVal : prev;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 bg-neutral-900 border border-neutral-800/80 rounded-3xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-left font-mono">
      {/* Indicator */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <span className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
        </span>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Swarm Node Status
          </span>
          <span className="text-[10px] text-neutral-500 font-medium uppercase">
            Live telemetry feed
          </span>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="w-full flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Token Rate */}
        <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-900 rounded-2xl p-3">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500 uppercase tracking-widest">
              Throughput
            </span>
            <span className="text-sm font-bold text-neutral-200">
              {tokensPerSec.toLocaleString()} tok/s
            </span>
          </div>
        </div>

        {/* Active Threads */}
        <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-900 rounded-2xl p-3">
          <Cpu className="w-4 h-4 text-purple-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500 uppercase tracking-widest">
              Active Nodes
            </span>
            <span className="text-sm font-bold text-neutral-200">
              {activeThreads} swarms
            </span>
          </div>
        </div>

        {/* Compliance Checks */}
        <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-900 rounded-2xl p-3">
          <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500 uppercase tracking-widest">
              Zero-Trust
            </span>
            <span className="text-sm font-bold text-neutral-200">
              {secChecks.toLocaleString()} verif
            </span>
          </div>
        </div>

        {/* Ping / Latency */}
        <div className="flex items-center gap-3 bg-neutral-950 border border-neutral-900 rounded-2xl p-3">
          <RefreshCw className="w-4 h-4 text-sky-500 shrink-0 animate-spin-slow" />
          <div className="flex flex-col">
            <span className="text-xs text-neutral-500 uppercase tracking-widest">
              LCP Latency
            </span>
            <span className="text-sm font-bold text-neutral-200">
              {ping} ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
