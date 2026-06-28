"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useSession } from "next-auth/react";

import DeleteModal from "@/components/delete";
import Subscription from "@/components/dashboard/dashboard-payment/subscription";
import { billingAPI } from "@/lib/enterprise-api";

// Transparent Model Pricing Catalog (Pass-Through)
const pricingCatalog = [
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    provider: "Google Gemini",
    icon: "simple-icons:googlegemini",
    iconColor: "text-[#1A73E8]",
    inputPrice: 0.075, // per 1M tokens
    outputPrice: 0.30, // per 1M tokens
  },
  {
    id: "gemini-3.5-pro",
    name: "Gemini 3.5 Pro",
    provider: "Google Gemini",
    icon: "simple-icons:googlegemini",
    iconColor: "text-[#1A73E8]",
    inputPrice: 1.25,
    outputPrice: 5.00,
  },
  {
    id: "claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic Claude",
    icon: "simple-icons:claude",
    iconColor: "text-[#CC9980]",
    inputPrice: 3.00,
    outputPrice: 15.00,
  },
  {
    id: "claude-opus-4.8",
    name: "Claude Opus 4.8",
    provider: "Anthropic Claude",
    icon: "simple-icons:claude",
    iconColor: "text-[#CC9980]",
    inputPrice: 15.00,
    outputPrice: 75.00,
  },
  {
    id: "claude-fable-5",
    name: "Claude Fable 5",
    provider: "Anthropic Claude",
    icon: "simple-icons:claude",
    iconColor: "text-[#CC9980]",
    inputPrice: 15.00,
    outputPrice: 75.00,
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    provider: "OpenAI GPT",
    icon: "simple-icons:openai",
    iconColor: "text-[#10A37F]",
    inputPrice: 0.15,
    outputPrice: 0.60,
  },
  {
    id: "gpt-5.5-pro",
    name: "GPT-5.5 Pro",
    provider: "OpenAI GPT",
    icon: "simple-icons:openai",
    iconColor: "text-[#10A37F]",
    inputPrice: 2.50,
    outputPrice: 10.00,
  },
  {
    id: "gpt-5.5-thinking",
    name: "GPT-5.5 Thinking",
    provider: "OpenAI GPT",
    icon: "simple-icons:openai",
    iconColor: "text-[#10A37F]",
    inputPrice: 15.00,
    outputPrice: 75.00,
  },
];

const fallbackUsageReport = {
  totalTokens: 3224050,
  totalCost: 18.45,
  allowance: 5000000,
  usagePercent: 64,
  byModel: [
    { name: "gpt-5.5-pro", tokens: 1450000, input: 1100000, output: 350000, cost: 6.25 },
    { name: "gemini-3.5-flash", tokens: 1200000, input: 900000, output: 300000, cost: 0.16 },
    { name: "claude-sonnet-4.6", tokens: 412000, input: 300000, output: 112000, cost: 2.58 },
    { name: "gpt-5.5-thinking", tokens: 162050, input: 100000, output: 62050, cost: 4.90 },
  ],
};

const fallbackAccount = {
  planName: "Professional",
  monthlyAllowance: 5000000,
  tokensUsed: 3224050,
  tokensRemaining: 1775950,
  prepaidBalance: 125.50,
  currentPeriodStart: "2026-06-01T00:00:00Z",
  currentPeriodEnd: "2026-06-30T23:59:59Z",
};

