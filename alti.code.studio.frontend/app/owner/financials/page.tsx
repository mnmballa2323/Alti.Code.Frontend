"use client";

import React from "react";
import { DollarSign, Download, HelpCircle, Layers, LineChart, TrendingUp } from "lucide-react";

export default function FinancialsPage() {
  const providers = [
    { name: "Azure OpenAI Foundry", inputTokens: 41200000, outputTokens: 12000000, rps: 84.5, cost: 5410.20, pct: 43 },
    { name: "GCP Vertex AI", inputTokens: 38900000, outputTokens: 10500000, rps: 68.2, cost: 4890.30, pct: 39 },
    { name: "AWS Bedrock", inputTokens: 18500000, outputTokens: 5200000, rps: 31.5, cost: 2180.00, pct: 18 }
  ];

  return (
    <div className="flex-1 w-full space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Financial Dashboard</h2>
          <p className="text-xs text-neutral-400 mt-1">Monitor unified cloud cost allocation, spot instance savings, and overall profit margins.</p>
        </div>
        <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs py-2 px-4 rounded-xl border border-neutral-750 transition-all flex items-center gap-1.5">
          <Download className="w-4 h-4 text-white" />
          <span>Export FinOps Ledger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-5">
          <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block mb-2">Total Monthly Spend</span>
          <div className="text-2xl font-bold text-white">$12,480.50</div>
          <div className="text-[10px] text-green-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>-2.4% vs estimated budget</span>
          </div>
        </div>

        <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-5">
          <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block mb-2">Spot Instance Savings</span>
          <div className="text-2xl font-bold text-green-400">$8,450.00</div>
          <div className="text-[10px] text-neutral-400 font-semibold mt-1">
            GKE Autopilot node optimizations
          </div>
        </div>

        <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-5">
          <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block mb-2">Estimated Margin</span>
          <div className="text-2xl font-bold text-white">48.2%</div>
          <div className="text-[10px] text-green-400 font-semibold mt-1 flex items-center gap-1">
            <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
            <span>Healthy baseline profitability</span>
          </div>
        </div>
      </div>

      <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-500" />
          <span>API Call pricing & allocation</span>
        </h3>
        <div className="space-y-6">
          {providers.map(p => (
            <div key={p.name} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-neutral-800/80 last:border-b-0">
              <div className="flex-1">
                <span className="font-semibold text-white text-xs block mb-1">{p.name}</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  Input: {(p.inputTokens / 1000000).toFixed(1)}M tokens • Output: {(p.outputTokens / 1000000).toFixed(1)}M tokens
                </span>
              </div>
              <div className="w-48 bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${p.pct}%` }}
                />
              </div>
              <div className="w-32 text-right">
                <span className="font-mono text-white text-xs font-semibold block">${p.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-widest">{p.pct}% of total spend</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
