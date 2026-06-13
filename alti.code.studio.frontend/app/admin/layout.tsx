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
  DollarSign,
  Server,
  Cloud,
} from "lucide-react";

import { useAppSelector } from "@/store";
import { FaAws } from "react-icons/fa6";
import { VscAzure } from "react-icons/vsc";
import { SiGooglecloud } from "react-icons/si";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

const adminItems: SidebarItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Invite", href: "/admin/members", icon: UserPlus },
  { label: "Revenue", href: "/admin/revenue", icon: DollarSign },
  { label: "Audit Logs", href: "/admin/audit", icon: Activity },
  { label: "Model Usage", href: "/admin/usage", icon: BarChart3 },
];

const memberItems: SidebarItem[] = [
  { label: "Individual", href: "/admin/team-members", icon: Users },
  { label: "Teams", href: "/admin/teams", icon: Users },
  { label: "Enterprise", href: "/admin/enterprise", icon: Users },
];

const managerItems: SidebarItem[] = [

  { label: "Instructions", href: "/admin/instructions", icon: FileText },
  { label: "Guardrails", href: "/admin/guardrails", icon: Shield },
];

const cloudItems: SidebarItem[] = [
  { label: "Liberty Center One", href: "/admin/liberty", icon: Server },
  { label: "Amazon Web Services", href: "/admin/aws", icon: FaAws },
  { label: "Microsoft Azure", href: "/admin/azure", icon: VscAzure },
  { label: "Google Cloud", href: "/admin/google", icon: SiGooglecloud },
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
  const isTeamsDetail =
    pathname.startsWith("/admin/teams/") && pathname !== "/admin/teams";

  const isEnterpriseDetail =
    pathname.startsWith("/admin/enterprise/") &&
    pathname !== "/admin/enterprise";

  const isMemberDetail =
    (pathname.startsWith("/admin/team-members/") &&
      pathname !== "/admin/team-members") ||
    isTeamsDetail ||
    isEnterpriseDetail;

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
      pathname.startsWith("/admin/teams") ||

      pathname.startsWith("/admin/revenue") ||
      pathname.startsWith("/admin/audit") ||
      pathname.startsWith("/admin/usage")
    ) {
      return "Platform Admin";
    }
    if (

      pathname.startsWith("/admin/instructions") ||
      pathname.startsWith("/admin/guardrails")
    ) {
      return "Platform Controls";
    }

    if (
      pathname.startsWith("/admin/liberty") ||
      pathname.startsWith("/admin/aws") ||
      pathname.startsWith("/admin/azure") ||
      pathname.startsWith("/admin/google")
    ) {
      return "Cloud Providers";
    }

    return "Platform Admin";
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
    if (pathname.startsWith("/admin/members")) return "Invite";
    if (pathname.startsWith("/admin/team-members")) return "Individual";
    if (pathname.startsWith("/admin/teams")) return "Teams";
    if (pathname.startsWith("/admin/enterprise")) return "Enterprise";

    if (pathname.startsWith("/admin/revenue")) return "Revenue";

    if (pathname.startsWith("/admin/instructions")) return "Instructions";
    if (pathname.startsWith("/admin/guardrails")) return "Guardrails";
    if (pathname.startsWith("/admin/usage")) return "Model Usage";
    if (pathname.startsWith("/admin/audit")) return "Audit Logs";

    if (pathname.startsWith("/admin/liberty")) return "Liberty Center One";
    if (pathname.startsWith("/admin/aws")) return "Amazon Web Services";
    if (pathname.startsWith("/admin/azure")) return "Microsoft Azure";
    if (pathname.startsWith("/admin/google")) return "Google Cloud";

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
        <div className="flex-1 h-full flex items-center justify-between pl-10 pr-14">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-neutral-950 dark:text-white text-[15px]">
              {isMemberDetail
                ? activeMemberName || "Ada Lovelace"
                : getPageTitle()}
            </span>
          </div>

          <div className="flex items-center">
            {isMemberDetail && (
              <Link
                className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-450 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer bg-transparent"
                href={
                  isEnterpriseDetail
                    ? "/admin/enterprise"
                    : isTeamsDetail
                      ? "/admin/teams"
                      : "/admin/team-members"
                }
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>
                  {isEnterpriseDetail
                    ? "Back to Enterprise"
                    : isTeamsDetail
                      ? "Back to Teams"
                      : "Back to Individual"}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex w-full overflow-hidden">
        {/* Internal Navigation Sidebar */}
        <div className="w-72 border-r border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#161b22] flex flex-col h-full shrink-0 py-6 px-5 overflow-y-auto relative z-10">
          {renderNavGroup("Platform Admin", adminItems)}
          {renderNavGroup("Member Management", memberItems, "mt-8")}
          {renderNavGroup("Platform Controls", managerItems, "mt-8")}
          {renderNavGroup("Cloud Providers", cloudItems, "mt-8")}
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#0d1117] relative overflow-hidden">
          {/* Content Children */}
          <div className="flex-1 overflow-y-auto pt-4 px-10 relative flex flex-col h-full">
            {children}
            <div className="shrink-0 h-4 w-full" />
          </div>
          {/* Thick gray bar at the bottom */}
          <div className="shrink-0 h-12 w-full bg-[#F3F4F6] dark:bg-[#0d1117] z-10 pointer-events-none absolute bottom-0 left-0" />
        </div>
      </div>
    </div>
  );
}
