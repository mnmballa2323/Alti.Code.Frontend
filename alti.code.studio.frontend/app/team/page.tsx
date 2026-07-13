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

const getLanguageIcon = (id: string) => {
  switch (id) {
    case "c-expert": return "devicon:c";
    case "cpp-expert": return "devicon:cplusplus";
    case "rust-expert": return "devicon:rust";
    case "zig-expert": return "devicon:zig";
    case "go-expert": return "devicon:go";
    case "assembly-x86-expert": return "devicon:nasm";
    case "assembly-arm-expert": return "devicon:nasm";
    case "d-expert": return "vscode-icons:file-type-dlang";
    case "nim-expert": return "devicon:nim";
    case "carbon-expert": return "devicon:carbon";
    case "mojo-expert": return "vscode-icons:file-type-mojo";
    case "ts-expert": return "devicon:typescript";
    case "js-expert": return "devicon:javascript";
    case "python-expert": return "devicon:python";
    case "php-expert": return "devicon:php";
    case "ruby-expert": return "devicon:ruby";
    case "perl-expert": return "devicon:perl";
    case "lua-expert": return "devicon:lua";
    case "tcl-expert": return "vscode-icons:file-type-tcl";
    case "bash-expert": return "devicon:bash";
    case "powershell-expert": return "vscode-icons:file-type-powershell";
    case "java-expert": return "devicon:java";
    case "csharp-expert": return "devicon:csharp";
    case "kotlin-lang-expert": return "devicon:kotlin";
    case "swift-lang-expert": return "devicon:swift";
    case "objc-expert": return "vscode-icons:file-type-objectivec";
    case "scala-expert": return "devicon:scala";
    case "groovy-expert": return "devicon:groovy";
    case "haskell-expert": return "devicon:haskell";
    case "elixir-lang-expert": return "devicon:elixir";
    case "erlang-expert": return "devicon:erlang";
    case "fsharp-lang-expert": return "devicon:fsharp";
    case "clojure-expert": return "devicon:clojure";
    case "ocaml-expert": return "devicon:ocaml";
    case "lisp-expert": return "vscode-icons:file-type-lisp";
    case "prolog-expert": return "vscode-icons:file-type-prolog";
    case "sql-expert": return "vscode-icons:file-type-sql";
    case "r-expert": return "devicon:r";
    case "julia-expert": return "devicon:julia";
    case "matlab-expert": return "devicon:matlab";
    case "fortran-expert": return "devicon:fortran";
    case "sas-expert": return "vscode-icons:file-type-sas";
    case "cobol-expert": return "devicon:cobol";
    case "solidity-expert": return "devicon:solidity";
    case "vyper-expert": return "devicon:vyper";
    case "html-expert": return "logos:html-5";
    case "css-expert": return "devicon:css3";
    case "graphql-expert": return "logos:graphql";
    case "config-expert": return "logos:aws-config";
    case "latex-expert": return "devicon:latex";
    case "terraform-expert": return "logos:terraform";
    case "unity-expert": return "logos:unity";
    case "unreal-expert": return "logos:unrealengine";
    case "ada-expert": return "vscode-icons:file-type-ada";
    case "delphi-expert": return "devicon:delphi";
    case "vb-expert": return "vscode-icons:file-type-vb";
    case "plsql-expert": return "vscode-icons:file-type-plsql";
    case "abap-expert": return "logos:sap";
    case "vhdl-expert": return "vscode-icons:file-type-vhdl";
    case "actionscript-expert": return "mdi:flash";
    case "coldfusion-expert": return "vscode-icons:file-type-cf";
    case "racket-expert": return "mdi:lambda";
    case "smalltalk-expert": return "mdi:chat-processing-outline";
    case "apex-expert": return "logos:salesforce";
    case "pascal-expert": return "vscode-icons:file-type-pascal";
    case "shopify-liquid-expert": return "logos:shopify";
    case "wordpress-expert": return "logos:wordpress";
    case "webgl-expert": return "logos:webgl";
    case "webrtc-expert": return "logos:webrtc";
    case "firebase-expert": return "logos:firebase";
    case "cloudflare-workers-expert": return "logos:cloudflare-icon";
    case "servicenow-expert": return "logos:servicenow";
    case "sap-expert": return "logos:sap";
    case "gis-expert": return "mdi:map-marker-path";
    case "crypto-architect": return "mdi:shield-key";
    case "plc-expert": return "mdi:robot-industrial";
    case "gcode-expert": return "mdi:printer-3d";
    case "labview-expert": return "vscode-icons:file-type-labview";
    case "angular-expert": return "devicon:angular";
    case "django-expert": return "devicon:django";
    case "fastapi-expert": return "devicon:fastapi";
    case "docker-expert": return "devicon:docker";
    case "clickhouse-expert": return "logos:clickhouse";
    case "android-expert": return "devicon:android";
    case "chief-architect": return "mdi:account-tie";
    case "business-expert": return "mdi:tie";
    case "compliance-expert": return "mdi:shield-check";
    case "devrel-expert": return "mdi:account-group-outline";
    case "a11y-expert": return "mdi:human-wheelchair";
    case "cicd-pipeline": return "mdi:rocket-launch";
    case "enterprise-architect": return "mdi:domain";
    default:
      if (id.includes("typescript") || id.includes("ts-")) return "devicon:typescript";
      if (id.includes("javascript") || id.includes("js-")) return "devicon:javascript";
      if (id.includes("python")) return "devicon:python";
      if (id.includes("rust")) return "devicon:rust";
      if (id.includes("golang") || id.includes("go-")) return "devicon:go";
      if (id.includes("cpp") || id.includes("cplusplus")) return "devicon:cplusplus";
      if (id.includes("c-")) return "devicon:c";
      if (id.includes("assembly")) return "devicon:nasm";
      return "mdi:code-braces";
  }
};

