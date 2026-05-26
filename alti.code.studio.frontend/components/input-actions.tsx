"use client";

import { Badge, Button, Form, Image, cn, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from "@heroui/react";
import { Icon } from "@iconify/react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import {
  ArrowUp,
  Plus,
  ChevronDown,
  Github,
  CloudUpload,
  Play,
  Figma,
  Codesandbox,
  MonitorSmartphone,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import AudioRecorder from "./AudioRecorder";
import PromptInput from "./prompt-input";
import { useSettingsStore } from "@/store/useSettingsStore";

import { useModalStore } from "@/store/useModalStore";
import { VideoEyeRecorder } from "@/components/studio/VideoEyeRecorder";
import { LogCaptureAgent } from "@/components/studio/LogCaptureAgent";
import { sendMessage } from "@/store/messagesSlice";
import { AppDispatch, RootState } from "@/store";

const programmingLanguages = [
  // General-purpose & scripting
  "ABAP",
  "ActionScript",
  "Ada",
  "Apex",
  "APL",
  "Assembly",
  "AutoHotkey",
  "Bash",
  "C",
  "C#",
  "C++",
  "Clojure",
  "COBOL",
  "CoffeeScript",
  "Crystal",
  "CSS",
  "Cuda",
  "D",
  "Dart",
  "Delphi",
  "Elixir",
  "Elm",
  "Erlang",
  "F#",
  "Forth",
  "Fortran",
  "GDScript",
  "Go",
  "GraphQL",
  "Groovy",
  "Hack",
  "Haskell",
  "Haxe",
  "HTML",
  "Java",
  "JavaScript",
  "JSON",
  "Julia",
  "Kotlin",
  "LabVIEW",
  "LaTeX",
  "Lisp",
  "LiveScript",
  "Lua",
  "Makefile",
  "Markdown",
  "MATLAB",
  "Mojo",
  "Nim",
  "Node.js",
  "Objective-C",
  "OCaml",
  "Pascal",
  "Perl",
  "PHP",
  "PL/SQL",
  "PostScript",
  "PowerShell",
  "Prolog",
  "Protocol Buffers",
  "PureScript",
  "Python",
  "R",
  "Racket",
  "Raku",
  "ReScript",
  "RPG",
  "Ruby",
  "Rust",
  "SAS",
  "Sass/SCSS",
  "Scala",
  "Scheme",
  "Shell",
  "Simulink",
  "Smalltalk",
  "SQL",
  "Svelte",
  "Swift",
  "Tcl",
  "Terraform",
  "TOML",
  "TypeScript",
  "V",
  "Vala",
  "VBA",
  "Verilog",
  "VHDL",
  "WebAssembly",
  "Wolfram",
  "XML",
  "YAML",
  "Zig",
  // Blockchain & Crypto
  "Cairo",
  "Clarity",
  "Fe",
  "Ink!",
  "Michelson",
  "Move",
  "Plutus",
  "Solidity",
  "Sway",
  "Vyper",
  "Yul",
  // Gaming & Shaders
  "GLSL",
  "HLSL",
  "ShaderLab",
  "UnrealScript",
  // Automotive, Manufacturing & Industrial
  "AUTOSAR C/C++",
  "CAPL",
  "G-code",
  "Karel",
  "KRL",
  "Ladder Logic",
  "RAPID",
  "Structured Text",
  "SystemVerilog",
].sort();

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
  hideDropdown = false,
  hideAgents = false,
  hideRunLocally = false,
  showFigmaButton = false,
  showSandboxButton = false,
  showResponsiveButton = false,
  isTestWorkspace = false,
  placeholder = "Enter your prompt here...",
  customActions,
  rightActions,
  showModelDropdown = false,
}: {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  onSend?: (
    prompt: string,
    mode?: string,
    domain?: string,
    language?: string,
  ) => void;
  hideDropdown?: boolean;
  hideAgents?: boolean;
  hideRunLocally?: boolean;
  showFigmaButton?: boolean;
  showSandboxButton?: boolean;
  showResponsiveButton?: boolean;
  isTestWorkspace?: boolean;
  placeholder?: string;
  customActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  showModelDropdown?: boolean;
}) {
  const router = useRouter();
  const { onOpen } = useModalStore();
  const { defaultModel, setDefaultModel } = useSettingsStore();
  const connectedClouds = useSelector(
    (state: RootState) => state.system.connectedClouds,
  );
  const [assets, setAssets] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("Mode");
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedModel, setSelectedModel] = useState(
    isTestWorkspace ? "Framework" : "Stack",
  );
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedProgLang, setSelectedProgLang] = useState("Language");
  const [progLangDropdownOpen, setProgLangDropdownOpen] = useState(false);
  const progLangDropdownRef = useRef<HTMLDivElement>(null);
  const [githubSelected, setGithubSelected] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const token = session?.user.accessToken ?? null;
  const sessionId = useSelector((state: RootState) => state.messages.sessionId);

  // Listen for file drops from the Data / Vault Workspace
  useEffect(() => {
    const handleAddDocument = (e: Event) => {
      const customEvent = e as CustomEvent<string>;

      if (customEvent.detail && !assets.includes(customEvent.detail)) {
        setAssets((prev) => [...prev, customEvent.detail]);
      }
    };

    window.addEventListener("add-document", handleAddDocument);

    return () => window.removeEventListener("add-document", handleAddDocument);
  }, [assets]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(e.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(e.target as Node)
      ) {
        setModelDropdownOpen(false);
      }
      if (
        progLangDropdownRef.current &&
        !progLangDropdownRef.current.contains(e.target as Node)
      ) {
        setProgLangDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!prompt.trim()) return;
    const mode = "Agent";
    const domain = "Full Stack";
    const language = undefined;

    if (onSend) {
      onSend(prompt, mode, domain, language);
    } else {
      dispatch(
        sendMessage({
          prompt,
          model: mode,
          domain,
          language,
          sessionId,
          token,
        }),
      );
    }
    setPrompt("");
    inputRef.current?.focus();
  }, [
    prompt,
    setPrompt,
    dispatch,
    sessionId,
    token,
    onSend,
  ]);

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
    [],
  );

  return (
    <Form
      className="mx-auto w-full max-w-2xl flex flex-col overflow-visible bg-background/90 backdrop-blur-3xl rounded-[24px] border border-default-200/80 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-default-300 dark:border-white/10 dark:bg-content1/80"
      onSubmit={onSubmit}
    >
      <div
        className={cn(
          "group flex gap-2 pl-[20px] pr-3",
          assets.length > 0 ? "pt-4" : "hidden",
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
        className="max-h-[300px] w-full resize-none border-none shadow-none outline-none placeholder:text-default-400 focus-visible:ring-0"
        classNames={{
          innerWrapper: "relative",
          input:
            "text-[15px] leading-relaxed font-normal h-auto w-full text-foreground overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          inputWrapper: "!bg-transparent shadow-none !border-0 px-5 pt-4 pb-1",
        }}
        maxRows={12}
        minRows={1}
        name="content"
        placeholder={placeholder}
        radius="lg"
        spellCheck={"false"}
        value={prompt}
        variant="bordered"
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onValueChange={setPrompt}
      />

      <div className="flex w-full flex-row items-center justify-between gap-4 px-4 pb-2 pt-0 overflow-visible scrollbar-hide">
        <div className="flex flex-row items-center gap-2 flex-nowrap shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="size-5" />
                <VisuallyHidden>
                  <input
                    ref={fileInputRef}
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                  />
                </VisuallyHidden>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Add context (files, images)</p>
            </TooltipContent>
          </Tooltip>

          {showModelDropdown && (
            <Dropdown
              className="bg-white/95 dark:bg-[#161b22] border border-default-200/50 dark:border-gray-800 shadow-2xl rounded-2xl p-1.5 z-[100] min-w-[130px]"
              placement="bottom-start"
            >
              <DropdownTrigger>
                <button
                  className="group flex items-center justify-center gap-1 h-8 px-2 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors text-[13px] font-medium select-none cursor-pointer bg-transparent border-none outline-none shrink-0"
                  type="button"
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors duration-200",
                      (defaultModel || "").includes("gemini") && "group-hover:text-purple-500 dark:group-hover:text-purple-400",
                      (defaultModel || "").includes("claude") && "group-hover:text-orange-500 dark:group-hover:text-orange-400",
                      (defaultModel || "").includes("gpt") && "group-hover:text-emerald-500 dark:group-hover:text-emerald-400",
                    )}
                    icon={
                      (defaultModel || "").includes("gemini")
                        ? "simple-icons:googlegemini"
                        : (defaultModel || "").includes("claude")
                        ? "simple-icons:anthropic"
                        : "simple-icons:openai"
                    }
                  />
                  <span className="transition-colors duration-200">
                    {(defaultModel || "").includes("gemini") || (defaultModel || "").includes("omni")
                      ? "Gemini"
                      : (defaultModel || "").includes("claude") || (defaultModel || "").includes("sonnet")
                      ? "Claude"
                      : "GPT"}
                  </span>
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Select AI Model"
                className="p-1 max-h-[380px] overflow-y-auto"
                onAction={(key) => setDefaultModel(key as string)}
              >
                <DropdownSection title="Gemini (Vertex AI)" showDivider>
                  <DropdownItem
                    key="gemini-3.5-flash"
                    className="rounded-xl px-3 py-1.5 hover:!bg-purple-500/10"
                    startContent={
                      <Icon className="size-4 text-purple-500 dark:text-purple-400" icon="logos:google-gemini-icon" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">Gemini 3.5 Flash</span>
                      <span className="text-[10px] text-default-400">Latest default agent & code model</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="gemini-3.5-pro"
                    className="rounded-xl px-3 py-1.5 hover:!bg-purple-500/10"
                    startContent={
                      <Icon className="size-4 text-purple-400" icon="logos:google-gemini-icon" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">Gemini 3.5 Pro</span>
                      <span className="text-[10px] text-default-400">Flagship deep reasoning & software logic</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="gemini-3.1-pro"
                    className="rounded-xl px-3 py-1.5 hover:!bg-purple-500/10"
                    startContent={
                      <Icon className="size-4 text-purple-400" icon="logos:google-gemini-icon" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">Gemini 3.1 Pro</span>
                      <span className="text-[10px] text-default-400">Production-proven agent reasoning</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="gemini-omni-flash"
                    className="rounded-xl px-3 py-1.5 hover:!bg-purple-500/10"
                    startContent={
                      <Icon className="size-4 text-purple-400" icon="logos:google-gemini-icon" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">Gemini Omni Flash</span>
                      <span className="text-[10px] text-default-400">Multimodal omni-world coding</span>
                    </div>
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection title="Claude (Anthropic)" showDivider>
                  <DropdownItem
                    key="claude-4.7-opus"
                    className="rounded-xl px-3 py-1.5 hover:!bg-orange-500/10"
                    startContent={
                      <Icon className="size-4 text-orange-500 dark:text-orange-400" icon="simple-icons:anthropic" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">Claude 4.7 Opus</span>
                      <span className="text-[10px] text-default-400">Deep software engineering with 1M context</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="sonnet-5"
                    className="rounded-xl px-3 py-1.5 hover:!bg-orange-500/10"
                    startContent={
                      <Icon className="size-4 text-orange-400" icon="simple-icons:anthropic" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">Sonnet 5</span>
                      <span className="text-[10px] text-default-400">High-end architecture & refactoring</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="claude-4.6-sonnet"
                    className="rounded-xl px-3 py-1.5 hover:!bg-orange-500/10"
                    startContent={
                      <Icon className="size-4 text-orange-400" icon="simple-icons:anthropic" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">Claude 4.6 Sonnet</span>
                      <span className="text-[10px] text-default-400">Balanced professional production model</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="claude-4.5-haiku"
                    className="rounded-xl px-3 py-1.5 hover:!bg-orange-500/10"
                    startContent={
                      <Icon className="size-4 text-orange-400" icon="simple-icons:anthropic" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">Claude 4.5 Haiku</span>
                      <span className="text-[10px] text-default-400">Fast low-latency agent automation</span>
                    </div>
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection title="GPT (OpenAI & Foundry)">
                  <DropdownItem
                    key="gpt-5.5-pro"
                    className="rounded-xl px-3 py-1.5 hover:!bg-emerald-500/10"
                    startContent={
                      <Icon className="size-4 text-emerald-500 dark:text-emerald-400" icon="simple-icons:openai" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">GPT-5.5 Pro (Direct)</span>
                      <span className="text-[10px] text-default-400">Parallel reasoning coding flagship</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="gpt-5.5"
                    className="rounded-xl px-3 py-1.5 hover:!bg-emerald-500/10"
                    startContent={
                      <Icon className="size-4 text-emerald-500 dark:text-emerald-400" icon="simple-icons:openai" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">GPT-5.5 (Direct)</span>
                      <span className="text-[10px] text-default-400">Frontier omnimodal developer model</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="gpt-5.5-instant"
                    className="rounded-xl px-3 py-1.5 hover:!bg-emerald-500/10"
                    startContent={
                      <Icon className="size-4 text-emerald-500 dark:text-emerald-400" icon="simple-icons:openai" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">GPT-5.5 Instant (Direct)</span>
                      <span className="text-[10px] text-default-400">Fast low-latency editing</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="azure/gpt-5.5-pro"
                    className="rounded-xl px-3 py-1.5 hover:!bg-blue-500/10"
                    startContent={
                      <Icon className="size-4 text-blue-500 dark:text-blue-400" icon="simple-icons:openai" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">GPT-5.5 Pro (Azure Foundry)</span>
                      <span className="text-[10px] text-default-400">High-complexity enterprise deployment</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="azure/gpt-5.5"
                    className="rounded-xl px-3 py-1.5 hover:!bg-blue-500/10"
                    startContent={
                      <Icon className="size-4 text-blue-500 dark:text-blue-400" icon="simple-icons:openai" />
                    }
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground">GPT-5.5 (Azure Foundry)</span>
                      <span className="text-[10px] text-default-400">Sovereign enterprise deployment</span>
                    </div>
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          )}


          {customActions}


        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isTestWorkspace && (
            <>
              <LogCaptureAgent
                onCapture={(logs) =>
                  setPrompt(prompt ? `${prompt}\n\n${logs}` : logs)
                }
              />
              <VideoEyeRecorder />
            </>
          )}
          {!hideAgents && (
            <>
              {!hideRunLocally && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Play
                      className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300"
                      onClick={() => {
                        const runPrompt =
                          prompt.trim() ||
                          "Analyze the workspace and run the application locally.";

                        if (onSend) {
                          onSend(
                            runPrompt,
                            "Deploy",
                            selectedModel === "Stack" ||
                              selectedModel === "Framework"
                              ? "Full Stack"
                              : selectedModel,
                            selectedProgLang === "Language"
                              ? undefined
                              : selectedProgLang,
                          );
                        } else {
                          dispatch(
                            sendMessage({
                              prompt: runPrompt,
                              model: "Deploy",
                              domain:
                                selectedModel === "Stack" ||
                                selectedModel === "Framework"
                                  ? "Full Stack"
                                  : selectedModel,
                              language:
                                selectedProgLang === "Language"
                                  ? undefined
                                  : selectedProgLang,
                              sessionId,
                              token,
                            }),
                          );
                        }
                        setPrompt("");
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Run Locally</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {showFigmaButton && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Figma
                      className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300 hover:border-[#F24E1E] hover:text-[#F24E1E]"
                      onClick={() => {
                        const figmaPrompt =
                          prompt.trim() ||
                          "Sync with Figma: Paste your Figma URL to convert designs to React components.";

                        setPrompt(figmaPrompt);
                        if (onSend) {
                          onSend(
                            figmaPrompt,
                            selectedLanguage === "Mode" ? "default" : selectedLanguage.toLowerCase(),
                            selectedModel === "Stack" ? "fullstack" : selectedModel.toLowerCase(),
                            selectedProgLang === "Language" ? "typescript" : selectedProgLang.toLowerCase()
                          );
                        }
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Sync with Figma</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {showSandboxButton && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Codesandbox
                      className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300 hover:border-blue-400 hover:text-blue-400"
                      onClick={() => {
                        const sandboxPrompt =
                          prompt.trim() ||
                          "Export to CodeSandbox: Create a live interactive preview of this design.";
                        setPrompt(sandboxPrompt);
                        if (onSend) {
                          onSend(
                            sandboxPrompt,
                            selectedLanguage === "Mode" ? "default" : selectedLanguage.toLowerCase(),
                            selectedModel === "Stack" ? "fullstack" : selectedModel.toLowerCase(),
                            selectedProgLang === "Language" ? "typescript" : selectedProgLang.toLowerCase()
                          );
                        }
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Export to Sandbox</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {showResponsiveButton && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MonitorSmartphone
                      className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300 hover:border-emerald-400 hover:text-emerald-400"
                      onClick={() => {
                        const responsivePrompt =
                          prompt.trim() ||
                          "Make Responsive: Ensure this design is fully responsive and looks perfect on mobile, tablet, and desktop screens using Tailwind breakpoints.";
                        setPrompt(responsivePrompt);
                        if (onSend) {
                          onSend(
                            responsivePrompt,
                            selectedLanguage === "Mode" ? "default" : selectedLanguage.toLowerCase(),
                            selectedModel === "Stack" ? "fullstack" : selectedModel.toLowerCase(),
                            selectedProgLang === "Language" ? "typescript" : selectedProgLang.toLowerCase()
                          );
                        }
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Make Responsive</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {!hideRunLocally && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Github
                        className={cn(
                          "size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95",
                          githubSelected
                            ? "bg-indigo-500 border-indigo-500"
                            : "bg-black border-gray-300",
                        )}
                        onClick={() => {
                          setGithubSelected(!githubSelected);
                          if (!githubSelected) console.log("Pushing to GitHub...");
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Push to GitHub</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CloudUpload
                        className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300"
                        onClick={() => {
                          // Check if any cloud providers are connected in the global Redux store
                          const hasConnectedCloud =
                            connectedClouds && connectedClouds.length > 0;

                          if (!hasConnectedCloud) {
                            onOpen({ type: "connect-cloud" });

                            return;
                          }

                          const deployPrompt =
                            prompt.trim() ||
                            "Analyze the workspace and autonomously deploy this application to production.";

                          if (onSend) {
                            onSend(
                              deployPrompt,
                              "Deploy",
                              selectedModel === "Stack" ||
                                selectedModel === "Framework"
                                ? "Full Stack"
                                : selectedModel,
                              selectedProgLang === "Language"
                                ? undefined
                                : selectedProgLang,
                            );
                          } else {
                            dispatch(
                              sendMessage({
                                prompt: deployPrompt,
                                model: "Deploy",
                                domain:
                                  selectedModel === "Stack" ||
                                  selectedModel === "Framework"
                                    ? "Full Stack"
                                    : selectedModel,
                                language:
                                  selectedProgLang === "Language"
                                    ? undefined
                                    : selectedProgLang,
                                sessionId,
                                token,
                              }),
                            );
                          }
                          setPrompt("");
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Deploy to Cloud</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </>
          )}

          {rightActions}

          {prompt ? (
            <ArrowUp
              className="size-6 flex-none cursor-pointer rounded-full border-2 border-gray-300 bg-black p-0.5 text-white transition-transform hover:scale-110 active:scale-95"
              onClick={handleSubmit}
            />
          ) : (
            <AudioRecorder setMessage={setPrompt} />
          )}
        </div>
      </div>
    </Form>
  );
}

export default function PromptInputFullLineWithBottomActions({
  onSend,
  hideDropdown = false,
  hideAgents = false,
  hideRunLocally = false,
  showFigmaButton = false,
  showSandboxButton = false,
  showResponsiveButton = false,
  isTestWorkspace = false,
  placeholder = "Enter your prompt here...",
  value,
  onChange,
  customActions,
  rightActions,
  showModelDropdown = false,
}: {
  onSend?: (
    prompt: string,
    mode?: string,
    domain?: string,
    language?: string,
  ) => void;
  hideDropdown?: boolean;
  hideAgents?: boolean;
  hideRunLocally?: boolean;
  showFigmaButton?: boolean;
  showSandboxButton?: boolean;
  showResponsiveButton?: boolean;
  isTestWorkspace?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
  customActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  showModelDropdown?: boolean;
}) {
  const [internalPrompt, setInternalPrompt] = useState("");
  const prompt = value !== undefined ? value : internalPrompt;
  const setPrompt = onChange !== undefined ? onChange : setInternalPrompt;

  return (
    <div className="flex w-full flex-col gap-4 mb-6 !z-50">
      <PromptInputFullLineComponent
        customActions={customActions}
        rightActions={rightActions}
        hideAgents={hideAgents}
        hideDropdown={hideDropdown}
        hideRunLocally={hideRunLocally}
        isTestWorkspace={isTestWorkspace}
        placeholder={placeholder}
        prompt={prompt}
        setPrompt={(val) => {
          const newVal = typeof val === "function" ? val(prompt) : val;

          if (onChange) onChange(newVal);
          else setInternalPrompt(newVal);
        }}
        showFigmaButton={showFigmaButton}
        showResponsiveButton={showResponsiveButton}
        showSandboxButton={showSandboxButton}
        showModelDropdown={showModelDropdown}
        onSend={onSend}
      />
    </div>
  );
}
