"use client";

import React from "react";
import { Sliders, ShieldAlert, CheckCircle, RefreshCw, Cpu, Database } from "lucide-react";

export default function OperationsPage() {
  return (
    <div className="flex-1 w-full space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-white">System Operations & Controls</h2>
        <p className="text-xs text-neutral-400 mt-1">Manage infrastructure, invoke cryptographic operations, and verify system compliance state.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Infrastructure components */}
        <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-500" />
            <span>Infrastructure Clusters</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-350 mb-1.5">
                <span>GKE Autopilot Main Ring</span>
                <span className="text-green-400">HEALTHY</span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-normal">
                Running 15 instances in us-central1-a. CPU usage: 22% | Memory: 41%. Autoscaler ready.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-350 mb-1.5">
                <span>Regional Secondary Rings</span>
                <span className="text-green-400">HEALTHY</span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-normal">
                Multi-cluster endpoints configured in europe-west1 and asia-east1. Hot redundancy fully synchronized.
              </p>
            </div>
          </div>
        </div>

        {/* Database configurations */}
        <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-500" />
            <span>Database Engines</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-350 mb-1.5">
                <span>PostgreSQL (pgvector instance)</span>
                <span className="text-green-400">ONLINE</span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-normal">
                Active connections: 42. Memory indexing: HNSW vectors configured. Nightly backups successfully completed.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-350 mb-1.5">
                <span>Redis Synapse Cache</span>
                <span className="text-green-400">ONLINE</span>
              </div>
              <p className="text-[10px] text-neutral-500 leading-normal">
                Key count: 154,200. Hit rate: 98.4%. Eviction: volatile-lru. Used memory: 1.2 GB.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action controls list */}
      <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5">
          Global Operations & Invocation Deck
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-neutral-800 hover:border-amber-500/20 rounded-xl p-4 bg-neutral-900/40 flex flex-col justify-between h-40">
            <div>
              <span className="text-xs font-bold text-white block mb-1">Force CMEK Rotation</span>
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                Triggers immediate KMS envelope key rotation across all encrypted customer database volumes.
              </p>
            </div>
            <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg border border-neutral-750 transition-all text-center mt-3">
              Rotate Keys
            </button>
          </div>

          <div className="border border-neutral-800 hover:border-amber-500/20 rounded-xl p-4 bg-neutral-900/40 flex flex-col justify-between h-40">
            <div>
              <span className="text-xs font-bold text-white block mb-1">Verify Audit Integrity</span>
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                Scans the cryptographic log chain using WORM block hashing to verify platform audit logs.
              </p>
            </div>
            <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg border border-neutral-750 transition-all text-center mt-3">
              Verify Chain
            </button>
          </div>

          <div className="border border-neutral-800 hover:border-amber-500/20 rounded-xl p-4 bg-neutral-900/40 flex flex-col justify-between h-40">
            <div>
              <span className="text-xs font-bold text-white block mb-1">Clean System Cache</span>
              <p className="text-[10px] text-neutral-500 leading-relaxed">
                Clears the Redis cache store for temporary session files and prompts cache indexes.
              </p>
            </div>
            <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg border border-neutral-750 transition-all text-center mt-3">
              Flush Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
