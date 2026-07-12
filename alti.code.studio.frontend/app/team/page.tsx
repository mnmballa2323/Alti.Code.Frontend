"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bot,
  Sparkles,
  Cpu,
  Layers,
  Shield,
  Activity,
  Terminal,
  Database,
  ArrowUpRight,
  Code2,
} from "lucide-react";

import { Icon } from "@iconify/react";
import { teamMembers, TeamMember } from "./teamData";

// Map ID prefix to specific programming language logos using Iconify devicons
const getLanguageIcon = (id: string) => {
  const lang = id.split("-")[0];
  switch (lang) {
    case "c":
      return "devicon:c";
    case "cpp":
      return "devicon:cplusplus";
    case "rust":
      return "devicon:rust";
    case "zig":
      return "devicon:zig";
    case "go":
      return "devicon:go";
    case "assembly":
      return "mdi:binary";
    case "python":
      return "devicon:python";
    case "typescript":
    case "ts":
      return "devicon:typescript";
    case "javascript":
    case "js":
      return "devicon:javascript";
    case "ruby":
      return "devicon:ruby";
    case "php":
      return "devicon:php";
    case "csharp":
      return "devicon:csharp";
    case "java":
      return "devicon:java";
    case "kotlin":
      return "devicon:kotlin";
    case "swift":
      return "devicon:swift";
    case "html":
      return "devicon:html5";
    case "css":
      return "devicon:css3";
    case "bash":
    case "shell":
      return "devicon:bash";
    case "sql":
    case "postgresql":
    case "postgres":
      return "devicon:postgresql";
    case "haskell":
      return "devicon:haskell";
    case "clojure":
      return "devicon:clojure";
    case "scala":
      return "devicon:scala";
    case "elixir":
      return "devicon:elixir";
    case "lua":
      return "devicon:lua";
    case "perl":
      return "devicon:perl";
    case "cobol":
      return "devicon:cobol";
    case "fortran":
      return "devicon:fortran";
    case "lisp":
      return "devicon:lisp";
    case "prolog":
      return "devicon:prolog";
    case "dart":
      return "devicon:dart";
    case "objectivec":
      return "devicon:objectivec";
    case "r":
      return "devicon:r";
    case "julia":
      return "devicon:julia";
    case "ocaml":
      return "devicon:ocaml";
    case "fsharp":
      return "devicon:fsharp";
    case "erlang":
      return "devicon:erlang";
    case "groovy":
      return "devicon:groovy";
    case "ada":
      return "devicon:ada";
    case "scratch":
      return "devicon:scratch";
    case "solidity":
      return "devicon:solidity";
    case "vyper":
      return "devicon:vyper";
    case "delphi":
      return "devicon:delphi";
    case "matlab":
      return "devicon:matlab";
    case "oracle":
    case "plsql":
      return "devicon:oracle";
    default:
      if (id.includes("typescript")) return "devicon:typescript";
      if (id.includes("javascript")) return "devicon:javascript";
      if (id.includes("python")) return "devicon:python";
      if (id.includes("rust")) return "devicon:rust";
      if (id.includes("golang") || id.includes("go")) return "devicon:go";
      if (id.includes("cpp") || id.includes("cplusplus")) return "devicon:cplusplus";
      if (id.includes("c-")) return "devicon:c";
      if (id.includes("assembly")) return "mdi:binary";
      return null;
  }
};

// Helper to convert hex to RGB values for custom styling shadow functions
function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "124, 58, 237";
}

// Utility to get status color classes
const getStatusClasses = (status: TeamMember["status"]) => {
  switch (status) {
    case "idle":
      return {
        dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
        text: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10 dark:border-emerald-500/20",
      };
    case "active":
      return {
        dot: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
        text: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/10 dark:border-blue-500/20",
      };
    case "testing":
      return {
        dot: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]",
        text: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/10 dark:border-purple-500/20",
      };
    case "compiling":
      return {
        dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
        text: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/10 dark:border-amber-500/20",
      };
  }
};

// Map categories to appropriate icons
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Systems":
      return Cpu;
    case "Web":
      return Code2;
    case "Enterprise":
      return Layers;
    case "Functional":
      return Terminal;
    case "Data":
      return Database;
    case "DevOps":
      return Activity;
    case "Security":
      return Shield;
    default:
      return Bot;
  }
};

