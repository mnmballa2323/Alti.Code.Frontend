"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { useAppSelector } from "@/store";
import Sidebar from "@/components/dashboard/dashboard-sidebar/dashboard-sidebar";

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
  const isRedirecting =
    status === "authenticated" &&
    (userRole === "owner" || userRole === "admin");

  useEffect(() => {
    if (status === "authenticated" && profile) {
      if (userRole === "owner") {
        if (pathname === "/dashboard") {
          router.push("/owner/dashboard");
        } else if (pathname.startsWith("/dashboard/members")) {
          router.push("/owner/dashboard");
        } else if (pathname.startsWith("/dashboard/billing")) {
          router.push("/owner/billing");
        } else if (pathname.startsWith("/dashboard/data")) {
          router.push("/owner/data");
        } else {
          router.push("/owner/dashboard");
        }
      } else if (userRole === "admin") {
        if (pathname === "/dashboard") {
          router.push("/admin/dashboard");
        } else if (pathname.startsWith("/dashboard/members")) {
          router.push("/admin/team-members");
        } else if (pathname.startsWith("/dashboard/billing")) {
          router.push("/admin/billing");
        } else if (pathname.startsWith("/dashboard/data")) {
          router.push("/admin/data");
        } else {
          router.push("/admin/dashboard");
        }
      }
    }
  }, [status, profile, userRole, pathname, router]);

  const isLoadingDashboard =
    status === "loading" ||
    (status === "authenticated" && !profile && session?.user?.accessToken);

  return (
    <div className="flex">
      <Sidebar />
      {isLoadingDashboard || isRedirecting ? (
        <div className="flex h-screen w-full bg-[#F3F4F6] dark:bg-[#0d1117]"></div>
      ) : (
        children
      )}
    </div>
  );
}
