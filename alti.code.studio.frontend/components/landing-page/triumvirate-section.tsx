"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code2, ShieldAlert, LineChart } from "lucide-react";

export default function TriumvirateSection() {
  return (
    <section
      className="w-full py-24 bg-white text-black relative overflow-hidden"
      id="triumvirate"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
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
            The Triumvirate of Power
          </h2>
          <p className="text-lg text-zinc-600 w-full font-medium tracking-tight leading-relaxed">
            AI should not just assist developers; it should participate as a peer. Inso code moves beyond basic copilots by separating concerns across the enterprise structure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto relative z-10">
          <FeatureCard
            icon={<Code2 className="w-8 h-8 text-[#0000ff]" />}
            title="Architect"
            description="The Developer's domain. Unfettered access to local execution, compilers, and the terminal."
          />
          <FeatureCard
            icon={<ShieldAlert className="w-8 h-8 text-[#0000ff]" />}
            title="Sentinel"
            description="The Admin's domain. Built-in policy enforcement, live security scanning, and strict roles."
          />
          <FeatureCard
            icon={<LineChart className="w-8 h-8 text-[#0000ff]" />}
            title="Overseer"
            description="The Business Owner's domain. Intelligent resource allocation and deep cloud cost analysis."
          />
        </div>
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
      <p className="text-sm text-zinc-600 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}
