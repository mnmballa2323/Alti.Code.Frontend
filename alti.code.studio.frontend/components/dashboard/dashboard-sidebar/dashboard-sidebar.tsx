"use client";
import type { SidebarItem } from "./sidebar";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
  Spacer,
  useDisclosure,
} from "@heroui/react";
import React, { useMemo } from "react";
// Logout confirmation modal for dashboard sidebar
function LogoutModal({
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      hideCloseButton
      backdrop="opaque"
      classNames={{
        backdrop: "bg-black/20 backdrop-blur-sm",
        base: "bg-white dark:bg-[#18181b] rounded-3xl overflow-hidden shadow-2xl max-w-[340px] p-0",
      }}
      isOpen={isOpen}
      placement="center"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <div className="flex flex-col items-center pt-8 pb-6 px-6 gap-2 text-center">
              <h2 className="text-lg font-bold text-black dark:text-white">
                Logout
              </h2>
              <p className="text-sm text-default-500 dark:text-default-400">
                Are you sure you want to logout?
              </p>
            </div>

            <div className="flex flex-row border-t border-gray-200 dark:border-gray-800 w-full">
              <Button
                disableRipple
                className="flex-1 bg-transparent hover:bg-default-100 dark:hover:bg-default-200 rounded-none h-14 text-black dark:text-white font-medium text-sm"
                onPress={onClose}
              >
                Cancel
              </Button>
              <div className="w-[1px] shrink-0 bg-gray-200 dark:bg-gray-800 h-14" />
              <Button
                disableRipple
                className="flex-1 bg-transparent hover:bg-default-100 dark:hover:bg-default-200 rounded-none h-14 text-black dark:text-white font-medium text-sm"
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Logout
              </Button>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import Sidebar from "./sidebar";

const sidebarItems: SidebarItem[] = [
  {
    key: "chat",
    href: "/dashboard",
    title: "Chat",
  },
  {
    key: "billing",
    href: "/dashboard/billing",
    title: "Billing",
  },
  {
    key: "members",
    href: "/dashboard/members",
    title: "Members",
  },
  {
    key: "documents",
    href: "/dashboard/documents",
    title: "Documents",
  },
  {
    key: "data",
    href: "/dashboard/data",
    title: "Data Hub",
  },
  {
    key: "marketplace",
    href: "/dashboard/marketplace",
    title: "Marketplace",
  },
];

export default function Component() {
  // Modal state for logout
  const {
    isOpen: isLogoutOpen,
    onOpen: onLogoutOpen,
    onOpenChange: onLogoutOpenChange,
  } = useDisclosure();
  const pathname = usePathname();
  const router = useRouter();

  const selectedKey = pathname?.split("/")[2] || "chat";

  const handleSelect = (key: string | React.SyntheticEvent) => {
    if (typeof key !== "string") return;

    const targetPath = key === "chat" ? "/dashboard" : `/dashboard/${key}`;

    if (pathname !== targetPath) {
      router.push(targetPath);
    }
  };

  const memoizedSelectedKeys = useMemo(
    () => new Set([selectedKey]),
    [selectedKey],
  );

  return (
    <div className="h-screen">
      <div className="relative flex h-full w-72 flex-1 flex-col border-r-small border-divider p-6 bg-black">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 px-2 mt-4">
            <Image alt="Logo" height={40} src={"/insoWhite.png"} width={140} />
          </div>
        </div>

        <Spacer y={12} />

        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar
            itemClasses={{
              base: "data-[selected=true]:bg-white aria-[selected=false]:focus:!bg-black data-[selected=true]:focus:bg-white dark:data-[selected=true]:bg-primary-300 data-[hover=true]:bg-default-300/20 dark:data-[hover=true]:bg-default-200/40 mt-5",
              title:
                "group-data-[selected=true]:text-black text-white text-lg font-normal",
            }}
            items={sidebarItems}
            selectedKeys={memoizedSelectedKeys}
            onSelect={handleSelect}
          />
        </ScrollShadow>

        <Dropdown placement="bottom-end">
          <DropdownTrigger className="">
            <Button
              fullWidth
              className="h-[60px] justify-start gap-3 rounded-[14px] border-1 border-white bg-transparent px-3 py-[10px]"
            >
              <div className="flex w-full items-center justify-center">
                <div className="flex flex-col text-center text-white">
                  My Account
                </div>
              </div>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Profile Actions"
            className="w-[210px] bg-content1 px-[8px] py-[8px]"
            variant="flat"
          >
            <DropdownSection aria-label="profile-section-3" className="mb-0">
              <DropdownItem
                key="logout"
                className="pt-[4px] dark:text-white text-black"
                onClick={onLogoutOpen}
              >
                Logout
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
        {/* Logout Modal */}
        <LogoutModal
          isOpen={isLogoutOpen}
          onConfirm={async () => {
            await signOut({ callbackUrl: "/" });
          }}
          onOpenChange={onLogoutOpenChange}
        />
      </div>
    </div>
  );
}
