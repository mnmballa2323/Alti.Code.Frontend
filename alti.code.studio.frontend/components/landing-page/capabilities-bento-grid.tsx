"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CapabilitiesBentoGrid() {
 return (
 <section
 className="w-full lg:h-screen lg:min-h-[720px] flex flex-col justify-center bg-white text-black px-4 sm:px-6 lg:px-8  py-16 lg:py-0 overflow-hidden relative"
 id="features"
 >
 <div className="absolute inset-0  /10  z-0 pointer-events-none" />
 <motion.div
 className="max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 xl:gap-10 w-full relative z-10"
 initial="hidden"
 variants={{
 visible: { transition: { staggerChildren: 0.1 } },
 }}
 viewport={{ once: true, margin: "-100px" }}
 whileInView="visible"
 >
 {/* Header */}
 <motion.div
 className="flex flex-col items-center text-center gap-4 max-w-4xl mx-auto"
 variants={{
 hidden: { opacity: 0, y: 30 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
 },
 }}
 >
 <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-black leading-[1.1]">
 Engineered for scale
 </h3>
 <p className="text-lg text-zinc-600 leading-relaxed font-medium">
 Under the hood, inso code uses system level components that coordinate local daemons
 <br className="hidden md:block" />
 for unmatched execution speed, strict enterprise security, and absolute precision.
 </p>
 </motion.div>

 {/* Bento Grid */}
 <div className="grid grid-cols-12 gap-4 lg:gap-4 xl:gap-5 auto-rows-auto lg:auto-rows-[150px] xl:auto-rows-[180px]">
 {/* Card 1: Desktop IPC & CLI */}
 <motion.div
 className="col-span-12 lg:col-span-6 rounded-[32px] bg-zinc-100  border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-200   px-5 py-2.5 xl:px-6 xl:py-3.5 flex flex-col lg:flex-row gap-5 lg:gap-6 justify-between items-center transition-all duration-500 overflow-hidden relative group "
 variants={{
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
 },
 }}
 >

 <div className="flex flex-col gap-2 xl:gap-3 max-w-xs w-full relative z-10">
 <h4 className="text-lg xl:text-xl font-bold tracking-tight text-black">
 Desktop IPC & CLI Steering
 </h4>
 <p className="text-xs xl:text-sm text-zinc-600 leading-relaxed font-medium">
 Inso Code runs tools and modifies code directly on your machine
 via secure local IPC, bypassing slow virtual machines
 completely.
 </p>
 </div>

 {/* Visual Terminal */}
 <div className="flex-1 bg-[#050015] border border-zinc-200 rounded-2xl p-2 xl:p-2.5 font-mono text-[9px] xl:text-[10px] text-zinc-600 flex flex-col justify-between shadow-inner select-none w-full max-w-sm relative z-10">
 <div className="flex items-center gap-1.5 pb-1.5 border-b border-zinc-200 text-zinc-500">
 <span className="w-2 h-2 rounded-full bg-blue-900/50" />
 <span className="w-2 h-2 rounded-full bg-blue-900/50" />
 <span className="w-2 h-2 rounded-full bg-blue-900/50" />
 <span className="ml-2">ipc_stream::localhost:5000</span>
 </div>
 <div>
 <span className="text-zinc-600 mr-1.5">[IPC]</span> connected to
 local daemon v2.0.0
 </div>
 <div>
 <span className="text-zinc-600 mr-1.5">[IPC]</span> running
 subagent: Codebase Researcher
 </div>
 <div className="text-emerald-400 font-semibold">
 <span className="text-zinc-600 mr-1.5">[CLI]</span> cargo test:
 42 passed (481ms)
 </div>
 </div>
 </motion.div>

 {/* Card 2: AST Traversal */}
 <motion.div
 className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-[32px] bg-zinc-100  border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-200   px-5 py-2.5 xl:px-6 xl:py-3.5 flex flex-col justify-center transition-all duration-500 overflow-hidden relative group "
 variants={{
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
 },
 }}
 >

 <div className="flex flex-col gap-2 xl:gap-3 relative z-10">
 <h4 className="text-lg xl:text-xl font-bold tracking-tight text-black">
 AST Traversal Edits
 </h4>
 <p className="text-xs xl:text-sm text-zinc-600 leading-relaxed font-medium">
 Instead of regex matching, agents build Abstract Syntax Trees to surgically modify nodes with precision.
 </p>
 </div>
 </motion.div>

 {/* Card 3: Gossip Mesh Coordination */}
 <motion.div
 className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-[32px] bg-zinc-100  border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-200   px-5 py-2.5 xl:px-6 xl:py-3.5 flex flex-col justify-center transition-all duration-500 overflow-hidden relative group "
 variants={{
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
 },
 }}
 >

 <div className="flex flex-col gap-2 xl:gap-3 relative z-10">
 <h4 className="text-lg xl:text-xl font-bold tracking-tight text-black">
 Gossip Mesh Coordination
 </h4>
 <p className="text-xs xl:text-sm text-zinc-600 leading-relaxed font-medium">
 25,000 specialist agents stay perfectly synchronized via a gossip network, propagating state in sub 10ms.
 </p>
 </div>
 </motion.div>

 {/* Card 4: Semantic Prompt Cache */}
 <motion.div
 className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-[32px] bg-zinc-100  border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-200   px-5 py-2.5 xl:px-6 xl:py-3.5 flex flex-col justify-center transition-all duration-500 overflow-hidden relative group "
 variants={{
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
 },
 }}
 >

 <div className="flex flex-col gap-2 xl:gap-3 relative z-10">
 <h4 className="text-lg xl:text-xl font-bold tracking-tight text-black">
 Semantic Cache
 </h4>
 <p className="text-xs xl:text-sm text-zinc-600 leading-relaxed font-medium">
 Saves up to 80% on inference. Prefix caching detects identical requests and serves them with zero delay.
 </p>
 </div>
 </motion.div>

 {/* Card 5: Git Submodule Auto-Sync */}
 <motion.div
 className="col-span-12 sm:col-span-6 lg:col-span-3 rounded-[32px] bg-zinc-100  border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-200   px-5 py-2.5 xl:px-6 xl:py-3.5 flex flex-col justify-center transition-all duration-500 overflow-hidden relative group "
 variants={{
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
 },
 }}
 >

 <div className="flex flex-col gap-2 xl:gap-3 relative z-10">
 <h4 className="text-lg xl:text-xl font-bold tracking-tight text-black">
 Submodule Auto Sync
 </h4>
 <p className="text-xs xl:text-sm text-zinc-600 leading-relaxed font-medium">
 Our agent automatically coordinates submodules, matching revisions and verifying integrity across repos.
 </p>
 </div>
 </motion.div>

 {/* Card 6: Private Vault */}
 <motion.div
 className="col-span-12 lg:col-span-6 rounded-[32px] bg-zinc-100  border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-200   px-5 py-2.5 xl:px-6 xl:py-3.5 flex flex-col lg:flex-row gap-5 lg:gap-6 justify-between items-center transition-all duration-500 overflow-hidden relative group "
 variants={{
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
 },
 }}
 >

 <div className="flex flex-col gap-2 xl:gap-3 max-w-xs w-full relative z-10">
 <h4 className="text-lg xl:text-xl font-bold tracking-tight text-black">
 Hardware Secure Vault
 </h4>
 <p className="text-xs xl:text-sm text-zinc-600 leading-relaxed font-medium">
 Secrets are locked locally in an encrypted keyring. Agents query
 them on demand, never exposing raw values.
 </p>
 </div>

 {/* Keyring Visual */}
 <div className="w-full max-w-sm h-[100px] lg:h-[95px] xl:h-[115px] bg-[#050015] border border-zinc-200 rounded-2xl p-2 xl:p-3 font-mono text-[9px] xl:text-[10px] text-zinc-600 flex flex-col justify-between shadow-inner select-none relative z-10">
 <div className="flex items-center gap-1.5 pb-1.5 border-b border-zinc-200 text-zinc-500">
 <span className="w-2 h-2 rounded-full bg-blue-900/50" />
 <span className="w-2 h-2 rounded-full bg-blue-900/50" />
 <span className="w-2 h-2 rounded-full bg-blue-900/50" />
 <span className="ml-2">secure_keyring::aes256gcm</span>
 </div>
 <div className="flex justify-between">
 <span className="text-zinc-600">[status]</span>{" "}
 <span className="text-emerald-400 font-semibold">LOCKED</span>
 </div>
 <div className="flex justify-between">
 <span className="text-zinc-600">[keys]</span>{" "}
 <span>3 active identities</span>
 </div>
 <div className="flex justify-between">
 <span className="text-zinc-600">[auth]</span>{" "}
 <span>biometric / hardware pin</span>
 </div>
 </div>
 </motion.div>

      {/* Card 7: SEDE */}
      <motion.div
        className="col-span-12 lg:col-span-6 rounded-[32px] bg-zinc-100  border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-200   px-5 py-2.5 xl:px-6 xl:py-3.5 flex flex-col justify-center transition-all duration-500 overflow-hidden relative group "
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          },
        }}
      >
        <div className="flex flex-col gap-2 xl:gap-3 relative z-10">
          <h4 className="text-lg xl:text-xl font-bold tracking-tight text-black">
            Self Evolving Dev Environment
          </h4>
          <p className="text-xs xl:text-sm text-zinc-600 leading-relaxed font-medium">
            The IDE works while you sleep, autonomously noticing bugs, writing comprehensive test cases, fixing complex issues locally, and seamlessly pushing fully verified commits.
          </p>
        </div>
      </motion.div>

      {/* Card 8: GitOps */}
      <motion.div
        className="col-span-12 lg:col-span-6 rounded-[32px] bg-zinc-100  border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-200   px-5 py-2.5 xl:px-6 xl:py-3.5 flex flex-col justify-center transition-all duration-500 overflow-hidden relative group "
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
          },
        }}
      >
        <div className="flex flex-col gap-2 xl:gap-3 relative z-10">
          <h4 className="text-lg xl:text-xl font-bold tracking-tight text-black">
            Native GitOps & Declarative Infra
          </h4>
          <p className="text-xs xl:text-sm text-zinc-600 leading-relaxed font-medium">
            Deep native integration with Terraform and ArgoCD enables fully automated, highly available continuous deployment directly from Git, while managing your entire cloud infrastructure.
          </p>
        </div>
      </motion.div>

 </div>
 </motion.div>
 </section>
 );
}
