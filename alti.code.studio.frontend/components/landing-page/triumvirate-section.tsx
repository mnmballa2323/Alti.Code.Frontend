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
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            The Triumvirate of Power.
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed font-medium">
            AI should not just assist developers; it should participate as a peer. Alti Code Studio moves beyond basic copilots by separating concerns across the entire enterprise structure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {/* Architect */}
          <motion.div
            className="rounded-[32px] bg-zinc-100 border border-zinc-200 p-8 xl:p-10 flex flex-col gap-6 group hover:bg-zinc-200 transition-colors duration-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
              <Code2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-3">Creation (The Architect)</h3>
              <p className="text-zinc-600 leading-relaxed font-medium">
                The Developer's domain. Unfettered access to the filesystem, terminal, and compilers. Engineered for local execution, speed, and privacy without restrictive cloud latency.
              </p>
            </div>
          </motion.div>

          {/* Sentinel */}
          <motion.div
            className="rounded-[32px] bg-zinc-100 border border-zinc-200 p-8 xl:p-10 flex flex-col gap-6 group hover:bg-zinc-200 transition-colors duration-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-3">Governance (The Sentinel)</h3>
              <p className="text-zinc-600 leading-relaxed font-medium">
                The Admin's domain. Policy enforcement, live security scanning, and strict role management. Compliance is baked into the scaffolding by default, not an afterthought.
              </p>
            </div>
          </motion.div>

          {/* Overseer */}
          <motion.div
            className="rounded-[32px] bg-zinc-100 border border-zinc-200 p-8 xl:p-10 flex flex-col gap-6 group hover:bg-zinc-200 transition-colors duration-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
              <LineChart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-3">Strategy (The Overseer)</h3>
              <p className="text-zinc-600 leading-relaxed font-medium">
                The Business Owner's domain. Cloud infrastructure cost analysis, token usage velocity metrics, and intelligent resource allocation across the agent swarm.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
