"use client";

import { motion } from "framer-motion";
import {
  Database,
  Network,
  Server,
  ShieldCheck,
  Activity,
  Terminal,
  Code2,
  Link,
  CloudLightning,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function DataPage() {
  const [logs, setLogs] = useState<string[]>([
    "[System] Initializing Sovereign Data Hub...",
    "[VectorDB] Connected to GCP AlloyDB cluster (Latency: 14ms)",
    "[ETL] Syncing Jira agile boards...",
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const simulatedLogs = [
        "[Gemini 3.1 Pro] Autonomously chunking 450 pages of API docs...",
        "[Tri-Brain] Embedding AST syntax trees...",
        "[VectorDB] Pruning stale vectors from branch 'feature/auth'...",
        "[Sovereign] Scraping GitHub trending repos for insights...",
        "[ETL] Successful sync of Confluence spaces (2,041 documents)",
      ];

      setLogs((prev) => {
        const newLog =
          simulatedLogs[Math.floor(Math.random() * simulatedLogs.length)];
        const updated = [...prev, newLog];

        if (updated.length > 6) updated.shift();

        return updated;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      label: "Total Vectors",
      value: "84.2M",
      icon: Database,
      color: "text-blue-400",
    },
    {
      label: "Active Connections",
      value: "1,048",
      icon: Network,
      color: "text-emerald-400",
    },
    {
      label: "Ingestion Latency",
      value: "12ms",
      icon: Activity,
      color: "text-purple-400",
    },
    {
      label: "Shard Health",
      value: "100%",
      icon: ShieldCheck,
      color: "text-green-400",
    },
  ];

  const connectors = [
    {
      name: "GitHub Enterprise",
      status: "Connected",
      icon: Code2,
      syncTime: "2 mins ago",
    },
    {
      name: "Jira Software",
      status: "Connected",
      icon: Activity,
      syncTime: "5 mins ago",
    },
    {
      name: "GCP Cloud Storage",
      status: "Syncing",
      icon: CloudLightning,
      syncTime: "In progress",
    },
    {
      name: "Confluence",
      status: "Connected",
      icon: Link,
      syncTime: "1 hour ago",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8 overflow-hidden font-sans relative">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/30 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/30 blur-[150px] rounded-full pointer-events-none" />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto relative z-10"
        initial={{ opacity: 0, y: -20 }}
      >
        <header className="mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent pb-2">
            Sovereign Data Hub
          </h1>
          <p className="text-gray-400 text-lg mt-2">
            God-Tier GCP Sovereign Vector Ingestion & Real-Time Analytics
          </p>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((m, i) => (
            <motion.div
              key={i}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              initial={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-xl bg-black/50 border border-white/5 ${m.color} group-hover:scale-110 transition-transform`}
                >
                  <m.icon size={24} />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                {m.label}
              </h3>
              <p className="text-3xl font-bold mt-1 tracking-tight">
                {m.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Data Connectors */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8"
            initial={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Server className="text-blue-400" />
                Global Data Connectors
              </h2>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors">
                + Add Connector
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectors.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                      <c.icon className="text-gray-300" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{c.name}</h4>
                      <p className="text-xs text-gray-500">
                        Last synced: {c.syncTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      {c.status === "Syncing" && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-3 w-3 ${c.status === "Connected" ? "bg-emerald-500" : "bg-purple-500"}`}
                      />
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Live Ingestion Terminal */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="col-span-1 bg-black/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 flex flex-col font-mono text-sm relative overflow-hidden shadow-2xl"
            initial={{ opacity: 0, x: 20 }}
            transition={{ delay: 0.5 }}
          >
            {/* Terminal Top Bar */}
            <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-4">
              <Terminal className="text-emerald-400" size={16} />
              <span className="text-gray-400 font-semibold tracking-widest uppercase text-xs">
                Live Swarm Ingestion
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, y: 10 }}
                >
                  <span className="text-gray-600">
                    [{new Date().toLocaleTimeString()}]
                  </span>
                  <span
                    className={
                      log.includes("VectorDB")
                        ? "text-purple-400"
                        : log.includes("Gemini")
                          ? "text-blue-400"
                          : "text-emerald-400"
                    }
                  >
                    {log}
                  </span>
                </motion.div>
              ))}
            </div>
            {/* Scanning line animation */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500/50 shadow-[0_0_10px_2px_rgba(16,185,129,0.5)] animate-scan" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
