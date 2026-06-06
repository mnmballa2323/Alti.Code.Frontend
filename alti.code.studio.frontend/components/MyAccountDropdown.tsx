"use client";

import { CreditCard, LogOut, Settings, Table2 } from "lucide-react";
import Link from "next/link";

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

const MyAccountDropdown = () => {
  const { onOpen } = useModalStore();

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
