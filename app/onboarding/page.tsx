"use client";

import React, { useState } from "react";
import { Card, CardBody } from "@heroui/card";
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
  Cloud,
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
  { label: "Cloud Provider", icon: Cloud },
  { label: "Deployment Tier", icon: CreditCard },
  { label: "Team Setup", icon: Users },
  { label: "AI Config", icon: Bot },
];

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Government",
  "Other",
];

const CLOUD_PROVIDERS = [
  {
    id: "gcp",
    name: "Google Cloud Platform (GCP)",
    description:
      "Native sovereign execution powered exclusively by Google Cloud Run, Vertex AI, and Cloud SQL.",
    icon: Cloud,
  },
];

const PLANS = [
  {
    id: "multi-tenant",
    name: "GCP Cloud (Shared)",
    price: "$49",
    period: "/mo",
    badge: "Most Popular",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    description: "Shared serverless compute resources.",
    features: [
      "Logically isolated application",
      "Shared compute (Fargate/Cloud Run)",
      "Standard database tier",
      "Standard SLA (99.5%)",
    ],
  },
  {
    id: "single-tenant",
    name: "GCP Dedicated",
    price: "$499",
    period: "/mo",
    badge: "Best Value",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    description: "Dedicated bare-metal hardware. Absolute physical isolation.",
    features: [
      "Physically isolated application",
      "Dedicated Hosts / Sole-Tenant Nodes",
      "Highly Available (Multi-AZ) Database",
      "Enterprise SLA (99.9%)",
    ],
  },
  {
    id: "government",
    name: "GCP Government",
    price: "Custom",
    period: "",
    badge: "Compliance",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    description: "Deployed to GovCloud/Assured Workloads.",
    features: [
      "FedRAMP High Compliant Regions",
      "Strict data residency",
      "Dedicated success engineer",
      "Custom SLA (99.99%)",
    ],
  },
];

