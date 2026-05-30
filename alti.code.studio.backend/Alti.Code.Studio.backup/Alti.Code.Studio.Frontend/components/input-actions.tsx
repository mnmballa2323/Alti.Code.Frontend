"use client";

import { AppDispatch, RootState } from "@/store";
import { sendMessage } from "@/store/messagesSlice";
import { Badge, Button, Form, Image, cn } from "@heroui/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

import { Icon } from "@iconify/react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { ArrowRight, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AudioRecorder from "./AudioRecorder";
import PromptInput from "./prompt-input";

const programmingLanguages = [
  { title: "Python", icon: "devicon:python" },
  { title: "JavaScript", icon: "vscode-icons:file-type-js" },
  { title: "TypeScript", icon: "vscode-icons:file-type-typescript" },
  { title: "Java", icon: "devicon:java" },
  { title: "C", icon: "mdi:language-c" },
  { title: "C++", icon: "vscode-icons:file-type-cpp2" },
  { title: "C#", icon: "material-icon-theme:csharp" },
  { title: "Go", icon: "logos:go" },
  { title: "Rust", icon: "material-icon-theme:rust" },
  { title: "Swift", icon: "material-icon-theme:swift" },
  { title: "Kotlin", icon: "material-icon-theme:kotlin" },
  { title: "SQL", icon: "vscode-icons:file-type-sql" },
  { title: "Bash", icon: "codicon:terminal-bash" },
  { title: "PowerShell", icon: "material-icon-theme:powershell" },
  { title: "PHP", icon: "ri:php-line" },
  { title: "Ruby", icon: "material-icon-theme:ruby" },
  { title: "R", icon: "mdi:language-r" },
  { title: "Dart", icon: "material-icon-theme:dart" },
  { title: "MATLAB", icon: "vscode-icons:file-type-matlab" },
  { title: "Solidity", icon: "vscode-icons:file-type-light-solidity" },
];

const suggestions = [
  {
    id: "draft-email",
    label: "Draft an email",
    icon: "solar:document-add-outline",
  },
  {
    id: "create-image",
    label: "Create an image",
    icon: "solar:gallery-linear",
  },
  { id: "brainstorm", label: "Brainstorm", icon: "solar:lightbulb-linear" },
  { id: "make-plan", label: "Make a plan", icon: "solar:checklist-linear" },
  { id: "code", label: "Code", icon: "solar:code-linear" },
  { id: "help-write", label: "Help me write", icon: "solar:pen-2-outline" },
  {
    id: "get-advice",
    label: "Get advice",
    icon: "solar:square-academic-cap-2-outline",
  },
];

type PromptSuggestion = (typeof suggestions)[number];

function PromptInputAssets({
  assets,
  onRemoveAsset,
}: {
  assets: string[];
  onRemoveAsset: (index: number) => void;
}) {
  if (assets.length === 0) return null;
  return (
    <>
      {assets.map((asset, index) => {
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
}

function PromptInputFullLineComponent({
  prompt,
  setPrompt,
  onSend,
}: {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  onSend?: (prompt: string) => void;
}) {
  const [assets, setAssets] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? null;
  const sessionId = useSelector((state: RootState) => state.messages.sessionId);

  const handleSubmit = useCallback(() => {
    if (!prompt.trim()) return;
    if (onSend) {
      onSend(prompt);
    } else {
      dispatch(sendMessage({ prompt, model: "default", sessionId, token }));
    }
    setPrompt("");
    inputRef.current?.focus();
  }, [prompt, setPrompt, dispatch]);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSubmit();
    },
    [handleSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    []
  );

  return (
    <Form
      // className="flex w-full flex-col items-start gap-0 rounded-medium bg-default-100 dark:bg-default-50"
      className="mx-auto w-full max-w-[796px] space-y-0 bg-white lg:px-0 rounded-2xl border-2 gap-0 border-gray-200 px-3 shadow-sm sm:px-4"
      onSubmit={onSubmit}
    >
      <div
        className={cn(
          "group flex gap-2 pl-[20px] pr-3",
          assets.length > 0 ? "pt-4" : "hidden"
        )}
      >
        <PromptInputAssets
          assets={assets}
          onRemoveAsset={(index) =>
            setAssets((prev) => prev.filter((_, i) => i !== index))
          }
        />
      </div>

      <PromptInput
        ref={inputRef}
        autoFocus
        classNames={{
          innerWrapper: "relative",
          input: "text-medium h-auto w-full",
          inputWrapper:
            "!bg-transparent shadow-none !border-0 pr-3 pl-[20px] pt-0 pb-0",
        }}
        maxRows={16}
        minRows={2}
        name="content"
        radius="lg"
        spellCheck={"false"}
        value={prompt}
        variant="bordered"
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onValueChange={setPrompt}
        className="max-h-[500px] min-h-12 w-full resize-none overflow-y-auto border-none px-2 pt-3 shadow-none outline-none placeholder:text-sm focus-visible:ring-0"
      />

      <div className="flex w-full flex-row items-center justify-between px-3 pb-3">
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger>
              <Button
                isIconOnly
                radius="full"
                size="sm"
                variant="light"
                className="flex items-center"
                onPress={() => fileInputRef.current?.click()}
              >
                <Plus className="size-6 rounded-full border-2 border-gray-300 p-[3px]" />
                <VisuallyHidden>
                  <input
                    ref={fileInputRef}
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                </VisuallyHidden>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Attach Files</p>
            </TooltipContent>
          </Tooltip>
          <div className="flex items-center space-x-1.5">
            {programmingLanguages.map((language) => (
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex-none cursor-pointer size-6 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white p-1 text-black">
                    <Icon
                      // className="text-foreground"
                      icon={language.icon}
                      width={16}
                      className="flex-none"
                    />
                  </div>
                  {/* <Code
              className={cn(
                "size-6 flex-none cursor-pointer rounded-full border-2 border-gray-300 bg-white p-[3px] text-black"
                // selectedOption === OPTIONS.TRANSLATE_DOCUMENTS &&
                //   'bg-black text-white',
                )}
                /> */}
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{language.title}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {prompt ? (
          <Button
            isIconOnly
            // className={!prompt ? "bg-default" : "dark:bg-white bg-black"}
            className="bg-transparent"
            isDisabled={!prompt}
            radius="full"
            size="sm"
            type="submit"
            variant="solid"
          >
            <ArrowRight
              // onClick={handleSubmit}
              className="size-6 flex-none cursor-pointer rounded-full border-2 border-gray-300 bg-black p-1 text-white"
            />
            {/* <Icon
            className={cn(
              "[&>path]:stroke-[2px]",
              !prompt ? "text-white" : "dark:text-black text-white"
            )}
            icon="solar:arrow-up-linear"
            width={20}
          /> */}
          </Button>
        ) : (
          <AudioRecorder setMessage={setPrompt} />
        )}
      </div>
    </Form>
  );
}

export default function PromptInputFullLineWithBottomActions({
  onSend,
}: {
  onSend?: (prompt: string) => void;
}) {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="flex w-full flex-col gap-4 mb-6 !z-50">
      <PromptInputFullLineComponent
        prompt={prompt}
        setPrompt={setPrompt}
        onSend={onSend}
      />
    </div>
  );
}
