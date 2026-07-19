"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Cpu,
  Layers,
  Shield,
  Activity,
  Terminal,
  Database,
  ArrowUpRight,
  Code2,
  Cloud,
} from "lucide-react";
import { Icon } from "@iconify/react";

import { teamMembers, TeamMember } from "./teamData";

const getLanguageDisplayName = (id: string) => {
  switch (id) {
    case "c-expert":
      return "C";
    case "cpp-expert":
      return "C++";
    case "rust-expert":
      return "Rust";
    case "zig-expert":
      return "Zig";
    case "go-expert":
      return "Go";
    case "assembly-x86-expert":
      return "x86 Assembly";
    case "assembly-arm-expert":
      return "ARM Assembly";
    case "d-expert":
      return "D Language";
    case "nim-expert":
      return "Nim";
    case "carbon-expert":
      return "Carbon";
    case "mojo-expert":
      return "Mojo";
    case "ts-expert":
      return "TypeScript";
    case "js-expert":
      return "JavaScript";
    case "python-expert":
      return "Python";
    case "php-expert":
      return "PHP";
    case "ruby-expert":
      return "Ruby";
    case "perl-expert":
      return "Perl";
    case "lua-expert":
      return "Lua";
    case "tcl-expert":
      return "Tcl";
    case "bash-expert":
      return "Bash";
    case "powershell-expert":
      return "PowerShell";
    case "java-expert":
      return "Java";
    case "csharp-expert":
      return "C#";
    case "kotlin-lang-expert":
      return "Kotlin";
    case "swift-lang-expert":
      return "Swift";
    case "objc-expert":
      return "Objective-C";
    case "scala-expert":
      return "Scala";
    case "groovy-expert":
      return "Groovy";
    case "haskell-expert":
      return "Haskell";
    case "elixir-lang-expert":
      return "Elixir";
    case "erlang-expert":
      return "Erlang";
    case "fsharp-lang-expert":
      return "F#";
    case "clojure-expert":
      return "Clojure";
    case "ocaml-expert":
      return "OCaml";
    case "lisp-expert":
      return "Lisp";
    case "prolog-expert":
      return "Prolog";
    case "sql-expert":
      return "SQL";
    case "r-expert":
      return "R";
    case "julia-expert":
      return "Julia";
    case "matlab-expert":
      return "MATLAB";
    case "fortran-expert":
      return "Fortran";
    case "sas-expert":
      return "SAS";
    case "cobol-expert":
      return "COBOL";
    case "solidity-expert":
      return "Solidity";
    case "vyper-expert":
      return "Vyper";
    case "html-expert":
      return "HTML";
    case "css-expert":
      return "CSS";
    case "graphql-expert":
      return "GraphQL";
    case "config-expert":
      return "Configuration";
    case "latex-expert":
      return "LaTeX";
    case "terraform-expert":
      return "Terraform";
    case "unity-expert":
      return "Unity Engine";
    case "unreal-expert":
      return "Unreal Engine";
    case "ada-expert":
      return "Ada";
    case "delphi-expert":
      return "Delphi";
    case "vb-expert":
      return "Visual Basic";
    case "plsql-expert":
      return "PL/SQL";
    case "abap-expert":
      return "ABAP";
    case "vhdl-expert":
      return "VHDL";
    case "plc-expert":
      return "PLC / Logic";
    case "gcode-expert":
      return "G-Code";
    case "labview-expert":
      return "LabVIEW";
    case "crypto-architect":
      return "Cryptography Architect";
    case "chief-architect":
      return "Chief Architect";
    case "cicd-pipeline":
      return "CI/CD Pipeline";
    case "devrel-expert":
      return "Developer Relations";
    case "a11y-expert":
      return "Accessibility";
    case "business-expert":
      return "Business Analyst";
    case "compliance-expert":
      return "Compliance & Legal";
    case "enterprise-architect":
      return "Enterprise Architecture";
    case "aws-expert":
      return "AWS";
    case "gcp-expert":
      return "GCP";
    case "ibm-cloud-expert":
      return "IBM";
    case "sap-expert":
      return "SAP";
    case "sap-cloud-expert":
      return "SAP";
    case "ntt-cloud-expert":
      return "NTT";
    default:
      const base = id.split("-")[0];

      return base.charAt(0).toUpperCase() + base.slice(1);
  }
};

