"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Modal, ModalContent, Button } from "@heroui/react";

import { useModalStore } from "@/store/useModalStore";

export function Logout() {
  const { onClose, isOpen } = useModalStore();
  const router = useRouter();

  const handleLogOut = async () => {
    const isDesktop = typeof window !== "undefined" && ("__TAURI__" in window || "electron" in window || window.navigator.userAgent.includes("Electron"));

    if (isDesktop) {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      onClose();
      window.location.href = "/";
    } else {
      await signOut({
        redirect: false,
      });
      onClose();
    }
  };

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
      onClose={onClose}
    >
      <ModalContent>
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
            onPress={handleLogOut}
          >
            Logout
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
