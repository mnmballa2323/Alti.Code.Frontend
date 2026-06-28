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

const DUMMY_ENTERPRISE: TenantInfo[] = [
  {
    id: "jpmorgan-chase",
    name: "JPMorgan Chase (Sovereign)",
    domain: "jpmc.alticodestudio.com",
    plan: "enterprise",
    status: "active",
    owner: "jamie.dimon@jpmchase.com",
    userCount: 120,
  },
  {
    id: "nasa-hq",
    name: "NASA Jet Propulsion Lab",
    domain: "jpl.nasa.gov",
    plan: "enterprise",
    status: "active",
    owner: "director@jpl.nasa.gov",
    userCount: 45,
  },
  {
    id: "dod-sovereign",
    name: "Department of Defense (Sovereign)",
    domain: "pentagon.mil",
    plan: "enterprise",
    status: "active",
    owner: "secdef@pentagon.mil",
    userCount: 300,
  }
];

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
        setTenants(enterpriseTenants.length > 0 ? enterpriseTenants : DUMMY_ENTERPRISE);
      } else {
        setTenants(DUMMY_ENTERPRISE);
      }
    } catch (err) {
      console.error("Failed to fetch sovereign tenants:", err);
      setTenants(DUMMY_ENTERPRISE);
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
            <div className="col-span-4">Enterprise Account Name</div>
            <div className="col-span-3">Owner Email</div>
            <div className="col-span-3">Members</div>
            <div className="col-span-2">Price</div>
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
                <div className="col-span-4 flex flex-col gap-0.5 min-w-0">
                  <span className="text-neutral-900 dark:text-white font-normal overflow-hidden text-ellipsis whitespace-nowrap">
                    {tenant.name}
                  </span>
                  {tenant.domain && (
                    <div className="flex items-center gap-1 text-[11px] text-neutral-455 dark:text-neutral-500 font-normal">
                      <Globe className="w-3 h-3" />
                      <span>{tenant.domain}</span>
                    </div>
                  )}
                </div>

                <div className="col-span-3 flex items-center gap-2 text-neutral-500 dark:text-neutral-400 font-normal min-w-0">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tenant.owner || "No owner assigned"}</span>
                </div>

                <div className="col-span-3 text-neutral-600 dark:text-neutral-400 font-normal">
                  {tenant.userCount === 1
                    ? "1 member"
                    : `${tenant.userCount} members`}
                </div>

                <div className="col-span-2 flex items-center justify-between pr-2">
                  <span className="text-neutral-800 dark:text-neutral-200 font-normal text-sm">
                    $5,000/mo
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors shrink-0" />
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
