"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
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
} from "lucide-react";

import { useAppSelector } from "@/store";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

const ownerItems: SidebarItem[] = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Revenue", href: "/owner/revenue", icon: DollarSign },
  { label: "Audit Logs", href: "/owner/audit", icon: Activity },
  { label: "Model Usage", href: "/owner/usage", icon: BarChart3 },
];

const memberItems: SidebarItem[] = [
  { label: "Individual", href: "/owner/team-members", icon: Users },
  { label: "Teams", href: "/owner/teams", icon: Users },
  { label: "Enterprise", href: "/owner/enterprise", icon: Users },
];

const managerItems: SidebarItem[] = [

  { label: "Instructions", href: "/owner/instructions", icon: FileText },
  { label: "Guardrails", href: "/owner/guardrails", icon: Shield },
];

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { status } = useSession();
  const profileFromStore = useAppSelector((state) => state.user.data);
  const activeMemberName = useAppSelector((state) => state.ui.activeMemberName);
  const profile = profileFromStore?.email ? profileFromStore : null;
  const [isAuthorized, setIsAuthorized] = useState(false);

  const isTeamsDetail =
    pathname.startsWith("/owner/teams/") && pathname !== "/owner/teams";

  const isEnterpriseDetail =
    pathname.startsWith("/owner/enterprise/") &&
    pathname !== "/owner/enterprise";

  const isMemberDetail =
    (pathname.startsWith("/owner/team-members/") &&
      pathname !== "/owner/team-members") ||
    isTeamsDetail ||
    isEnterpriseDetail;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && profile) {
      const userRole = (profile.role || "").toLowerCase();

      if (userRole === "owner") {
        setIsAuthorized(true);
      } else {
        router.push("/dashboard");
      }
    }
  }, [status, profile, router]);

  const isAuthLoading =
    status === "loading" || (status === "authenticated" && !isAuthorized);

  const renderNavGroup = (
    title: string,
    items: SidebarItem[],
    extraClass = "",
  ) => {
    return (
      <div className={`mb-6 ${extraClass}`}>
        <h3 className="px-4 text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider mb-2">
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

  const getPageTitle = () => {
    if (pathname.startsWith("/owner/dashboard")) return "Dashboard";
    if (pathname.startsWith("/owner/members")) return "Invite";
    if (pathname.startsWith("/owner/team-members")) return "Individual";
    if (pathname.startsWith("/owner/teams")) return "Teams";
    if (pathname.startsWith("/owner/enterprise")) return "Enterprise";

    if (pathname.startsWith("/owner/revenue")) return "Revenue";

    if (pathname.startsWith("/owner/instructions")) return "Instructions";
    if (pathname.startsWith("/owner/guardrails")) return "Guardrails";
    if (pathname.startsWith("/owner/usage")) return "Model Usage";
    if (pathname.startsWith("/owner/audit")) return "Audit Logs";

    return "Platform Owner";
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
                    ? "/owner/enterprise"
                    : isTeamsDetail
                      ? "/owner/teams"
                      : "/owner/team-members"
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
        <div className="w-64 border-r border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#161b22] flex flex-col h-full shrink-0 py-6 px-5 overflow-y-auto relative z-10">
          {renderNavGroup("Platform Admin", ownerItems)}
          {renderNavGroup("Members", memberItems, "mt-8")}
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
