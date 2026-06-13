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
  TerminalSquare,
  FileJson,
  Webhook,
  Fingerprint,
  Building2,
  ChevronDown,
  ChevronUp
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
  // Using a string key formatted as `${categoryId}-${itemIndex}` to track which credential's "Eye" is active
  const [showKey, setShowKey] = useState<string | null>(null);
  
  // Track expanded categories (defaulting to have a few open, others closed)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    api_keys: true,
    iam_pairs: true,
  });

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Mock data for models
  const mockModels = [
    { name: "Text Generation (Large)", tokens: "14.2M", spend: "$42.50" },
    { name: "Text Generation (Fast)", tokens: "8.5M", spend: "$12.00" },
    { name: "Embeddings", tokens: "45.1M", spend: "$8.25" },
    { name: "Vision/Multimodal", tokens: "1.2M", spend: "$18.40" },
  ];

  // Comprehensive mock data for credential types
  const credentialCategories = [
    {
      id: "api_keys",
      title: "Standard API Keys",
      icon: Key,
      items: [
        { name: "Production App", key: "sk-prod-8f92...a1b2", full: "sk-prod-8f92je83mf9201ma1b2", date: "Created Mar 12, 2026" },
        { name: "Development Bot", key: "sk-dev-44x1...p9q0", full: "sk-dev-44x1ldo93mc847p9q0", date: "Created Jun 02, 2026" }
      ]
    },
    {
      id: "iam_pairs",
      title: "Secret Access Keys (IAM)",
      icon: Lock,
      items: [
        { name: "AWS Admin User", key: "AKIAIOSF...Z7E", full: "AKIAIOSFODNN7EXAMPLE", date: "Created Jan 15, 2026" }
      ]
    },
    {
      id: "service_accounts",
      title: "Service Account JSONs",
      icon: FileJson,
      items: [
        { name: "GCP Vertex Engine", key: "gcp-prod-ver...json", full: '{"type": "service_account", "project_id": "production"}', date: "Created Apr 10, 2026" }
      ]
    },
    {
      id: "webhook_secrets",
      title: "Webhook Secrets",
      icon: Webhook,
      items: [
        { name: "Billing Sync Events", key: "whsec_8x9...2mP", full: "whsec_8x9Lkj21PqM2mP", date: "Created Feb 28, 2026" }
      ]
    },
    {
      id: "oauth_tokens",
      title: "OAuth Credentials",
      icon: Fingerprint,
      items: [] // Empty state example
    },
    {
      id: "org_ids",
      title: "Organization / Tenant IDs",
      icon: Building2,
      items: [
        { name: "Primary Org", key: "org-H89s...2xQ", full: "org-H89sJkL21mN2xQ", date: "Created Dec 01, 2025" }
      ]
    },
    {
      id: "ssh_keys",
      title: "SSH Keys",
      icon: TerminalSquare,
      items: [
        { name: "michael-macbook-pro", key: "SHA256:d8a9f.../x1b", full: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC...", date: "Last used 2 days ago" },
        { name: "ci-cd-runner", key: "SHA256:a91mP.../z9q", full: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...", date: "Last used 10 mins ago" }
      ]
    }
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
          { label: "Total Keys Stored", value: "8", icon: Key },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Usage & Spend */}
        <div className="space-y-6 sticky top-6">
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

        {/* Right Column: Credentials Vault */}
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Credentials Vault</h2>
            <p className="text-sm text-neutral-500 mt-1">Manage all authentication and connection secrets for this provider.</p>
          </div>

          {credentialCategories.map((category) => {
            const isExpanded = expandedCategories[category.id];
            
            return (
              <div key={category.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
                {/* Category Header (Clickable Accordion) */}
                <div 
                  onClick={() => toggleCategory(category.id)}
                  className="p-5 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/20 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/40 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <category.icon className="w-5 h-5 text-neutral-500" />
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{category.title}</h2>
                    <span className="bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-bold px-2 py-0.5 rounded-full">
                      {category.items.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                </div>

                {/* Category Content */}
                {isExpanded && (
                  <div className="p-5 space-y-4 border-t border-neutral-200 dark:border-neutral-800">
                    {/* Add New Button */}
                    <div className="flex justify-end mb-2">
                      <button className="flex items-center gap-1 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                        <Plus className="w-3.5 h-3.5" /> New {category.title.split(' ')[0]}
                      </button>
                    </div>

                    {category.items.length === 0 ? (
                      <div className="text-center py-6 bg-neutral-50 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 border-dashed">
                        <p className="text-sm text-neutral-500">No {category.title.toLowerCase()} configured.</p>
                      </div>
                    ) : (
                      category.items.map((item, i) => {
                        const uniqueId = `${category.id}-${i}`;
                        return (
                          <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
                            <div>
                              <p className="text-sm font-bold text-neutral-900 dark:text-white mb-1">{item.name}</p>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-1 rounded font-mono truncate max-w-[200px] sm:max-w-[300px]">
                                  {showKey === uniqueId ? item.full : item.key}
                                </code>
                                <p className="text-xs text-neutral-500 hidden sm:block">{item.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => setShowKey(showKey === uniqueId ? null : uniqueId)}
                                className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                title="Reveal Secret"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                className="p-2 text-neutral-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
