"use client";

import React from "react";
import { motion } from "framer-motion";
import { Database, Cpu, Search } from "lucide-react";

export default function RagArchitectureSection() {
  return (
    <section
      className="w-full py-24 bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      id="ultimate-rag"
    >
      <div className="absolute inset-0 z-0 pointer-events-none" />
      <motion.div
        className="max-w-5xl mx-auto w-full flex flex-col items-center text-center relative z-10"
        initial="hidden"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
        viewport={{ once: true, margin: "-100px" }}
        whileInView="visible"
      >
        {/* Headline */}
        <motion.h2
          className="text-3xl md:text-4xl font-bold tracking-tighter text-black mb-6"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          Sovereign Knowledge Pipeline
        </motion.h2>

        <motion.p
          className="text-lg text-zinc-600 w-full font-medium tracking-tight mb-16 leading-relaxed"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        >
          Stop relying on simple search. Inso code uses a massive retrieval augmented generation pipeline designed for sovereign codebase ingestion, relationship mapping, and precise inline citations.
        </motion.p>

        {/* Simple Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <FeatureCard
            description="Manages deep semantic relationships between files, modules, classes, and microservices for precise context."
            icon={<Database className="w-8 h-8 text-[#0000ff]" />}
            title="Graph Database"
          />
          <FeatureCard
            description="Performs dense vector similarity search across your codebase text, logic, and historical commits."
            icon={<Search className="w-8 h-8 text-[#0000ff]" />}
            title="Vector Search"
          />
          <FeatureCard
            description="Aggregates exact contextual snippets into a prompt for flawless citations and rapid implementation strategies."
            icon={<Cpu className="w-8 h-8 text-[#0000ff]" />}
            title="Neural Synthesis"
          />
        </div>
      </motion.div>
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
      <p className="text-sm text-zinc-600 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}
