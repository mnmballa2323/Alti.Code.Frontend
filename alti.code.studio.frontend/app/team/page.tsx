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

import { teamMembers, TeamMember } from "./teamData";

// Utility to get status color classes
const getStatusClasses = (status: TeamMember["status"]) => {
  switch (status) {
    case "idle":
      return {
        dot: "bg-emerald-500",
        text: "text-emerald-500/80",
        bg: "bg-emerald-500/10 border-emerald-500/20",
      };
    case "active":
      return {
        dot: "bg-blue-500",
        text: "text-blue-500/80",
        bg: "bg-blue-500/10 border-blue-500/20",
      };
    case "testing":
      return {
        dot: "bg-purple-500",
        text: "text-purple-500/80",
        bg: "bg-purple-500/10 border-purple-500/20",
      };
    case "compiling":
      return {
        dot: "bg-amber-500",
        text: "text-amber-500/80",
        bg: "bg-amber-500/10 border-amber-500/20",
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
    // Navigate to the existing chatbot/agent view with query parameters
    router.push(
      `/agents?agentId=${member.id}&name=${encodeURIComponent(member.name)}`,
    );
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-transparent p-6 lg:p-10 font-sans text-gray-900 dark:text-zinc-100 overflow-y-auto">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-medium text-xs tracking-wider uppercase">
            <Sparkles className="animate-pulse" size={14} />
            <span>Virtual Developer Swarm</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-black dark:text-white">
            The Century Team
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
            Choose from our specialized AI engineers covering 120 distinct
            programming language paradigms, systems optimization domains, and
            team execution roles.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:max-w-xs group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <Search size={16} />
          </div>
          <input
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#161b22] text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
            placeholder="Search language, role or skill..."
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // Reset category filter if searching to avoid blank results
              if (activeCategory !== "All") setActiveCategory("All");
            }}
          />
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Navigation Tabs */}
        <div className="flex flex-col gap-5 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div className="flex p-1 bg-zinc-100 dark:bg-[#161b22] rounded-xl self-start border border-zinc-200/50 dark:border-zinc-800/50">
            <button
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "language"
                  ? "bg-white dark:bg-[#0d1117] text-black dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-800/30"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
              onClick={() => {
                setActiveTab("language");
                setActiveCategory("All");
              }}
            >
              Language Codex (60)
            </button>
            <button
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "functional"
                  ? "bg-white dark:bg-[#0d1117] text-black dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-800/30"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
              onClick={() => {
                setActiveTab("functional");
                setActiveCategory("All");
              }}
            >
              Functional Grid (60)
            </button>
          </div>

          {/* Sub-categories Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition-all border ${
                  activeCategory === category
                    ? "bg-black dark:bg-white text-white dark:text-black border-transparent"
                    : "bg-white dark:bg-[#161b22] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Roster Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-16"
        >
          <AnimatePresence mode="popLayout">
            {filteredMembers.map((member, idx) => {
              const statusInfo = getStatusClasses(member.status);
              const CategoryIcon = getCategoryIcon(member.category);

              return (
                <motion.div
                  key={member.id}
                  layout
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#161b22] border border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-400 dark:hover:border-zinc-700/80 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.015)] transition-all duration-300 overflow-hidden"
                  exit={{ opacity: 0, scale: 0.95 }}
                  initial={{ opacity: 0, y: 15 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(idx * 0.02, 0.2),
                  }}
                >
                  {/* Subtle Glowing Background Accent */}
                  <div
                    className="absolute -top-12 -right-12 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-20 dark:opacity-20 group-hover:scale-125 transition-transform duration-500"
                    style={{ backgroundColor: member.accentColor }}
                  />

                  {/* Top Section: Icon, Name & Status */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      {/* Icon with Glowing Border */}
                      <div
                        className="p-2.5 rounded-xl border flex items-center justify-center bg-zinc-50 dark:bg-[#0d1117] transition-all"
                        style={{
                          borderColor: `${member.accentColor}20`,
                          color: member.accentColor,
                          boxShadow: `0 0 10px ${member.accentColor}05`,
                        }}
                      >
                        <CategoryIcon size={18} />
                      </div>

                      {/* Status Indicator */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-medium transition-all ${statusInfo.bg}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} ${member.status !== "idle" ? "animate-pulse" : ""}`}
                        />
                        <span className={statusInfo.text}>
                          {member.statusText}
                        </span>
                      </div>
                    </div>

                    {/* Developer Info */}
                    <div className="flex flex-col gap-0.5 mt-2">
                      <h3 className="font-semibold text-sm text-black dark:text-white leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        {member.role}
                      </p>
                    </div>

                    {/* Bio Description */}
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal min-h-[54px] line-clamp-3">
                      {member.bio}
                    </p>
                  </div>

                  {/* Bottom Section: Specialties & Action */}
                  <div className="flex flex-col gap-4 mt-5">
                    {/* Specialties Tags */}
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 text-[9px] font-semibold rounded bg-zinc-100 dark:bg-[#0d1117]/80 text-zinc-500 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/40"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg bg-zinc-50 hover:bg-black dark:bg-[#0d1117] dark:hover:bg-white text-zinc-700 hover:text-white dark:text-zinc-300 dark:hover:text-black border border-zinc-200 dark:border-zinc-800/60 hover:border-transparent dark:hover:border-transparent transition-all duration-200 group-hover:shadow-sm"
                      onClick={() => handleDeploy(member)}
                    >
                      <span>Deploy Specialist</span>
                      <ArrowUpRight
                        className="opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
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
