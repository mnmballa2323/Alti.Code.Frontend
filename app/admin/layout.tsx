"use client";

import type { RootState } from "@/store";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  UserPlus,
  Users,
  CreditCard,
  FileText,
  ArrowLeft,
  Activity,
  Headset,
  ClipboardList,
  Search,
  Wallet,
  Inbox,
  Tag,
} from "lucide-react";

import { useAppSelector, useAppDispatch } from "@/store";
import { setSearchQuery } from "@/store/uiSlice";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

const workspaceItems: SidebarItem[] = [
  { label: "Invite", href: "/admin/members", icon: UserPlus },
  { label: "Members", href: "/admin/team-members", icon: Users },
];

const billingItems: SidebarItem[] = [
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Invoices", href: "/admin/invoices", icon: FileText },
];

const pricingItems: SidebarItem[] = [
  { label: "Pricing", href: "/admin/pricing", icon: Tag },
  { label: "Balance", href: "/admin/balance", icon: Wallet },
];

const systemItems: SidebarItem[] = [
  { label: "Usage", href: "/admin/usage", icon: Activity },
  { label: "Logs", href: "/admin/logs", icon: ClipboardList },
];

const supportItems: SidebarItem[] = [
  { label: "Support", href: "/admin/support", icon: Headset },
  { label: "Inbox", href: "/admin/inbox", icon: Inbox },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const dispatch = useAppDispatch();
  const profileFromStore = useAppSelector((state) => state.user.data);
  const activeMemberName = useAppSelector((state) => state.ui.activeMemberName);
  const { searchQuery, activeThreadSubject } = useAppSelector(
    (state: RootState) => state.ui,
  );
  const profile = profileFromStore?.email ? profileFromStore : null;
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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

  const showSearch =
    pathname === "/admin/team-members" ||
    pathname === "/admin/logs" ||
    pathname === "/admin/invoices";

  useEffect(() => {
    if (profile) {
      if (
        profile.role === "admin" ||
        profile.role === "ADMIN" ||
        profile.role === "owner" ||
        profile.role === "OWNER" ||
        profile.role === "super_admin" ||
        profile.role === "SUPER_ADMIN"
      ) {
        setIsAdmin(true);
      } else {
        // Authenticated but not admin/owner → redirect away
        // window.location.href = "/";
        setIsAdmin(true); // Temporarily allow access
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
        {title && (
          <h3 className="px-4 text-[10px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider mb-2">
            {title}
          </h3>
        )}
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

    if (pathname.startsWith("/admin/gcp")) {
      return "Cloud Providers";
    }

    return "Platform Admin";
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
    if (pathname.startsWith("/admin/members")) return "Invite";
    if (pathname.startsWith("/admin/team-members")) return "Members";

    if (pathname.startsWith("/admin/balance")) return "Balance";
    if (pathname.startsWith("/admin/billing")) return "Billing";
    if (pathname.startsWith("/admin/invoices")) return "Invoices";
    if (pathname.startsWith("/admin/usage")) return "Usage";
    if (pathname.startsWith("/admin/logs")) return "Logs";
    if (pathname.startsWith("/admin/support")) return "Support";
    if (pathname.startsWith("/admin/inbox")) return "Inbox";

    return "Platform Admin";
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F3F4F6] dark:bg-[#0d1117] overflow-hidden text-neutral-900 dark:text-neutral-100">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Overriding Chrome autofill default background */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active,
        input:-internal-autofill-selected {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: #171717 !important;
        }
        
        .dark input:-webkit-autofill,
        .dark input:-webkit-autofill:hover, 
        .dark input:-webkit-autofill:focus, 
        .dark input:-webkit-autofill:active,
        .dark input:-internal-autofill-selected {
          -webkit-box-shadow: 0 0 0 1000px #171717 inset !important;
          box-shadow: 0 0 0 1000px #171717 inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }
      `,
        }}
      />
      {/* Top Title Navbar */}
      <div className="h-14 w-full bg-white dark:bg-[#161b22] border-b border-neutral-100 dark:border-neutral-800 flex items-center shrink-0 z-20">
        {/* Left header: aligns with sidebar width */}
        <div className="w-72 border-r border-neutral-100 dark:border-neutral-800 h-full flex items-center gap-3 px-6 shrink-0">
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
        <div className="flex-1 h-full flex items-center justify-between">
          <div className="flex items-center h-full">
            <div
              className={`h-full flex items-center gap-3 ${pathname.startsWith("/admin/inbox") ? "w-72 border-r border-neutral-200 dark:border-neutral-800 shrink-0 px-6" : "pl-10"}`}
            >
              {isMemberDetail ? (
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
                        : "Back to Members"}
                  </span>
                </Link>
              ) : (
                <span className="font-semibold text-neutral-950 dark:text-white text-[15px]">
                  {getPageTitle()}
                </span>
              )}
            </div>
            {pathname.startsWith("/admin/inbox") && activeThreadSubject && (
              <span className="font-semibold text-neutral-900 dark:text-white ml-6">
                {activeThreadSubject.replace(/^Re:\s*/i, "")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 pr-10">
            {showSearch && (
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-[#0d1117] border border-transparent dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-shadow text-neutral-900 dark:text-white placeholder-neutral-500"
                  placeholder="Search..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                />
              </div>
            )}

            {isMemberDetail && (
              <span className="font-semibold text-neutral-950 dark:text-white text-[15px]">
                {activeMemberName || "Ada Lovelace"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex w-full overflow-hidden">
        {/* Internal Navigation Sidebar */}
        <div className="w-72 border-r border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#161b22] flex flex-col h-full shrink-0 py-6 px-5 relative z-10">
          <div className="flex-1 overflow-y-auto">
            {renderNavGroup("Workspace", workspaceItems)}
            {renderNavGroup("Billing", billingItems)}
            {renderNavGroup("Finances", pricingItems)}
            {renderNavGroup("System", systemItems)}
            {renderNavGroup("Support", supportItems)}
          </div>
          <div className="pt-4 mt-auto">
            <button
              className="w-full bg-[#e53935] hover:bg-[#d32f2f] text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
              onClick={() => setShowLogoutModal(true)}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#0d1117] relative overflow-hidden">
          {/* Content Children */}
          <div
            className={`flex-1 overflow-y-auto relative flex flex-col h-full ${pathname.startsWith("/admin/inbox") ? "" : "pt-4 px-10"}`}
          >
            {children}
            {!pathname.startsWith("/admin/inbox") && (
              <div className="shrink-0 h-4 w-full" />
            )}
          </div>
          {/* Thick gray bar at the bottom */}
          {!pathname.startsWith("/admin/inbox") && (
            <div className="shrink-0 h-12 w-full bg-[#F3F4F6] dark:bg-[#0d1117] z-10 pointer-events-none absolute bottom-0 left-0" />
          )}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#161b22] w-[300px] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <h3 className="text-[17px] font-bold text-neutral-900 dark:text-white mb-1.5">
                Logout
              </h3>
              <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
                Are you sure you want to logout?
              </p>
            </div>
            <div className="flex border-t border-neutral-200 dark:border-neutral-700">
              <button
                className="flex-1 py-3 text-[15px] font-normal text-neutral-900 dark:text-white border-r border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 text-[15px] font-normal text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
