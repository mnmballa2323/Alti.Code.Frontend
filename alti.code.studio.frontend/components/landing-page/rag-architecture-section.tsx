"use client";

import React from "react";
import { motion } from "framer-motion";
import { Search, Database, BrainCircuit, FileSearch, ArrowRight } from "lucide-react";

export default function RagArchitectureSection() {
  return (
    <section
      className="w-full py-24 bg-[#030014] text-white relative overflow-hidden"
      id="ultimate-rag"
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-6">
            <Search className="w-4 h-4" />
            Ultimate RAG Search Engine
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            The Sovereign Knowledge Pipeline.
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Stop relying on simple regex searches. Alti Code Studio uses a massive triple-threat Retrieval-Augmented Generation (RAG) pipeline designed for sovereign codebase ingestion, relationship mapping, and precise inline citations.
          </p>
        </motion.div>

        {/* The Pipeline Visual */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connector Lines (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-purple-500/0 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {/* Step 1: Spanner Graph */}
            <motion.div
              className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full transition-transform group-hover:scale-110" />
              <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Google Cloud Spanner Graph</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Manages deep semantic relationships between files, classes, and microservices (e.g., "Service A depends on Interface B").
              </p>
            </motion.div>

            {/* Step 2: Vertex AI */}
            <motion.div
              className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group mt-0 lg:mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full transition-transform group-hover:scale-110" />
              <div className="w-14 h-14 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                <FileSearch className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Vertex AI Discovery</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Performs dense vector similarity search across the actual code text, implementation logic, and historical commits.
              </p>
            </motion.div>

            {/* Step 3: Gemini Synthesis */}
            <motion.div
              className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full transition-transform group-hover:scale-110" />
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Gemini Synthesis</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Aggregates exact contextual snippets into a monolithic prompt to generate flawless inline citations and implementation strategies.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
