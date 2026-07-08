"use client";

import React, { useState } from "react";
import {
  Webhook,
  Plus,
  Play,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Pause,
  Clock,
  Zap,
} from "lucide-react";

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: "active" | "paused";
  lastDelivery: "success" | "failed";
  successRate: number;
  createdAt: string;
}

interface RecentDelivery {
  id: string;
  event: string;
  endpoint: string;
  status: "success" | "failed";
  duration: string;
  time: string;
}

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: "wh_01",
    url: "https://api.company.com/webhook",
    events: ["agent.completed", "session.ended"],
    status: "active",
    lastDelivery: "success",
    successRate: 99.2,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "wh_02",
    url: "https://alerts.company.com/alti",
    events: ["security.alert", "deployment.completed"],
    status: "active",
    lastDelivery: "success",
    successRate: 100,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "wh_03",
    url: "https://billing.company.com/usage",
    events: ["org.usage_threshold"],
    status: "active",
    lastDelivery: "failed",
    successRate: 97.8,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

const mockDeliveries: RecentDelivery[] = [
  {
    id: "del_01",
    event: "agent.completed",
    endpoint: "api.company.com/webhook",
    status: "success",
    duration: "142ms",
    time: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: "del_02",
    event: "security.alert",
    endpoint: "alerts.company.com/alti",
    status: "success",
    duration: "89ms",
    time: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "del_03",
    event: "org.usage_threshold",
    endpoint: "billing.company.com/usage",
    status: "failed",
    duration: "5012ms",
    time: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "del_04",
    event: "session.ended",
    endpoint: "api.company.com/webhook",
    status: "success",
    duration: "201ms",
    time: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "del_05",
    event: "deployment.completed",
    endpoint: "alerts.company.com/alti",
    status: "success",
    duration: "115ms",
    time: new Date(Date.now() - 7200000).toISOString(),
  },
];

