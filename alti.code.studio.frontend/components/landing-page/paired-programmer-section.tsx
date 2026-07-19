"use client";

import React from "react";
import { UserCircle, Code2, TerminalSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function PairedProgrammerSection() {
 return (
 <section className="w-full py-24 bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8  relative overflow-hidden">
 <div className="absolute inset-0    z-0 pointer-events-none" />
 <motion.div
 className="max-w-5xl mx-auto w-full flex flex-col items-center text-center relative z-10"
 initial="hidden"
 variants={{
 visible: { transition: { staggerChildren: 0.1 } },
 }}
 viewport={{ once: true, margin: "-100px" }}
 whileInView="visible"
 >
 {/* Apple-style Headline */}
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
 Your AI Engineering Team
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
 It doesn't replace you. It amplifies you. You are the architect, and
 the
 <br className="hidden md:block" /> swarm is your tireless engineering
 team ready to execute every command.
 </motion.p>

 {/* Simple Features Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
 <FeatureCard
 description="Provide your vision and intent. The AI swarm instantly translates your commands into production code."
 icon={<TerminalSquare className="w-8 h-8 text-[#0000ff]" />}
 title="Command Driven"
 />
 <FeatureCard
 description="You make all executive decisions. The AI swarm handles all your coding, testing, and debugging."
 icon={<UserCircle className="w-8 h-8 text-[#0000ff]" />}
 title="Human in Control"
 />
 <FeatureCard
 description="It reads your entire codebase, learns your unique patterns, and writes code exactly like you do."
 icon={<Code2 className="w-8 h-8 text-[#0000ff]" />}
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
 <div className="mb-6 bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
 {icon}
 </div>
 <h3 className="text-2xl font-bold text-black tracking-tight mb-3">
 {title}
 </h3>
 <p className="text-zinc-600 leading-relaxed font-medium">{description}</p>
 </motion.div>
 );
}
