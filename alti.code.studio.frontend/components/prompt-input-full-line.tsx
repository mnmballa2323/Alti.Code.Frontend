"use client";

import { Badge, Button, cn, Form, Image, Tooltip } from "@heroui/react";
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
      className="mx-auto w-full max-w-4xl flex flex-col overflow-hidden bg-background/90 backdrop-blur-3xl rounded-[24px] border border-default-200/80 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-default-300 dark:border-white/10 dark:bg-content1/80"
      validationBehavior="native"
      onSubmit={onSubmit}
    >
      <div
        className={cn(
          "group flex gap-2 pl-[20px] pr-3",
          assets.length > 0 ? "pt-4" : "",
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
        className="max-h-[300px] w-full resize-none border-none shadow-none outline-none placeholder:text-default-400 focus-visible:ring-0"
        classNames={{
          innerWrapper: "relative",
          input:
            "text-[15px] leading-relaxed font-normal h-auto w-full text-foreground overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          inputWrapper: "!bg-transparent shadow-none !border-0 px-5 pt-4 pb-1",
        }}
        maxRows={16}
        minRows={1}
        name="content"
        radius="lg"
        spellCheck={"false"}
        value={prompt}
        variant="flat"
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onValueChange={setPrompt}
      />
      <div className="flex w-full flex-row items-center justify-between gap-4 px-4 pb-2 pt-0 overflow-x-auto scrollbar-hide">
        <Tooltip showArrow content="Attach Files">
          <Button
            isIconOnly
            className="text-white"
            radius="full"
            size="sm"
            variant="light"
            onPress={() => fileInputRef.current?.click()}
          >
            <Icon
              className="text-default-500"
              icon="solar:paperclip-outline"
              width={24}
            />
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
        <Tooltip showArrow content="Send Prompt">
          <Button
            isIconOnly
            className="dark:bg-white bg-black"
            radius="full"
            size="sm"
            type="submit"
            variant="solid"
            style={{ opacity: 1 }}
          >
            <Icon
              className="dark:text-black text-white [&>path]:stroke-[2px]"
              icon="solar:arrow-up-linear"
              width={20}
            />
          </Button>
        </Tooltip>
      </div>
    </Form>
  );
}

export default function PromptInputFullLine() {
  const [prompt, setPrompt] = React.useState<string>("");

  return <PromptInputFullLineComponent prompt={prompt} setPrompt={setPrompt} />;
}
