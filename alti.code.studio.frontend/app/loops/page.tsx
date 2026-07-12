"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Coins,
  Terminal,
  Play,
  Gauge,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Button } from "@heroui/react";

import { TuningTabs } from "@/components/tuning-tabs";
import ChatBotLayout from "@/components/ChatbotLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface SignalDetail {
  present?: boolean;
  paths?: string[];
  count?: number;
  loopSkills?: string[];
  used?: boolean;
  workflows?: boolean;
}

interface Finding {
  level: "fail" | "warn" | "ok";
  message: string;
}

interface AuditResult {
  target: string;
  score: number;
  level: string;
  assessment: string;
  signals: Record<string, SignalDetail>;
  findings: Finding[];
  recommendations: string[];
}

interface Pattern {
  id: string;
  costTier: string;
  cadenceRange: string;
}

interface CostScenario {
  tokensPerRun: number;
  tokensPerDay: number;
  assumptions?: string;
}

interface CostResult {
  patternId: string;
  patternName: string;
  cadence: string;
  level: string;
  runsPerDay: number;
  tokenCostTier: string;
  suggestedDailyCap: number;
  scenarios: {
    noop: CostScenario;
    report: CostScenario;
    action: CostScenario;
    realistic: CostScenario;
  };
  warnings: string[];
}