const MODELS = [
  {
    id: "premium",
    name: "Premium Model Tier",
    description:
      "Most capable — complex reasoning, code generation, long-context analysis",
  },
  {
    id: "standard",
    name: "Standard Model Tier",
    description:
      "Balanced — fast responses with strong reasoning at lower cost",
  },
  {
    id: "fast",
    name: "Fast Model Tier",
    description:
      "Ultra-fast — high throughput for simple tasks and rapid iteration",
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

  // Step 2 — Cloud
  const [selectedCloud, setSelectedCloud] = useState("aws");

  // Step 3 — Plan
  const [selectedPlan, setSelectedPlan] = useState("multi-tenant");

  // Step 4 — Team
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { email: "", role: "developer" },
  ]);

  // Step 5 — AI Config
  const [defaultModel, setDefaultModel] = useState("premium");
  const [guardrails, setGuardrails] = useState(true);
  const [codeExecution, setCodeExecution] = useState(false);

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { email: "", role: "developer" }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (
    index: number,
    field: keyof TeamMember,
    value: string,
  ) => {
    const updated = [...teamMembers];

    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/v1/onboarding/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          organization: { name: orgName, domain, industry },
          cloudProvider: selectedCloud,
          deploymentTier: selectedPlan,
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
    <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-4">
      {STEPS.map((step, idx) => {
        const StepIcon = step.icon;
        const isActive = idx === currentStep;
        const isComplete = idx < currentStep;

        return (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-2 flex-shrink-0">
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
                className={`w-6 sm:w-10 h-px transition-colors duration-300 flex-shrink-0 ${
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
        <p className="text-sm text-gray-500 mt-2">
          Tell us about your company to get started
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            className="w-full px-4 py-3 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            placeholder="Acme Corporation"
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Domain <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="flex items-center gap-2">
            <Globe className="text-gray-400 shrink-0" size={16} />
            <input
              className="w-full px-4 py-3 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              placeholder="acme.com"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Industry
          </label>
          <select
            className="w-full px-4 py-3 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none cursor-pointer"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
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

  /* ── Step 2: Cloud Selection ─────────────────────────────────────── */
  const renderCloudStep = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-400">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
          <Cloud className="w-7 h-7 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Select Cloud Provider
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Your entire environment and inference will run natively on your chosen
          cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CLOUDS.map((cloud) => {
          const isSelected = selectedCloud === cloud.id;
          const CloudIcon = cloud.icon;

          return (
            <Card
              key={cloud.id}
              isPressable
              className={`relative overflow-visible transition-all duration-300 ${
                isSelected
                  ? "border-2 border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                  : "border border-default-200 dark:border-white/10 hover:border-default-300"
              } bg-white dark:bg-black/40`}
              onPress={() => setSelectedCloud(cloud.id)}
            >
              <CardBody className="p-5">
                <div className="flex items-center justify-between mb-4">
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-auto">
                      <Check className="text-white" size={12} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-default-200 ml-auto" />
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-default-100 dark:bg-white/5 flex items-center justify-center">
                    <CloudIcon
                      className="text-gray-600 dark:text-gray-300"
                      size={20}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {cloud.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-500">{cloud.description}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );

  /* ── Step 3: Plan Selection ─────────────────────────────────────── */
  const renderPlanStep = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-400">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-7 h-7 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Deployment Tier
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Select your hardware isolation level for{" "}
          {CLOUDS.find((c) => c.id === selectedCloud)?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const PlanIcon =
            plan.id === "multi-tenant"
              ? Sparkles
              : plan.id === "single-tenant"
                ? Crown
                : Shield;

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
                      <Check className="text-white" size={12} />
                    </div>
                  )}
                </div>

                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-default-100 dark:bg-white/5 flex items-center justify-center">
                    <PlanIcon
                      className="text-gray-600 dark:text-gray-300"
                      size={20}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
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

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 h-10">
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                    >
                      <Check
                        className="text-emerald-500 shrink-0 mt-0.5"
                        size={14}
                      />
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

  /* ── Step 4: Team Setup ─────────────────────────────────────────── */
  const renderTeamStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7 text-violet-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Invite Your Team
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Add your first team members or skip for now
        </p>
      </div>

      <div className="space-y-3">
        {teamMembers.map((member, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40"
          >
            <input
              className="flex-1 px-3 py-2 rounded-lg bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
              placeholder="colleague@company.com"
              type="email"
              value={member.email}
              onChange={(e) => updateTeamMember(idx, "email", e.target.value)}
            />
            <select
              className="px-3 py-2 rounded-lg border border-default-200 dark:border-white/10 bg-default-50 dark:bg-white/5 text-sm text-gray-700 dark:text-gray-300 focus:outline-none appearance-none cursor-pointer"
              value={member.role}
              onChange={(e) => updateTeamMember(idx, "role", e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="viewer">Viewer</option>
            </select>
            {teamMembers.length > 1 && (
              <button
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                onClick={() => removeTeamMember(idx)}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        onClick={addTeamMember}
      >
        <Plus size={16} />
        Add Another
      </button>
    </div>
  );

  /* ── Step 5: AI Configuration ───────────────────────────────────── */
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
          Set your default model tier and safety preferences for your{" "}
          {selectedCloud.toUpperCase()} deployment.
        </p>
      </div>

      {/* Model Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Model Tier
        </label>
        {MODELS.map((model) => {
          const isSelected = defaultModel === model.id;

          return (
            <button
              key={model.id}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                isSelected
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                  : "border-default-200 dark:border-white/10 bg-white dark:bg-black/40 hover:border-default-300"
              }`}
              onClick={() => setDefaultModel(model.id)}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? "border-primary"
                    : "border-default-300 dark:border-white/20"
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
                <p className="text-xs text-gray-500 mt-0.5">
                  {model.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Toggles */}
      <div className="space-y-4 pt-4 border-t border-default-200 dark:border-white/10">
        <div className="flex items-center justify-between p-4 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40">
          <div className="flex items-center gap-3">
            <Shield className="text-emerald-500" size={18} />
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
            className="transition-colors"
            onClick={() => setGuardrails(!guardrails)}
          >
            {guardrails ? (
              <ToggleRight className="text-emerald-500" size={32} />
            ) : (
              <ToggleLeft
                className="text-gray-300 dark:text-gray-600"
                size={32}
              />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-default-200 dark:border-white/10 bg-white dark:bg-black/40">
          <div className="flex items-center gap-3">
            <Zap className="text-amber-500" size={18} />
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
            className="transition-colors"
            onClick={() => setCodeExecution(!codeExecution)}
          >
            {codeExecution ? (
              <ToggleRight className="text-emerald-500" size={32} />
            ) : (
              <ToggleLeft
                className="text-gray-300 dark:text-gray-600"
                size={32}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────────── */
  const stepRenderers = [
    renderOrgStep,
    renderCloudStep,
    renderPlanStep,
    renderTeamStep,
    renderAIConfigStep,
  ];

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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentStep === 0
                ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                : "text-gray-600 dark:text-gray-300 hover:bg-default-100 dark:hover:bg-white/5"
            }`}
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 3 && (
              <button
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-default-100 dark:hover:bg-white/5 transition-all"
                onClick={() => setCurrentStep(4)}
              >
                Skip
              </button>
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  canProceed()
                    ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 shadow-lg"
                    : "bg-default-200 dark:bg-white/10 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!canProceed()}
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
                disabled={isSubmitting}
                onClick={handleComplete}
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
