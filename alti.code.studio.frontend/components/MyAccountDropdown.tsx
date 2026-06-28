"use client";

import { LogOut, Palette, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { useModalStore } from "@/store/useModalStore";
import { getUserData } from "@/lib/user";

const MyAccountDropdown = () => {
  const { onOpen } = useModalStore();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
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
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full h-9 bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 border-none text-gray-400 text-xs font-medium rounded-xl focus-visible:ring-0 focus-visible:border-border transition-colors justify-start px-3 shadow-none">
            My Account
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-[var(--radix-dropdown-menu-trigger-width)]"
        >
          <DropdownMenuGroup>
            {(profile?.role === "admin" || profile?.role === "ADMIN") && (
              <DropdownMenuItem className="relative">
                <span className="flex items-center space-x-2">
                  <Shield className="size-5 text-indigo-400" />
                  <Link href="/admin">
                    <span className="absolute inset-0" />
                    Admin Console
                  </Link>
                </span>
              </DropdownMenuItem>
            )}


          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() =>
              // signOut({ callbackUrl: "/" })
              onOpen({
                type: "logout",
              })
            }
          >
            <span className="flex items-center space-x-2">
              <LogOut className="size-5" /> <span>Logout</span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MyAccountDropdown;
