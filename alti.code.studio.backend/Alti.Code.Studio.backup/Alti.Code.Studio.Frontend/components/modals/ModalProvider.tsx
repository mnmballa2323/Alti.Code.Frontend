"use client";
import { useModalStore } from "@/store/useModalStore";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { Login } from "./login";
import { Logout } from "./logout";
import { Register } from "./register";
import RenameChat from "./RenameChat";
import SearchChats from "./SearchChats";
import SearchWorkflows from "./SearchWorkflows";
import SettingsModal from "./SettingsModal";

export const ModalProvider = () => {
  const { type, isOpen } = useModalStore();

  if (!type || !isOpen) return null;

  return (
    <>
      {type === "login" && <Login />}
      {type === "logout" && <Logout />}
      {type === "register" && <Register />}
      {type === "search-chats" && <SearchChats />}
      {type === "rename-chat" && <RenameChat />}
      {type === "forgot-password" && <ForgotPasswordDialog />}
      {type === "search-workflows" && <SearchWorkflows />}
      {type === "settings" && <SettingsModal />}
    </>
  );
};