// Helper to convert hex to RGB values for custom styling shadow functions
function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(
    shorthandRegex,
    (_, r, g, b) => r + r + g + g + b + b,
  );
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
    case "Cloud":
      return Cloud;
    default:
      return Bot;
  }
};

function TeamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get("q") || "";
  const activeTab = searchParams?.get("tab") || "Language";

  // Filter team members based on search and category
  const uniqueTeamMembers = Array.from(
    new Map(teamMembers.map((item) => [item.id, item])).values(),
  );
  const filteredMembers = uniqueTeamMembers
    .filter((member) => {
      const matchesTab = searchQuery ? true : member.category === activeTab;
      const matchesSearch =
        searchQuery === "" ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.specialties.some((spec) =>
          spec.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      const nameA = a.name.replace(" Specialist AI", "");
      const nameB = b.name.replace(" Specialist AI", "");

      return nameA.localeCompare(nameB);
    });

  const handleDeploy = (member: TeamMember) => {
    router.push(
      `/agents?agentId=${member.id}&name=${encodeURIComponent(member.name)}`,
    );
  };

  return (
    <div className="flex-1 w-full h-screen bg-transparent flex flex-col pt-[52px] pb-0 relative overflow-hidden font-sans text-zinc-900 dark:text-zinc-100">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/5 dark:bg-primary/[0.04] blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-secondary/5 dark:bg-secondary/[0.04] blur-[120px] pointer-events-none animate-pulse duration-[6000ms]" />

      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden px-6 lg:px-10">
        {/* Main Grid Container */}
        <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10 h-full">
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
                const resolvedIcon = member.icon || "mdi:code-braces";
                const langIcon =
                  resolvedIcon !== "mdi:code-braces" ? resolvedIcon : null;

                return (
                  <motion.div
                    key={member.id}
                    layout
                    animate={{ opacity: 1, y: 0 }}
                    className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white/70 dark:bg-[#0f1115]/80 backdrop-blur-md border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all duration-500 overflow-hidden"
                    exit={{ opacity: 0, scale: 0.95 }}
                    initial={{ opacity: 0, y: 15 }}
                    style={
                      {
                        "--accent-color": member.accentColor,
                        "--accent-rgb": accentRgb,
                      } as React.CSSProperties
                    }
                    transition={{
                      duration: 0.25,
                      delay: Math.min(idx * 0.015, 0.15),
                    }}
                  >
                    {/* Top Section: Icon & Name */}
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
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
                              langIcon.startsWith("http") ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  alt="Logo"
                                  className="w-5 h-5 shrink-0 object-contain rounded-[2px]"
                                  src={langIcon}
                                />
                              ) : (
                                <Icon
                                  className="w-5 h-5 shrink-0"
                                  icon={langIcon}
                                />
                              )
                            ) : (
                              <CategoryIcon className="shrink-0" size={18} />
                            )}
                          </div>

                          {/* Language Name */}
                          <span className="font-bold text-[13px] text-zinc-700 dark:text-zinc-300 truncate">
                            {member.name.replace(" Specialist AI", "")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section: Specialties & Action */}
                    <div className="flex flex-col gap-4 mt-5">
                      <button
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/5 hover:bg-[#0B1121] hover:text-white hover:border-[#0B1121] transition-all duration-300 group-hover:shadow-sm"
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
    </div>
  );
}

export default function TeamPage() {
  return (
    <Suspense
      fallback={<div className="flex-1 w-full min-h-screen bg-transparent" />}
    >
      <TeamContent />
    </Suspense>
  );
}
