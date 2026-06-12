"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Search,
  AlertTriangle,
  ChevronDown,
  Check,
  X,
  Shield,
} from "lucide-react";

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

const mockLogs: AuditLog[] = [
  {
    _id: "log_01",
    timestamp: new Date(Date.now() - 500000).toISOString(),
    actor: "michael.meram@clearledger.com",
    action: "USER_INVITE_SEND",
    status: "SUCCESS",
    ipAddress: "192.168.1.142",
    metadata: '{"email":"test.dev@clearledger.com","role":"developer"}',
  },
  {
    _id: "log_02",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actor: "system.sentinel@inso.ai",
    action: "GUARDRAIL_VIOLATION_BLOCK",
    status: "DENIED",
    ipAddress: "10.0.4.88",
    metadata:
      '{"rule_id":"gr_04","agent_id":"agent_cli_99","input_snippet":"rm -rf /"}',
  },
  {
    _id: "log_03",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    actor: "michael.meram@clearledger.com",
    action: "KNOWLEDGE_FILE_UPLOAD",
    status: "SUCCESS",
    ipAddress: "192.168.1.142",
    metadata: '{"filename":"inso code black.png","size":"0.02 MB"}',
  },
  {
    _id: "log_04",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    actor: "system.auditor@inso.ai",
    action: "BACKEND_PERFORMANCE_ALERT",
    status: "WARNING",
    ipAddress: "127.0.0.1",
    metadata: '{"endpoint":"GET /api/v1/audit","response_time_ms":1450}',
  },
  {
    _id: "log_05",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    actor: "system.db@clearledger.com",
    action: "DATABASE_BACKUP_FAILED",
    status: "FAILURE",
    ipAddress: "10.0.0.5",
    metadata: '{"backup_type":"daily","error":"disk space exceeded on vault"}',
  },
];

const AuditPage = () => {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Adjust URL to your backend endpoint
      const response = await axios.get(`${SOCKET_URL}/api/v1/audit`, {
        params: {
          page,
          limit: 20,
          action: searchTerm, // Simulating search by action or actor if backend supports it
        },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        withCredentials: true, // Ensure cookies/auth headers are sent
      });

      if (
        response.data.success &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        setLogs(response.data.data);
        setTotalPages(response.data.meta.totalPages);
      } else {
        const filtered = mockLogs.filter(
          (log) =>
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.actor.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        setLogs(filtered);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs, loading mock data", error);
      const filtered = mockLogs.filter(
        (log) =>
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.actor.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      setLogs(filtered);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [page, searchTerm]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 dark:bg-emerald-600 text-white shrink-0 shadow-sm">
            <Check className="w-3 h-3 text-white stroke-[3.5]" />
          </span>
        );
      case "FAILURE":
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 dark:bg-rose-600 text-white shrink-0 shadow-sm">
            <X className="w-3 h-3 text-white stroke-[3.5]" />
          </span>
        );
      case "DENIED":
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 dark:bg-indigo-600 text-white shrink-0 shadow-sm">
            <Shield className="w-3 h-3 text-white stroke-[2.5]" />
          </span>
        );
      case "WARNING":
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 dark:bg-amber-600 text-white shrink-0 shadow-sm">
            <AlertTriangle className="w-3 h-3 text-white stroke-[3]" />
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0">
      <div className="space-y-4">
        {/* Sticky Header Wrapper */}
        <div className="sticky top-0 z-30 bg-[#F3F4F6] dark:bg-[#0d1117] -mt-4 pt-4 pb-2">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            <input
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all shadow-sm text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
              placeholder="Search by action or actor..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table Header */}
          <div
            className="grid gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-[10px] font-bold text-neutral-450 dark:text-neutral-500 tracking-wider uppercase shadow-sm"
            style={{
              gridTemplateColumns:
                "90px 120px minmax(0, 2.5fr) minmax(0, 2.2fr) minmax(0, 1.1fr) 120px",
            }}
          >
            <div>Date</div>
            <div>Time</div>
            <div>Actor</div>
            <div>Action</div>
            <div>Status</div>
            <div>IP Address</div>
          </div>
        </div>

        {/* Content Pane */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
            <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-2" />
            <p className="text-sm text-neutral-500">Loading audit logs...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
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
                          "90px 120px minmax(0, 2.5fr) minmax(0, 2.2fr) minmax(0, 1.1fr) 120px",
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
                        title={log.actor}
                      >
                        {log.actor}
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
                      <div className="flex items-center justify-start gap-2">
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
            {totalPages > 1 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <button
                  className="h-9 px-4 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 disabled:pointer-events-none text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-450">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="h-9 px-4 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 disabled:opacity-50 disabled:pointer-events-none text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                  disabled={page === totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditPage;
