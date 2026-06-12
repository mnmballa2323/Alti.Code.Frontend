"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/store";
import Sidebar from "@/components/dashboard/dashboard-sidebar/dashboard-sidebar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { data: session, status } = useSession();
  const profileFromStore = useAppSelector((state) => state.user.data);
  const profile = profileFromStore?.email ? profileFromStore : null;

  const userRole = (profile?.role || "").toLowerCase();
  const isRedirecting = status === "authenticated" && (userRole === "owner" || userRole === "admin");

  useEffect(() => {
    if (status === "authenticated" && profile) {
      if (userRole === "owner") {
        if (pathname === "/dashboard") {
          router.push("/owner/team-members");
        } else if (pathname.startsWith("/dashboard/members")) {
          router.push("/owner/team-members");
        } else if (pathname.startsWith("/dashboard/billing")) {
          router.push("/owner/billing");
        } else if (pathname.startsWith("/dashboard/data")) {
          router.push("/owner/data");
        } else {
          router.push("/owner/team-members");
        }
      } else if (userRole === "admin") {
        if (pathname === "/dashboard") {
          router.push("/admin/members");
        } else if (pathname.startsWith("/dashboard/members")) {
          router.push("/admin/team-members");
        } else if (pathname.startsWith("/dashboard/billing")) {
          router.push("/admin/billing");
        } else if (pathname.startsWith("/dashboard/data")) {
          router.push("/admin/data");
        } else {
          router.push("/admin/members");
        }
      }
    }
  }, [status, profile, userRole, pathname, router]);

  if (status === "loading" || (status === "authenticated" && !profile && session?.user?.accessToken)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d1117] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <span className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
            Loading Dashboard...
          </span>
        </div>
      </div>
    );
  }

  if (isRedirecting) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d1117] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <span className="text-sm font-semibold tracking-wider text-neutral-400 uppercase">
            Redirecting to console...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      {children}
    </div>
  );
}
