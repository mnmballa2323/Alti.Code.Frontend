"use client";

import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Building2,
  Globe,
  CreditCard,
  Users,
  Bot,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Crown,
  Shield,
  Plus,
  Trash2,
  Zap,
  Brain,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import { API_URL } from "@/lib/config";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TeamMember {
  email: string;
  role: "admin" | "developer" | "viewer";
}

const STEPS = [
  { label: "Organization", icon: Building2 },
  { label: "Choose Plan", icon: CreditCard },
  { label: "Team Setup", icon: Users },
  { label: "AI Config", icon: Bot },
];

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Government", "Other"];

const PLANS = [
  {
    id: "cloud",
    name: "Cloud",
    price: "$49",
    period: "/mo",
    badge: "Most Popular",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    tokens: "5M tokens",
    agents: "10 agents",
    features: [
      "Shared Vertex AI infrastructure",
      "Community support",
      "Standard SLA (99.5%)",
      "5 concurrent sessions",
      "Basic guardrails",
    ],
  },
  {
    id: "dedicated",
    name: "Dedicated",
    price: "$499",
    period: "/mo",
    badge: "Best Value",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    tokens: "50M tokens",
    agents: "50 agents",
    features: [
      "Dedicated Vertex AI endpoints",
      "Priority support (4hr SLA)",
      "Enterprise SLA (99.9%)",
      "50 concurrent sessions",
      "Advanced guardrails & audit logs",
    ],
  },
  {
    id: "sovereign",
    name: "Sovereign",
    price: "Custom",
    period: "",
    badge: "Enterprise",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    tokens: "500M tokens",
    agents: "500 agents",
    features: [
      "Sovereign GCP deployment (IL5)",
      "Dedicated success engineer",
      "Custom SLA (99.99%)",
      "Unlimited concurrent sessions",
      "Full compliance & data residency",
    ],
  },
];

