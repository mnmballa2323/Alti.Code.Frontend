"use client";

import { LogOut, Shield, Activity, Settings, Paintbrush } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useModalStore } from "@/store/useModalStore";
import { getUserData } from "@/lib/user";

const MyAccountDropdown = () => {
  const { onOpen } = useModalStore();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsDesktop(
      typeof window !== "undefined" &&
        ("__TAURI__" in window ||
          "electron" in window ||
          window.navigator.userAgent.includes("Electron")),
    );
    (async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const res = await getUserData(token);

          if (res?.success && res?.data) {
            setProfile(res.data);
          }
        }
      } catch (e) {
        console.error("Failed to fetch user profile in dropdown:", e);
      }
    })();
  }, []);

  return (
    <div className="w-full relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 bg-transparent border-none text-gray-400 text-xs font-semibold rounded-xl focus-visible:ring-0 focus-visible:border-border transition-colors flex items-center justify-start px-3 shadow-none outline-none cursor-pointer hover:text-white"
      >
        My Account
      </button>

      {isOpen && (
        <>
          {/* Overlay to close the dropdown on click outside */}
          <div 
            className="fixed inset-0 z-[140] cursor-default" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="absolute bottom-11 left-0 w-48 bg-white dark:bg-[#0D0D0D] border border-zinc-200 dark:border-white/5 shadow-2xl rounded-2xl p-1.5 z-[150] flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
            {/* Admin Console (if applicable) */}
            {!isDesktop &&
              (profile?.role === "admin" || profile?.role === "ADMIN") && (
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left border-none bg-transparent outline-none"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/admin");
                  }}
                >
                  <Shield className="size-4 text-indigo-500 shrink-0" />
                  <span>Admin Console</span>
                </button>
              )}

            {/* Settings */}
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left border-none bg-transparent outline-none"
              onClick={() => {
                setIsOpen(false);
                onOpen({ type: "settings" });
              }}
            >
              <Settings className="size-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
              <span>Settings</span>
            </button>



            {/* Token Usage */}
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-left border-none bg-transparent outline-none"
              onClick={() => {
                setIsOpen(false);
                router.push("/dashboard/token-usage");
              }}
            >
              <Activity className="size-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
              <span>Token Usage</span>
            </button>

            <div className="h-[1px] bg-zinc-100 dark:bg-white/5 my-1.5" />

            {/* Logout */}
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer text-left border-none bg-transparent outline-none"
              onClick={() => {
                setIsOpen(false);
                onOpen({
                  type: "logout",
                });
              }}
            >
              <LogOut className="size-4 text-red-600 dark:text-red-500 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyAccountDropdown;
