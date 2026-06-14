"use client";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { Logout } from "./logout";
import { LoginModal } from "./LoginModal";
import RenameChat from "./RenameChat";
import SearchChats from "./SearchChats";
import SearchWorkflows from "./SearchWorkflows";
import SettingsModal from "./SettingsModal";
import { ConnectCloud } from "./connect-cloud";

import { useModalStore } from "@/store/useModalStore";

export const ModalProvider = () => {
  const { type, isOpen } = useModalStore();

  if (!type || !isOpen) return null;

  return (
    <>
      {type === "login" && <LoginModal />}
      {type === "logout" && <Logout />}
      {type === "search-chats" && <SearchChats />}
      {type === "rename-chat" && <RenameChat />}
      {type === "forgot-password" && <ForgotPasswordDialog />}
      {type === "search-workflows" && <SearchWorkflows />}
      {type === "settings" && <SettingsModal />}
      {type === "connect-cloud" && <ConnectCloud />}
    </>
  );
};
