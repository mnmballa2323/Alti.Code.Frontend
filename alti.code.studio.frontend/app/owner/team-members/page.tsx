"use client";

import React, { useEffect, useState } from "react";
import { Trash2, Loader2, Search } from "lucide-react";
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

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

  const handleRemove = (id: string, email: string) => {
    if (id === currentUser?.id) {
      alert("You cannot remove yourself from the workspace.");

      return;
    }
    setMemberToDelete({ id, email });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;
    const { id } = memberToDelete;

    try {
      await teamAPI.removeMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      alert("Member removed successfully.");
    } catch (err) {
      console.error("Failed to remove member:", err);
      alert("Failed to remove member. Please try again.");
    } finally {
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await teamAPI.updateMemberRole(userId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m)),
      );
      if (userId === currentUser?.id) {
        setCurrentUser((prev: any) => ({ ...prev, role: newRole }));
      }
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to update member role. Please try again.");
    }
  };

  const formatRole = (role: string) => {
    if (!role) return "Developer";
    const r = role.toLowerCase();

    if (r === "admin" || r === "owner") return "Admin";

    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

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
                  <div className="col-span-3">Role</div>
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
                          <div className="relative flex items-center w-full max-w-[120px] -ml-2">
                            {isYou ? (
                              <span
                                className="text-sm text-neutral-800 dark:text-neutral-200 px-2 py-1"
                                style={{ fontWeight: 400 }}
                              >
                                Admin
                              </span>
                            ) : (
                              <>
                                <button
                                  className="w-full flex items-center justify-between bg-transparent px-2 py-1 text-sm text-neutral-800 dark:text-neutral-200 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 cursor-pointer"
                                  style={{ fontWeight: 400 }}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenDropdownId(
                                      openDropdownId === member.id
                                        ? null
                                        : member.id,
                                    );
                                  }}
                                >
                                  <span>{formatRole(member.role)}</span>
                                  <svg
                                    className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${
                                      openDropdownId === member.id
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M19 9l-7 7-7-7"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                    />
                                  </svg>
                                </button>

                                {openDropdownId === member.id && (
                                  <>
                                    {/* Overlay to close the dropdown */}
                                    <div
                                      className="fixed inset-0 z-40"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdownId(null);
                                      }}
                                    />
                                    {/* Dropdown Options Box */}
                                    <div className="absolute top-full left-0 mt-1.5 w-full min-w-[120px] bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0">
                                      {["admin", "manager", "developer"].map(
                                        (r) => (
                                          <button
                                            key={r}
                                            className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40 focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 ${
                                              member.role?.toLowerCase() === r
                                                ? "text-neutral-900 dark:text-white bg-neutral-50/60 dark:bg-neutral-800/20"
                                                : "text-neutral-650 dark:text-neutral-400"
                                            }`}
                                            style={{ fontWeight: 400 }}
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRoleChange(member.id, r);
                                              setOpenDropdownId(null);
                                            }}
                                          >
                                            {formatRole(r)}
                                          </button>
                                        ),
                                      )}
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                          {!isYou && (
                            <button
                              className="p-1 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(member.id, member.email);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmOpen && memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-[380px] bg-white dark:bg-[#161b22] border border-neutral-200/50 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                Remove Member
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 px-4 leading-normal">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  {memberToDelete.email}
                </span>
              </p>
            </div>

            {/* Horizontal border line */}
            <div className="border-t border-neutral-100 dark:border-neutral-800" />

            {/* Footer Buttons Split by Vertical Line */}
            <div className="flex w-full">
              <button
                className="flex-1 py-3 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#1f242c] transition-colors focus:outline-none"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setMemberToDelete(null);
                }}
              >
                Cancel
              </button>

              {/* Vertical divider line */}
              <div className="border-r border-neutral-100 dark:border-neutral-800" />

              <button
                className="flex-1 py-3 text-sm font-medium text-red-500 hover:bg-neutral-50 dark:hover:bg-[#1f242c] transition-colors focus:outline-none"
                onClick={confirmDelete}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
