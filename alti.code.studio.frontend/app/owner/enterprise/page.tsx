"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Search, ChevronRight, Globe, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { adminAPI } from "@/lib/enterprise-api";

interface TenantInfo {
  id: string;
  name: string;
  domain?: string;
  plan: string;
  status: string;
  owner?: string;
  userCount: number;
}

export default function EnterprisePage() {
  const router = useRouter();
  const { status } = useSession();
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTenants = async () => {
    try {
      const res = await adminAPI.listTenants();
      if (res && Array.isArray(res)) {
        // Filter for Sovereign tier (enterprise plan)
        const enterpriseTenants = res.filter((t: any) => t.plan === "enterprise");
        setTenants(enterpriseTenants);
      }
    } catch (err) {
      console.error("Failed to fetch sovereign tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchTenants();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  // Filter based on search query
  const filteredTenants = tenants.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      (t.domain && t.domain.toLowerCase().includes(query)) ||
      (t.owner && t.owner.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0 animate-fade-in">
      <div className="space-y-4">
        {/* Sticky Header Wrapper */}
        <div className="sticky top-0 z-30 bg-[#F3F4F6] dark:bg-[#0d1117] -mt-4 pt-4 pb-2">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <input
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all shadow-sm text-neutral-850 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
              placeholder="Search Sovereign enterprise accounts..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase shadow-sm">
            <div className="col-span-5">Enterprise Account Name</div>
            <div className="col-span-4">Owner Email</div>
            <div className="col-span-3 text-right pr-12">Members</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="space-y-3 mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
              <p className="text-sm text-neutral-500">
                Loading sovereign environments...
              </p>
            </div>
          ) : filteredTenants.length > 0 ? (
            filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="group grid grid-cols-12 gap-4 px-6 py-5 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-sm transition-all shadow-sm duration-200 hover:border-neutral-350 dark:hover:border-neutral-700 cursor-pointer"
                onClick={() => router.push(`/owner/enterprise/${tenant.id}`)}
              >
                <div className="col-span-5 flex flex-col gap-0.5">
                  <span className="text-neutral-900 dark:text-white font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                    {tenant.name}
                  </span>
                  {tenant.domain && (
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                      <Globe className="w-3 h-3" />
                      <span>{tenant.domain}</span>
                    </div>
                  )}
                </div>

                <div className="col-span-4 flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate">{tenant.owner || "No owner assigned"}</span>
                </div>

                <div className="col-span-3 flex items-center justify-end gap-3 pr-2">
                  <span className="px-3 py-1 text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-full border border-neutral-200/50 dark:border-neutral-750">
                    {tenant.userCount === 1
                      ? "1 member"
                      : `${tenant.userCount} members`}
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              No Sovereign accounts match your search query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
