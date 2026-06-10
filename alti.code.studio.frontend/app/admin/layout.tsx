"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserPlus,
  Users,
  CreditCard,
  FileText,
  BookOpen,
  FolderOpen,
  Shield,
  Activity,
} from "lucide-react";
import { getUserData } from "@/lib/user";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

const adminItems: SidebarItem[] = [
  { label: "Invite", href: "/admin/members", icon: UserPlus },
  { label: "Members", href: "/admin/team-members", icon: Users },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Invoices", href: "/admin/invoices", icon: FileText },
];

const managerItems: SidebarItem[] = [
  { label: "Knowledge", href: "/admin/data", icon: BookOpen },
  { label: "Instructions", href: "/admin/instructions", icon: FileText },
  { label: "Guardrails", href: "/admin/guardrails", icon: Shield },
  { label: "Projects", href: "/admin/projects", icon: FolderOpen },
];

const systemItems: SidebarItem[] = [
  { label: "Audit Logs", href: "/admin/audit", icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const res = await getUserData(token);
          if (res?.success && (res?.data?.role === "admin" || res?.data?.role === "ADMIN")) {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error("Failed verification:", err);
      }
    })();
  }, []);

  const renderNavGroup = (title: string, items: SidebarItem[]) => {
    return (
      <div className="mb-6">
        <h3 className="px-4 text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">
          {title}
        </h3>
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  };

  const getSidebarHeader = () => {
    if (
      pathname.startsWith("/admin/members") ||
      pathname.startsWith("/admin/team-members") ||
      pathname.startsWith("/admin/billing") ||
      pathname.startsWith("/admin/invoices")
    ) {
      return "Platform Admin";
    }
    if (
      pathname.startsWith("/admin/data") ||
      pathname.startsWith("/admin/instructions") ||
      pathname.startsWith("/admin/guardrails") ||
      pathname.startsWith("/admin/projects")
    ) {
      return "Platform Manager";
    }
    return "Platform Console";
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/admin/members")) return "Invite";
    if (pathname.startsWith("/admin/team-members")) return "Members";
    if (pathname.startsWith("/admin/billing")) return "Billing";
    if (pathname.startsWith("/admin/invoices")) return "Invoices";
    if (pathname.startsWith("/admin/data")) return "Knowledge";
    if (pathname.startsWith("/admin/instructions")) return "Instructions";
    if (pathname.startsWith("/admin/guardrails")) return "Guardrails";
    if (pathname.startsWith("/admin/projects")) return "Projects";
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
            src="/inso-logo-black.png"
            alt="Inso Code Logo"
            className="w-5 h-5 object-contain block dark:hidden"
          />
          <img
            src="/inso-logo-white.png"
            alt="Inso Code Logo"
            className="w-5 h-5 object-contain hidden dark:block"
          />
          <span className="font-semibold text-neutral-900 dark:text-white text-[14px]">
            {getSidebarHeader()}
          </span>
        </div>

        {/* Right header: page title */}
        <div className="flex-1 h-full flex items-center px-10">
          <span className="font-semibold text-neutral-950 dark:text-white text-[15px]">
            {getPageTitle()}
          </span>
        </div>
      </div>

      <div className="flex-1 flex w-full overflow-hidden">
        {/* Internal Navigation Sidebar */}
        <div className="w-64 border-r border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#161b22] flex flex-col h-full shrink-0 py-6 px-5 overflow-y-auto">
          {renderNavGroup("Platform Admin", adminItems)}
          {renderNavGroup("Platform Manager", managerItems)}
          {renderNavGroup("System Operations", systemItems)}
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#0d1117] relative overflow-hidden">
          {/* Subtle Background Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] dark:opacity-[0.04] z-0 select-none">
            <img
              src="/inso-logo-black.png"
              alt="Inso Code Watermark"
              className="w-80 h-80 object-contain block dark:hidden"
            />
            <img
              src="/inso-logo-white.png"
              alt="Inso Code Watermark"
              className="w-80 h-80 object-contain hidden dark:block"
            />
          </div>

          {/* Content Children */}
          <div className="flex-1 overflow-y-auto p-10 z-10 relative flex flex-col h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
