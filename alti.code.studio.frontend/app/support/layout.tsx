"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Headset,
  Search,
  LogOut,
  Users
} from "lucide-react";
import { signOut } from "next-auth/react";

import { useAppSelector, useAppDispatch } from "@/store";
import type { RootState } from "@/store";
import type { TeamMember } from "@/store/teamSlice";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

const supportItems: SidebarItem[] = [
  { label: "Inbox", href: "/support/inbox", icon: Headset },
  { label: "Group Chat", href: "/support/group", icon: Users },
];

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { status } = useSession();
  const profileFromStore = useAppSelector((state) => state.user.data);
  const { activeThreadSubject } = useAppSelector((state: RootState) => state.ui);
  const teamMembers = useAppSelector((state: RootState) => state.team.members);
  const profile = profileFromStore?.email ? profileFromStore : null;
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && profile) {
      const userRole = (profile.role || "").toLowerCase();

      if (userRole === "owner" || userRole === "support" || userRole === "admin" || userRole === "super_admin" || !userRole) {
        setIsAuthorized(true);
      } else {
        // router.push("/dashboard");
        setIsAuthorized(true);
      }
    }
  }, [status, profile, router]);

  const isAuthLoading = status === "loading";

  const getPageTitle = () => {
    if (pathname.startsWith("/support/inbox")) return "Support Inbox";
    if (pathname.startsWith("/support/group")) return "Group Chat";
    if (pathname.startsWith("/support/chat/")) {
      const memberId = pathname.split("/support/chat/")[1];
      const member = teamMembers?.find((m) => m.id === memberId);
      if (member) return member.name;
    }
    return "Support Portal";
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
          -webkit-text-fill-color: #000000 !important;
          background-color: transparent !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .dark input:-webkit-autofill,
        .dark input:-webkit-autofill:hover, 
        .dark input:-webkit-autofill:focus, 
        .dark input:-webkit-autofill:active,
        .dark input:-internal-autofill-selected {
          -webkit-box-shadow: 0 0 0 1000px #0d1117 inset !important;
          box-shadow: 0 0 0 1000px #0d1117 inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }
      `,
        }}
      />
      {isAuthLoading ? (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0d1117]">
          <div className="w-6 h-6 border-2 border-neutral-300 dark:border-neutral-700 border-t-black dark:border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-1 h-full overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 h-full bg-white dark:bg-[#161b22] border-r border-neutral-200 dark:border-neutral-800 flex flex-col shrink-0">
            {/* Logo area */}
            <div className="h-14 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
              <span className="font-bold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                Support Portal
              </span>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-6">
              <div className="mb-6">
                <h3 className="px-4 text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider mb-2">
                  Messages
                </h3>
                <nav className="flex flex-col gap-1">
                  {supportItems.map((item) => {
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

              {/* Team Chat Section */}
              {teamMembers && teamMembers.length > 0 && (
                <div className="mb-6">
                  <h3 className="px-4 text-[10px] font-bold text-neutral-455 dark:text-neutral-500 uppercase tracking-wider mb-2">
                    Team Members
                  </h3>
                  <nav className="flex flex-col gap-1">
                    {teamMembers.map((member) => {
                      const chatHref = `/support/chat/${member.id}`;
                      const isActive = pathname === chatHref;

                      return (
                        <Link
                          key={member.id}
                          className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                            isActive
                              ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                              : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-white"
                          }`}
                          href={chatHref}
                        >
                          <span className="truncate">{member.name}</span>
                          {member.status === "Pending" && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-orange-400" title="Pending invite" />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              )}
            </div>

            {/* User Profile Area */}
            <div className="h-24 flex items-center px-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-3 px-2 w-full">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                    {profile?.username || "Support Agent"}
                  </span>
                  <span className="text-xs text-neutral-500 truncate">
                    {profile?.email || "agent@company.com"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F3F4F6] dark:bg-[#0d1117]">
            {/* Topbar */}
            <header className="h-14 flex items-center justify-between px-6 bg-white dark:bg-[#161b22] border-b border-neutral-200 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold text-neutral-900 dark:text-white leading-tight">
                    {getPageTitle()}
                  </h1>
                </div>
              </div>

              {/* Breadcrumb / Thread Subject */}
              {activeThreadSubject && (
                <div className="hidden md:flex items-center gap-2 text-sm font-medium text-neutral-500 bg-neutral-50 dark:bg-[#0d1117] px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="max-w-[300px] truncate">{activeThreadSubject}</span>
                </div>
              )}
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </div>
      )}
    </div>
  );
}
