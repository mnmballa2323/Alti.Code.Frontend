"use client";

import React from "react";
import { Modal, ModalContent, Button } from "@heroui/react";
import { useTheme } from "next-themes";
import { Icon } from "@iconify/react";

import { useModalStore } from "@/store/useModalStore";

export function ThemePickerModal() {
  const { onClose, isOpen } = useModalStore();
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: "light", label: "Light", icon: "solar:sun-bold" },
    { id: "dark", label: "Dark", icon: "solar:moon-bold" },
    { id: "midnight-navy", label: "Midnight", icon: "solar:cloud-bold" },
  ];

  return (
    <Modal
      hideCloseButton
      backdrop="opaque"
      classNames={{
        backdrop: "bg-black/20 backdrop-blur-sm",
        base: "bg-white dark:bg-[#18181b] rounded-3xl overflow-hidden shadow-2xl max-w-[300px] p-0",
      }}
      isOpen={isOpen}
      placement="center"
      onClose={onClose}
    >
      <ModalContent>
        <div className="flex flex-col items-center pt-6 pb-5 px-5 gap-2 text-center w-full">
          <h2 className="text-base font-bold text-black dark:text-white">
            Select Theme
          </h2>
          <p className="text-[11px] text-default-500 dark:text-default-400 mb-2">
            Choose your preferred interface theme.
          </p>

          <div className="flex flex-row bg-default-100 dark:bg-zinc-800/30 p-1 rounded-2xl w-full">
            {themes.map((t) => {
              const isSelected = theme === t.id;

              return (
                <button
                  key={t.id}
                  className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 cursor-pointer border-none outline-none ${
                    isSelected
                      ? "bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm font-semibold"
                      : "text-default-500 hover:text-default-800 dark:text-default-400 dark:hover:text-default-200"
                  }`}
                  onClick={() => setTheme(t.id)}
                >
                  <Icon className="text-lg mb-1 shrink-0" icon={t.icon} />
                  <span className="text-[10px] tracking-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-row border-t border-gray-200 dark:border-gray-800 w-full">
          <Button
            disableRipple
            className="flex-1 bg-transparent hover:bg-default-100 dark:hover:bg-default-200 rounded-none h-12 text-black dark:text-white font-medium text-xs"
            onPress={onClose}
          >
            Done
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
