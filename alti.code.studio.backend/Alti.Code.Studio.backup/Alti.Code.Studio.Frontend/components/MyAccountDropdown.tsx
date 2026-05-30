"use client";

import { useModalStore } from "@/store/useModalStore";
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

const MyAccountDropdown = () => {
  const { onOpen } = useModalStore();

  return (
    <div className="px-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full focus-visible:ring-0 focus-visible:border-border"
          >
            My Account
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuGroup>
            <DropdownMenuItem className="relative">
              <span className="flex items-center space-x-2">
                <Table2 className="size-4.5" />
                <Link href="/pricing">
                  <span className="absolute inset-0"></span>
                  Plans
                </Link>
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="relative">
              <span className="flex items-center space-x-2">
                <CreditCard className="size-5" />
                <Link href="/billing">
                  <span className="absolute inset-0"></span>
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
