"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Search, ChevronRight, Globe, User, Plus, X } from "lucide-react";
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

const DUMMY_TEAMS: TenantInfo[] = [
  {
    id: "acme-corp",
    name: "Acme Corp (Dedicated)",
    domain: "acme.alticodestudio.com",
    plan: "starter",
    status: "active",
    owner: "admin@acme.com",
    userCount: 8,
  },
  {
    id: "stark-industries",
    name: "Stark Industries",
    domain: "stark.alticodestudio.com",
    plan: "starter",
    status: "active",
    owner: "pepper.potts@stark.com",
    userCount: 15,
  },
  {
    id: "wayne-enterprises",
    name: "Wayne Enterprises",
    domain: "wayne.alticodestudio.com",
    plan: "starter",
    status: "suspended",
    owner: "lucius.fox@wayne.com",
    userCount: 4,
  }
];

export default function TeamsPage() {
  const router = useRouter();
  const { status } = useSession();
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchTenants = async () => {
    try {
      const res = await adminAPI.listTenants();
      if (res && Array.isArray(res)) {
        // Filter for Dedicated tier (starter plan)
        const starterTenants = res.filter((t: any) => t.plan === "starter");
        setTenants(starterTenants.length > 0 ? starterTenants : DUMMY_TEAMS);
      } else {
        setTenants(DUMMY_TEAMS);
      }
    } catch (err) {
      console.error("Failed to fetch dedicated tenants:", err);
      setTenants(DUMMY_TEAMS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      await adminAPI.createTenant({
        name: newName,
        domain: newDomain || null,
        plan: "starter",
      });
      setNewName("");
      setNewDomain("");
      setIsCreateModalOpen(false);
      await fetchTenants();
    } catch (err) {
      console.error("Failed to create dedicated tenant:", err);
      alert("Failed to create account. Please try again.");
    } finally {
      setIsCreating(false);
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
    <div className="w-full flex flex-col h-full justify-start pt-0 animate-fade-in relative">
      <div className="space-y-4">
        {/* Sticky Header Wrapper */}
        <div className="sticky top-0 z-30 bg-[#F3F4F6] dark:bg-[#0d1117] -mt-4 pt-4 pb-2">
          {/* Search Bar & Create Button */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              <input
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all shadow-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                placeholder="Search Dedicated team accounts..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-semibold text-sm rounded-2xl transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Account</span>
            </button>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase shadow-sm">
            <div className="col-span-4">Team Account Name</div>
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
                Loading dedicated environments...
              </p>
            </div>
          ) : filteredTenants.length > 0 ? (
            filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="group grid grid-cols-12 gap-4 px-6 py-5 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-sm transition-all shadow-sm duration-200 hover:border-neutral-350 dark:hover:border-neutral-700 cursor-pointer"
                onClick={() => router.push(`/owner/teams/${tenant.id}`)}
              >
                <div className="col-span-4 flex items-center min-w-0">
                  <span className="text-neutral-900 dark:text-white font-normal overflow-hidden text-ellipsis whitespace-nowrap">
                    {tenant.name}
                  </span>
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
                    $2,500/mo
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors shrink-0" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              No Dedicated accounts match your search query.
            </div>
          )}
        </div>
      </div>

      {/* Create Account Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/45 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCreateModalOpen(false)}
          />
          
          {/* Modal content */}
          <div className="relative bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in text-neutral-800 dark:text-neutral-100 mx-4">
            <button
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-750 dark:hover:text-white transition-colors cursor-pointer"
              onClick={() => setIsCreateModalOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
              Add Dedicated Account
            </h2>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#1f242c] border border-neutral-200 dark:border-neutral-850 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all text-neutral-800 dark:text-neutral-200"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider mb-2">
                  Custom Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. acme.alticodestudio.com"
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#1f242c] border border-neutral-200 dark:border-neutral-855 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all text-neutral-800 dark:text-neutral-200"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-5 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-3 text-sm font-semibold text-white bg-black hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-2xl transition-colors focus:outline-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
