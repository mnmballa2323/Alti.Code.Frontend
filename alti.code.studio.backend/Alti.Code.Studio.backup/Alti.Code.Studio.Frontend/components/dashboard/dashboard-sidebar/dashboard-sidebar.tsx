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
function LogoutModal({ isOpen, onOpenChange, onConfirm }: { isOpen: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm" placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <span className="dark:text-white text-black text-lg font-semibold">Logout</span>
            </ModalHeader>
            <ModalBody>
              <span className="dark:text-white text-black">Are you sure you want to logout?</span>
            </ModalBody>
            <ModalFooter>
              <Button onPress={onClose} className="bg-gray-200 text-black">Cancel</Button>
              <Button onPress={() => { onConfirm(); onClose(); }} className="bg-black text-white">Logout</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
];

export default function Component() {
  // Modal state for logout
  const { isOpen: isLogoutOpen, onOpen: onLogoutOpen, onOpenChange: onLogoutOpenChange } = useDisclosure();
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
    [selectedKey]
  );

  return (
    <div className="h-screen">
      <div className="relative flex h-full w-72 flex-1 flex-col border-r-small border-divider p-6 bg-black">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 px-2 mt-4">
            <Image src={'/insoWhite.png'} alt="Logo" width={140} height={40} />
          </div>
        </div>

        <Spacer y={12} />

        <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
          <Sidebar
            selectedKeys={memoizedSelectedKeys}
            onSelect={handleSelect}
            itemClasses={{
              base: "data-[selected=true]:bg-white aria-[selected=false]:focus:!bg-black data-[selected=true]:focus:bg-white dark:data-[selected=true]:bg-primary-300 data-[hover=true]:bg-default-300/20 dark:data-[hover=true]:bg-default-200/40 mt-5",
              title:
                "group-data-[selected=true]:text-black text-white text-lg font-normal",
            }}
            items={sidebarItems}
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
        <LogoutModal isOpen={isLogoutOpen} onOpenChange={onLogoutOpenChange} onConfirm={() => {/* Add logout logic here */}} />
      </div>
    </div>
  );
}
