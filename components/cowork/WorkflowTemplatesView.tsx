"use client";

import { useState } from "react";
import {
  ShieldAlert,
  GitPullRequest,
  Play,
  Sliders,
  CheckCircle2,
  Layers,
  Flame,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface WorkflowTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  agent: string;
  estimatedTime: string;
  icon: any;
  accentColor: string;
  badge?: string;
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "wf-security-audit",
    name: "Full SAST Security & Dependency Audit",
    category: "Security",
    description:
      "Scan AST for SQL injections, check package licenses against sovereign whitelists, and parameterize exposed queries.",
    agent: "security-reviewer",
    estimatedTime: "~3 minutes",
    icon: ShieldAlert,
    accentColor: "from-blue-600 to-indigo-600",
    badge: "Recommended",
  },
  {
    id: "wf-pr-review",
    name: "Autonomous PR Code Quality & Refactor",
    category: "Code Quality",
    description:
      "Inspect uncommitted or PR changes for immutability, missing try/catch blocks, and deep nesting violations.",
    agent: "code-reviewer",
    estimatedTime: "~5 minutes",
    icon: GitPullRequest,
    accentColor: "from-[#0000ff] to-purple-600",
    badge: "Popular",
  },
  {
    id: "wf-tdd-expansion",
    name: "TDD Test Coverage Expansion Loop",
    category: "Testing",
    description:
      "Write failing unit tests first, implement minimal fixes, and enforce 80%+ test coverage target across components.",
    agent: "tdd-guide",
    estimatedTime: "~8 minutes",
    icon: Zap,
    accentColor: "from-emerald-600 to-teal-600",
  },
  {
    id: "wf-harness-audit",
    name: "Repository Harness & Agent Efficiency Audit",
    category: "Ops",
    description:
      "Audit agent tools, cost burn, duplicate cron jobs, and prompt context budget performance.",
    agent: "harness-optimizer",
    estimatedTime: "~4 minutes",
    icon: Sliders,
    accentColor: "from-amber-600 to-orange-600",
  },
];

interface WorkflowTemplatesViewProps {
  onLaunchWorkflow?: (template: WorkflowTemplate) => void;
}

export default function WorkflowTemplatesView({
  onLaunchWorkflow,
}: WorkflowTemplatesViewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate>(
    WORKFLOW_TEMPLATES[0],
  );
  const [maxSteps, setMaxSteps] = useState(10);
  const [modelRoute, setModelRoute] = useState("gemini-3.6-flash");

  const handleLaunch = () => {
    if (onLaunchWorkflow) {
      onLaunchWorkflow(selectedTemplate);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0000ff]/20 border border-[#0000ff]/60 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(0,0,255,0.4)]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide">
              Autonomous Workflow Templates
            </h2>
            <p className="text-xs text-zinc-400">
              Select a pre-built agentic recipe to launch background execution
            </p>
          </div>
        </div>

        <span className="text-xs text-blue-400 font-semibold flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
          <Flame className="w-3.5 h-3.5" />4 Templates Ready
        </span>
      </div>

      {/* Grid of Templates & Launcher Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Template Cards List */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          {WORKFLOW_TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            const isSelected = selectedTemplate.id === tmpl.id;

            return (
              <div
                key={tmpl.id}
                className={cn(
                  "flex flex-col p-4 bg-zinc-950/80 border rounded-2xl cursor-pointer transition-all duration-200 shadow-md relative overflow-hidden group justify-between gap-4",
                  isSelected
                    ? "border-[#0000ff] bg-[#0000ff]/10 shadow-[0_0_15px_rgba(0,0,255,0.25)]"
                    : "border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40",
                )}
                onClick={() => setSelectedTemplate(tmpl)}
              >
                {tmpl.badge && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#0000ff]/30 text-blue-300 border border-[#0000ff]/60">
                    {tmpl.badge}
                  </span>
                )}

                <div className="flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br p-0.5 shadow-md flex items-center justify-center text-white shrink-0">
                    <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                      {tmpl.category}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-3 mt-1 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 text-[11px] text-zinc-400">
                  <span className="font-mono">{tmpl.estimatedTime}</span>
                  <span className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Configure
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Configuration Launcher Panel */}
        <div className="lg:col-span-5 flex flex-col bg-zinc-950/90 border border-zinc-800/80 rounded-2xl p-5 shadow-xl gap-5 backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
            <div className="w-9 h-9 rounded-xl bg-[#0000ff]/20 border border-[#0000ff]/50 flex items-center justify-center text-blue-400 shrink-0">
              <Sliders className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Configure & Launch Workflow
              </h3>
              <p className="text-xs text-zinc-400">{selectedTemplate.name}</p>
            </div>
          </div>

          {/* Model Route Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Execution Model Tier
            </label>
            <select
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0000ff]"
              value={modelRoute}
              onChange={(e) => setModelRoute(e.target.value)}
            >
              <option value="gemini-3.6-flash">
                Gemini 3.6 Flash (Fastest · Low Latency)
              </option>
              <option value="gemini-3.1-pro">
                Gemini 3.1 Pro (Balanced reasoning)
              </option>
              <option value="claude-opus-4.6">
                Claude Opus 4.6 (Deep Reasoning)
              </option>
            </select>
          </div>

          {/* Max Iterations Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-zinc-300 uppercase tracking-wider">
                Max Execution Steps
              </label>
              <span className="font-mono text-blue-400 font-bold">
                {maxSteps} steps
              </span>
            </div>
            <input
              className="w-full accent-[#0000ff] cursor-pointer"
              max={25}
              min={3}
              type="range"
              value={maxSteps}
              onChange={(e) => setMaxSteps(Number(e.target.value))}
            />
          </div>

          {/* Safety Checklist */}
          <div className="flex flex-col gap-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-xs">
            <span className="text-zinc-400 font-semibold block mb-1">
              Guaranteed Security Controls:
            </span>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Standard Sandbox Mode (Isolation enforced)</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>License compliance filter (MIT / Apache 2.0)</span>
            </div>
          </div>

          {/* Launch Button */}
          <button
            className="w-full py-3 rounded-xl bg-[#0000ff] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#0000ff]/80 transition-all shadow-[0_0_18px_rgba(0,0,255,0.6)] cursor-pointer"
            type="button"
            onClick={handleLaunch}
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Autonomous Workflow</span>
          </button>
        </div>
      </div>
    </div>
  );
}
