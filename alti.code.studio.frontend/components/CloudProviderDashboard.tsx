"use client";

import React, { useState } from "react";
import { 
  DollarSign, 
  Key, 
  Network,
  Cpu,
  Plus,
  Eye,
  Trash2,
  Lock,
  CheckCircle2,
  TerminalSquare
} from "lucide-react";

interface CloudProviderDashboardProps {
  providerName: string;
  providerIcon: React.ElementType;
  themeColorClass: string;
  accentColorHex: string;
  mockInstances?: number;
  mockCost?: string;
  mockUptime?: string;
}

export default function CloudProviderDashboard({
  providerName,
  providerIcon: Icon,
  themeColorClass,
  accentColorHex,
}: CloudProviderDashboardProps) {
  const [showKey, setShowKey] = useState<number | null>(null);

  // Mock data for models
  const mockModels = [
    { name: "Text Generation (Large)", tokens: "14.2M", spend: "$42.50" },
    { name: "Text Generation (Fast)", tokens: "8.5M", spend: "$12.00" },
    { name: "Embeddings", tokens: "45.1M", spend: "$8.25" },
    { name: "Vision/Multimodal", tokens: "1.2M", spend: "$18.40" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header Banner */}
      <div className={`relative w-full h-32 rounded-2xl overflow-hidden flex items-center px-8 border border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-900/50`}>
        <div 
          className="absolute top-0 right-0 w-96 h-96 opacity-[0.08] dark:opacity-[0.15] blur-3xl pointer-events-none rounded-full"
          style={{ backgroundColor: accentColorHex, transform: 'translate(20%, -30%)' }}
        />
        
        <div className="relative z-10 flex items-center gap-6 w-full">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700 flex items-center justify-center shrink-0">
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">{providerName}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Usage, Billing & Credentials</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-200 dark:border-green-500/20 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Active
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Monthly Spend", value: "$81.15", icon: DollarSign },
          { label: "Total Tokens Used", value: "69.0M", icon: Cpu },
          { label: "Active API Keys", value: "3", icon: Key },
          { label: "Active SSH Keys", value: "2", icon: TerminalSquare },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</div>
              <div className={`p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-${themeColorClass}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Usage & Spend */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/20">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-neutral-500" />
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Model Usage & Spend</h2>
              </div>
              <span className="text-xs text-neutral-500 font-medium">This Month</span>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800/30 border-b border-neutral-100 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">Model Category</th>
                    <th className="px-5 py-3 font-medium">Tokens</th>
                    <th className="px-5 py-3 font-medium text-right">Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                  {mockModels.map((model, i) => (
                    <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors">
                      <td className="px-5 py-4 font-medium text-neutral-900 dark:text-neutral-200">{model.name}</td>
                      <td className="px-5 py-4 text-neutral-600 dark:text-neutral-400">{model.tokens}</td>
                      <td className="px-5 py-4 text-neutral-900 dark:text-white font-semibold text-right">{model.spend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Credentials */}
        <div className="space-y-6">
          
          {/* API Keys */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/20">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-neutral-500" />
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">API Keys</h2>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                <Plus className="w-3.5 h-3.5" /> New Key
              </button>
            </div>
            <div className="p-5 space-y-4">
              {[
                { name: "Production App", key: "sk-prod-8f92...a1b2", full: "sk-prod-8f92je83mf9201ma1b2", date: "Created Mar 12, 2026" },
                { name: "Development Bot", key: "sk-dev-44x1...p9q0", full: "sk-dev-44x1ldo93mc847p9q0", date: "Created Jun 02, 2026" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white mb-1">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-1 rounded font-mono">
                        {showKey === i ? item.full : item.key}
                      </code>
                      <p className="text-xs text-neutral-500">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShowKey(showKey === i ? null : i)}
                      className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SSH Keys */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/20">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-neutral-500" />
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">SSH Keys</h2>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                <Plus className="w-3.5 h-3.5" /> Add SSH Key
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
                <div className="flex items-start gap-3">
                  <TerminalSquare className="w-8 h-8 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white mb-1">michael-macbook-pro</p>
                    <p className="text-xs text-neutral-500 font-mono">SHA256:d8a9f.../x1b</p>
                    <p className="text-xs text-neutral-400 mt-1">Last used 2 days ago</p>
                  </div>
                </div>
                <button className="p-2 text-neutral-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