const getLanguageDisplayName = (id: string) => {
  switch (id) {
    case "c-expert": return "C";
    case "cpp-expert": return "C++";
    case "rust-expert": return "Rust";
    case "zig-expert": return "Zig";
    case "go-expert": return "Go";
    case "assembly-x86-expert": return "x86 Assembly";
    case "assembly-arm-expert": return "ARM Assembly";
    case "d-expert": return "D Language";
    case "nim-expert": return "Nim";
    case "carbon-expert": return "Carbon";
    case "mojo-expert": return "Mojo";
    case "ts-expert": return "TypeScript";
    case "js-expert": return "JavaScript";
    case "python-expert": return "Python";
    case "php-expert": return "PHP";
    case "ruby-expert": return "Ruby";
    case "perl-expert": return "Perl";
    case "lua-expert": return "Lua";
    case "tcl-expert": return "Tcl";
    case "bash-expert": return "Bash";
    case "powershell-expert": return "PowerShell";
    case "java-expert": return "Java";
    case "csharp-expert": return "C#";
    case "kotlin-lang-expert": return "Kotlin";
    case "swift-lang-expert": return "Swift";
    case "objc-expert": return "Objective-C";
    case "scala-expert": return "Scala";
    case "groovy-expert": return "Groovy";
    case "haskell-expert": return "Haskell";
    case "elixir-lang-expert": return "Elixir";
    case "erlang-expert": return "Erlang";
    case "fsharp-lang-expert": return "F#";
    case "clojure-expert": return "Clojure";
    case "ocaml-expert": return "OCaml";
    case "lisp-expert": return "Lisp";
    case "prolog-expert": return "Prolog";
    case "sql-expert": return "SQL";
    case "r-expert": return "R";
    case "julia-expert": return "Julia";
    case "matlab-expert": return "MATLAB";
    case "fortran-expert": return "Fortran";
    case "sas-expert": return "SAS";
    case "cobol-expert": return "COBOL";
    case "solidity-expert": return "Solidity";
    case "vyper-expert": return "Vyper";
    case "html-expert": return "HTML";
    case "css-expert": return "CSS";
    case "graphql-expert": return "GraphQL";
    case "config-expert": return "Configuration";
    case "latex-expert": return "LaTeX";
    case "terraform-expert": return "Terraform";
    case "unity-expert": return "Unity Engine";
    case "unreal-expert": return "Unreal Engine";
    case "ada-expert": return "Ada";
    case "delphi-expert": return "Delphi";
    case "vb-expert": return "Visual Basic";
    case "plsql-expert": return "PL/SQL";
    case "abap-expert": return "ABAP";
    case "vhdl-expert": return "VHDL";
    case "plc-expert": return "PLC / Logic";
    case "gcode-expert": return "G-Code";
    case "labview-expert": return "LabVIEW";
    case "crypto-architect": return "Cryptography Architect";
    case "chief-architect": return "Chief Architect";
    case "cicd-pipeline": return "CI/CD Pipeline";
    case "devrel-expert": return "Developer Relations";
    case "a11y-expert": return "Accessibility";
    case "business-expert": return "Business Analyst";
    case "compliance-expert": return "Compliance & Legal";
    case "enterprise-architect": return "Enterprise Architecture";
    default:
      const base = id.split("-")[0];
      return base.charAt(0).toUpperCase() + base.slice(1);
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
  const [activeTab, setActiveTab] = useState<TabType>("language");
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
  const uniqueTeamMembers = Array.from(new Map(teamMembers.map(item => [item.id, item])).values());
  const filteredMembers = uniqueTeamMembers
    .filter((member) => {
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
    })
    .sort((a, b) => {
      const nameA = getLanguageDisplayName(a.id);
      const nameB = getLanguageDisplayName(b.id);
      return nameA.localeCompare(nameB);
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
      <div className="sticky top-0 z-50 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 py-4 -mt-6 pt-6 lg:-mt-10 lg:pt-10 bg-[#FAFAFA]/80 dark:bg-[#09090B]/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-white/5 -mx-6 px-6 lg:-mx-10 lg:px-10">
        {/* Navigation Tab Toggle Slider */}
        <div className="relative flex p-1 bg-zinc-100/80 dark:bg-white/[0.03] backdrop-blur-md rounded-2xl border border-zinc-200/50 dark:border-white/5 self-start shadow-sm">
          <button
            className={`relative px-5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 z-10 whitespace-nowrap ${
              activeTab === "language"
                ? "text-black dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
            onClick={() => {
              setActiveTab("language");
              setActiveCategory("All");
            }}
          >
            Languages
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
            className={`relative px-5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 z-10 whitespace-nowrap ${
              activeTab === "framework"
                ? "text-black dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
            onClick={() => {
              setActiveTab("framework");
              setActiveCategory("All");
            }}
          >
            Frameworks
            {activeTab === "framework" && (
              <motion.div
                layoutId="activeTabSlider"
                className="absolute inset-0 bg-white dark:bg-white/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-zinc-200/30 dark:border-white/10 rounded-xl"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
          </button>
          <button
            className={`relative px-5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 z-10 whitespace-nowrap ${
              activeTab === "role"
                ? "text-black dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
            onClick={() => {
              setActiveTab("role");
              setActiveCategory("All");
            }}
          >
            Roles
            {activeTab === "role" && (
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
              const resolvedIcon = getLanguageIcon(member.id);
              const langIcon = resolvedIcon !== "mdi:code-braces" ? resolvedIcon : null;

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
                            <Icon icon={langIcon} className="w-5 h-5 shrink-0" />
                          ) : (
                            <CategoryIcon size={18} className="shrink-0" />
                          )}
                        </div>
                        
                        {/* Language Name */}
                        <span className="font-bold text-[13px] text-zinc-700 dark:text-zinc-300 truncate">
                          {getLanguageDisplayName(member.id)}
                        </span>
                      </div>
                    </div>


                  </div>

                  {/* Bottom Section: Specialties & Action */}
                  <div className="flex flex-col gap-4 mt-5">
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
