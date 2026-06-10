"use client";

import { CreditCard, LogOut, Settings, Building, Shield } from "lucide-react";
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
          <Button className="w-full h-9 bg-[#FAFAFA] text-default-700 border border-default-200 hover:bg-default-100 dark:bg-default-100 dark:text-default-300 dark:hover:bg-default-200 text-xs font-medium rounded-xl focus-visible:ring-0 focus-visible:border-border transition-colors">
            My Account
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuItem className="relative">
              <span className="flex items-center space-x-2">
                <CreditCard className="size-5" />
                <Link href="/billing">
                  <span className="absolute inset-0" />
                  Billing
                </Link>
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem className="relative">
              <span className="flex items-center space-x-2">
                <Building className="size-5" />
                <Link href="/enterprise/team">
                  <span className="absolute inset-0" />
                  Workspace Settings
                </Link>
              </span>
            </DropdownMenuItem>

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

            <DropdownMenuItem
              onClick={() =>
                onOpen({
                  type: "settings",
                })
              }
            >
              <span className="flex items-center space-x-2">
                <Settings className="size-5" /> <span>Settings</span>
              </span>
            </DropdownMenuItem>
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
