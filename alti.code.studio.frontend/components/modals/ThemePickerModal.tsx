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
    { id: "midnight-navy", label: "Midnight Navy", icon: "solar:cloud-bold" },
  ];

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
        <div className="flex flex-col items-center pt-8 pb-6 px-6 gap-2 text-center w-full">
          <h2 className="text-lg font-bold text-black dark:text-white">
            Select Theme
          </h2>
          <p className="text-xs text-default-500 dark:text-default-400 mb-4">
            Choose your preferred interface theme.
          </p>

          <div className="flex flex-col gap-2 w-full">
            {themes.map((t) => {
              const isSelected = theme === t.id;

              return (
                <button
                  key={t.id}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 text-primary font-semibold"
                      : "border-default-200 dark:border-default-100 hover:bg-default-100 dark:hover:bg-default-200/50 text-default-700 dark:text-default-300"
                  }`}
                  onClick={() => setTheme(t.id)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-lg text-default-500 dark:text-default-400" icon={t.icon} />
                    <span className="text-xs">{t.label}</span>
                  </div>
                  {isSelected && (
                    <Icon
                      className="text-primary text-base"
                      icon="solar:check-circle-bold"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-row border-t border-gray-200 dark:border-gray-800 w-full mt-2">
          <Button
            disableRipple
            className="flex-1 bg-transparent hover:bg-default-100 dark:hover:bg-default-200 rounded-none h-14 text-black dark:text-white font-medium text-sm"
            onPress={onClose}
          >
            Done
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
