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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center w-full flex flex-col items-center mb-16"
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
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-black mb-6">
            Sovereign Knowledge Pipeline
          </h2>
          <p className="text-lg text-zinc-600 w-full font-medium tracking-tight mb-16 leading-relaxed">
            Stop relying on simple regex searches. Alti Code Studio uses a massive triple-threat Retrieval-Augmented Generation (RAG) pipeline designed for sovereign codebase ingestion, relationship mapping, and precise inline citations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <FeatureCard
              description='Manages deep semantic relationships between files, classes, and microservices (e.g., "Service A depends on Interface B").'
              icon={<Database className="w-8 h-8 text-[#0000ff]" />}
              title="Enterprise Graph Database"
            />
            <FeatureCard
              description="Performs dense vector similarity search across the actual code text, implementation logic, and historical commits."
              icon={<FileSearch className="w-8 h-8 text-[#0000ff]" />}
              title="Deep Vector Discovery"
            />
            <FeatureCard
              description="Aggregates exact contextual snippets into a monolithic prompt to generate flawless inline citations and implementation strategies."
              icon={<BrainCircuit className="w-8 h-8 text-[#0000ff]" />}
              title="Neural Context Synthesis"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      className="flex flex-col items-start text-left p-8 rounded-3xl bg-zinc-100 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-200 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm shrink-0">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-black tracking-tight">
          {title}
        </h3>
      </div>
      <p className="text-zinc-600 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}
