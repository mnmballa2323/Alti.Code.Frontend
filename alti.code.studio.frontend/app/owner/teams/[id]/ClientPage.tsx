"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Shield,
  Pencil,
  ChevronDown,
  Search,
} from "lucide-react";
import { useSession } from "next-auth/react";

import { adminAPI, teamAPI } from "@/lib/enterprise-api";
import { useAppSelector, useAppDispatch } from "@/store";
import { setActiveMemberName } from "@/store/uiSlice";

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
  subscriptionPrice?: number;
}

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { status } = useSession();

  const teamId = params.id as string;
  const [tenant, setTenant] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [customPrice, setCustomPrice] = useState("$1,000");
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTenantDetails = async () => {
    try {
      const res = await adminAPI.getTenant(teamId);
      if (res) {
        setTenant(res);
        setMembers(
          (res.users || []).map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.tenantRole || "developer",
            subscriptionPrice: u.subscriptionPrice,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch tenant details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchTenantDetails();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, teamId]);

  const teamName = tenant ? tenant.name : "Dedicated Environment";
  const teamDesc = tenant ? tenant.domain || "Dedicated team environment" : "Loading environment details...";
  const teamAdminEmail = tenant ? tenant.owner || "No owner assigned" : "";

  useEffect(() => {
    if (tenant) {
      dispatch(setActiveMemberName(teamName));
    }
    return () => {
      dispatch(setActiveMemberName(null));
    };
  }, [dispatch, teamName, tenant]);

  const memberPrice =
    members.length > 0 &&
    members[0].subscriptionPrice !== undefined &&
    members[0].subscriptionPrice !== null
      ? members[0].subscriptionPrice
      : 1000;

  // Set default edit price based on first member
  useEffect(() => {
    if (members.length > 0) {
      const first = members[0];
      const priceVal =
        first.subscriptionPrice !== undefined &&
        first.subscriptionPrice !== null
          ? `$${Number(first.subscriptionPrice).toLocaleString("en-US")}`
          : "$1,000";

      setCustomPrice(priceVal);
    }
  }, [editModalOpen, members]);

  const handleSaveTeamPricing = async () => {
    setIsSaving(true);
    try {
      // Update all team members' price in parallel
      await Promise.all(
        members.map((m) => teamAPI.updateMemberPrice(m.id, customPrice))
      );
      setEditModalOpen(false);
      await fetchTenantDetails();
    } catch (err) {
      console.error("Failed to update team pricing:", err);
      alert("Failed to update team pricing. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0 animate-fade-in">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
          <p className="text-sm text-neutral-500">Loading team details...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Team Header card */}
          <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-sm transition-all hover:border-neutral-350 dark:hover:border-neutral-700 hover:shadow-md overflow-hidden">
            <div className="group px-6 py-5 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white leading-none">
                  {teamName}
                </h1>
                <span className="text-sm text-neutral-500">
                  {teamDesc} (Owner: {teamAdminEmail})
                </span>
              </div>

              <div className="relative w-64 h-8 shrink-0">
                {/* Monthly price per member */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-row items-center gap-8 transition-all duration-200 opacity-100 group-hover:opacity-0 group-hover:pointer-events-none">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 rounded-full border border-neutral-200/50 dark:border-neutral-750 whitespace-nowrap leading-none">
                    {members.length} {members.length === 1 ? "Member" : "Members"}
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white leading-none">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    }).format(memberPrice)}
                    /mo
                  </span>
                </div>

                {/* Edit pencil icon */}
                <button
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:scale-105 transition-all w-8 h-8 cursor-pointer opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto duration-200"
                  onClick={() => setEditModalOpen(true)}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            {editModalOpen && (
              <div className="px-6 pb-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161b22]">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">
                      Monthly Price Per Member
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 bg-neutral-100 dark:bg-[#1f242c] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all text-neutral-850 dark:text-neutral-200 appearance-none cursor-pointer pr-10"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                      >
                        <option value="$0">$0</option>
                        <option value="$250">$250</option>
                        <option value="$500">$500</option>
                        <option value="$750">$750</option>
                        <option value="$1,000">$1,000</option>
                        <option value="$1,250">$1,250</option>
                        <option value="$2,000">$2,000</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="px-6 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
                      disabled={isSaving}
                      onClick={() => setEditModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-6 py-3 text-sm font-semibold text-white bg-black hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-2xl transition-colors focus:outline-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      disabled={isSaving}
                      onClick={handleSaveTeamPricing}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <input
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all shadow-sm text-neutral-850 dark:text-neutral-100 placeholder-neutral-450 dark:placeholder-neutral-500"
              placeholder="Search team members..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Members list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.filter(
              (m) =>
                (m.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()))
            ).length > 0 ? (
              members
                .filter(
                  (m) =>
                    (m.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (m.role && m.role.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((member) => (
                  <div
                    key={member.id}
                    className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex items-start gap-4 transition-all hover:border-neutral-350 dark:hover:border-neutral-700 shadow-sm cursor-pointer"
                    onClick={() => router.push(`/owner/team-members/${member.id}`)}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-850 dark:text-neutral-100 truncate text-[15px] group-hover:text-black dark:group-hover:text-white transition-colors">
                          {member.name || member.email.split("@")[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                        <Shield className="w-3.5 h-3.5 shrink-0" />
                        <span className="capitalize truncate">{member.role}</span>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="col-span-2 text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
                No members currently in this team.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
