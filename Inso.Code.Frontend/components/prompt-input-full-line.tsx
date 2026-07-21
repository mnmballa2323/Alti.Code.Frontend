"use client";

import { Badge, Button, cn, Form, Image, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { Icon } from "@iconify/react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

import PromptInput from "./prompt-input";

import { AppDispatch } from "@/store";

interface PromptInputProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
}

interface PromptInputAssetsProps {
  assets: string[];
  onRemoveAsset: (index: number) => void;
}

const PromptInputAssets = ({
  assets,
  onRemoveAsset,
}: PromptInputAssetsProps) => {
  if (assets.length === 0) return null;

  return (
    <>
      {assets.map((asset, index) => {
        // Try to detect if the asset is an image (data URL starts with image/)
        const isImage = asset.startsWith("data:image/");

        return (
          <Badge
            key={index}
            isOneChar
            className="opacity-0 group-hover:opacity-100"
            content={
              <Button
                isIconOnly
                radius="full"
                size="sm"
                variant="light"
                onPress={() => onRemoveAsset(index)}
              >
                <Icon
                  className="text-foreground"
                  icon="iconamoon:close-thin"
                  width={16}
                />
              </Button>
            }
          >
            {isImage ? (
              <Image
                alt="uploaded image"
                className="h-14 w-14 rounded-small border-small border-default-200/50 object-cover"
                src={asset}
              />
            ) : (
              <div className="h-14 w-14 flex items-center justify-center rounded-small border-small border-default-200/50 bg-default-200 text-xs text-default-700">
                <Icon
                  className="text-default-500"
                  icon="solar:file-linear"
                  width={24}
                />
              </div>
            )}
          </Badge>
        );
      })}
    </>
  );
};