const eventCategories: Record<string, string[]> = {
  Agent: ["agent.started", "agent.completed", "agent.failed"],
  Session: ["session.created", "session.ended"],
  User: ["user.created", "user.updated", "user.deleted"],
  Org: ["org.plan_changed", "org.usage_threshold"],
  Deploy: ["deployment.started", "deployment.completed", "deployment.failed"],
  Security: ["security.alert", "security.audit_finding"],
};

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(mockWebhooks);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});

  const handleDelete = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              status:
                w.status === "active"
                  ? ("paused" as const)
                  : ("active" as const),
            }
          : w,
      ),
    );
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const formatRelative = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);

    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);

    return `${days}d ago`;
  };

  return (
    <div className="w-full flex flex-col h-full justify-start pt-0">
      <div className="space-y-4">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-[#F3F4F6] dark:bg-[#0d1117] -mt-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <Webhook className="w-4.5 h-4.5 text-neutral-600 dark:text-neutral-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  Webhooks
                </h1>
                <p className="text-[11px] text-neutral-400 font-medium">
                  Configure endpoints to receive real-time event notifications
                </p>
              </div>
            </div>
            <button
              className="flex items-center gap-1.5 px-4 py-2.5 bg-black hover:bg-neutral-900 dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-white text-xs font-semibold rounded-lg shadow-sm transition-colors focus:outline-none cursor-pointer"
              type="button"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Endpoint
            </button>
          </div>
        </div>

        {/* Webhook Endpoint Cards */}
        <div className="space-y-3">
          {webhooks.map((wh) => {
            const isPaused = wh.status === "paused";

            return (
              <div
                key={wh.id}
                className={`bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md ${
                  isPaused ? "opacity-60" : ""
                }`}
              >
                {/* Top row: URL + Status + Actions */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className={`flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${
                          isPaused
                            ? "bg-neutral-100 dark:bg-neutral-800"
                            : "bg-indigo-50 dark:bg-indigo-950/30"
                        }`}
                      >
                        <Zap
                          className={`w-3.5 h-3.5 ${
                            isPaused
                              ? "text-neutral-400"
                              : "text-indigo-600 dark:text-indigo-400"
                          }`}
                        />
                      </div>
                      <code className="font-mono text-xs text-neutral-800 dark:text-neutral-200 truncate font-semibold">
                        {wh.url}
                      </code>
                    </div>

                    {/* Events subscribed */}
                    <div className="flex items-center gap-1.5 flex-wrap ml-[38px]">
                      {wh.events.map((evt) => (
                        <span
                          key={evt}
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 tracking-wide"
                        >
                          {evt}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: Status + Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Delivery status */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        wh.lastDelivery === "success"
                          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {wh.lastDelivery === "success" ? (
                        <Check className="w-2.5 h-2.5" />
                      ) : (
                        <X className="w-2.5 h-2.5" />
                      )}
                      {wh.lastDelivery === "success" ? "Healthy" : "Failing"}
                    </span>

                    {/* Active/Paused */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isPaused
                          ? "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isPaused ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                      />
                      {isPaused ? "Paused" : "Active"}
                    </span>
                  </div>
                </div>

                {/* Bottom row: Success rate + Action buttons */}
                <div className="flex items-center justify-between ml-[38px] mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wide">
                        Success Rate
                      </span>
                      <span
                        className={`text-xs font-bold tabular-nums ${
                          wh.successRate >= 99
                            ? "text-emerald-600 dark:text-emerald-400"
                            : wh.successRate >= 95
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {wh.successRate}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 transition-all shadow-sm cursor-pointer"
                      title="Send test event"
                      type="button"
                    >
                      <Play className="w-3 h-3" />
                      Test
                    </button>
                    <button
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 transition-all shadow-sm cursor-pointer"
                      title={isPaused ? "Resume" : "Pause"}
                      type="button"
                      onClick={() => handleToggleStatus(wh.id)}
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-3 h-3" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-3 h-3" />
                          Pause
                        </>
                      )}
                    </button>
                    <button
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161b22] hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 transition-all shadow-sm cursor-pointer"
                      title="Edit endpoint"
                      type="button"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-rose-200 dark:border-rose-800/50 bg-white dark:bg-[#161b22] hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 transition-all shadow-sm cursor-pointer"
                      title="Delete endpoint"
                      type="button"
                      onClick={() => handleDelete(wh.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Supported Events — Collapsible */}
        <div className="bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
            type="button"
            onClick={() => setEventsExpanded(!eventsExpanded)}
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                Supported Events
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 tabular-nums">
                {Object.values(eventCategories).flat().length}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
                eventsExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {eventsExpanded && (
            <div className="px-6 pb-5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              {Object.entries(eventCategories).map(([category, events]) => {
                const isOpen = !!expandedCategories[category];

                return (
                  <div
                    key={category}
                    className="border border-neutral-100 dark:border-neutral-800/60 rounded-xl overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
                      type="button"
                      onClick={() => toggleCategory(category)}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                        <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                          {category}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-400 tabular-nums">
                          {events.length}
                        </span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 flex flex-wrap gap-1.5 animate-in fade-in duration-150">
                        {events.map((evt) => (
                          <span
                            key={evt}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-neutral-50 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 border border-neutral-100 dark:border-neutral-800/60"
                          >
                            {evt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Deliveries Table */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Recent Deliveries
            </span>
          </div>

          {/* Table Header */}
          <div
            className="grid gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-[10px] font-bold text-neutral-450 dark:text-neutral-500 tracking-wider uppercase shadow-sm"
            style={{
              gridTemplateColumns:
                "minmax(0, 1.5fr) minmax(0, 1.8fr) 70px 80px 80px",
            }}
          >
            <div>Event</div>
            <div>Endpoint</div>
            <div>Status</div>
            <div>Duration</div>
            <div>Time</div>
          </div>

          {/* Table Rows */}
          {mockDeliveries.map((del) => (
            <div
              key={del.id}
              className="grid gap-4 px-6 py-4 bg-white dark:bg-[#161b22] border border-neutral-200 dark:border-neutral-800 rounded-2xl items-center text-sm shadow-sm transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md"
              style={{
                gridTemplateColumns:
                  "minmax(0, 1.5fr) minmax(0, 1.8fr) 70px 80px 80px",
              }}
            >
              {/* Event */}
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  {del.event}
                </span>
              </div>

              {/* Endpoint */}
              <div className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {del.endpoint}
              </div>

              {/* Status */}
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    del.status === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {del.status === "success" ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : (
                    <X className="w-2.5 h-2.5" />
                  )}
                  {del.status === "success" ? "200" : "500"}
                </span>
              </div>

              {/* Duration */}
              <div className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
                {del.duration}
              </div>

              {/* Time */}
              <div className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
                {formatRelative(del.time)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
