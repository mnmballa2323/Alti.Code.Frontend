"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Loader2, Search, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { teamAPI } from "@/lib/enterprise-api";
import { useAppSelector } from "@/store";

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
  subscriptionPrice?: number;
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
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await teamAPI.members();

      if (res && res.members && res.members.length > 0) {
        setMembers(res.members);
        const initialPrices: Record<string, string> = {};

        res.members.forEach((m: any) => {
          if (
            m.subscriptionPrice !== undefined &&
            m.subscriptionPrice !== null
          ) {
            initialPrices[m.id] =
              `$${m.subscriptionPrice.toLocaleString("en-US")}`;
          }
        });
        setPrices((prev) => ({ ...prev, ...initialPrices }));
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
      id: currentUser.id || currentUser._id || "current-user",
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
      <div className="space-y-4">
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
              <div className="col-span-6">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2 text-right">Members</div>
              <div className="col-span-2 text-right pr-6">Price</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="space-y-3 mt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
                <p className="text-sm text-neutral-500">
                  Loading workspace members...
                </p>
              </div>
            ) : displayedMembers.length > 0 ? (
              sortedFilteredMembers.length > 0 ? (
                sortedFilteredMembers.map((member) => {
                  const isYou = member.email === currentUser?.email;

                  const isEditing =
                    editModalOpen && editingMember?.id === member.id;

                  return (
                    <div
                      key={member.id}
                      className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl transition-all shadow-sm duration-200 hover:border-neutral-350 dark:hover:border-neutral-700 relative"
                    >
                      <div
                        className="group grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm cursor-pointer"
                        onClick={() =>
                          router.push(`/owner/team-members/${member.id}`)
                        }
                      >
                        <div className="col-span-6 flex items-center gap-2 min-w-0">
                          <span className="text-neutral-900 dark:text-white font-medium truncate flex-1">
                            {member.email}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center text-neutral-500 dark:text-neutral-400 capitalize">
                          {member.role || "user"}
                        </div>
                        <div className="col-span-2 text-right text-neutral-600 dark:text-neutral-400 font-semibold pr-2">
                          1 member
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2 pr-1">
                          <span className="text-neutral-800 dark:text-neutral-200 font-medium text-sm">
                            {prices[member.id] || "$1,000"}
                          </span>
                          <button
                            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded transition-colors opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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

                      {isEditing && (
                        <div className="px-6 pb-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#161b22] rounded-b-2xl">
                          <div className="flex items-end gap-4">
                            <div className="flex-1 relative">
                              <label className="block text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">
                                Custom Pricing Amount
                              </label>
                              
                              {/* Custom Dropdown Trigger */}
                              <button
                                type="button"
                                className="w-full flex items-center justify-between px-4 py-3 bg-neutral-100 dark:bg-[#1f242c] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm font-semibold shadow-sm hover:shadow-md transition-all text-neutral-800 dark:text-neutral-200 cursor-pointer focus:outline-none"
                                onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                              >
                                <span>{customPrice}</span>
                                <ChevronDown className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${isPriceDropdownOpen ? 'rotate-180' : ''}`} />
                              </button>

                              {/* Dropdown Overlay Close Trigger */}
                              {isPriceDropdownOpen && (
                                <div 
                                  className="fixed inset-0 z-40 bg-transparent" 
                                  onClick={() => setIsPriceDropdownOpen(false)}
                                />
                              )}

                              {/* Dropdown Options List */}
                              {isPriceDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-2 z-50 bg-neutral-100 dark:bg-[#1f242c] border border-neutral-200/85 dark:border-neutral-800 rounded-2xl shadow-xl p-2 animate-in fade-in slide-in-from-top-1 duration-150 flex flex-col gap-0.5">
                                  {["$0", "$250", "$500", "$750", "$1,000"].map((price) => (
                                    <button
                                      key={price}
                                      type="button"
                                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold w-full text-left transition-colors cursor-pointer ${
                                        customPrice === price
                                          ? "bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white shadow-sm"
                                          : "text-neutral-600 dark:text-neutral-400 hover:bg-white/70 dark:hover:bg-neutral-900/40 hover:text-neutral-900 dark:hover:text-white"
                                      }`}
                                      onClick={() => {
                                        setCustomPrice(price);
                                        setIsPriceDropdownOpen(price !== customPrice ? false : !isPriceDropdownOpen);
                                      }}
                                    >
                                      <span>{price}</span>
                                      {customPrice === price && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-3">
                              <button
                                className="px-6 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors focus:outline-none cursor-pointer disabled:opacity-50"
                                disabled={isSaving}
                                onClick={() => {
                                  setEditModalOpen(false);
                                  setEditingMember(null);
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-6 py-3 text-sm font-semibold text-white bg-black hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-2xl transition-colors focus:outline-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                disabled={isSaving}
                                onClick={async () => {
                                  if (editingMember) {
                                    setIsSaving(true);
                                    try {
                                      await teamAPI.updateMemberPrice(
                                        editingMember.id,
                                        customPrice,
                                      );
                                      setPrices((prev) => ({
                                        ...prev,
                                        [editingMember.id]: customPrice,
                                      }));
                                      setEditModalOpen(false);
                                      setEditingMember(null);
                                      await fetchMembers();
                                    } catch (err) {
                                      console.error(
                                        "Failed to update custom price:",
                                        err,
                                      );
                                      alert(
                                        "Failed to update pricing. Please try again.",
                                      );
                                    } finally {
                                      setIsSaving(false);
                                    }
                                  }
                                }}
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
                  );
                })
              ) : (
                <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
                  No members match your search query.
                </div>
              )
            ) : (
              <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
                No members configured.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