export default function LoopsPage() {
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState("daily-triage");
  const [selectedTool, setSelectedTool] = useState("claude");
  const [dryRun, setDryRun] = useState(true);

  const [selectedCostLevel, setSelectedCostLevel] = useState("L1");
  const [costResult, setCostResult] = useState<CostResult | null>(null);
  const [loadingCost, setLoadingCost] = useState(false);

  const [scaffoldResult, setScaffoldResult] = useState<string | null>(null);
  const [scaffolding, setScaffolding] = useState(false);

  // Load patterns list and initial audit on mount
  useEffect(() => {
    axios
      .get(`${API_URL}/loop-engineering/patterns`)
      .then((res) => setPatterns(res.data))
      .catch((err) => console.error("Failed to load patterns", err));

    handleAudit();
  }, []);

  // Recalculate cost when pattern or level changes
  useEffect(() => {
    if (!selectedPattern) return;
    setLoadingCost(true);
    axios
      .post(`${API_URL}/loop-engineering/cost`, {
        pattern: selectedPattern,
        level: selectedCostLevel,
      })
      .then((res) => setCostResult(res.data))
      .catch((err) => console.error("Failed to calculate cost", err))
      .finally(() => setLoadingCost(false));
  }, [selectedPattern, selectedCostLevel]);

  const handleAudit = () => {
    setLoadingAudit(true);
    axios
      .post(`${API_URL}/loop-engineering/audit`, {})
      .then((res) => setAuditResult(res.data))
      .catch((err) => console.error("Failed to run audit", err))
      .finally(() => setLoadingAudit(false));
  };

  const handleScaffold = () => {
    setScaffolding(true);
    setScaffoldResult(null);
    axios
      .post(`${API_URL}/loop-engineering/init`, {
        pattern: selectedPattern,
        tool: selectedTool,
        dryRun: dryRun,
      })
      .then((res) => {
        setScaffoldResult(res.data.output);
        // Refresh audit after active scaffolding
        if (!dryRun) {
          handleAudit();
        }
      })
      .catch((err) =>
        setScaffoldResult(`Error: ${err.response?.data?.error || err.message}`),
      )
      .finally(() => setScaffolding(false));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success border-success";
    if (score >= 40) return "text-warning border-warning";

    return "text-danger border-danger";
  };

  const getFindingIcon = (level: string) => {
    switch (level) {
      case "ok":
        return <CheckCircle2 className="w-5 h-5 text-success shrink-0" />;
      case "warn":
        return <AlertTriangle className="w-5 h-5 text-warning shrink-0" />;
      case "fail":
      default:
        return <XCircle className="w-5 h-5 text-danger shrink-0" />;
    }
  };

  return (
    <ChatBotLayout>
      <div className="flex flex-col h-full bg-default-100 dark:bg-default-50">
        {/* Premium header with tab bar */}
        <div className="shrink-0 w-full bg-white/80 dark:bg-[#111111]/90 backdrop-blur-md border-b border-default-200/60 dark:border-white/5 flex items-center justify-center h-14 px-8">
          <TuningTabs />
        </div>

        {/* Dashboard Content grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Main Layout Row: Audit & Cost */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Loop Readiness Audit Section (Left, 7 columns) */}
            <div className="lg:col-span-7 flex flex-col bg-white dark:bg-[#151515] rounded-2xl border border-default-200/60 dark:border-white/5 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Gauge className="w-6 h-6 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Loop Readiness Audit
                  </h2>
                </div>
                <Button
                  isIconOnly
                  isLoading={loadingAudit}
                  title="Run Audit Scan"
                  variant="light"
                  onClick={handleAudit}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {auditResult ? (
                <div className="space-y-6">
                  {/* Score & General Assessment */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 bg-default-100/50 dark:bg-default-50/50 p-4 rounded-xl">
                    {/* Circle Score Gauge */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          className="stroke-default-200 dark:stroke-default-100 fill-none"
                          cx="48"
                          cy="48"
                          r="40"
                          strokeWidth="8"
                        />
                        <circle
                          className={`fill-none transition-all duration-500 ${
                            auditResult.score >= 80
                              ? "stroke-success"
                              : auditResult.score >= 40
                                ? "stroke-warning"
                                : "stroke-danger"
                          }`}
                          cx="48"
                          cy="48"
                          r="40"
                          strokeDasharray={251.2}
                          strokeDashoffset={
                            251.2 - (251.2 * auditResult.score) / 100
                          }
                          strokeWidth="8"
                        />
                      </svg>
                      <span className="absolute text-2xl font-bold text-foreground">
                        {auditResult.score}
                      </span>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-sm font-semibold uppercase tracking-wider text-default-400">
                          Level
                        </span>
                        <span
                          className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            auditResult.level === "L3"
                              ? "bg-success/20 text-success"
                              : auditResult.level === "L2"
                                ? "bg-primary/20 text-primary"
                                : "bg-warning/20 text-warning"
                          }`}
                        >
                          {auditResult.level}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {auditResult.assessment}
                      </p>
                      <p className="text-xs text-default-400">
                        Target: {auditResult.target}
                      </p>
                    </div>
                  </div>

                  {/* Findings Scroll box */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      Scan Findings
                    </h3>
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1 border border-default-100 rounded-lg p-2 bg-default-50/20">
                      {auditResult.findings.map((f, idx) => (
                        <div
                          key={idx}
                          className="flex gap-3 items-start text-sm p-2 rounded-md hover:bg-default-100/30"
                        >
                          {getFindingIcon(f.level)}
                          <span className="text-default-600 dark:text-default-300">
                            {f.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  {auditResult.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        Actionable Suggestions
                      </h3>
                      <ul className="space-y-2">
                        {auditResult.recommendations
                          .slice(0, 4)
                          .map((rec, idx) => (
                            <li
                              key={idx}
                              className="flex gap-2 items-start text-xs text-default-500"
                            >
                              <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Activity className="w-8 h-8 text-default-300 animate-pulse" />
                  <p className="text-sm text-default-400">Scan loading...</p>
                </div>
              )}
            </div>

            {/* Scaffold / Init & Cost Estimation Section (Right, 5 columns) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Loop Scaffolder Card */}
              <div className="bg-white dark:bg-[#151515] rounded-2xl border border-default-200/60 dark:border-white/5 p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <Terminal className="w-6 h-6 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Loop Scaffolding
                  </h2>
                </div>

                <div className="space-y-4 flex-1">
                  {/* Select Pattern */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-default-400">
                      Pattern Template
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-default-200 dark:border-default-100 bg-transparent text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={selectedPattern}
                      onChange={(e) => setSelectedPattern(e.target.value)}
                    >
                      {patterns.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.id} ({p.costTier} cost)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Tool */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-default-400">
                      Agent Tool
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-default-200 dark:border-default-100 bg-transparent text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={selectedTool}
                      onChange={(e) => setSelectedTool(e.target.value)}
                    >
                      <option value="claude">Claude Code (.claude)</option>
                      <option value="grok">Grok (.grok)</option>
                      <option value="opencode">OpenCode (opencode.json)</option>
                    </select>
                  </div>

                  {/* Dry Run / Execution Options */}
                  <div className="flex items-center justify-between bg-default-100/50 dark:bg-default-50/50 p-3 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        Dry Run Mode
                      </span>
                      <span className="text-xs text-default-400">
                        Simulate file additions without writing
                      </span>
                    </div>
                    <input
                      checked={dryRun}
                      className="w-5 h-5 accent-primary cursor-pointer"
                      type="checkbox"
                      onChange={(e) => setDryRun(e.target.checked)}
                    />
                  </div>

                  <Button
                    className="w-full font-semibold rounded-xl"
                    color="primary"
                    isLoading={scaffolding}
                    onClick={handleScaffold}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {dryRun ? "Simulate Scaffolding" : "Scaffold Loop Starter"}
                  </Button>

                  {/* Scaffold Output Box */}
                  {scaffoldResult && (
                    <div className="mt-4">
                      <label className="text-xs font-semibold text-default-400 block mb-1">
                        Execution Output
                      </label>
                      <pre className="p-3 text-xs bg-[#1A1A1A] text-success rounded-lg overflow-x-auto max-h-40 font-mono scrollbar-hide border border-white/5">
                        {scaffoldResult}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Loop Cost Estimation Card */}
              <div className="bg-white dark:bg-[#151515] rounded-2xl border border-default-200/60 dark:border-white/5 p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <Coins className="w-6 h-6 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Token Cost Estimator
                  </h2>
                </div>

                <div className="space-y-4 flex-1">
                  {/* Select Level */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-default-400">
                      Loop Level
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-lg border border-default-200 dark:border-default-100 bg-transparent text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={selectedCostLevel}
                      onChange={(e) => setSelectedCostLevel(e.target.value)}
                    >
                      <option value="L1">L1: Report & Triage only</option>
                      <option value="L2">L2: Autonomous Implementer</option>
                      <option value="L3">L3: Builder & Verifier split</option>
                    </select>
                  </div>

                  {costResult ? (
                    <div className="space-y-4">
                      {/* Grid Stats */}
                      <div className="grid grid-cols-2 gap-3 bg-default-100/30 dark:bg-default-50/30 p-3 rounded-xl text-center">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-default-400">
                            Runs Per Day
                          </span>
                          <span className="text-lg font-bold text-foreground">
                            {costResult.runsPerDay}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-default-400">
                            Daily Token Cap
                          </span>
                          <span className="text-lg font-bold text-foreground">
                            {(costResult.suggestedDailyCap / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>

                      {/* Scenarios cost */}
                      <div className="space-y-2 text-xs">
                        <h4 className="font-semibold text-default-400">
                          Daily Cost Scenarios
                        </h4>
                        <div className="space-y-1.5">
                          <div className="flex justify-between py-1 border-b border-default-100/30">
                            <span className="text-default-500">
                              No-Op / Idle Exit
                            </span>
                            <span className="font-semibold text-foreground">
                              {(
                                costResult.scenarios.noop.tokensPerDay / 1000
                              ).toFixed(0)}
                              k tokens
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-default-100/30">
                            <span className="text-default-500">
                              Realistic Execution
                            </span>
                            <span className="font-semibold text-foreground">
                              {(
                                costResult.scenarios.realistic.tokensPerDay /
                                1000
                              ).toFixed(0)}
                              k tokens
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-default-100/30">
                            <span className="text-default-500">
                              Action & Fix Run
                            </span>
                            <span className="font-semibold text-foreground">
                              {(
                                costResult.scenarios.action.tokensPerDay /
                                1000000
                              ).toFixed(1)}
                              M tokens
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Warnings list */}
                      {costResult.warnings.length > 0 && (
                        <div className="bg-warning/10 p-3 rounded-xl border border-warning/20">
                          <div className="flex gap-2 items-center text-xs font-bold text-warning mb-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Efficiency Warning</span>
                          </div>
                          <ul className="space-y-1">
                            {costResult.warnings.map((w, idx) => (
                              <li
                                key={idx}
                                className="text-[10px] text-warning/90 leading-tight"
                              >
                                • {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Activity className="w-6 h-6 text-default-300 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
