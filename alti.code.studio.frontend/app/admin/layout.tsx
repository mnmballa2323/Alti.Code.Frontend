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

  return (
    <div className="flex h-screen w-full bg-[#FFFFFF] dark:bg-[#0d1117] text-neutral-800 dark:text-neutral-200 font-sans overflow-hidden">
      {/* Internal Navigation Sidebar */}
      <div className="w-64 border-r border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#161b22] flex flex-col h-full shrink-0 py-8 px-5">
        <div className="flex items-center gap-3 mb-8 px-2">
          {/* Hexagon Outline Logo Icon */}
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-neutral-800 dark:text-neutral-200"
          >
            <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" />
            <path d="M50 10 L50 90" />
            <path d="M50 50 L85 30" />
            <path d="M50 50 L15 30" />
          </svg>
          <span className="font-semibold text-neutral-900 dark:text-white text-[15px]">
            Platform Console
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 -mr-2">
          {renderNavGroup("Platform Admin", adminItems)}
          {renderNavGroup("Platform Manager", managerItems)}
          {renderNavGroup("System Operations", systemItems)}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] dark:bg-[#0d1117] relative overflow-hidden">
        {/* Subtle Background Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0 select-none">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-72 h-72 text-neutral-800 dark:text-white"
          >
            <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" />
            <path d="M50 10 L50 90" />
            <path d="M50 50 L85 30" />
            <path d="M50 50 L15 30" />
          </svg>
        </div>

        {/* Content Children */}
        <div className="flex-1 overflow-y-auto p-10 z-10 relative flex flex-col h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
