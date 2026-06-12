"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Loader2, Search, ChevronDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { teamAPI } from "@/lib/enterprise-api";
import { useAppSelector } from "@/store";

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
}

export default function TeamMembersPage() {
  const router = useRouter();
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
  const { status } = useSession();
  const currentUserFromStore = useAppSelector(
    (state) => state.user.data,
  ) as any;
  const [currentUser, setCurrentUser] = useState<any>({
    id: "admin-user",
    name: "Platform Admin",
    email: "admin@alticodestudio.com",
    role: "admin",
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [customPrice, setCustomPrice] = useState("$1,000");

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





  // Merge current user into members list if not already returned by the API
  const displayedMembers = [...members];

  if (
    currentUser &&
    !displayedMembers.some((m) => m.email === currentUser.email)
  ) {
    displayedMembers.push({
      id: currentUser.id || "current-user",
      name:
        currentUser.name ||
        `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() ||
        undefined,
      email: currentUser.email,
      role: currentUser.role || "admin",
    });
  }

  const getMemberFirstName = (member: Member) => {
    if (member.name) {
      const parts = member.name.trim().split(/\s+/);

      if (parts[0]) return parts[0];
    }
    const emailPrefix = member.email.split("@")[0] || "";
    const parts = emailPrefix.split(/[\._\-]/);

    return parts[0] || "";
  };

  const filteredMembers = displayedMembers.filter((member) => {
    const query = searchQuery.toLowerCase();
    const fullName = member.name ? member.name.toLowerCase() : "";
    const email = member.email ? member.email.toLowerCase() : "";
    const role = member.role ? member.role.toLowerCase() : "";

    return (
      fullName.includes(query) || email.includes(query) || role.includes(query)
    );
  });

  const sortedFilteredMembers = [...filteredMembers].sort((a, b) => {
    const nameA = getMemberFirstName(a).toLowerCase();
    const nameB = getMemberFirstName(b).toLowerCase();

    return nameA.localeCompare(nameB);
  });

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
          <p className="text-sm text-neutral-500">
            Loading workspace members...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedMembers.length > 0 ? (
            <div className="w-full">
              {/* Sticky Header Wrapper */}
              <div className="sticky top-0 z-30 bg-[#F3F4F6] dark:bg-[#0d1117] -mt-4 pt-4 pb-2">
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <input
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all shadow-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                    placeholder="Search..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase shadow-sm">
                  <div className="col-span-9">Email Address</div>
                  <div className="col-span-3">Price</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="space-y-3 mt-6">
                {sortedFilteredMembers.length > 0 ? (
                  sortedFilteredMembers.map((member) => {
                    const isYou = member.email === currentUser?.email;

                    return (
                      <div
                        key={member.id}
                        className="group grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-sm transition-all shadow-sm duration-200 hover:border-neutral-350 dark:hover:border-neutral-700 cursor-pointer"
                        onClick={() =>
                          router.push(`/owner/team-members/${member.id}`)
                        }
                      >
                        <div className="col-span-9 flex items-center gap-2">
                          <span className="text-neutral-600 dark:text-neutral-300 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                            {member.email}
                          </span>
                          {isYou && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded border border-neutral-200/40 dark:border-neutral-700/40">
                              You
                            </span>
                          )}
                        </div>
                        <div className="col-span-3 flex items-center justify-between">
                          <span className="text-neutral-800 dark:text-neutral-200 font-medium text-sm">
                            {prices[member.id] || "$1,000"}
                          </span>
                          <button
                            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded transition-colors ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMember(member);
                              setCustomPrice(prices[member.id] || "$1,000");
                              setEditModalOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
                    No members match your search query.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              No members configured.
            </div>
          )}
        </div>
      )}

      {/* Edit Membership Pricing Modal */}
      {editModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-[420px] bg-white dark:bg-[#161b22] border border-neutral-200/50 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative">
            {/* Close button X */}
            <button
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer bg-transparent"
              onClick={() => {
                setEditModalOpen(false);
                setEditingMember(null);
              }}
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-[17px] font-bold text-neutral-900 dark:text-white mb-6">
              Edit Membership Pricing
            </h2>

            <div className="space-y-4">
              {/* User Email */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">
                  User Email
                </label>
                <input
                  readOnly
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-[#1f242c] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm text-neutral-500 dark:text-neutral-450 focus:outline-none cursor-not-allowed"
                  type="text"
                  value={editingMember.email}
                />
              </div>

              {/* Custom Pricing Amount */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">
                  Custom Pricing Amount
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
                    <option value="$1,000">$1,000</option>
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
                className="flex-1 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer"
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingMember(null);
                }}
              >
                Cancel
              </button>

              <button
                className="flex-1 py-3 text-sm font-semibold text-white bg-black hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-2xl transition-colors focus:outline-none cursor-pointer"
                onClick={() => {
                  if (editingMember) {
                    setPrices((prev) => ({
                      ...prev,
                      [editingMember.id]: customPrice,
                    }));
                  }
                  setEditModalOpen(false);
                  setEditingMember(null);
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
