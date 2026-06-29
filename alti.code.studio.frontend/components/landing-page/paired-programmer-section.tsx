"use client";

import React from "react";
import { UserCircle, Code2, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function PairedProgrammerSection() {
  return (
    <section className="w-full py-24 bg-[#030014] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#05001a] via-[#030014] to-[#030014] z-0 pointer-events-none" />
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          visible: { transition: { staggerChildren: 0.1 } }
        }}
        className="max-w-5xl mx-auto w-full flex flex-col items-center text-center relative z-10"
      >
        {/* Apple-style Headline */}
        <motion.h2 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
          }}
          className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6"
        >
          Your AI pair programmer.
        </motion.h2>

        <motion.p 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
          }}
          className="text-xl md:text-2xl text-zinc-400 w-full font-medium tracking-tight mb-16 leading-relaxed"
        >
          It doesn't replace you. It amplifies you. You are the architect, and
          the
          <br className="hidden md:block" /> swarm is your tireless engineering
          team ready to execute every command.
        </motion.p>

        {/* Simple Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <FeatureCard
            description="Provide your vision and intent. The AI swarm instantly translates your commands into production code."
            icon={<TerminalSquare className="w-8 h-8 text-blue-400" />}
            title="Command Driven"
          />
          <FeatureCard
            description="You make all executive decisions. The AI swarm handles all your coding, testing, and debugging."
            icon={<UserCircle className="w-8 h-8 text-blue-400" />}
            title="Human in Control"
          />
          <FeatureCard
            description="It reads your entire codebase, learns your unique patterns, and writes code exactly like you do."
            icon={<Code2 className="w-8 h-8 text-blue-400" />}
            title="Native Integration"
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
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
      }}
      className="flex flex-col items-start text-left p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-purple-500/50 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 relative group overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]"
    >
      <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-blue-600/10 rounded-full blur-[60px] group-hover:bg-blue-500/20 transition-all duration-500" />
      <div className="mb-6 bg-blue-900/30 p-3 rounded-2xl border border-blue-800/50">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white tracking-tight mb-3">
        {title}
      </h3>
      <p className="text-zinc-400 leading-relaxed font-medium">
        {description}
      </p>
    </motion.div>
  );
}
