"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Shield,
  CreditCard,
  BarChart3,
  Bot,
  Server,
  Rocket,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Circle,
} from "lucide-react";

import { API_URL } from "@/lib/config";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type NotificationCategory =
  | "security"
  | "billing"
  | "usage"
  | "agent"
  | "system"
  | "deployment";

interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
}

type FilterTab = "all" | NotificationCategory;

interface NotificationPrefs {
  security: boolean;
  billing: boolean;
  usage: boolean;
  agent: boolean;
  system: boolean;
}

interface ChannelPrefs {
  inApp: boolean;
  desktop: boolean;
  email: boolean;
}

/* ------------------------------------------------------------------ */
/*  Category icon / color map                                          */
/* ------------------------------------------------------------------ */

const CATEGORY_META: Record<
  NotificationCategory,
  { icon: React.ComponentType<any>; color: string; bg: string; label: string }
> = {
  security: {
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10",
    label: "Security",
  },
  billing: {
    icon: CreditCard,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Billing",
  },
  usage: {
    icon: BarChart3,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: "Usage",
  },
  agent: {
    icon: Bot,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    label: "Agent",
  },
  system: {
    icon: Server,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "System",
  },
  deployment: {
    icon: Rocket,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    label: "Deployment",
  },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "security", label: "Security" },
  { key: "billing", label: "Billing" },
  { key: "usage", label: "Usage" },
  { key: "agent", label: "Agent" },
  { key: "system", label: "System" },
];

/* ------------------------------------------------------------------ */
/*  Fallback mock data                                                 */
/* ------------------------------------------------------------------ */

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    category: "security",
    title: "New login from unknown device",
    message:
      "A sign-in was detected from Chrome on Windows in San Jose, CA. If this wasn't you, secure your account immediately.",
    timeAgo: "5 min ago",
    read: false,
  },
  {
    id: "n2",
    category: "billing",
    title: "Invoice #1234 generated",
    message:
      "Your monthly invoice for $2,847.63 has been generated and is ready for review.",
    timeAgo: "1 hour ago",
    read: false,
  },
  {
    id: "n3",
    category: "agent",
    title: "Code Architect completed 15 tasks",
    message:
      "The Code Architect agent finished a batch run — 15 tasks completed, 0 failed, avg latency 2.3s.",
    timeAgo: "2 hours ago",
    read: false,
  },
  {
    id: "n4",
    category: "usage",
    title: "Token usage at 85% of monthly limit",
    message:
      "Your organization has consumed 85% of the monthly token allowance. Consider upgrading or reviewing high-usage agents.",
    timeAgo: "3 hours ago",
    read: true,
  },
  {
    id: "n5",
    category: "system",
    title: "Platform update deployed v2.4.1",
    message:
      "Includes performance improvements, new guardrail options, and bug fixes for the agent dashboard.",
    timeAgo: "1 day ago",
    read: true,
  },
  {
    id: "n6",
    category: "security",
    title: "API key rotated successfully",
    message:
      "The production API key ending in …f8a2 was rotated. Old key is now revoked.",
    timeAgo: "2 days ago",
    read: true,
  },
  {
    id: "n7",
    category: "agent",
    title: "Security Auditor flagged 3 issues",
    message:
      "The Security Auditor agent found 3 medium-severity issues during the nightly scan. Review recommended.",
    timeAgo: "2 days ago",
    read: true,
  },
  {
    id: "n8",
    category: "deployment",
    title: "Staging deployment completed",
    message:
      "Build #487 deployed to staging environment successfully. All health checks passed.",
    timeAgo: "3 days ago",
    read: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [categoryPrefs, setCategoryPrefs] = useState<NotificationPrefs>({
    security: true,
    billing: true,
    usage: true,
    agent: true,
    system: true,
  });
  const [channelPrefs, setChannelPrefs] = useState<ChannelPrefs>({
    inApp: true,
    desktop: true,
    email: false,
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken") ||
              localStorage.getItem("token")
            : null;

        const res = await fetch(`${API_URL}/notifications`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        if (json.success && json.data) {
          setNotifications(json.data);
        }
      } catch {
        // API unavailable — keep mock data
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  /* ---- Derived values ---- */
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeTab);

  /* ---- Actions ---- */
  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const toggleCategoryPref = (key: keyof NotificationPrefs) =>
    setCategoryPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleChannelPref = (key: keyof ChannelPrefs) =>
    setChannelPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={unreadCount === 0}
          onClick={markAllRead}
        >
          <CheckCheck className="h-4 w-4" />
          Mark All Read
        </button>
      </div>

      {/* ---- Filter Tabs ---- */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "bg-default-100 text-default-600 hover:bg-default-200"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---- Notification List ---- */}
      <Card className="border border-default-200 bg-default-50/50">
        <CardBody className="p-0 divide-y divide-default-200 max-h-[520px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-default-400 text-sm">
              No notifications in this category.
            </p>
          ) : (
            filtered.map((n) => {
              const meta = CATEGORY_META[n.category];
              const IconComp = meta.icon;

              return (
                <button
                  key={n.id}
                  className="flex items-start gap-4 w-full text-left p-4 hover:bg-default-100/60 transition-colors"
                  onClick={() => markRead(n.id)}
                >
                  {/* Category icon */}
                  <div className={`flex-shrink-0 rounded-lg p-2 ${meta.bg}`}>
                    <IconComp className={`h-5 w-5 ${meta.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${n.read ? "font-normal text-default-700" : "font-semibold text-foreground"}`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-default-500 mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-default-400 mt-1">
                      {n.timeAgo}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <Circle className="h-2.5 w-2.5 flex-shrink-0 mt-1.5 fill-primary text-primary" />
                  )}
                </button>
              );
            })
          )}
        </CardBody>
      </Card>

      {/* ---- Notification Preferences (collapsible) ---- */}
      <Card className="border border-default-200 bg-default-50/50">
        <CardHeader
          className="cursor-pointer select-none flex items-center justify-between px-4 py-3"
          onClick={() => setPrefsOpen((v) => !v)}
        >
          <span className="text-sm font-semibold">
            Notification Preferences
          </span>
          {prefsOpen ? (
            <ChevronUp className="h-4 w-4 text-default-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-default-500" />
          )}
        </CardHeader>

        {prefsOpen && (
          <CardBody className="pt-0 pb-5 px-4 space-y-5">
            {/* Category toggles */}
            <div>
              <p className="text-xs font-medium text-default-500 uppercase tracking-wider mb-3">
                Categories
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(
                  Object.keys(categoryPrefs) as (keyof NotificationPrefs)[]
                ).map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      checked={categoryPrefs[key]}
                      className="rounded border-default-300 text-primary focus:ring-primary"
                      type="checkbox"
                      onChange={() => toggleCategoryPref(key)}
                    />
                    <span className="capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Channel checkboxes */}
            <div>
              <p className="text-xs font-medium text-default-500 uppercase tracking-wider mb-3">
                Channels
              </p>
              <div className="flex gap-6">
                {(
                  [
                    { key: "inApp" as const, label: "In-App" },
                    { key: "desktop" as const, label: "Desktop" },
                    { key: "email" as const, label: "Email" },
                  ] as const
                ).map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      checked={channelPrefs[key]}
                      className="rounded border-default-300 text-primary focus:ring-primary"
                      type="checkbox"
                      onChange={() => toggleChannelPref(key)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </CardBody>
        )}
      </Card>
    </section>
  );
}
