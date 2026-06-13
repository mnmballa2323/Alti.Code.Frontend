"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Mail, Shield, User, ArrowLeft, Pencil, X, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";

import { teamAPI } from "@/lib/enterprise-api";
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
  const currentUserFromStore = useAppSelector((state) => state.user.data) as any;
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([
    {
      id: "2",
      name: "Ada Lovelace",
      email: "ada.lovelace@alticodestudio.com",
      role: "admin",
    },
    {
      id: "4",
      name: "Alan Turing",
      email: "alan.turing@alticodestudio.com",
      role: "manager",
    },
    {
      id: "3",
      name: "Grace Hopper",
      email: "grace.hopper@alticodestudio.com",
      role: "developer",
    },
    {
      id: "1",
      name: "Jules Verne",
      email: "jules.verne@alticodestudio.com",
      role: "developer",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [customPrice, setCustomPrice] = useState("$1,000");
  const [isSaving, setIsSaving] = useState(false);

  let teamName = "Team Directory";
  let teamDesc = "Workspace team members";

  if (teamId === "engineering") {
    teamName = "Engineering Team";
    teamDesc = "Core platform engineering and development";
  } else if (teamId === "product-design") {
    teamName = "Product & Design Team";
    teamDesc = "Product management and UI/UX design";
  } else if (teamId === "ops-support") {
    teamName = "Operations & Support Team";
    teamDesc = "Infrastructure, security, and customer support";
  }

  useEffect(() => {
    dispatch(setActiveMemberName(teamName));
    return () => {
      dispatch(setActiveMemberName(null));
    };
  }, [dispatch, teamName]);

  const fetchMembers = async () => {
    try {
      const res = await teamAPI.members();
      if (res && res.members && res.members.length > 0) {
        setMembers(res.members);
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchMembers();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (currentUserFromStore && currentUserFromStore.email) {
      setCurrentUser(currentUserFromStore);
    }
  }, [currentUserFromStore]);

  // Merge current user if not already in members
  const allMembers = [...members];
  if (
    currentUser &&
    !allMembers.some((m) => m.email === currentUser.email)
  ) {
    allMembers.push({
      id: currentUser.id || currentUser._id || "current-user",
      name:
        currentUser.name ||
        `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
        undefined,
      email: currentUser.email,
      role: currentUser.role || "admin",
    });
  }

  // Filter members belonging to this specific team
  const teamMembers = allMembers.filter((m) => {
    const roleLower = (m.role || "").toLowerCase();
    if (teamId === "engineering") {
      return roleLower === "developer" || roleLower === "dev";
    } else if (teamId === "product-design") {
      return (
        roleLower === "manager" ||
        (roleLower === "admin" &&
          m.email !== "owner@insocode.com" &&
          m.email !== "admin@insocode.com")
      );
    } else if (teamId === "ops-support") {
      return (
        roleLower === "owner" ||
        m.email === "owner@insocode.com" ||
        m.email === "admin@insocode.com"
      );
    }
    return false;
  });

  const firstMember = teamMembers[0];
  const memberPrice = firstMember && firstMember.subscriptionPrice !== undefined && firstMember.subscriptionPrice !== null
    ? firstMember.subscriptionPrice
    : 1000;

  // Set default edit price based on first member
  useEffect(() => {
    if (teamMembers.length > 0) {
      const first = teamMembers[0];
      const priceVal = first.subscriptionPrice !== undefined && first.subscriptionPrice !== null
        ? `$${first.subscriptionPrice}`
        : "$1,000";
      setCustomPrice(priceVal);
    }
  }, [editModalOpen]);

  const handleSaveTeamPricing = async () => {
    setIsSaving(true);
    try {
      // Update all team members' price in parallel
      await Promise.all(
        teamMembers.map((m) => teamAPI.updateMemberPrice(m.id, customPrice))
      );
      setEditModalOpen(false);
      await fetchMembers();
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
          <div className="group bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm flex items-start justify-between hover:border-neutral-350 dark:hover:border-neutral-700 hover:shadow-md transition-all">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {teamName}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-450">
                {teamDesc}
              </p>
            </div>
            
            <div className="relative w-36 h-14 shrink-0">
              {/* Monthly price per member (visible when not hovered) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-end transition-all duration-200 opacity-100 group-hover:opacity-0 group-hover:pointer-events-none">
                <span className="text-xl font-bold text-neutral-900 dark:text-white leading-none">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(memberPrice)}/mo
                </span>
                <span className="mt-1.5 px-2.5 py-1 text-xs font-semibold bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 rounded-full border border-neutral-200/50 dark:border-neutral-750 whitespace-nowrap leading-none">
                  {teamMembers.length} {teamMembers.length === 1 ? "Member" : "Members"}
                </span>
              </div>
              
              {/* Edit pencil icon (visible on hover) */}
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:scale-105 transition-all w-8 h-8 cursor-pointer opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto duration-200"
                onClick={() => setEditModalOpen(true)}
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Members list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => {
                const isYou = currentUser && member.email === currentUser.email;
                const memberInitial = (member.name || member.email || "M")
                  .charAt(0)
                  .toUpperCase();

                return (
                  <div
                    key={member.id}
                    className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex items-start gap-4 transition-all hover:border-neutral-350 dark:hover:border-neutral-700 shadow-sm"
                  >
                    {/* Member info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-850 dark:text-neutral-100 truncate text-[15px]">
                          {member.name || member.email.split("@")[0]}
                        </span>
                        {isYou && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded border border-neutral-200/40 dark:border-neutral-700/40 uppercase">
                            You
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-450 mt-1.5">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-455 mt-1">
                        <Shield className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                        <span className="capitalize">{member.role}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
                No members currently in this team.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Team Pricing Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-[420px] bg-white dark:bg-[#161b22] border border-neutral-200/50 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
            {/* Close button X */}
            <button
              disabled={isSaving}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer bg-transparent disabled:opacity-50"
              onClick={() => setEditModalOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-[17px] font-bold text-neutral-900 dark:text-white mb-6">
              Edit Team Pricing
            </h2>

            <div className="space-y-4">
              {/* Team Name */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">
                  Team Name
                </label>
                <input
                  readOnly
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#1f242c] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-500 dark:text-neutral-455 focus:outline-none cursor-not-allowed"
                  type="text"
                  value={teamName}
                />
              </div>

              {/* Price Per User Option */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">
                  Monthly Price Per Member
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all text-neutral-850 dark:text-neutral-200 appearance-none cursor-pointer pr-10"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                  >
                    <option value="$0">$0</option>
                    <option value="$250">$250</option>
                    <option value="$500">$500</option>
                    <option value="$750">$750</option>
                    <option value="$1,000">$1,000</option>
                    <option value="$1,250">$1,250</option>
                    <option value="$1,500">$1,500</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex gap-3 mt-8">
              <button
                disabled={isSaving}
                className="flex-1 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>

              <button
                disabled={isSaving}
                className="flex-1 py-3 text-sm font-semibold text-white bg-black hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-2xl transition-colors focus:outline-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={handleSaveTeamPricing}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