export function PromptInputFullLineComponent({
  prompt,
  setPrompt,
}: PromptInputProps) {
  const [showLocalToggle, setShowLocalToggle] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [assets, setAssets] = useState<string[]>([]);

  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = useCallback(() => {
    if (!prompt) return;

    setPrompt("");
    // dispatch(sendMessage({ prompt, model: "default", sessionId: null }));
    inputRef?.current?.focus();
  }, [prompt, setPrompt]);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSubmit();
    },
    [handleSubmit],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);

    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        const blob = item.getAsFile();

        if (!blob) continue;

        const reader = new FileReader();

        reader.onload = () => {
          const base64data = reader.result as string;

          setAssets((prev) => [...prev, base64data]);
        };
        reader.readAsDataURL(blob);
      }
    }
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);

      files.forEach((file) => {
        const reader = new FileReader();

        reader.onload = () => {
          const base64data = reader.result as string;

          setAssets((prev) => [...prev, base64data]);
        };
        reader.readAsDataURL(file);
      });

      // Reset input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [],
  );

  return (
    <Form
      className="mx-auto w-full max-w-4xl flex flex-col overflow-hidden bg-white dark:bg-[#161b22] rounded-[24px] border border-default-200 dark:border-zinc-800/50 transition-all duration-300 shadow-sm"
      validationBehavior="native"
      onSubmit={onSubmit}
    >
      {/* Top Bar */}
      <div className="flex items-center gap-1.5 px-4 pt-4 pb-0 text-sm text-default-500">
        <Icon
          className="text-default-400"
          icon="solar:folder-bold"
          width={16}
        />
        <span className="text-xs font-medium text-default-500">
          inso.code
        </span>
        <Icon
          className="text-default-400"
          icon="solar:alt-arrow-down-linear"
          width={14}
        />
      </div>

      <div
        className={cn(
          "group flex gap-2 pl-[20px] pr-3",
          assets.length > 0 ? "pt-2" : "pt-0",
        )}
      >
        <PromptInputAssets
          assets={assets}
          onRemoveAsset={(index) => {
            setAssets((prev) => prev.filter((_, i) => i !== index));
          }}
        />
      </div>
      <PromptInput
        ref={inputRef}
        autoFocus
        className="max-h-[300px] w-full resize-none border-none shadow-none outline-none focus-visible:ring-0"
        classNames={{
          base: "![mask-image:none] ![-webkit-mask-image:none]",
          innerWrapper: "relative !bg-none bg-transparent [&::after]:hidden [&::before]:hidden ![mask-image:none] ![-webkit-mask-image:none]",
          input:
            "text-[15px] leading-relaxed font-normal h-auto w-full text-foreground overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-default-400 placeholder:font-normal py-0 !bg-none bg-transparent ![mask-image:none] ![-webkit-mask-image:none]",
          inputWrapper: "!bg-transparent shadow-none !border-0 px-4 pt-3 pb-1 !bg-none [&::after]:hidden [&::before]:hidden ![mask-image:none] ![-webkit-mask-image:none] group-data-[hover=true]:!bg-transparent group-data-[focus=true]:!bg-transparent",
        }}
        maxRows={16}
        minRows={1}
        name="content"
        placeholder="Enter prompt here..."
        radius="none"
        spellCheck={"false"}
        value={prompt}
        variant="flat"
        disableAnimation={true}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onValueChange={setPrompt}
      />
      
      <div className="flex w-full flex-row items-center justify-between px-4 pb-4 pt-4 mt-1 border-t-[0.5px] border-default-200 dark:border-zinc-800/50">
        <div className="flex items-center gap-1">
          {showLocalToggle && (
            <Dropdown
              className="bg-white dark:bg-[#161b22] border border-default-200/50 dark:border-gray-800 shadow-2xl rounded-2xl min-w-[200px] p-2 text-foreground"
              placement="top-start"
            >
              <DropdownTrigger>
                <button
                  className={cn(
                    "group flex items-center justify-center gap-1.5 h-8 px-3 rounded-full transition-colors text-[13px] font-semibold cursor-pointer border border-default-200 dark:border-gray-800 outline-none shrink-0",
                    isLocalMode
                      ? "text-primary bg-primary/10 border-primary/30 hover:bg-primary/20"
                      : "text-default-500 hover:text-foreground hover:bg-default-100 dark:hover:bg-zinc-800",
                  )}
                  type="button"
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isLocalMode ? "text-primary" : "text-default-400",
                    )}
                    icon="solar:server-square-bold-duotone"
                  />
                  <span>{isLocalMode ? "Local" : "Cloud"}</span>
                  <ChevronDown className="size-3.5 shrink-0 opacity-60 transition-transform group-aria-expanded:rotate-180" />
                </button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Execution Mode" variant="flat">
                <DropdownItem
                  key="cloud"
                  className={cn(
                    "rounded-xl px-2 py-1.5",
                    !isLocalMode && "bg-primary/10",
                  )}
                  onPress={() => setIsLocalMode(false)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-[12px]">
                        Cloud (Fastest)
                      </span>
                      <span className="text-[10px] text-default-400">
                        Use managed infrastructure
                      </span>
                    </div>
                    {!isLocalMode && (
                      <Icon
                        className="size-4 text-primary"
                        icon="lucide:check"
                      />
                    )}
                  </div>
                </DropdownItem>
                <DropdownItem
                  key="local"
                  className={cn(
                    "rounded-xl px-2 py-1.5",
                    isLocalMode && "bg-primary/10",
                  )}
                  onPress={() => setIsLocalMode(true)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-[12px]">
                        Local (Private)
                      </span>
                      <span className="text-[10px] text-default-400">
                        Execute on your machine
                      </span>
                    </div>
                    {isLocalMode && (
                      <Icon
                        className="size-4 text-primary"
                        icon="lucide:check"
                      />
                    )}
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          {/* Top row of bottom section */}
          <div className="flex items-center gap-2">
            <Tooltip showArrow content="Attach Files">
              <Button
                isIconOnly
                className="text-default-500 h-7 w-7 min-w-7"
                radius="full"
                size="sm"
                variant="light"
                onPress={() => fileInputRef.current?.click()}
              >
                <Icon icon="mingcute:add-line" width={18} />
                <VisuallyHidden>
                  <input
                    ref={fileInputRef}
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                </VisuallyHidden>
              </Button>
            </Tooltip>

            <div className="flex items-center gap-1.5 text-xs font-medium text-default-600 bg-default-200/50 hover:bg-default-200 transition-colors cursor-pointer px-2 py-1.5 rounded-lg w-fit">
              <span>Gemini 3.1 Pro (High)</span>
              <Icon
                className="text-default-400"
                icon="solar:alt-arrow-down-linear"
                width={14}
              />
            </div>
          </div>

          {/* Bottom row of bottom section */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-default-500 bg-default-200/50 hover:bg-default-200 transition-colors cursor-pointer px-2 py-1.5 rounded-lg w-fit ml-1">
            <Icon
              className="text-default-400"
              icon="solar:monitor-linear"
              width={14}
            />
            <span>Local</span>
            <Icon
              className="text-default-400"
              icon="solar:alt-arrow-down-linear"
              width={14}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip showArrow content="Voice Input">
            <Button
              isIconOnly
              className="text-default-400"
              radius="full"
              size="sm"
              variant="light"
            >
              <Icon icon="solar:microphone-3-linear" width={20} />
            </Button>
          </Tooltip>
          <Tooltip showArrow content="Send Prompt">
            <Button
              isIconOnly
              className="bg-[#161b22] text-white hover:bg-[#161b22]/90 dark:bg-primary dark:text-primary-foreground shadow-sm !w-6 !h-6 !min-w-6"
              radius="md"
              size="sm"
              type="submit"
            >
              <Icon icon="solar:arrow-right-linear" width={14} />
            </Button>
          </Tooltip>
        </div>
      </div>
    </Form>
  );
}

export default function PromptInputFullLine() {
  const [prompt, setPrompt] = React.useState<string>("");

  return <PromptInputFullLineComponent prompt={prompt} setPrompt={setPrompt} />;
}