export default function TeamPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"language" | "functional">(
    "language",
  );
  const [activeCategory, setActiveCategory] = useState("All");

  // Get unique categories based on active tab
  const categories = [
    "All",
    ...Array.from(
      new Set(
        teamMembers
          .filter((member) => member.type === activeTab)
          .map((member) => member.category),
      ),
    ),
  ];

  // Filter team members based on search, tab, and category
  const filteredMembers = teamMembers.filter((member) => {
    const matchesTab = member.type === activeTab;
    const matchesCategory =
      activeCategory === "All" || member.category === activeCategory;
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.specialties.some((spec) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return matchesTab && matchesCategory && matchesSearch;
  });

  const handleDeploy = (member: TeamMember) => {
    router.push(
      `/agents?agentId=${member.id}&name=${encodeURIComponent(member.name)}`,
    );
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-transparent p-6 lg:p-10 font-sans text-zinc-900 dark:text-zinc-100 overflow-y-auto relative">
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/5 dark:bg-primary/[0.04] blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/5 dark:bg-secondary/[0.04] blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />

      {/* Top Navigation Row (Toggle & Search Bar) */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 relative z-10">
        {/* Navigation Tab Toggle Slider */}
        <div className="relative flex p-1 bg-zinc-100/80 dark:bg-white/[0.03] backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-white/5 self-start shadow-sm">
          <button
            className={`relative px-5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 z-10 ${
              activeTab === "language"
                ? "text-black dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
            onClick={() => {
              setActiveTab("language");
              setActiveCategory("All");
            }}
          >
            Language Codex (60)
            {activeTab === "language" && (
              <motion.div
                layoutId="activeTabSlider"
                className="absolute inset-0 bg-white dark:bg-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-zinc-200/30 dark:border-white/10 rounded-xl"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
          </button>
          <button
            className={`relative px-5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 z-10 ${
              activeTab === "functional"
                ? "text-black dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
            onClick={() => {
              setActiveTab("functional");
              setActiveCategory("All");
            }}
          >
            Functional Grid (60)
            {activeTab === "functional" && (
              <motion.div
                layoutId="activeTabSlider"
                className="absolute inset-0 bg-white dark:bg-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-zinc-200/30 dark:border-white/10 rounded-xl"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Search size={16} />
          </div>
          <input
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-md text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 focus:border-primary transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            placeholder="Search language, role or skill..."
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeCategory !== "All") setActiveCategory("All");
            }}
          />
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">


        {/* Roster Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-16"
        >
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member, idx) => {
              const statusInfo = getStatusClasses(member.status);
              const CategoryIcon = getCategoryIcon(member.category);
              const accentRgb = hexToRgb(member.accentColor);
              const langIcon = member.type === "language" ? getLanguageIcon(member.id) : null;

              return (
                <motion.div
                  key={member.id}
                  layout
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white/70 dark:bg-[#0f1115]/80 backdrop-blur-md border border-zinc-200 dark:border-white/5 hover:!border-[var(--accent-color)] hover:shadow-[0_12px_40px_rgba(var(--accent-rgb),0.15)] dark:hover:shadow-[0_12px_40px_rgba(var(--accent-rgb),0.2)] transition-all duration-500 overflow-hidden"
                  exit={{ opacity: 0, scale: 0.95 }}
                  initial={{ opacity: 0, y: 15 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(idx * 0.015, 0.15),
                  }}
                  style={{
                    "--accent-color": member.accentColor,
                    "--accent-rgb": accentRgb,
                  } as React.CSSProperties}
                >
                  {/* Subtle Glowing Background Accent */}
                  <div
                    className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-[50px] pointer-events-none opacity-0 group-hover:opacity-30 dark:group-hover:opacity-20 scale-75 group-hover:scale-110 transition-all duration-500"
                    style={{ backgroundColor: member.accentColor }}
                  />

                  {/* Top Section: Icon & Name */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      {/* Icon with Glowing Border */}
                      <div
                        className="p-2.5 rounded-xl border flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 transition-all w-9 h-9 shrink-0"
                        style={{
                          borderColor: `${member.accentColor}25`,
                          color: member.accentColor,
                          boxShadow: `0 0 10px ${member.accentColor}08`,
                        }}
                      >
                        {langIcon ? (
                          <Icon icon={langIcon} className="w-5 h-5 shrink-0" />
                        ) : (
                          <CategoryIcon size={18} className="shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Developer Info */}
                    <div className="flex flex-col gap-0.5 mt-2">
                      <h3 className="font-bold text-sm text-black dark:text-white leading-tight flex items-center gap-1.5">
                        {member.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                        {member.role}
                      </p>
                    </div>

                    {/* Bio Description */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal min-h-[54px] line-clamp-3">
                      {member.bio}
                    </p>

                    {/* Active Work Simulation Progress Bar */}
                    {member.status !== "idle" && (
                      <div className="w-full mt-3">
                        <div className="flex justify-between items-center text-[9px] text-zinc-400 mb-1 font-medium">
                          <span>Progress</span>
                          <span>
                            {member.status === "compiling" ? "Compiling build..." : "Running checks..."}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: member.accentColor }}
                            initial={{ width: "15%" }}
                            animate={{
                              width: member.status === "compiling"
                                ? ["25%", "65%", "45%", "90%", "55%"]
                                : ["30%", "55%", "80%", "35%", "95%"]
                            }}
                            transition={{
                              repeat: Infinity,
                              duration: 10,
                              ease: "easeInOut"
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Section: Specialties & Action */}
                  <div className="flex flex-col gap-4 mt-5">
                    {/* Specialties Tags */}
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 text-[9px] font-bold rounded-lg border transition-all"
                          style={{
                            backgroundColor: `${member.accentColor}10`,
                            borderColor: `${member.accentColor}18`,
                            color: member.accentColor,
                          }}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/5 hover:!bg-[var(--accent-color)] hover:!text-white dark:hover:!text-black hover:border-transparent dark:hover:border-transparent hover:shadow-[0_4px_15px_rgba(var(--accent-rgb),0.2)] transition-all duration-300 group-hover:shadow-sm"
                      onClick={() => handleDeploy(member)}
                    >
                      <span>Deploy Specialist</span>
                      <ArrowUpRight
                        className="opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        size={13}
                      />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
