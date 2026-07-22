"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Languages, ShieldCheck, Scale } from "lucide-react";
import { motion } from "framer-motion";

const languages = [
  { name: "English (US/UK)", icon: "circle-flags:us" },
  { name: "日本語 (Japanese)", icon: "circle-flags:jp" },
  { name: "中文 (Chinese)", icon: "circle-flags:cn" },
  { name: "Deutsch (German)", icon: "circle-flags:de" },
  { name: "Français (French)", icon: "circle-flags:fr" },
  { name: "Español (Spanish)", icon: "circle-flags:es" },
  { name: "Português (Portuguese)", icon: "circle-flags:pt" },
  { name: "Italiano (Italian)", icon: "circle-flags:it" },
  { name: "Nederlands (Dutch)", icon: "circle-flags:nl" },
  { name: "한국어 (Korean)", icon: "circle-flags:kr" },
  { name: "العربية (Arabic)", icon: "circle-flags:sa" },
];

const jurisdictions = [
  { name: "United States", label: "HIPAA & SOC2", icon: "circle-flags:us" },
  { name: "European Union", label: "GDPR Sovereign", icon: "circle-flags:eu" },
  { name: "Japan", label: "APPI Data Protection", icon: "circle-flags:jp" },
  { name: "Germany", label: "BSI Cloud Security", icon: "circle-flags:de" },
  { name: "France", label: "SecNumCloud Certified", icon: "circle-flags:fr" },
  {
    name: "United Kingdom",
    label: "Cyber Essentials",
    icon: "circle-flags:gb",
  },
  { name: "Canada", label: "PIPEDA Sovereign", icon: "circle-flags:ca" },
  { name: "Singapore", label: "PDPA Compliance", icon: "circle-flags:sg" },
  { name: "Brazil", label: "LGPD Data Privacy", icon: "circle-flags:br" },
  { name: "Australia", label: "Commonwealth Privacy", icon: "circle-flags:au" },
];

// Duplicate lists to enable seamless loop
const marqueeLanguages = [...languages, ...languages, ...languages];
const marqueeJurisdictions = [
  ...jurisdictions,
  ...jurisdictions,
  ...jurisdictions,
];

export default function GlobalReachSection() {
  return (
    <section
      className="w-full py-20 bg-white dark:bg-[#030303] text-black dark:text-white px-4 sm:px-6 lg:px-8 border-none transition-colors duration-300 overflow-hidden relative"
      id="global-reach-section"
    >
      {/* Background visual accents */}
      <div className="absolute inset-0 moving-grid-bg opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/[0.02] blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col gap-12 items-center text-center relative z-10">
        {/* Header Block */}
        <div className="flex flex-col gap-6 max-w-4xl w-full px-4 text-center">
          <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.15] text-zinc-900 dark:text-white">
            Global Intellect.{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Sovereign Security.
            </span>
          </h3>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium max-w-3xl mx-auto">
            Running natively on secure, air-gapped enterprise environments,
            inso code orchestrates complex software development swarms across
            global natural languages and national compliance jurisdictions with
            absolute data privacy.
          </p>
        </div>

        {/* Marquees Container */}
        <div className="w-full flex flex-col gap-5 mt-4 relative">
          {/* Gradient shadows left & right to blur edge transitions */}
          <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-white dark:from-[#030303] to-transparent pointer-events-none z-20" />
          <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-white dark:from-[#030303] to-transparent pointer-events-none z-20" />

          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes scroll-left {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-33.3333%); }
                }
                @keyframes scroll-right {
                  0% { transform: translateX(-33.3333%); }
                  100% { transform: translateX(0); }
                }
                .animate-scroll-left {
                  animation: scroll-left 40s linear infinite;
                  width: max-content;
                }
                .animate-scroll-right {
                  animation: scroll-right 40s linear infinite;
                  width: max-content;
                }
              `,
            }}
          />

          {/* Row 1: Languages (Left Scroll) */}
          <div
            className="relative w-full overflow-hidden py-1.5 select-none"
            id="lang-marquee"
          >
            <div className="flex animate-scroll-left hover:[animation-play-state:paused] gap-4 px-4">
              {marqueeLanguages.map((lang, idx) => (
                <div
                  key={`lang-${idx}`}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 hover:scale-[1.03] transition-all duration-300 cursor-pointer shrink-0"
                >
                  <Icon
                    className="w-5 h-5 shrink-0 object-contain rounded-full shadow-sm"
                    icon={lang.icon}
                  />
                  <span className="text-[13px] md:text-sm font-semibold tracking-tight text-zinc-700 dark:text-zinc-300">
                    {lang.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Jurisdictions (Right Scroll) */}
          <div
            className="relative w-full overflow-hidden py-1.5 select-none"
            id="compliance-marquee"
          >
            <div className="flex animate-scroll-right hover:[animation-play-state:paused] gap-4 px-4">
              {marqueeJurisdictions.map((juri, idx) => (
                <div
                  key={`juri-${idx}`}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900 hover:scale-[1.03] transition-all duration-300 cursor-pointer shrink-0"
                >
                  <Icon
                    className="w-5 h-5 shrink-0 object-contain rounded-full shadow-sm"
                    icon={juri.icon}
                  />
                  <span className="text-[13px] md:text-sm font-semibold tracking-tight text-zinc-700 dark:text-zinc-300">
                    {juri.name}{" "}
                    <span className="mx-1 text-zinc-400 dark:text-zinc-600">
                      |
                    </span>{" "}
                    <span className="font-normal text-zinc-500 dark:text-zinc-500">
                      {juri.label}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bento Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl px-4 mt-8">
          {/* Card 1: Multi-Lingual Context */}
          <motion.div
            className="flex flex-col items-start text-left p-8 rounded-[32px] bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
            id="card-translation"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="p-3.5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-6 border border-blue-500/10">
              <Languages className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
              Cross-Border Translation
            </h4>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Seamlessly translate inline comments, codebases, legacy
              documentation, and ticket instructions across 12+ natural
              languages with high localization accuracy, keeping team updates
              globally unified.
            </p>
          </motion.div>

          {/* Card 2: Sovereign Multi-Cloud */}
          <motion.div
            className="flex flex-col items-start text-left p-8 rounded-[32px] bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
            id="card-multicloud"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="p-3.5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-6 border border-indigo-500/10">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
              Isolated Cloud Operations
            </h4>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Deploy sovereign code execution daemons and agent swarms inside
              local VPC boundaries, strictly respecting regional privacy
              constraints such as GDPR, HIPAA, and SecNumCloud.
            </p>
          </motion.div>

          {/* Card 3: Local Compliance Mapping */}
          <motion.div
            className="flex flex-col items-start text-left p-8 rounded-[32px] bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
            id="card-compliance"
            initial={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="p-3.5 rounded-2xl bg-violet-500/5 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-6 border border-violet-500/10">
              <Scale className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
              Jurisdictional Adaptability
            </h4>
            <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Audit workspace patterns dynamically against localized laws,
              mapping cryptographic keys, software packages, and licenses
              directly to the regulatory standards of each sovereign market.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
