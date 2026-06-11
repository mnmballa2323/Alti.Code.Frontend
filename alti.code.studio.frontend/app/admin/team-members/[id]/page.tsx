"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  Activity,
  Cpu,
  TrendingUp,
  AlertCircle,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldAlert,
  ChevronDown
} from "lucide-react";

import { teamAPI } from "@/lib/enterprise-api";
import { useSession } from "next-auth/react";
import { useAppSelector, useAppDispatch } from "@/store";
import { setActiveMemberName } from "@/store/uiSlice";
import axios from "axios";
import { SOCKET_URL } from "@/lib/config";

interface AuditLog {
  _id: string;
  timestamp: string;
  actor: string;
  action: string;
  status: "SUCCESS" | "FAILURE" | "DENIED" | "WARNING";
  ipAddress?: string;
  metadata?: string;
}


interface Member {
  id: string;
  name?: string;
  email: string;
  role: string;
}

export default function MemberDetailsPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const accessToken = session?.user?.accessToken as string | undefined;
  const id = params?.id as string;
  const dispatch = useAppDispatch();

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"usage" | "audit">("usage");

  const currentUserFromStore = useAppSelector((state) => state.user.data) as any;

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "FAILURE":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "DENIED":
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case "WARNING":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

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
        auditLogs: [
          {
            _id: "ada_log_01",
            timestamp: new Date(Date.now() - 300000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "MODEL_RUN_CODE_GENERATOR",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.15",
            metadata: '{"model":"gemini-1.5-pro","prompt_tokens":120400,"completion_tokens":25400}'
          },
          {
            _id: "ada_log_02",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "GIT_PUSH_ENTERPRISE_AUTH",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.15",
            metadata: '{"repo":"enterprise-auth","branch":"main","commits_count":14,"hash":"7e9f3b1"}'
          },
          {
            _id: "ada_log_03",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "DEPLOY_CONFIG_MODIFY",
            status: "WARNING" as const,
            ipAddress: "192.168.1.15",
            metadata: '{"environment":"production","modified_keys":["replicaCount","memoryLimit"],"reason":"high load scaling"}'
          },
          {
            _id: "ada_log_04",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "AUDIT_LOG_EXPORT_REQUEST",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.15",
            metadata: '{"target_format":"csv","export_scope":"entire_org","compliance_id":"comp_881"}'
          },
          {
            _id: "ada_log_05",
            timestamp: new Date(Date.now() - 345600000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "AGENT_PROMPT_UPDATE",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.15",
            metadata: '{"agent_name":"Legal-Analyst","version":"v2.1","changed_instructions":"Enforce strict compliance checks"}'
          },
          {
            _id: "ada_log_06",
            timestamp: new Date(Date.now() - 604800000).toISOString(),
            actor: "ada.lovelace@alticodestudio.com",
            action: "BUILD_SWEEP_TRIGGER",
            status: "FAILURE" as const,
            ipAddress: "192.168.1.15",
            metadata: '{"branch":"staging","error":"Webpack bundle compilation timed out after 300s"}'
          }
        ]
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
        auditLogs: [
          {
            _id: "alan_log_01",
            timestamp: new Date(Date.now() - 720000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "DB_INDEX_OPTIMIZATION_SWEEP",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.22",
            metadata: '{"script":"db-indexing.sql","tables_affected":["transactions","users"],"latency_improvement":"42%"}'
          },
          {
            _id: "alan_log_02",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "CODEBASE_SECURITY_AUDIT",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.22",
            metadata: '{"scope":"all_submodules","vulnerabilities_found":0,"scanned_files_count":4820}'
          },
          {
            _id: "alan_log_03",
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "WORKSPACE_GROUP_CREATE",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.22",
            metadata: '{"group_name":"security-hardening","description":"Group for automated security sweeps"}'
          },
          {
            _id: "alan_log_04",
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "ROLE_PERMISSIONS_MODIFY",
            status: "DENIED" as const,
            ipAddress: "10.0.0.12",
            metadata: '{"target_group":"Developer","denied_reason":"Requires dual authorization to elevate developer permissions"}'
          },
          {
            _id: "alan_log_05",
            timestamp: new Date(Date.now() - 432000000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "LOGGING_TRANSPORT_VERIFY",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.22",
            metadata: '{"transport":"fluentd","encryption":"TLSv1.3","destination":"private_cloud_vault"}'
          },
          {
            _id: "alan_log_06",
            timestamp: new Date(Date.now() - 604800000).toISOString(),
            actor: "alan.turing@alticodestudio.com",
            action: "DB_MIGRATION_UPDATE",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.22",
            metadata: '{"version":"20260610_billing","down_migration_available":true,"lock_timeout_ms":5000}'
          }
        ]
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
        auditLogs: [
          {
            _id: "grace_log_01",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            actor: "grace.hopper@alticodestudio.com",
            action: "STAGING_BUILD_DEPLOY",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.44",
            metadata: '{"version":"v2.4.1-rc3","environment":"staging","checks_passed":true}'
          },
          {
            _id: "grace_log_02",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            actor: "grace.hopper@alticodestudio.com",
            action: "TELEMETRY_PARSER_BUGFIX",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.44",
            metadata: '{"daemon":"telemetry-parser","leak_size_kb":450,"files_modified":["parser.go"]}'
          },
          {
            _id: "grace_log_03",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            actor: "grace.hopper@alticodestudio.com",
            action: "PERF_BENCHMARK_RUN",
            status: "WARNING" as const,
            ipAddress: "192.168.1.44",
            metadata: '{"target":"landing_page","lcp_ms":2850,"inp_ms":220,"status":"needs_optimization"}'
          },
          {
            _id: "grace_log_04",
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            actor: "grace.hopper@alticodestudio.com",
            action: "LOGGING_DEPS_REFACTOR",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.44",
            metadata: '{"removed_packages":["winston-legacy"],"added_packages":["pino"],"bundle_reduction_kb":142}'
          },
          {
            _id: "grace_log_05",
            timestamp: new Date(Date.now() - 432000000).toISOString(),
            actor: "grace.hopper@alticodestudio.com",
            action: "UNIT_TEST_ADD",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.44",
            metadata: '{"service":"recaptcha-mock","tests_added_count":8,"coverage_increase":"1.4%"}'
          }
        ]
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
        auditLogs: [
          {
            _id: "jules_log_01",
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            actor: "jules.verne@alticodestudio.com",
            action: "WORKSPACE_FOLDER_INIT",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.88",
            metadata: '{"folder_path":"/scratchpad","is_git_ignored":true}'
          },
          {
            _id: "jules_log_02",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            actor: "jules.verne@alticodestudio.com",
            action: "DOCS_DRAFT_CREATE",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.88",
            metadata: '{"file":"system-instructions.md","word_count":425}'
          },
          {
            _id: "jules_log_03",
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            actor: "jules.verne@alticodestudio.com",
            action: "WORKSPACE_INVITE_ACCEPT",
            status: "SUCCESS" as const,
            ipAddress: "192.168.1.88",
            metadata: '{"workspace_id":"ws_dev_main","role":"developer"}'
          }
        ]
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
      auditLogs: [
        {
          _id: "fallback_log_01",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          actor: memberObj.email,
          action: "MEMBERS_LIST_VIEW",
          status: "SUCCESS" as const,
          ipAddress: "192.168.1.99",
          metadata: '{"filtered_by":null,"limit":50}'
        },
        {
          _id: "fallback_log_02",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          actor: memberObj.email,
          action: "PROFILE_SETTINGS_UPDATE",
          status: "SUCCESS" as const,
          ipAddress: "192.168.1.99",
          metadata: '{"fields_updated":["avatar","displayName"]}'
        }
      ]
    };
  };

  useEffect(() => {
    if (activeTab !== "audit" || !member) return;

    const delayDebounceFn = setTimeout(() => {
      const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
          const response = await axios.get(`${SOCKET_URL}/api/v1/audit`, {
            params: {
              page: logsPage,
              limit: 50,
              action: searchTerm,
            },
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            withCredentials: true,
          });

          if (
            response.data.success &&
            response.data.data &&
            response.data.data.length > 0
          ) {
            const memberEmail = member.email.toLowerCase();
            const filtered = response.data.data.filter((log: any) =>
              log.actor?.toLowerCase() === memberEmail &&
              (log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
               log.actor.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setLogs(filtered);
            setLogsTotalPages(1);
          } else {
            const detailsObj = getMemberDetails(member);
            const filtered = detailsObj.auditLogs.filter(
              (log) =>
                log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.actor.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            setLogs(filtered);
            setLogsTotalPages(1);
          }
        } catch (error) {
          console.error("Failed to fetch audit logs, loading mock data", error);
          const detailsObj = getMemberDetails(member);
          const filtered = detailsObj.auditLogs.filter(
            (log) =>
              log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
              log.actor.toLowerCase().includes(searchTerm.toLowerCase()),
          );
          setLogs(filtered);
          setLogsTotalPages(1);
        } finally {
          setLoadingLogs(false);
        }
      };

      fetchLogs();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [logsPage, searchTerm, activeTab, member?.email, accessToken]);

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
          <div className="w-full flex flex-col h-full justify-start pt-0">
            <div className="space-y-4">
              {/* Sticky Header Wrapper */}
              <div className="sticky top-0 z-30 bg-[#F3F4F6] dark:bg-[#0d1117] -mt-4 pt-4 pb-2">
                {/* Search Bar */}
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <input
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all shadow-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
                    placeholder="Search by action..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Table Header */}
                <div
                  className="grid gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-[10px] font-bold text-neutral-450 dark:text-neutral-500 tracking-wider uppercase shadow-sm"
                  style={{
                    gridTemplateColumns: "90px 120px 4fr 1.2fr 1.5fr",
                  }}
                >
                  <div>Date</div>
                  <div>Time</div>
                  <div>Action</div>
                  <div>Status</div>
                  <div className="text-right">IP Address</div>
                </div>
              </div>

              {/* Content Pane */}
              {loadingLogs ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
                  <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
                  <p className="text-sm text-neutral-500">Loading audit logs...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400 bg-white dark:bg-[#161b22] shadow-sm">
                      No logs found matching search query.
                    </div>
                  ) : (
                    logs.map((log) => {
                      const logDate = new Date(log.timestamp).toLocaleDateString();
                      const logTime = new Date(log.timestamp).toLocaleTimeString();
                      const isExpanded = !!expandedLogs[log._id];

                      return (
                        <div
                          key={log._id}
                          className={`flex flex-col px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm transition-all duration-200 gap-3 ${
                            log.metadata
                              ? "cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md"
                              : ""
                          }`}
                          onClick={() => log.metadata && toggleExpand(log._id)}
                        >
                          <div
                            className="grid gap-4 items-center text-sm"
                            style={{
                              gridTemplateColumns:
                                "90px 120px 4fr 1.2fr 1.5fr",
                            }}
                          >
                            <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                              {logDate}
                            </div>
                            <div className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                              {logTime}
                            </div>
                            <div
                              className="text-neutral-800 dark:text-neutral-200 font-mono text-xs truncate"
                              title={log.action}
                            >
                              {log.action}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                                {log.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-2 text-right">
                              <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
                                {log.ipAddress || "—"}
                              </span>
                              {log.metadata && (
                                <ChevronDown
                                  className={`w-4 h-4 text-neutral-450 dark:text-neutral-500 transition-transform duration-200 shrink-0 ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                          {log.metadata && isExpanded && (
                            <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-xl border border-neutral-100 dark:border-neutral-800/60 text-xs font-mono text-neutral-500 dark:text-neutral-400 overflow-x-auto whitespace-pre-wrap break-all animate-in fade-in slide-in-from-top-1 duration-200">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-450 dark:text-neutral-500 block mb-1">
                                Metadata
                              </span>
                              {log.metadata}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {/* Pagination Controls */}
                  {logsTotalPages > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                      <button
                        className="h-9 px-4 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 disabled:pointer-events-none text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                        disabled={logsPage === 1 || loadingLogs}
                        onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </button>
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-455">
                        Page {logsPage} of {logsTotalPages}
                      </span>
                      <button
                        className="h-9 px-4 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 disabled:pointer-events-none text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                        disabled={logsPage === logsTotalPages || loadingLogs}
                        onClick={() => setLogsPage((p) => Math.min(logsTotalPages, p + 1))}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
