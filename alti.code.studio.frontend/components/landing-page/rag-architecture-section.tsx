"use client";

import React from "react";
import { motion } from "framer-motion";
import { Database, BrainCircuit, FileSearch } from "lucide-react";

export default function RagArchitectureSection() {
  return (
    <section
      className="w-full py-24 bg-white text-black relative overflow-hidden"
      id="ultimate-rag"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center max-w-5xl mx-auto mb-16"
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
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-black mb-6 whitespace-nowrap">
            The Sovereign Knowledge Pipeline.
          </h2>
          <p className="text-lg text-zinc-600 w-full font-medium tracking-tight mb-16 leading-relaxed">
            Stop relying on simple regex searches. Alti Code Studio uses a massive triple-threat Retrieval-Augmented Generation (RAG) pipeline designed for sovereign codebase ingestion, relationship mapping, and precise inline citations.
          </p>
        </motion.div>

        {/* The Pipeline Visual */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connector Lines (Desktop) */}
          <div className="hidden lg:block absolute top-[40%] left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-zinc-200/0 via-zinc-200 to-zinc-200/0 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
            {/* Step 1: Spanner Graph */}
            <motion.div
              className="rounded-[32px] bg-zinc-100 border border-zinc-200 p-8 xl:p-10 flex flex-col gap-6 group hover:bg-zinc-200 transition-colors duration-500 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center relative z-10">
                <Database className="w-8 h-8" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold tracking-tight mb-3">Google Cloud Spanner Graph</h3>
                <p className="text-zinc-600 leading-relaxed font-medium">
                  Manages deep semantic relationships between files, classes, and microservices (e.g., "Service A depends on Interface B").
                </p>
              </div>
            </motion.div>

            {/* Step 2: Vertex AI */}
            <motion.div
              className="rounded-[32px] bg-zinc-100 border border-zinc-200 p-8 xl:p-10 flex flex-col gap-6 group hover:bg-zinc-200 transition-colors duration-500 relative overflow-hidden mt-0 lg:mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center relative z-10">
                <FileSearch className="w-8 h-8" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold tracking-tight mb-3">Vertex AI Discovery</h3>
                <p className="text-zinc-600 leading-relaxed font-medium">
                  Performs dense vector similarity search across the actual code text, implementation logic, and historical commits.
                </p>
              </div>
            </motion.div>

            {/* Step 3: Gemini Synthesis */}
            <motion.div
              className="rounded-[32px] bg-zinc-100 border border-zinc-200 p-8 xl:p-10 flex flex-col gap-6 group hover:bg-zinc-200 transition-colors duration-500 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center relative z-10">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold tracking-tight mb-3">Gemini Synthesis</h3>
                <p className="text-zinc-600 leading-relaxed font-medium">
                  Aggregates exact contextual snippets into a monolithic prompt to generate flawless inline citations and implementation strategies.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