function BillingPage() {
  const { data: session } = useSession();
  const [isCardDetails, setCardDetails] = useState(true);
  const [isModel, setModel] = useState(false);
  const [isCardRemoving, setCardRemoving] = useState(false);

  // Live usage report states
  const [loading, setLoading] = useState(true);
  const [billingAccount, setBillingAccount] = useState<any>(fallbackAccount);
  const [usageReport, setUsageReport] = useState<any>(fallbackUsageReport);

  // Model Pricing Filter
  const [providerFilter, setProviderFilter] = useState<string>("All");

  // Cost Calculator states
  const [calcModel, setCalcModel] = useState<string>("gpt-5.5-pro");
  const [calcInput, setCalcInput] = useState<string>("100000");
  const [calcOutput, setCalcOutput] = useState<string>("20000");
  const [calcResult, setCalcResult] = useState<any>({ inputCost: 0.25, outputCost: 0.20, totalCost: 0.45 });

  useEffect(() => {
    async function fetchBillingData() {
      try {
        const tenantId = (session?.user as any)?.tenantId || "default_tenant";
        const [acct, report] = await Promise.all([
          billingAPI.account(tenantId),
          billingAPI.usage(tenantId),
        ]);
        if (acct) setBillingAccount(acct);
        if (report) {
          // Map backend report items and calculate costs
          const byModelMapped = (report.byModel || []).map((m: any) => {
            const pricing = pricingCatalog.find(p => p.id === m.name);
            const inputTokens = Math.round(m.tokens * 0.7); // estimate division
            const outputTokens = Math.round(m.tokens * 0.3);
            const inputCost = pricing ? (inputTokens / 1000000) * pricing.inputPrice : 0;
            const outputCost = pricing ? (outputTokens / 1000000) * pricing.outputPrice : 0;
            return {
              name: m.name,
              tokens: m.tokens,
              input: inputTokens,
              output: outputTokens,
              cost: Number((inputCost + outputCost).toFixed(2)),
            };
          });
          
          setUsageReport({
            totalTokens: report.totalTokens || 0,
            totalCost: report.totalCost || 0,
            allowance: report.allowance || 5000000,
            usagePercent: report.usagePercent || 0,
            byModel: byModelMapped.length ? byModelMapped : fallbackUsageReport.byModel,
          });
        }
      } catch (err) {
        console.warn("Using fallback high-fidelity billing info: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBillingData();
  }, [session]);

  // Recalculate cost inside calculator
  useEffect(() => {
    const selected = pricingCatalog.find((p) => p.id === calcModel);
    if (!selected) return;

    const inCount = parseFloat(calcInput) || 0;
    const outCount = parseFloat(calcOutput) || 0;

    const inputCost = (inCount / 1000000) * selected.inputPrice;
    const outputCost = (outCount / 1000000) * selected.outputPrice;
    const totalCost = inputCost + outputCost;

    setCalcResult({
      inputCost: parseFloat(inputCost.toFixed(4)),
      outputCost: parseFloat(outputCost.toFixed(4)),
      totalCost: parseFloat(totalCost.toFixed(4)),
    });
  }, [calcModel, calcInput, calcOutput]);

  const handleClose = () => {
    setCardRemoving(false);
  };

  const handleRemove = () => {
    setCardDetails(false);
    setCardRemoving(false);
  };

  const handleSubmit = () => {
    setModel(false);
    setCardDetails(true);
  };

  const filteredCatalog = pricingCatalog.filter((item) => {
    if (providerFilter === "All") return true;
    return item.provider === providerFilter;
  });

  return (
    <div className="w-full min-h-screen p-8 bg-[#0d1117] text-white font-sans overflow-x-hidden">
      {/* Premium Hero Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-[800] tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Billing & Token pricing
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-xl">
            Sovereign platform seat subscriptions are flat-rate, and model execution usage costs are passed through transparently at base wholesale pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Chip className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 font-semibold" variant="flat">
            Active Subscription
          </Chip>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Platform Subscription Plan */}
        <Card className="bg-[#161b22]/70 backdrop-blur-md border border-gray-800 shadow-xl rounded-2xl">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400">Platform Seat</span>
              <Icon className="text-2xl text-blue-400" icon="lucide:user-check" />
            </div>
            <h3 className="text-2xl font-[800] text-white">
              {billingAccount?.planName || "Starter"} Plan
            </h3>
            <p className="text-lg font-bold text-blue-400 mt-1">$149.00 / seat / month</p>
            <div className="mt-4 pt-4 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-400">
              <span>Next Invoice: July 01, 2026</span>
              <span className="text-green-400 font-semibold">● Paid</span>
            </div>
          </CardBody>
        </Card>

        {/* Card 2: Prepaid Token Balance */}
        <Card className="bg-[#161b22]/70 backdrop-blur-md border border-gray-800 shadow-xl rounded-2xl">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400">Prepaid Token Credit</span>
              <Icon className="text-2xl text-green-400" icon="lucide:wallet" />
            </div>
            <h3 className="text-2xl font-[800] text-white">
              ${billingAccount?.prepaidBalance?.toFixed(2) || "0.00"}
            </h3>
            <p className="text-xs text-gray-400 mt-1">Available balance for auto-refill pass-through</p>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl w-full">
                Add Balance
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Card 3: Total Cumulative Cost */}
        <Card className="bg-[#161b22]/70 backdrop-blur-md border border-gray-800 shadow-xl rounded-2xl">
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-400">Monthly Model Usage</span>
              <Icon className="text-2xl text-purple-400" icon="lucide:bar-chart-3" />
            </div>
            <h3 className="text-2xl font-[800] text-white">
              ${usageReport?.totalCost?.toFixed(2) || "0.00"}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              For {usageReport?.totalTokens?.toLocaleString() || 0} tokens consumed this cycle
            </p>
            <div className="mt-4 pt-4 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-400">
              <span>Wholesale pass-through pricing</span>
              <span className="text-indigo-400 font-semibold">Transparent</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Grid: Token Counter (Left) & Pricing Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Token Counter & Breakdown (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-[#161b22]/50 border border-gray-800 shadow-xl rounded-2xl p-6">
            <h3 className="text-xl font-[800] text-white mb-6 flex items-center gap-2">
              <Icon className="text-blue-400" icon="lucide:calculator" />
              Live Token Usage Counter
            </h3>

            {/* Token Allowance Bar */}
            <div className="space-y-2 mb-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Token Allowance Used</span>
                <span className="text-white font-semibold">
                  {usageReport?.totalTokens?.toLocaleString()} / {billingAccount?.monthlyAllowance?.toLocaleString()}
                </span>
              </div>
              <Progress
                aria-label="Token Usage Progress"
                value={usageReport?.usagePercent || 0}
                className="h-2.5 rounded-full"
                classNames={{
                  indicator: "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500",
                  track: "bg-gray-800",
                }}
              />
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>Resetting in 3 days</span>
                <span>{usageReport?.usagePercent || 0}% Consumed</span>
              </div>
            </div>

            {/* Model Breakdown */}
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Breakdown by Model
            </h4>
            <div className="space-y-4">
              {usageReport?.byModel?.map((m: any, index: number) => {
                const catalogItem = pricingCatalog.find((p) => p.id === m.name);
                return (
                  <div key={index} className="bg-[#0d1117]/80 rounded-xl p-4 border border-gray-800/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-gray-800/50 flex items-center justify-center">
                        <Icon
                          className={`size-5 ${catalogItem?.iconColor || "text-gray-400"}`}
                          icon={catalogItem?.icon || "lucide:cpu"}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{catalogItem?.name || m.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {m.input?.toLocaleString()} in / {m.output?.toLocaleString()} out
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{m.tokens?.toLocaleString()} tokens</p>
                      <p className="text-xs text-green-400 font-medium mt-0.5">${m.cost?.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Transparent Cost Estimator Widget */}
          <Card className="bg-[#161b22]/50 border border-gray-800 shadow-xl rounded-2xl p-6">
            <h3 className="text-xl font-[800] text-white mb-2 flex items-center gap-2">
              <Icon className="text-yellow-400" icon="lucide:calculator" />
              Developer Cost Calculator
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Estimate potential wholesale token cost for any workload.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">Select Model</label>
                <select
                  value={calcModel}
                  onChange={(e) => setCalcModel(e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  {pricingCatalog.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">Est. Input Tokens</label>
                <Input
                  size="sm"
                  type="number"
                  value={calcInput}
                  onValueChange={setCalcInput}
                  classNames={{
                    inputWrapper: "bg-[#0d1117] border border-gray-800 group-data-[focus=true]:border-blue-500",
                    input: "text-white",
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">Est. Output Tokens</label>
                <Input
                  size="sm"
                  type="number"
                  value={calcOutput}
                  onValueChange={setCalcOutput}
                  classNames={{
                    inputWrapper: "bg-[#0d1117] border border-gray-800 group-data-[focus=true]:border-blue-500",
                    input: "text-white",
                  }}
                />
              </div>
            </div>

            <div className="bg-[#0d1117] border border-gray-800/80 rounded-xl p-4 grid grid-cols-3 text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Input Cost</p>
                <p className="text-lg font-bold text-white mt-1">${calcResult.inputCost}</p>
              </div>
              <div className="border-x border-gray-800/60">
                <p className="text-xs text-gray-500 uppercase font-semibold">Output Cost</p>
                <p className="text-lg font-bold text-white mt-1">${calcResult.outputCost}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Estimated Total</p>
                <p className="text-lg font-bold text-green-400 mt-1">${calcResult.totalCost}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pricing Catalog (Right 5 cols) */}
        <div className="lg:col-span-5">
          <Card className="bg-[#161b22]/50 border border-gray-800 shadow-xl rounded-2xl p-6 h-full flex flex-col">
            <h3 className="text-xl font-[800] text-white mb-1 flex items-center gap-2">
              <Icon className="text-indigo-400" icon="lucide:table" />
              Transparent pricing
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Prices are passed directly through with absolutely zero markup.
            </p>

            {/* Catalog Filters */}
            <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
              {["All", "OpenAI GPT", "Google Gemini", "Anthropic Claude"].map((p) => (
                <button
                  key={p}
                  onClick={() => setProviderFilter(p)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors shrink-0 ${
                    providerFilter === p
                      ? "bg-blue-600 text-white"
                      : "bg-[#0d1117] text-gray-400 hover:text-white"
                  }`}
                >
                  {p.replace("Google ", "").replace("Anthropic ", "").replace("OpenAI ", "")}
                </button>
              ))}
            </div>

            {/* Pricing List */}
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[500px]">
              {filteredCatalog.map((item, index) => (
                <div key={index} className="bg-[#0d1117] rounded-xl p-4 border border-gray-800/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-gray-800/50 flex items-center justify-center">
                      <Icon className={`size-5 ${item.iconColor}`} icon={item.icon} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{item.provider}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col text-xs font-mono font-medium">
                      <span className="text-gray-400">
                        In: <b className="text-white">${item.inputPrice.toFixed(2)}</b> / 1M
                      </span>
                      <span className="text-gray-400 mt-0.5">
                        Out: <b className="text-white">${item.outputPrice.toFixed(2)}</b> / 1M
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Payment Methods & Billing Invoices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <Card className="bg-[#161b22]/50 border border-gray-800 shadow-xl rounded-2xl p-6">
          <h3 className="text-xl font-[800] text-white mb-4 flex items-center gap-2">
            <Icon className="text-blue-400" icon="lucide:credit-card" />
            Payment Methods
          </h3>
          
          <div className="mt-5">
            {isCardDetails ? (
              <div className="flex items-center justify-between bg-[#0d1117] rounded-xl p-4 border border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Icon className="text-2xl text-blue-400" icon="simple-icons:visa" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Visa ending in 2255</p>
                    <p className="text-xs text-gray-400">Expires 12/28</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold rounded-xl"
                  onClick={() => {
                    setCardRemoving(true);
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl mt-5 w-full"
                onClick={() => {
                  setModel(true);
                }}
              >
                Add Payment Card
              </Button>
            )}
          </div>
        </Card>

        {/* Historical Invoices */}
        <Card className="bg-[#161b22]/50 border border-gray-800 shadow-xl rounded-2xl p-6">
          <h3 className="text-xl font-[800] text-white mb-4 flex items-center gap-2">
            <Icon className="text-blue-400" icon="lucide:receipt" />
            Billing History
          </h3>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2">
            {[
              { date: "Jun 15, 2026", type: "Professional Plan + Model Usage", amount: 167.45 },
              { date: "May 15, 2026", type: "Professional Plan + Model Usage", amount: 181.20 },
              { date: "Apr 15, 2026", type: "Professional Plan + Model Usage", amount: 154.90 },
            ].map((inv, idx) => (
              <div key={idx} className="flex items-center justify-between bg-[#0d1117] rounded-xl p-3 border border-gray-800/80">
                <div>
                  <p className="text-sm font-semibold text-white">{inv.type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{inv.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-white">${inv.amount.toFixed(2)}</span>
                  <Link
                    download
                    className="text-blue-400 text-xs font-semibold underline hover:opacity-80 transition-opacity"
                    href="/assets/pdf/dummy.pdf"
                  >
                    PDF
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {isModel && (
        <div className="absolute right-0 top-0 h-screen w-screen flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white text-black px-7 py-6 h-fit overflow-y-auto rounded-2xl transition-all ease-in-out duration-200">
            <Subscription submit={handleSubmit} />
            <Button
              className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
              onClick={() => setModel(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      {isCardRemoving && (
        <DeleteModal
          isOpen={isCardRemoving}
          title="payment method"
          onClose={handleClose}
          onLogout={handleRemove}
        />
      )}
    </div>
  );
}

export default BillingPage;
