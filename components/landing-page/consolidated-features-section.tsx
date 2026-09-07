"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Cpu, Fingerprint } from "lucide-react";

export default function ConsolidatedFeaturesSection() {
  return (
    <section
      className="w-full py-24 bg-white text-black relative overflow-hidden"
      id="consolidated-features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial="hidden"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            },
          }}
          viewport={{ once: true, margin: "-100px" }}
          whileInView="visible"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-black mb-6">
            Enterprise-Grade Autonomy
          </h2>
          <p className="text-lg text-zinc-600 font-medium tracking-tight leading-relaxed">
            Uncompromising security, deterministic outputs, and complete control
            over your AI workforce.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto relative z-10">
          <FeatureCard
            description="Built for enterprise engineering teams, combining native guardrails and mandatory TDD workflows to guarantee predictable, robust production systems."
            icon={<ShieldCheck className="w-8 h-8 text-[#0000ff]" />}
            title="Deterministic Output"
          />
          <FeatureCard
            description="Clone, modify, and deploy specialized AI agents. Equip your team with custom tools, specific system prompts, and tailored enterprise access permissions."
            icon={<Cpu className="w-8 h-8 text-[#0000ff]" />}
            title="The Agent Forge"
          />
          <FeatureCard
            description="Every execution is sandboxed and recorded. Native DLP rules automatically scan, mask, and redact proprietary secrets before they ever leave your network."
            icon={<Fingerprint className="w-8 h-8 text-[#0000ff]" />}
            title="Cryptographic Ledger"
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
      className="flex flex-col items-start text-left p-8 rounded-3xl bg-zinc-100 hover:bg-zinc-200 transition-all duration-300 relative group overflow-hidden border"
      style={{
        borderColor: "rgba(37, 99, 235, 0.2)",
      }}
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
        <h3 className="text-xl font-bold text-black tracking-tight">{title}</h3>
      </div>
      <p className="text-sm text-zinc-600 leading-relaxed font-medium">
        {description}
      </p>
    </motion.div>
  );
}
