"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  UserPlus,
  Users,
  CreditCard,
  FileText,
  BookOpen,
  Shield,
  Activity,
  BarChart3,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";

import { useAppSelector } from "@/store";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

const adminItems: SidebarItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Invite", href: "/admin/members", icon: UserPlus },
  { label: "Members", href: "/admin/team-members", icon: Users },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Invoices", href: "/admin/invoices", icon: FileText },
  { label: "Audit Logs", href: "/admin/audit", icon: Activity },
  { label: "Model Usage", href: "/admin/usage", icon: BarChart3 },
];

const managerItems: SidebarItem[] = [
  { label: "Knowledge", href: "/admin/data", icon: BookOpen },
  { label: "Instructions", href: "/admin/instructions", icon: FileText },
  { label: "Guardrails", href: "/admin/guardrails", icon: Shield },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const profileFromStore = useAppSelector((state) => state.user.data);
  const activeMemberName = useAppSelector((state) => state.ui.activeMemberName);
  const profile = profileFromStore?.email ? profileFromStore : null;
  const [isAdmin, setIsAdmin] = useState(false);
  const isMemberDetail =
    pathname.startsWith("/admin/team-members/") &&
    pathname !== "/admin/team-members";

  useEffect(() => {
    if (profile) {
      if (profile.role === "admin" || profile.role === "ADMIN") {
        setIsAdmin(true);
      }
    }
  }, [profile]);

  const renderNavGroup = (
    title: string,
    items: SidebarItem[],
    extraClass = "",
  ) => {
    return (
      <div className={`mb-6 ${extraClass}`}>
        <h3 className="px-4 text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">
          {title}
        </h3>
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <a
                key={item.label}
                className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-white"
                }`}
                href={item.href}
              >
                <item.icon
                  className={`w-4 h-4 ${isActive ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}
                />
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    );
  };

  const getActiveGroup = () => {
    if (
      pathname.startsWith("/admin/dashboard") ||
      pathname.startsWith("/admin/members") ||
      pathname.startsWith("/admin/team-members") ||
      pathname.startsWith("/admin/billing") ||
      pathname.startsWith("/admin/invoices") ||
      pathname.startsWith("/admin/audit") ||
      pathname.startsWith("/admin/usage")
    ) {
      return "Platform Admin";
    }
    if (
      pathname.startsWith("/admin/data") ||
      pathname.startsWith("/admin/instructions") ||
      pathname.startsWith("/admin/guardrails")
    ) {
      return "Platform Manager";
    }

    return "Platform Admin";
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
    if (pathname.startsWith("/admin/members")) return "Invite";
    if (pathname.startsWith("/admin/team-members")) return "Members";
    if (pathname.startsWith("/admin/billing")) return "Billing";
    if (pathname.startsWith("/admin/invoices")) return "Invoices";
    if (pathname.startsWith("/admin/data")) return "Knowledge";
    if (pathname.startsWith("/admin/instructions")) return "Instructions";
    if (pathname.startsWith("/admin/guardrails")) return "Guardrails";
    if (pathname.startsWith("/admin/usage")) return "Model Usage";
    if (pathname.startsWith("/admin/audit")) return "Audit Logs";

    return "Platform Admin";
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#FFFFFF] dark:bg-[#0d1117] text-neutral-800 dark:text-neutral-200 font-sans overflow-hidden">
      {/* Top Title Navbar */}
      <div className="h-14 w-full bg-white dark:bg-[#161b22] border-b border-neutral-100 dark:border-neutral-800 flex items-center shrink-0 z-20">
        {/* Left header: aligns with sidebar width */}
        <div className="w-64 border-r border-neutral-100 dark:border-neutral-800 h-full flex items-center gap-3 px-6 shrink-0">
          <img
            alt="Inso Code Logo"
            className="w-5 h-5 object-contain block dark:hidden animate-fade-in"
            src="/logo-black.png"
          />
          <img
            alt="Inso Code Logo"
            className="w-5 h-5 object-contain hidden dark:block animate-fade-in"
            src="/logo-white.png"
          />
        </div>

        {/* Right header: page title and user info */}
        <div className="flex-1 h-full flex items-center justify-between px-10">
          <span className="font-semibold text-neutral-950 dark:text-white text-[15px]">
            {isMemberDetail
              ? activeMemberName || "Ada Lovelace"
              : getPageTitle()}
          </span>
          <div className="flex items-center gap-6">
            {isMemberDetail && (
              <Link
                className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-450 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer bg-transparent"
                href="/admin/team-members"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Members</span>
              </Link>
            )}
            {profile && (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-150">
                    {profile.email}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    {profile.role || "Admin"}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 font-bold text-xs">
                  {(profile.email || "A").charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex w-full overflow-hidden">
        {/* Internal Navigation Sidebar */}
        <div className="w-64 border-r border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#161b22] flex flex-col h-full shrink-0 py-6 px-5 overflow-y-auto relative z-10">
          {renderNavGroup("Platform Admin", adminItems)}
          {renderNavGroup("Platform Manager", managerItems, "mt-8")}
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#0d1117] relative overflow-hidden">
          {/* Content Children */}
          <div className="flex-1 overflow-y-auto pt-4 px-10 pb-10 z-10 relative flex flex-col h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
