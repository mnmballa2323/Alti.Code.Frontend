"use client";

import React from "react";
import { Globe, Plus, Search, ShieldCheck } from "lucide-react";

export default function TenantsPage() {
  const tenants = [
    { id: 'jpmorgan', name: 'JPMorgan Chase', plan: 'S&P 500', domain: 'jpmorgan.com', region: 'us-east1', compliance: ['SOX', 'PCI-DSS'], status: 'active' },
    { id: 'acme-corp', name: 'Acme Corp', plan: 'Enterprise', domain: 'acme.org', region: 'us-central1', compliance: ['SOC2', 'GDPR'], status: 'active' },
    { id: 'hooli', name: 'Hooli Inc', plan: 'Professional', domain: 'hooli.xyz', region: 'europe-west1', compliance: ['GDPR'], status: 'active' },
    { id: 'stark-ind', name: 'Stark Industries', plan: 'S&P 500', domain: 'stark.com', region: 'us-west2', compliance: ['ITAR', 'NIST'], status: 'active' }
  ];

  return (
    <div className="flex-1 w-full space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Multi-Tenant Management</h2>
          <p className="text-xs text-neutral-400 mt-1">Configure database isolation per workspace and monitor active client boundaries.</p>
        </div>
        <button className="bg-amber-500 hover:bg-amber-600 text-[#0d1117] font-bold text-xs py-2 px-4 rounded-xl transition-all flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#0d1117]" />
          <span>Provision Tenant</span>
        </button>
      </div>

      <div className="flex gap-4 max-w-md bg-[#161b22] border border-neutral-800 rounded-xl px-3 py-2 items-center">
        <Search className="w-4 h-4 text-neutral-500" />
        <input 
          placeholder="Filter tenants by name or ID..." 
          className="bg-transparent border-none outline-none text-xs text-white placeholder-neutral-500 flex-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tenants.map(t => (
          <div key={t.id} className="bg-[#161b22] border border-neutral-800 rounded-2xl p-5 hover:border-amber-500/30 transition-all flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-sm">{t.name}</h3>
                <p className="text-[11px] text-neutral-400 font-mono mt-0.5">{t.domain} • ID: {t.id}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500">
                {t.plan}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-y border-neutral-800/80 my-3 text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Deployment Region</span>
                <span className="font-semibold text-neutral-200 font-mono">{t.region}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Database Routing</span>
                <span className="font-semibold text-neutral-200">Isolated Instance</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex gap-1.5">
                {t.compliance.map(c => (
                  <span key={c} className="flex items-center gap-1 text-[9px] font-semibold text-neutral-350 bg-neutral-800 border border-neutral-700 px-2 py-0.5 rounded-lg">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    <span>{c}</span>
                  </span>
                ))}
              </div>
              <span className="flex items-center gap-1 text-green-400 font-bold uppercase text-[9px]">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>{t.status}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
