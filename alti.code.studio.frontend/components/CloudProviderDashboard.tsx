"use client";

import React, { useState } from "react";
import { 
  Server, 
  Activity, 
  DollarSign, 
  CheckCircle2, 
  Key, 
  Globe, 
  RefreshCcw, 
  Settings,
  ShieldAlert
} from "lucide-react";

interface CloudProviderDashboardProps {
  providerName: string;
  providerIcon: React.ElementType;
  themeColorClass: string;
  accentColorHex: string;
  mockInstances: number;
  mockCost: string;
  mockUptime: string;
}

export default function CloudProviderDashboard({
  providerName,
  providerIcon: Icon,
  themeColorClass,
  accentColorHex,
  mockInstances,
  mockCost,
  mockUptime
}: CloudProviderDashboardProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-10">
      {/* Header Banner */}
      <div className={`relative w-full h-32 rounded-2xl overflow-hidden flex items-center px-8 border border-neutral-200 dark:border-neutral-800 bg-gradient-to-r from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-900/50`}>
        {/* Abstract Background Glow */}
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
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Platform Integration Command Center</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-200 dark:border-green-500/20 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            Connected
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Instances", value: mockInstances, icon: Server },
          { label: "Est. Monthly Cost", value: mockCost, icon: DollarSign },
          { label: "Uptime SLA", value: mockUptime, icon: Activity },
          { label: "Security Alerts", value: "0", icon: ShieldAlert, color: "text-neutral-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</div>
              <div className={`p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 ${stat.color || `text-${themeColorClass}`}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold text-neutral-900 dark:text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Resource Config */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/20">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-neutral-500" />
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">API Configuration</h2>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Access Key ID</label>
                <div className="flex">
                  <div className="bg-neutral-100 dark:bg-neutral-800 px-3 flex items-center justify-center rounded-l-xl border border-r-0 border-neutral-200 dark:border-neutral-700">
                    <Key className="w-4 h-4 text-neutral-400" />
                  </div>
                  <input 
                    type="password" 
                    value="************************"
                    readOnly
                    className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-r-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-800 text-neutral-900 dark:text-neutral-300"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Default Region</label>
                <div className="flex">
                  <div className="bg-neutral-100 dark:bg-neutral-800 px-3 flex items-center justify-center rounded-l-xl border border-r-0 border-neutral-200 dark:border-neutral-700">
                    <Globe className="w-4 h-4 text-neutral-400" />
                  </div>
                  <select className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-r-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-800 text-neutral-900 dark:text-neutral-300 appearance-none">
                    <option>US East (N. Virginia)</option>
                    <option>US West (Oregon)</option>
                    <option>EU (Frankfurt)</option>
                    <option>Asia Pacific (Tokyo)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800 mt-6">
                <button 
                  onClick={handleSync}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isSyncing 
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed"
                      : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white"
                  }`}
                >
                  <RefreshCcw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing..." : "Sync State"}
                </button>
                <button className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-xl text-sm font-semibold transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Activity */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden h-full">
            <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-800/20">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Recent Logs</h2>
              <span className="text-xs text-neutral-500 font-medium">Last 24h</span>
            </div>
            <div className="p-5 space-y-4">
              {[
                { action: "Health check passed", time: "10 min ago", success: true },
                { action: "Instance auto-scaled", time: "2 hours ago", success: true },
                { action: "API key rotated", time: "5 hours ago", success: true },
                { action: "Configuration updated", time: "Yesterday", success: true },
              ].map((log, i) => (
                <div key={i} className="flex gap-3">
                  <div className="relative flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                    {i !== 3 && <div className="w-0.5 h-full bg-neutral-100 dark:bg-neutral-800 mt-2" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-200">{log.action}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
