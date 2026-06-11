"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  Activity,
  Cpu,
  TrendingUp,
  AlertCircle
} from "lucide-react";

import { teamAPI } from "@/lib/enterprise-api";
import { useSession } from "next-auth/react";
import { useAppSelector, useAppDispatch } from "@/store";
import { setActiveMemberName } from "@/store/uiSlice";

interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
}

export default function MemberDetailsPage() {
  const params = useParams();
  const { status } = useSession();
  const id = params?.id as string;
  const dispatch = useAppDispatch();

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"usage" | "audit">("usage");

  const currentUserFromStore = useAppSelector((state) => state.user.data) as any;

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
      if (foundMember) {
        dispatch(setActiveMemberName(foundMember.name || foundMember.email.split("@")[0]));
      }
    } catch (err) {
      console.error("Failed to load member details:", err);
      // Fallback immediately to static mock
      const found = staticMockMembers.find((m) => m.id === id);
      if (found) {
        setMember(found);
        dispatch(setActiveMemberName(found.name || found.email.split("@")[0]));
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

  useEffect(() => {
    return () => {
      dispatch(setActiveMemberName(null));
    };
  }, [dispatch]);



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
        <p className="text-sm text-neutral-500 dark:text-neutral-455 mb-6">
          The requested member directory could not be located or has been decommissioned.
        </p>
      </div>
    );
  }

  const details = getMemberDetails(member);

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0 space-y-6 pb-12">
      {/* Centered Toggle Header */}
      <div className="flex justify-center w-full border-b border-neutral-100 dark:border-neutral-800/80 pb-6 mb-2">
        <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-2xl border border-neutral-200/50 dark:border-neutral-800 shrink-0 shadow-sm">
          <button
            onClick={() => setActiveTab("usage")}
            className={`px-6 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "usage"
                ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Model Usage
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-6 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 shadow-sm border border-neutral-200/40 dark:border-neutral-800/40"
                : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full space-y-6">
        {activeTab === "usage" ? (
          <>
            {/* Metrics Overview: Tokens Only */}
            <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-neutral-400 dark:text-neutral-500 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Tokens</span>
                <Cpu className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  {details.tokensTotal}
                </span>
                <span className="text-xs text-neutral-455 dark:text-neutral-550 mt-1 leading-relaxed">
                  {details.tokensIn} in / {details.tokensOut} out
                </span>
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
          </>
        ) : (
          /* Timeline box */
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
        )}
      </div>

    </div>
  );
}
