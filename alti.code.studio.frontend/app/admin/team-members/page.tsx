"use client";

import React, { useEffect, useState } from "react";
import { Trash2, Loader2, Search, X, DollarSign, Activity, Cpu, Database, TrendingUp, CheckCircle2 } from "lucide-react";

import { teamAPI } from "@/lib/enterprise-api";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/store";

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
}

export default function TeamMembersPage() {
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
  const currentUserFromStore = useAppSelector((state) => state.user.data) as any;
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
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDrawer = (member: Member) => {
    setSelectedMember(member);
    setTimeout(() => setDrawerOpen(true), 50);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedMember(null), 300);
  };

  const getMemberDetails = (member: Member) => {
    const emailLower = member.email.toLowerCase();
    const isAda = emailLower.includes("ada");
    const isAlan = emailLower.includes("alan");
    const isGrace = emailLower.includes("grace");
    const isJules = emailLower.includes("jules");

    if (isAda) {
      return {
        avatarColor: "bg-purple-100 text-purple-750 dark:bg-purple-950/40 dark:text-purple-400",
        avatarInitials: "AL",
        spendCurrent: 42.15,
        spendLimit: 100.0,
        tokensTotal: "2.4M",
        tokensIn: "1.7M",
        tokensOut: "700k",
        tasksCount: "2,410",
        tasksSuccess: "99.4%",
        sparkline: [25, 45, 12, 60, 40, 85, 30],
        activity: [
          { time: "5m ago", action: "Ran code generator model gemini-1.5-pro", category: "code" },
          { time: "2h ago", action: "Pushed 14 new modules to enterprise-auth", category: "git" },
          { time: "1d ago", action: "Modified deployment parameters in production config", category: "config" },
          { time: "2d ago", action: "Requested audit log export for compliance review", category: "audit" },
        ],
      };
    }
    if (isAlan) {
      return {
        avatarColor: "bg-blue-100 text-blue-750 dark:bg-blue-950/40 dark:text-blue-400",
        avatarInitials: "AT",
        spendCurrent: 88.50,
        spendLimit: 150.0,
        tokensTotal: "6.8M",
        tokensIn: "4.2M",
        tokensOut: "2.6M",
        tasksCount: "8,920",
        tasksSuccess: "98.7%",
        sparkline: [60, 80, 45, 90, 75, 110, 85],
        activity: [
          { time: "12m ago", action: "Executed optimization sweep on db-indexing script", category: "perf" },
          { time: "1h ago", action: "Completed full codebase audit for security telemetry", category: "audit" },
          { time: "4h ago", action: "Created new workspace group 'security-hardening'", category: "admin" },
          { time: "3d ago", action: "Modified role permissions for Developer group", category: "admin" },
        ],
      };
    }
    if (isGrace) {
      return {
        avatarColor: "bg-emerald-100 text-emerald-750 dark:bg-emerald-950/40 dark:text-emerald-400",
        avatarInitials: "GH",
        spendCurrent: 14.80,
        spendLimit: 50.0,
        tokensTotal: "1.1M",
        tokensIn: "800k",
        tokensOut: "300k",
        tasksCount: "945",
        tasksSuccess: "99.1%",
        sparkline: [10, 15, 30, 20, 45, 25, 15],
        activity: [
          { time: "1h ago", action: "Deployed staging build v2.4.1-rc3", category: "deploy" },
          { time: "3h ago", action: "Patched memory leaks in telemetry-parser daemon", category: "bugfix" },
          { time: "1d ago", action: "Ran performance benchmark tests on landing page", category: "perf" },
          { time: "2d ago", action: "Refactored legacy logging dependencies", category: "cleanup" },
        ],
      };
    }
    if (isJules) {
      return {
        avatarColor: "bg-amber-100 text-amber-750 dark:bg-amber-950/40 dark:text-amber-400",
        avatarInitials: "JV",
        spendCurrent: 3.20,
        spendLimit: 50.0,
        tokensTotal: "240k",
        tokensIn: "180k",
        tokensOut: "60k",
        tasksCount: "182",
        tasksSuccess: "100%",
        sparkline: [2, 5, 10, 8, 4, 12, 5],
        activity: [
          { time: "4h ago", action: "Initialized scratchpad folder in workspace root", category: "setup" },
          { time: "1d ago", action: "Drafted system-instructions.md draft", category: "docs" },
          { time: "3d ago", action: "Accepted invitation to workspace", category: "admin" },
        ],
      };
    }

    // Default fallback
    const initials = member.name
      ? member.name.trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      : member.email.slice(0, 2).toUpperCase();

    return {
      avatarColor: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-350",
      avatarInitials: initials,
      spendCurrent: 12.50,
      spendLimit: 100.0,
      tokensTotal: "840k",
      tokensIn: "600k",
      tokensOut: "240k",
      tasksCount: "620",
      tasksSuccess: "99.0%",
      sparkline: [12, 18, 15, 22, 14, 30, 10],
      activity: [
        { time: "2h ago", action: "Viewed members directory list", category: "audit" },
        { time: "1d ago", action: "Updated personal profile settings", category: "settings" },
      ],
    };
  };

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
                  <div className="col-span-3">First Name</div>
                  <div className="col-span-3">Last Name</div>
                  <div className="col-span-4">Email Address</div>
                  <div className="col-span-2">Role</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="space-y-3 mt-6">
                {sortedFilteredMembers.length > 0 ? (
                  sortedFilteredMembers.map((member) => {
                    const isYou = member.email === currentUser?.email;

                    // Try to split name into first and last, or extract from email if not set
                    let firstName = "";
                    let lastName = "";

                    if (member.name) {
                      const nameParts = member.name.trim().split(/\s+/);

                      firstName = nameParts[0] || "";
                      lastName = nameParts.slice(1).join(" ") || "";
                    } else {
                      const emailPrefix = member.email.split("@")[0] || "";
                      const parts = emailPrefix.split(/[\._\-]/);

                      firstName = parts[0]
                        ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
                        : "";
                      lastName = parts.slice(1).join(" ")
                        ? parts
                            .slice(1)
                            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                            .join(" ")
                        : "";
                    }

                    return (
                      <div
                        key={member.id}
                        onClick={() => handleOpenDrawer(member)}
                        className="group grid grid-cols-12 gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-sm transition-all shadow-sm duration-200 hover:border-neutral-350 dark:hover:border-neutral-700 cursor-pointer"
                      >
                        <div className="col-span-3 text-neutral-800 dark:text-neutral-200 font-medium capitalize">
                          {firstName || "—"}
                        </div>
                        <div className="col-span-3 text-neutral-800 dark:text-neutral-200 font-medium capitalize">
                          {lastName || "—"}
                        </div>
                        <div className="col-span-4 flex items-center gap-2">
                          <span className="text-neutral-600 dark:text-neutral-300 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                            {member.email}
                          </span>
                          {isYou && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded border border-neutral-200/40 dark:border-neutral-700/40">
                              You
                            </span>
                          )}
                        </div>
                        <div className="col-span-2 flex items-center justify-between">
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

      {/* Drawer Overlay */}
      {selectedMember && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 transition-opacity duration-300 ${
            drawerOpen ? "opacity-100 animate-in fade-in" : "opacity-0 pointer-events-none"
          }`}
          onClick={handleCloseDrawer}
        />
      )}

      {/* Drawer Container */}
      {selectedMember && (
        <div
          className={`fixed inset-y-0 right-0 z-50 w-full max-w-[420px] bg-white dark:bg-[#161b22] border-l border-neutral-250 dark:border-neutral-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Member Insights
            </h3>
            <button
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-250 rounded-lg transition-colors cursor-pointer"
              onClick={handleCloseDrawer}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Profile Block */}
            {(() => {
              const details = getMemberDetails(selectedMember);
              return (
                <>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${details.avatarColor} shadow-inner`}>
                      {details.avatarInitials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-base font-bold text-neutral-800 dark:text-neutral-100 capitalize truncate">
                        {selectedMember.name || selectedMember.email.split("@")[0]}
                      </span>
                      <span className="text-xs text-neutral-450 dark:text-neutral-500 truncate">
                        {selectedMember.email}
                      </span>
                      <span className="mt-1 text-[11px] font-semibold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/40 dark:border-neutral-700/40 px-2 py-0.5 rounded-full w-fit">
                        {formatRole(selectedMember.role)}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-neutral-100 dark:border-neutral-800" />

                  {/* Cards Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Spend Card */}
                    <div className="bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Spend Limit</span>
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                          ${details.spendCurrent.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-neutral-450 dark:text-neutral-500 mt-0.5">
                          of ${details.spendLimit.toFixed(2)} limit
                        </span>
                        {/* Progress bar */}
                        <div className="w-full bg-neutral-205 dark:bg-neutral-800 h-1 rounded-full mt-3 overflow-hidden">
                          <div
                            className="bg-neutral-800 dark:bg-neutral-400 h-1 rounded-full"
                            style={{ width: `${Math.min(100, (details.spendCurrent / details.spendLimit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tokens Card */}
                    <div className="bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider">Tokens</span>
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                          {details.tokensTotal}
                        </span>
                        <span className="text-[10px] text-neutral-450 dark:text-neutral-500 mt-0.5 leading-relaxed">
                          {details.tokensIn} in / {details.tokensOut} out
                        </span>
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 font-medium">
                          Cumulative usage
                        </span>
                      </div>
                    </div>

                    {/* Tasks Card */}
                    <div className="bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl p-4 col-span-2 flex justify-between items-center">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 text-neutral-450 dark:text-neutral-500 text-[11px] font-bold uppercase tracking-wider mb-1">
                          <Database className="w-3.5 h-3.5" />
                          <span>Task Operations</span>
                        </div>
                        <span className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                          {details.tasksCount} executions
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-450 dark:text-neutral-500 block">Success Rate</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-450 flex items-center gap-1 mt-0.5 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {details.tasksSuccess}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sparkline Weekly Activity */}
                  <div className="bg-neutral-50/50 dark:bg-neutral-900/40 border border-neutral-200/60 dark:border-neutral-800/60 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-neutral-450 dark:text-neutral-500 text-[11px] font-bold uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Weekly Token Activity</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500">Last 7 Days</span>
                    </div>

                    {/* Sparkline Chart SVG */}
                    <div className="h-16 w-full flex items-end justify-between px-1">
                      {details.sparkline.map((val, idx) => {
                        const maxVal = Math.max(...details.sparkline);
                        const heightPct = (val / maxVal) * 100;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group/bar">
                            <div className="relative w-full flex justify-center">
                              {/* Tooltip on hover */}
                              <span className="absolute bottom-full mb-1 opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-950 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-md z-10 whitespace-nowrap">
                                {val}k tokens
                              </span>
                              {/* Sparkline Bar */}
                              <div
                                className="w-3 bg-neutral-300 dark:bg-neutral-700 group-hover/bar:bg-neutral-800 dark:group-hover/bar:bg-neutral-300 rounded-sm transition-all duration-200"
                                style={{ height: `${Math.max(8, heightPct * 0.6)}px` }}
                              />
                            </div>
                            <span className="text-[9px] text-neutral-400 dark:text-neutral-500 select-none">
                              {["M", "T", "W", "T", "F", "S", "S"][idx]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Activity List */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5 text-neutral-450 dark:text-neutral-500 text-[11px] font-bold uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Activity History</span>
                    </div>

                    <div className="space-y-3.5 pl-2 relative border-l border-neutral-100 dark:border-neutral-800 ml-2">
                      {details.activity.map((act, index) => (
                        <div key={index} className="relative pl-5">
                          {/* Dot indicator */}
                          <div className="absolute -left-[5.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-[#161b22] border-2 border-neutral-400 dark:border-neutral-600" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-neutral-700 dark:text-neutral-355 font-medium leading-relaxed">
                              {act.action}
                            </span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                              {act.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
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