const MODELS = [
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "Most capable — complex reasoning, code generation, long-context analysis",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Balanced — fast responses with strong reasoning at lower cost",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Ultra-fast — high throughput for simple tasks and rapid iteration",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 — Organization
  const [orgName, setOrgName] = useState("");
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] = useState("Technology");

  // Step 2 — Plan
  const [selectedPlan, setSelectedPlan] = useState("dedicated");

  // Step 3 — Team
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { email: "", role: "developer" },
  ]);

  // Step 4 — AI Config
  const [defaultModel, setDefaultModel] = useState("gemini-2.5-pro");
  const [guardrails, setGuardrails] = useState(true);
  const [codeExecution, setCodeExecution] = useState(false);

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { email: "", role: "developer" }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/onboarding/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          organization: { name: orgName, domain, industry },
          plan: selectedPlan,
          team: teamMembers.filter((m) => m.email.trim() !== ""),
          aiConfig: { defaultModel, guardrails, codeExecution },
        }),
      });
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return orgName.trim().length > 0;
    return true;
  };

  /* ── Step Indicator ─────────────────────────────────────────────── */
  const renderStepper = () => (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((step, idx) => {
        const StepIcon = step.icon;
        const isActive = idx === currentStep;
        const isComplete = idx < currentStep;
        return (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isComplete
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : isActive
                      ? "bg-black dark:bg-white text-white dark:text-black shadow-lg"
                      : "bg-default-100 dark:bg-white/5 text-gray-400"
                }`}
              >
                {isComplete ? <Check size={16} /> : <StepIcon size={16} />}
              </div>
              <span
                className={`text-sm font-medium hidden sm:inline transition-colors duration-300 ${
                  isActive
                    ? "text-gray-900 dark:text-gray-100"
                    : isComplete
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-10 h-px transition-colors duration-300 ${
                  idx < currentStep
                    ? "bg-emerald-400"
                    : "bg-default-200 dark:bg-white/10"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ── Step 1: Organization ───────────────────────────────────────── */
  const renderOrgStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-7 h-7 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Set Up Your Organization
        </h2>
        <p className="text-sm text-gray-500 mt-2">Tell us about your company to get started</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Acme Corporation"
            className="w-full px-4 py-3 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Domain <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="acme.com"
              className="w-full px-4 py-3 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Industry
          </label>
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  /* ── Step 2: Plan Selection ─────────────────────────────────────── */
  const renderPlanStep = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-400">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-7 h-7 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Choose Your Plan
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          All plans run exclusively on Google Cloud Vertex AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const PlanIcon =
            plan.id === "cloud" ? Sparkles : plan.id === "dedicated" ? Crown : Shield;
          return (
            <Card
              key={plan.id}
              isPressable
              className={`relative overflow-visible transition-all duration-300 ${
                isSelected
                  ? "border-2 border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border border-default-200 dark:border-white/10 hover:border-default-300"
              } bg-white dark:bg-black/40`}
              onPress={() => setSelectedPlan(plan.id)}
            >
              <CardBody className="p-5">
                {/* Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${plan.badgeColor}`}
                  >
                    {plan.badge}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-default-100 dark:bg-white/5 flex items-center justify-center">
                    <PlanIcon size={20} className="text-gray-600 dark:text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>

                {/* Token & Agent count */}
                <div className="flex gap-3 mb-4">
                  <span className="text-xs font-medium px-2 py-1 rounded-lg bg-default-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                    {plan.tokens}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-lg bg-default-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                    {plan.agents}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );

  /* ── Step 3: Team Setup ─────────────────────────────────────────── */
  const renderTeamStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7 text-violet-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Invite Your Team
        </h2>
        <p className="text-sm text-gray-500 mt-2">Add your first team members or skip for now</p>
      </div>

      <div className="space-y-3">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40"
          >
            <input
              type="email"
              value={member.email}
              onChange={(e) => updateTeamMember(idx, "email", e.target.value)}
              placeholder="colleague@company.com"
              className="flex-1 px-3 py-2 rounded-lg bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
            />
            <select
              value={member.role}
              onChange={(e) => updateTeamMember(idx, "role", e.target.value)}
              className="px-3 py-2 rounded-lg border border-default-200 dark:border-white/10 bg-default-50 dark:bg-white/5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none appearance-none cursor-pointer"
            >
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="viewer">Viewer</option>
            </select>
            {teamMembers.length > 1 && (
              <button
                onClick={() => removeTeamMember(idx)}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addTeamMember}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <Plus size={16} />
        Add Another
      </button>
    </div>
  );

  /* ── Step 4: AI Configuration ───────────────────────────────────── */
  const renderAIConfigStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-7 h-7 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Configure AI Defaults
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Set your default model and safety preferences
        </p>
      </div>

      {/* Model Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Model
        </label>
        {MODELS.map((model) => {
          const isSelected = defaultModel === model.id;
          return (
            <button
              key={model.id}
              onClick={() => setDefaultModel(model.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                isSelected
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                  : "border-default-200 dark:border-white/10 bg-white dark:bg-black/40 hover:border-default-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? "border-primary" : "border-default-300 dark:border-white/20"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {model.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{model.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-4 border-t border-default-200 dark:border-white/10">
        <div className="flex items-center justify-between p-4 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                AI Guardrails
              </p>
              <p className="text-xs text-gray-500">
                Content filtering and safety checks on all outputs
              </p>
            </div>
          </div>
          <button
            onClick={() => setGuardrails(!guardrails)}
            className="transition-colors"
          >
            {guardrails ? (
              <ToggleRight size={32} className="text-emerald-500" />
            ) : (
              <ToggleLeft size={32} className="text-gray-300 dark:text-gray-600" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40">
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Code Execution
              </p>
              <p className="text-xs text-gray-500">
                Allow agents to execute generated code in sandboxed environments
              </p>
            </div>
          </div>
          <button
            onClick={() => setCodeExecution(!codeExecution)}
            className="transition-colors"
          >
            {codeExecution ? (
              <ToggleRight size={32} className="text-emerald-500" />
            ) : (
              <ToggleLeft size={32} className="text-gray-300 dark:text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────────── */
  const stepRenderers = [renderOrgStep, renderPlanStep, renderTeamStep, renderAIConfigStep];

  return (
    <div className="min-h-screen bg-default-50 dark:bg-[#0A0A0A] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Stepper */}
        {renderStepper()}

        {/* Card */}
        <Card className="bg-white dark:bg-[#111111] border border-default-200 dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/30">
          <CardBody className="p-8">{stepRenderers[currentStep]()}</CardBody>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentStep === 0
                ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                : "text-gray-600 dark:text-gray-300 hover:bg-default-100 dark:hover:bg-white/5"
            }`}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 2 && (
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-default-100 dark:hover:bg-white/5 transition-all"
              >
                Skip
              </button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  canProceed()
                    ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 shadow-lg"
                    : "bg-default-200 dark:bg-white/10 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                {isSubmitting ? "Setting up…" : "Complete Setup"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
