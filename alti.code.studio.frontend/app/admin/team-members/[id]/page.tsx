"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Loader2,
  DollarSign,
  Activity,
  Cpu,
  Database,
  TrendingUp,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  User,
  AlertCircle
} from "lucide-react";

import { teamAPI } from "@/lib/enterprise-api";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/store";

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
}

export default function MemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const id = params?.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDropdownOpen, setOpenDropdownOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const currentUserFromStore = useAppSelector((state) => state.user.data) as any;
  const isYou = member?.email === currentUserFromStore?.email;

  const staticMockMembers: Member[] = [
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
  ];

  const fetchMemberDetails = async () => {
    try {
      const res = await teamAPI.members();
      let foundMember = res?.members?.find((m: any) => m.id === id) || null;

      // Fallback to static mock list if not found in API
      if (!foundMember) {
        foundMember = staticMockMembers.find((m) => m.id === id) || null;
      }

      // Check if current user
      if (!foundMember && currentUserFromStore && (currentUserFromStore.id === id || id === "current-user")) {
        foundMember = {
          id: currentUserFromStore.id || "current-user",
          name: currentUserFromStore.name || `${currentUserFromStore.firstName || ""} ${currentUserFromStore.lastName || ""}`.trim() || undefined,
          email: currentUserFromStore.email,
          role: currentUserFromStore.role || "admin",
        };
      }

      setMember(foundMember);
    } catch (err) {
      console.error("Failed to load member details:", err);
      // Fallback immediately to static mock
      const found = staticMockMembers.find((m) => m.id === id);
      if (found) {
        setMember(found);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" || status === "unauthenticated") {
      fetchMemberDetails();
    }
  }, [id, status, currentUserFromStore]);

  const handleRoleChange = async (newRole: string) => {
    if (!member) return;
    try {
      await teamAPI.updateMemberRole(member.id, newRole);
      setMember((prev) => (prev ? { ...prev, role: newRole } : null));
      setOpenDropdownOpen(false);
      alert(`Role updated successfully to ${formatRole(newRole)}.`);
    } catch (err) {
      console.error("Failed to update role:", err);
      alert("Failed to update member role. Please try again.");
    }
  };

  const handleRemove = async () => {
    if (!member) return;
    try {
      await teamAPI.removeMember(member.id);
      alert("Member removed successfully.");
      router.push("/admin/team-members");
    } catch (err) {
      console.error("Failed to remove member:", err);
      alert("Failed to remove member. Please try again.");
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const formatRole = (role: string) => {
    if (!role) return "Developer";
    const r = role.toLowerCase();
    if (r === "admin" || r === "owner") return "Admin";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  const getMemberDetails = (memberObj: Member) => {
    const emailLower = memberObj.email.toLowerCase();
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
          { time: "5 minutes ago", action: "Ran code generator model gemini-1.5-pro", category: "code" },
          { time: "2 hours ago", action: "Pushed 14 new modules to enterprise-auth", category: "git" },
          { time: "1 day ago", action: "Modified deployment parameters in production config", category: "config" },
          { time: "2 days ago", action: "Requested audit log export for compliance review", category: "audit" },
          { time: "4 days ago", action: "Updated prompt instructions for Legal-Analyst agent", category: "agent" },
          { time: "1 week ago", action: "Triggered build sweep for staging branch", category: "deploy" },
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
          { time: "12 minutes ago", action: "Executed optimization sweep on db-indexing script", category: "perf" },
          { time: "1 hour ago", action: "Completed full codebase audit for security telemetry", category: "audit" },
          { time: "4 hours ago", action: "Created new workspace group 'security-hardening'", category: "admin" },
          { time: "3 days ago", action: "Modified role permissions for Developer group", category: "admin" },
          { time: "5 days ago", action: "Verified private cloud local logging transport config", category: "security" },
          { time: "1 week ago", action: "Updated database migration schemas for user billing", category: "database" },
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
          { time: "1 hour ago", action: "Deployed staging build v2.4.1-rc3", category: "deploy" },
          { time: "3 hours ago", action: "Patched memory leaks in telemetry-parser daemon", category: "bugfix" },
          { time: "1 day ago", action: "Ran performance benchmark tests on landing page", category: "perf" },
          { time: "2 days ago", action: "Refactored legacy logging dependencies", category: "cleanup" },
          { time: "5 days ago", action: "Added unit tests for recaptcha service mock fallback", category: "test" },
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
          { time: "4 hours ago", action: "Initialized scratchpad folder in workspace root", category: "setup" },
          { time: "1 day ago", action: "Drafted system-instructions.md draft", category: "docs" },
          { time: "3 days ago", action: "Accepted invitation to workspace", category: "admin" },
        ],
      };
    }

    // Default fallback
    const initials = memberObj.name
      ? memberObj.name.trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase()
      : memberObj.email.slice(0, 2).toUpperCase();

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
        { time: "2 hours ago", action: "Viewed members directory list", category: "audit" },
        { time: "1 day ago", action: "Updated personal profile settings", category: "settings" },
      ],
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 h-full w-full">
        <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-3" />
        <p className="text-sm text-neutral-500">Loading member statistics...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20 h-full w-full text-center px-6">
        <AlertCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
        <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mb-1">Member Not Found</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-450 mb-6">
          The requested member directory could not be located or has been decommissioned.
        </p>
        <Link
          href="/admin/team-members"
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-750 dark:text-neutral-200 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Members
        </Link>
      </div>
    );
  }

  const details = getMemberDetails(member);

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0 space-y-6 pb-12">
      {/* Breadcrumb Header */}
      <div className="flex flex-col">
        <Link
          href="/admin/team-members"
          className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-350 uppercase tracking-wider mb-3 w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Members
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              {member.name || member.email.split("@")[0]}
            </h1>
            <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-1">
              Comprehensive operational logs, billing allocations, and workspace usage statistics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Manager */}
            {isYou ? (
              <span className="text-xs font-semibold text-neutral-550 dark:text-neutral-400 uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800/40 border border-neutral-200/40 dark:border-neutral-700/40 px-3 py-1.5 rounded-full">
                Role: Admin (You)
              </span>
            ) : (
              <div className="relative">
                <button
                  className="flex items-center gap-2 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors focus:outline-none cursor-pointer"
                  onClick={() => setOpenDropdownOpen(!openDropdownOpen)}
                >
                  <span>Role: {formatRole(member.role)}</span>
                  <svg
                    className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${
                      openDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </button>

                {openDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                      {["admin", "manager", "developer"].map((r) => (
                        <button
                          key={r}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40 ${
                            member.role?.toLowerCase() === r
                              ? "text-neutral-900 dark:text-white bg-neutral-50/60 dark:bg-neutral-800/20 font-semibold"
                              : "text-neutral-600 dark:text-neutral-400"
                          }`}
                          type="button"
                          onClick={() => handleRoleChange(r)}
                        >
                          {formatRole(r)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Remove Action */}
            {!isYou && (
              <button
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-xl transition-all cursor-pointer border border-red-100/40 dark:border-red-900/40"
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Member</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Analytics */}
        <div className="lg:col-span-8 space-y-6">
          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Tokens card */}
            <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Tokens</span>
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  {details.tokensTotal}
                </span>
                <span className="text-xs text-neutral-450 dark:text-neutral-500 mt-1 leading-relaxed">
                  {details.tokensIn} in / {details.tokensOut} out
                </span>
              </div>
            </div>

            {/* Spend card */}
            <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Spend Allocation</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  ${details.spendCurrent.toFixed(2)}
                </span>
                <span className="text-xs text-neutral-450 dark:text-neutral-500 mt-1">
                  Budget limit: ${details.spendLimit.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Executions card */}
            <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Task Operations</span>
                <Database className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  {details.tasksCount}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-450 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {details.tasksSuccess} Success Rate
                </span>
              </div>
            </div>
          </div>

          {/* Weekly token activity box */}
          <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 font-semibold">
                <TrendingUp className="w-4 h-4 text-neutral-400" />
                <span>Weekly Token Activity</span>
              </div>
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">Daily Token Processing</span>
            </div>

            <div className="h-24 w-full flex items-end justify-between px-2 gap-4">
              {details.sparkline.map((val, idx) => {
                const maxVal = Math.max(...details.sparkline);
                const heightPct = (val / maxVal) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group/bar relative">
                    {/* Tooltip */}
                    <span className="absolute bottom-full mb-1.5 opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg z-10 whitespace-nowrap">
                      {val}k tokens
                    </span>
                    {/* Bar */}
                    <div
                      className="w-full max-w-[28px] bg-neutral-100 dark:bg-neutral-800 group-hover/bar:bg-neutral-850 dark:group-hover/bar:bg-neutral-300 rounded-md transition-all duration-200"
                      style={{ height: `${Math.max(12, heightPct * 0.85)}px` }}
                    />
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium select-none">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline box */}
          <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 font-semibold">
              <Activity className="w-4 h-4 text-neutral-400" />
              <span>Activity History & Audit Logs</span>
            </div>

            <div className="space-y-6 pl-2 relative border-l border-neutral-100 dark:border-neutral-800 ml-2">
              {details.activity.map((act, index) => (
                <div key={index} className="relative pl-6">
                  {/* Dot */}
                  <div className="absolute -left-[5.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-[#161b22] border-2 border-neutral-400 dark:border-neutral-500" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-neutral-700 dark:text-neutral-200 font-medium leading-relaxed">
                      {act.action}
                    </span>
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: User details summary cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity card */}
          <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className={`w-18 h-18 rounded-full flex items-center justify-center text-2xl font-bold ${details.avatarColor} shadow-inner mb-4`}>
              {details.avatarInitials}
            </div>
            <h2 className="text-base font-bold text-neutral-850 dark:text-neutral-100 capitalize">
              {member.name || member.email.split("@")[0]}
            </h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{member.email}</p>

            <div className="w-full border-t border-neutral-100 dark:border-neutral-850 my-5" />

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 dark:text-neutral-500 font-medium">Workspace Role</span>
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 capitalize">
                  {formatRole(member.role)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 dark:text-neutral-500 font-medium">Joined Date</span>
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-455" />
                  <span>June 2026</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400 dark:text-neutral-500 font-medium">Verification Status</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-100/40 dark:border-emerald-900/40 rounded-full font-semibold">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Budget Limit gauge card */}
          <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Budget & Limit Usage
            </h3>
            <div className="flex flex-col">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  ${details.spendCurrent.toFixed(2)}
                </span>
                <span className="text-xs text-neutral-450 dark:text-neutral-500 mb-1">
                  of ${details.spendLimit.toFixed(2)} limit
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-neutral-800 dark:bg-neutral-300 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (details.spendCurrent / details.spendLimit) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2 font-medium">
                Resets monthly on the 1st of each calendar month.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-[380px] bg-white dark:bg-[#161b22] border border-neutral-200/50 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h2 className="text-base font-bold text-neutral-850 dark:text-neutral-200 mb-2">
                Remove Workspace Member
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-450 px-4 leading-relaxed">
                Are you absolutely sure you want to remove{" "}
                <span className="font-semibold text-neutral-750 dark:text-neutral-300">{member.email}</span> from
                this workspace? All active API tokens will be revoked.
              </p>
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-800" />

            <div className="flex w-full">
              <button
                className="flex-1 py-3.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#1f242c] transition-colors focus:outline-none"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Cancel
              </button>

              <div className="border-r border-neutral-100 dark:border-neutral-800" />

              <button
                className="flex-1 py-3.5 text-sm font-semibold text-red-500 hover:bg-neutral-50 dark:hover:bg-[#1f242c] transition-colors focus:outline-none"
                onClick={handleRemove}
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
