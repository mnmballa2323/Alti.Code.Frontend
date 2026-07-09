"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Users,
  ArrowLeft,
  LayoutDashboard,
  DollarSign,
  Cloud,
  Cpu,
  Shield,
  FileText,
  Search,
  Headset
} from "lucide-react";

import { useAppSelector, useAppDispatch, RootState } from "@/store";
import { setSearchQuery } from "@/store/uiSlice";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

const ownerItems: SidebarItem[] = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/owner/customers", icon: Users },
  { label: "Transactions", href: "/owner/transactions", icon: FileText },
  { label: "Support Inbox", href: "/owner/support", icon: Headset },
];

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status } = useSession();
  const profileFromStore = useAppSelector((state) => state.user.data);
  const activeMemberName = useAppSelector((state) => state.ui.activeMemberName);
  const { searchQuery, activeThreadSubject } = useAppSelector((state: RootState) => state.ui);
  const profile = profileFromStore?.email ? profileFromStore : null;
  const [isAuthorized, setIsAuthorized] = useState(false);

  const showSearch =
    pathname === "/owner/transactions" ||
    pathname === "/owner/customers";

  const isMemberDetail =
    pathname.startsWith("/owner/customers/") && pathname !== "/owner/customers";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && profile) {
      const userRole = (profile.role || "").toLowerCase();

      if (userRole === "owner") {
        setIsAuthorized(true);
      } else {
        // router.push("/dashboard");
        setIsAuthorized(true);
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
        {title && (
          <h3 className="px-4 text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider mb-2">
            {title}
          </h3>
        )}
        <nav className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
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
              </Link>
            );
          })}
        </nav>
      </div>
    );
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/owner/dashboard")) return "Dashboard";
    if (pathname.startsWith("/owner/members")) return "Invite";
    if (pathname.startsWith("/owner/customers")) return "Customers";
    if (pathname.startsWith("/owner/transactions")) return "Transactions";
    if (pathname.startsWith("/owner/support")) return "Support Inbox";

    return "Platform Owner";
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
            <div className={`h-full flex items-center gap-3 ${pathname.startsWith("/owner/support") ? "w-72 border-r border-neutral-200 dark:border-neutral-800 shrink-0 px-6" : "pl-10"}`}>
              {isMemberDetail ? (
                <Link
                  className="flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-450 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer bg-transparent"
                  href="/owner/customers"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Customers</span>
                </Link>
              ) : (
                <span className="font-semibold text-neutral-950 dark:text-white text-[15px]">
                  {getPageTitle()}
                </span>
              )}
            </div>
            {pathname.startsWith("/owner/support") && activeThreadSubject && (
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
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-[#0d1117] border border-transparent dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-shadow text-neutral-900 dark:text-white placeholder-neutral-500"
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
        <div className="w-72 border-r border-neutral-100 dark:border-neutral-800 bg-white dark:bg-[#161b22] flex flex-col h-full shrink-0 py-6 px-5 overflow-y-auto relative z-10">
          {renderNavGroup("", ownerItems)}
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col h-full bg-[#F3F4F6] dark:bg-[#0d1117] relative overflow-hidden">
          {/* Content Children */}
          <div className={`flex-1 overflow-y-auto relative flex flex-col h-full ${pathname.startsWith("/owner/support") ? "" : "pt-4 px-10"}`}>
            {children}
            {!pathname.startsWith("/owner/support") && <div className="shrink-0 h-4 w-full" />}
          </div>
          {/* Thick gray bar at the bottom */}
          {!pathname.startsWith("/owner/support") && (
            <div className="shrink-0 h-12 w-full bg-[#F3F4F6] dark:bg-[#0d1117] z-10 pointer-events-none absolute bottom-0 left-0" />
          )}
        </div>
      </div>
    </div>
  );
}
