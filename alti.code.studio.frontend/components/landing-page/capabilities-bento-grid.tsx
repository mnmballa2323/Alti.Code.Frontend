"use client";

import React from "react";
import { Terminal, GitBranch, Shield, Zap, Code2, Network } from "lucide-react";

export default function CapabilitiesBentoGrid() {
  return (
    <section className="w-full py-32 bg-black text-white px-4 sm:px-6 lg:px-8 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto flex flex-col gap-20">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
          <h3 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            Engineered for scale.
          </h3>
          <p className="text-xl text-zinc-400 leading-relaxed font-medium">
            Under the hood, inso code is built on system level components that coordinate local daemons, 
            optimize syntax tree modifications, and ensure peer to peer gossip synchronization to deliver 
            speed, security, and absolute precision.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[220px]">
          
          {/* Card 1: Desktop IPC & CLI (col-span-12 md:col-span-4 lg:col-span-8 row-span-2) */}
          <div className="md:col-span-4 lg:col-span-8 lg:row-span-2 rounded-[32px] bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] group-hover:bg-blue-500/10 transition-all duration-500" />
            <div className="flex flex-col gap-4 max-w-md">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-blue-400 shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-bold tracking-tight text-white">
                Desktop IPC & CLI Steering
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                Inso Code runs tools and modifies code directly on your machine through 
                a high-speed, secure local IPC channel. No slow virtual machines, 
                no remote terminal latency—just direct native command steering.
              </p>
            </div>
            
            {/* Visual Terminal */}
            <div className="mt-6 bg-black border border-zinc-800 rounded-2xl p-4 font-mono text-[10px] text-zinc-500 flex flex-col gap-1.5 shadow-inner select-none max-w-lg md:max-w-none">
              <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-900 text-zinc-600">
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
                <span className="ml-2">ipc_stream::localhost:5000</span>
              </div>
              <div><span className="text-zinc-600 mr-1.5">[IPC]</span> connected to local daemon version 2.0.0</div>
              <div><span className="text-zinc-600 mr-1.5">[IPC]</span> starting subagent: Codebase Researcher (PID: 8493)</div>
              <div><span className="text-zinc-600 mr-1.5">[CLI]</span> exec: <span className="text-zinc-300">cargo test --all-features</span></div>
              <div className="text-emerald-400 font-semibold"><span className="text-zinc-600 mr-1.5">[CLI]</span> success: 42 tests passed (481ms)</div>
            </div>
          </div>

          {/* Card 2: AST Traversal (col-span-12 md:col-span-2 lg:col-span-4 row-span-1) */}
          <div className="md:col-span-2 lg:col-span-4 rounded-[32px] bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl overflow-hidden relative group">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-emerald-400 shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold tracking-tight text-white">
                AST Traversal Edits
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Instead of simple regex matching, our agents build Abstract Syntax Trees to 
                surgically modify codebase nodes. Edits are type-safe and compilation-proof.
              </p>
            </div>
          </div>

          {/* Card 3: Gossip Mesh Coordination (col-span-12 md:col-span-2 lg:col-span-4 row-span-1) */}
          <div className="md:col-span-2 lg:col-span-4 rounded-[32px] bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl overflow-hidden relative group">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-purple-400 shrink-0">
                <Network className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold tracking-tight text-white">
                Gossip Mesh Coordination
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                50,000 specialist agents remain synchronized via a peer-to-peer gossip network. 
                State changes propagate in sub-10ms across local and cloud swarms.
              </p>
            </div>
          </div>

          {/* Card 4: Semantic Prompt Cache (col-span-12 md:col-span-3 lg:col-span-4 row-span-1) */}
          <div className="md:col-span-3 lg:col-span-4 rounded-[32px] bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl overflow-hidden relative group">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-yellow-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold tracking-tight text-white">
                Semantic Cache
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Saves up to 80% on inference costs. Prompt prefix caching detects 
                identical schema analysis requests and serves them locally, instantly.
              </p>
            </div>
          </div>

          {/* Card 5: Git Submodule Auto-Sync (col-span-12 md:col-span-3 lg:col-span-4 row-span-1) */}
          <div className="md:col-span-3 lg:col-span-4 rounded-[32px] bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl overflow-hidden relative group">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-red-400 shrink-0">
                <GitBranch className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold tracking-tight text-white">
                Cross-Repo Submodule Sync
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Our primary agent automatically coordinates submodules, matching branch revisions 
                and verifying integrity across separate enterprise repositories.
              </p>
            </div>
          </div>

          {/* Card 6: Private Vault (col-span-12 md:col-span-6 lg:col-span-4 row-span-1) */}
          <div className="md:col-span-6 lg:col-span-4 rounded-[32px] bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700/80 p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl overflow-hidden relative group">
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-cyan-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold tracking-tight text-white">
                Hardware Secure Vault
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Secrets are locked locally in an encrypted keyring. Agents query keys 
                on-demand, but the raw values are never exposed or written to the filesystem.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
