"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Globe,
  DollarSign,
  Sliders,
  LogOut,
  ArrowLeft,
  Loader2
} from "lucide-react";

import { useAppSelector } from "@/store";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

const ownerItems: SidebarItem[] = [
  { label: "Overview", href: "/owner", icon: LayoutDashboard },
  { label: "Tenants", href: "/owner/tenants", icon: Globe },
  { label: "Financials", href: "/owner/financials", icon: DollarSign },
  { label: "Operations", href: "/owner/operations", icon: Sliders },
];

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { status } = useSession();
  const profile = useAppSelector((state) => state.user.data);
  const [isAuthorized, setIsAuthorized] = useState(false);

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

  if (status === "loading" || (status === "authenticated" && !isAuthorized)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d1117] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <span className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
            Securing Connection...
          </span>
        </div>
      </div>
    );
  }

  const renderNavGroup = (title: string, items: SidebarItem[]) => {
    return (
      <div className="mb-6">
        <h3 className="px-4 text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3">
          {title}
        </h3>
        <nav className="flex flex-col gap-1.5">
          {items.map((item) => {
            // Match overview exactly, others by prefix
            const isActive = item.href === "/owner" 
              ? pathname === "/owner"
              : pathname.startsWith(item.href);

            return (
              <a
                key={item.label}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500/10 border-l-2 border-amber-500 text-amber-500 font-semibold"
                    : "text-neutral-400 hover:bg-neutral-800/40 hover:text-white"
                }`}
                href={item.href}
              >
                <item.icon
                  className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-neutral-500"}`}
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
    if (pathname === "/owner") return "Overview";
    if (pathname.startsWith("/owner/tenants")) return "Tenants";
    if (pathname.startsWith("/owner/financials")) return "Financials";
    if (pathname.startsWith("/owner/operations")) return "Operations";
    return "Owner Platform";
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0d1117] text-neutral-200 font-sans overflow-hidden">
      {/* Top Title Navbar */}
      <div className="h-14 w-full bg-[#161b22] border-b border-neutral-800 flex items-center shrink-0 z-20">
        {/* Left header: aligns with sidebar width */}
        <div className="w-64 border-r border-neutral-800 h-full flex items-center gap-3 px-6 shrink-0">
          <img
            alt="Inso Code Logo"
            className="w-5 h-5 object-contain block animate-fade-in"
            src="/logo-white.png"
          />
          <span className="font-bold text-sm tracking-wider text-white uppercase">
            Inso Owner
          </span>
        </div>

        {/* Right header: page title and user info */}
        <div className="flex-1 h-full flex items-center justify-between px-10">
          <span className="font-semibold text-white text-[15px]">
            {getPageTitle()}
          </span>
          <div className="flex items-center gap-6">
            <Link
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white text-xs font-bold transition-colors cursor-pointer bg-transparent"
              href="/dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Developer Workspace</span>
            </Link>
            {profile && (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-neutral-100">
                    {profile.email}
                  </span>
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                    Platform Owner
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-850 flex items-center justify-center border border-neutral-700 text-amber-500 font-bold text-xs">
                  O
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex w-full overflow-hidden">
        {/* Internal Navigation Sidebar */}
        <div className="w-64 border-r border-neutral-800 bg-[#161b22] flex flex-col h-full shrink-0 py-6 px-5 overflow-y-auto relative z-10">
          {renderNavGroup("Business Owner Platform", ownerItems)}
          
          <div className="mt-auto pt-4 border-t border-neutral-800">
            <button
              onClick={() => router.push("/api/auth/signout")}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-sm font-medium rounded-xl text-red-400 hover:bg-red-500/10 transition-all cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col h-full bg-[#0d1117] relative overflow-hidden">
          {/* Content Children */}
          <div className="flex-1 overflow-y-auto pt-6 px-10 pb-10 z-10 relative flex flex-col h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
