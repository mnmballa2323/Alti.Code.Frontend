"use client";

import { useModalStore } from "@/store/useModalStore";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";

const SettingsModal = () => {
  const { theme, setTheme } = useTheme();
  const { isOpen, onClose } = useModalStore();

  const changeTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };
  return (
    <div>
      {/* Settings Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onClose}
        size="md"
        placement="center"
        classNames={{
          base: "dark:bg-default-100 bg-white",
          header: "border-b dark:border-default-200 border-gray-200",
          body: "py-6",
          footer: "border-t dark:border-default-200 border-gray-200",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="dark:text-white text-black text-lg font-semibold">
                    Settings
                  </span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-6">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="dark:text-white text-black font-medium">
                        Theme
                      </span>
                      <span className="dark:text-default-400 text-gray-500 text-sm">
                        Switch between light and dark theme.
                      </span>
                    </div>
                    <Switch
                      isSelected={theme === "dark"}
                      onValueChange={changeTheme}
                      classNames={{
                        base: cn(
                          "inline-flex flex-row-reverse w-full bg-content1",
                          " items-center",
                          "justify-between cursor-pointer rounded-lg  ",
                          ""
                        ),
                        wrapper: "p-0 h-4 overflow-visible",
                        thumb: cn(
                          "w-6 h-6 border-2 shadow-lg",
                          "group-data-[hover=true]:border-primary",
                          "group-data-[selected=true]:ml-6",
                          "group-data-[pressed=true]:w-7",
                          "group-data-[selected]:group-data-[pressed]:ml-4"
                        ),
                      }}
                      startContent={<Icon icon="solar:sun-bold" width={16} />}
                      endContent={<Icon icon="solar:moon-bold" width={16} />}
                    />
                  </div>

                  {/* Mode Toggle */}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  onPress={onClose}
                  className="w-full bg-[#000] text-[#fff]"
                >
                  Done
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SettingsModal;
