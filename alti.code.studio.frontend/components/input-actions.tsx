"use client";

import {
  Badge,
  Button,
  Form,
  Image,
  cn,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import {
  ArrowUp,
  Plus,
  ChevronDown,
  Github,
  CloudUpload,
  Figma,
  Codesandbox,
  MonitorSmartphone,
  Shield,
  FlaskConical,
  Network,
  Cpu,
  Wand2,
  BookOpen,
  HelpCircle,
  Database,
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

  const getModelDisplayName = (modelKey: string): string => {
    switch (modelKey) {
      case "":
      case "auto":
        return "Smart Routing";
      case "gemini-3.5-flash":
        return "Gemini 3.5 Flash";
      case "gemini-3.5-pro":
        return "Gemini 3.5 Pro";
      case "gemini-omni-flash":
        return "Gemini Omni Flash";
      case "claude-4.7-opus":
        return "Claude 4.7 Opus";
      case "sonnet-5":
        return "Claude Sonnet 5";
      case "claude-4.5-haiku":
        return "Claude 4.5 Haiku";
      case "gpt-5.5-pro":
        return "GPT-5.5 Pro";
      case "gpt-5.5":
        return "GPT-5.5";
      case "gpt-5.5-instant":
        return "GPT-5.5 Instant";
      default:
        return "Smart Routing";
    }
  };

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

  // Enforce "Smart Routing" (empty defaultModel) by default on initial component mount
  useEffect(() => {
    setDefaultModel("");
  }, [setDefaultModel]);

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
  }, [prompt, setPrompt, dispatch, sessionId, token, onSend]);

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
              className="bg-white dark:bg-[#161b22] border border-default-200/50 dark:border-gray-800 shadow-2xl rounded-2xl min-w-[245px] p-2"
              placement="top-start"
            >
              <DropdownTrigger>
                <button
                  className="group flex items-center justify-center gap-1 h-8 px-2 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors text-[13px] font-medium select-none cursor-pointer bg-transparent border-none outline-none shrink-0"
                  type="button"
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors duration-200",
                      (defaultModel || "").includes("gemini") &&
                        "group-hover:text-purple-500 dark:group-hover:text-purple-400",
                      (defaultModel || "").includes("claude") &&
                        "group-hover:text-orange-500 dark:group-hover:text-orange-400",
                      (defaultModel || "").includes("gpt") &&
                        "group-hover:text-emerald-500 dark:group-hover:text-emerald-400",
                    )}
                    icon={
                      (defaultModel || "").includes("gemini")
                        ? "simple-icons:googlegemini"
                        : (defaultModel || "").includes("claude")
                          ? "simple-icons:anthropic"
                          : (defaultModel || "").includes("gpt")
                            ? "simple-icons:openai"
                            : "lucide:sparkles"
                    }
                  />
                  <span className="transition-colors duration-200">
                    {getModelDisplayName(defaultModel)}
                  </span>
                  <ChevronDown className="size-3.5 shrink-0 opacity-60 transition-transform group-aria-expanded:rotate-180" />
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Model Options"
                className="p-0 overflow-hidden"
                variant="flat"
              >
                <DropdownSection
                  className="mb-1.5 last:mb-0"
                  classNames={{
                    heading:
                      "px-3 py-1 text-[11px] font-semibold text-gray-400 select-none uppercase tracking-wider",
                    group: "flex flex-col gap-0.5",
                  }}
                  title="AUTONOMOUS"
                >
                  <DropdownItem
                    key="auto"
                    className="rounded-xl px-3 py-1.5 hover:bg-primary/10 data-[hover=true]:bg-primary/10 transition-colors"
                    textValue="Smart Routing"
                    onPress={() => setDefaultModel("")}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className="size-4 text-primary shrink-0"
                        icon="lucide:sparkles"
                      />
                      <span className="text-xs font-semibold text-primary text-[12px]">
                        Smart Routing (Auto)
                      </span>
                    </div>
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection
                  className="mb-1.5 last:mb-0"
                  classNames={{
                    heading:
                      "px-3 py-1 text-[11px] font-semibold text-gray-400 select-none uppercase tracking-wider",
                    group: "flex flex-col gap-0.5",
                  }}
                  title="GEMINI"
                >
                  <DropdownItem
                    key="gemini-3.5-flash"
                    className="rounded-xl px-3 py-1.5 hover:bg-purple-500/10 data-[hover=true]:bg-purple-500/10 transition-colors"
                    textValue="Gemini 3.5 Flash"
                    onPress={() => setDefaultModel("gemini-3.5-flash")}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className="size-4 text-purple-500 dark:text-purple-400 shrink-0"
                        icon="logos:google-gemini-icon"
                      />
                      <span className="text-xs font-medium text-foreground text-[12px]">
                        Gemini 3.5 Flash
                      </span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="gemini-3.5-pro"
                    className="rounded-xl px-3 py-1.5 hover:bg-purple-500/10 data-[hover=true]:bg-purple-500/10 transition-colors"
                    textValue="Gemini 3.5 Pro"
                    onPress={() => setDefaultModel("gemini-3.5-pro")}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className="size-4 text-purple-400 shrink-0"
                        icon="logos:google-gemini-icon"
                      />
                      <span className="text-xs font-medium text-foreground text-[12px]">
                        Gemini 3.5 Pro
                      </span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="gemini-omni-flash"
                    className="rounded-xl px-3 py-1.5 hover:bg-purple-500/10 data-[hover=true]:bg-purple-500/10 transition-colors"
                    textValue="Gemini Omni Flash"
                    onPress={() => setDefaultModel("gemini-omni-flash")}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className="size-4 text-purple-400 shrink-0"
                        icon="logos:google-gemini-icon"
                      />
                      <span className="text-xs font-medium text-foreground text-[12px]">
                        Gemini Omni Flash
                      </span>
                    </div>
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection
                  className="mb-1.5 last:mb-0"
                  classNames={{
                    heading:
                      "px-3 py-1 text-[11px] font-semibold text-gray-400 select-none uppercase tracking-wider",
                    group: "flex flex-col gap-0.5",
                  }}
                  title="CLAUDE"
                >
                  <DropdownItem
                    key="claude-4.7-opus"
                    className="rounded-xl px-3 py-1.5 hover:bg-orange-500/10 data-[hover=true]:bg-orange-500/10 transition-colors"
                    textValue="Claude 4.7 Opus"
                    onPress={() => setDefaultModel("claude-4.7-opus")}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className="size-4 text-orange-500 dark:text-orange-400 shrink-0"
                        icon="simple-icons:anthropic"
                      />
                      <span className="text-xs font-medium text-foreground text-[12px]">
                        Claude 4.7 Opus
                      </span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="sonnet-5"
                    className="rounded-xl px-3 py-1.5 hover:bg-orange-500/10 data-[hover=true]:bg-orange-500/10 transition-colors"
                    textValue="Claude Sonnet 5"
                    onPress={() => setDefaultModel("sonnet-5")}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className="size-4 text-orange-400 shrink-0"
                        icon="simple-icons:anthropic"
                      />
                      <span className="text-xs font-medium text-foreground text-[12px]">
                        Claude Sonnet 5
                      </span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="claude-4.5-haiku"
                    className="rounded-xl px-3 py-1.5 hover:bg-orange-500/10 data-[hover=true]:bg-orange-500/10 transition-colors"
                    textValue="Claude 4.5 Haiku"
                    onPress={() => setDefaultModel("claude-4.5-haiku")}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className="size-4 text-orange-400 shrink-0"
                        icon="simple-icons:anthropic"
                      />
                      <span className="text-xs font-medium text-foreground text-[12px]">
                        Claude 4.5 Haiku
                      </span>
                    </div>
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection
                  className="mb-1.5 last:mb-0"
                  classNames={{
                    heading:
                      "px-3 py-1 text-[11px] font-semibold text-gray-400 select-none uppercase tracking-wider",
                    group: "flex flex-col gap-0.5",
                  }}
                  title="GPT"
                >
                  <DropdownItem
                    key="gpt-5.5-pro"
                    className="rounded-xl px-3 py-1.5 hover:bg-emerald-500/10 data-[hover=true]:bg-emerald-500/10 transition-colors"
                    textValue="GPT-5.5 Pro"
                    onPress={() => setDefaultModel("gpt-5.5-pro")}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className="size-4 text-emerald-500 dark:text-emerald-400 shrink-0"
                        icon="simple-icons:openai"
                      />
                      <span className="text-xs font-medium text-foreground text-[12px]">
                        GPT-5.5 Pro
                      </span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="gpt-5.5"
                    className="rounded-xl px-3 py-1.5 hover:bg-emerald-500/10 data-[hover=true]:bg-emerald-500/10 transition-colors"
                    textValue="GPT-5.5"
                    onPress={() => setDefaultModel("gpt-5.5")}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className="size-4 text-emerald-500 dark:text-emerald-400 shrink-0"
                        icon="simple-icons:openai"
                      />
                      <span className="text-xs font-medium text-foreground text-[12px]">
                        GPT-5.5
                      </span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="gpt-5.5-instant"
                    className="rounded-xl px-3 py-1.5 hover:bg-emerald-500/10 data-[hover=true]:bg-emerald-500/10 transition-colors"
                    textValue="GPT-5.5 Instant"
                    onPress={() => setDefaultModel("gpt-5.5-instant")}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className="size-4 text-emerald-500 dark:text-emerald-400 shrink-0"
                        icon="simple-icons:openai"
                      />
                      <span className="text-xs font-medium text-foreground text-[12px]">
                        GPT-5.5 Instant
                      </span>
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
                            selectedLanguage === "Mode"
                              ? "default"
                              : selectedLanguage.toLowerCase(),
                            selectedModel === "Stack"
                              ? "fullstack"
                              : selectedModel.toLowerCase(),
                            selectedProgLang === "Language"
                              ? "typescript"
                              : selectedProgLang.toLowerCase(),
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
                            selectedLanguage === "Mode"
                              ? "default"
                              : selectedLanguage.toLowerCase(),
                            selectedModel === "Stack"
                              ? "fullstack"
                              : selectedModel.toLowerCase(),
                            selectedProgLang === "Language"
                              ? "typescript"
                              : selectedProgLang.toLowerCase(),
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
                            selectedLanguage === "Mode"
                              ? "default"
                              : selectedLanguage.toLowerCase(),
                            selectedModel === "Stack"
                              ? "fullstack"
                              : selectedModel.toLowerCase(),
                            selectedProgLang === "Language"
                              ? "typescript"
                              : selectedProgLang.toLowerCase(),
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
                      <Shield
                        className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300"
                        onClick={() => {
                          const sweepPrompt =
                            prompt.trim() ||
                            "Security Sweep: Audit my repository coordinates for dependency vulnerabilities, CVE threat coordinates, and compile secure self-healing patches.";

                          setPrompt(sweepPrompt);
                          if (onSend) {
                            onSend(
                              sweepPrompt,
                              selectedLanguage === "Mode"
                                ? "default"
                                : selectedLanguage.toLowerCase(),
                              selectedModel === "Stack"
                                ? "fullstack"
                                : selectedModel.toLowerCase(),
                              selectedProgLang === "Language"
                                ? "typescript"
                                : selectedProgLang.toLowerCase(),
                            );
                          } else {
                            dispatch(
                              sendMessage({
                                prompt: sweepPrompt,
                                model: "default",
                                domain: "Security",
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
                      <p>Security Audit</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FlaskConical
                        className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300"
                        onClick={() => {
                          const qaPrompt =
                            prompt.trim() ||
                            "Autonomous QA Loop: Run all unit tests, detect syntax or hydration failures, look up error stack traces, and autonomously patch the code until the entire test suite passes successfully.";

                          setPrompt(qaPrompt);
                          if (onSend) {
                            onSend(
                              qaPrompt,
                              selectedLanguage === "Mode"
                                ? "default"
                                : selectedLanguage.toLowerCase(),
                              selectedModel === "Stack"
                                ? "fullstack"
                                : selectedModel.toLowerCase(),
                              selectedProgLang === "Language"
                                ? "typescript"
                                : selectedProgLang.toLowerCase(),
                            );
                          } else {
                            dispatch(
                              sendMessage({
                                prompt: qaPrompt,
                                model: "default",
                                domain: "QA",
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
                      <p>Autonomous QA Loop</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Network
                        className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300"
                        onClick={() => {
                          const graphPrompt =
                            prompt.trim() ||
                            "Generate Knowledge Graph: Analyze the repository structure, parse all files, build dependency relationships, and render the complete visual knowledge graph of the codebase.";

                          setPrompt(graphPrompt);
                          if (onSend) {
                            onSend(
                              graphPrompt,
                              selectedLanguage === "Mode"
                                ? "default"
                                : selectedLanguage.toLowerCase(),
                              selectedModel === "Stack"
                                ? "fullstack"
                                : selectedModel.toLowerCase(),
                              selectedProgLang === "Language"
                                ? "typescript"
                                : selectedProgLang.toLowerCase(),
                            );
                          } else {
                            dispatch(
                              sendMessage({
                                prompt: graphPrompt,
                                model: "default",
                                domain: "Code",
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
                      <p>Generate Knowledge Graph</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Cpu
                        className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300"
                        onClick={() => {
                          const archPrompt =
                            prompt.trim() ||
                            "System Architecture: Trace the codebase components, map key layers (API, backend, database), analyze system dependencies, and compile the full topography map.";

                          setPrompt(archPrompt);
                          if (onSend) {
                            onSend(
                              archPrompt,
                              selectedLanguage === "Mode"
                                ? "default"
                                : selectedLanguage.toLowerCase(),
                              selectedModel === "Stack"
                                ? "fullstack"
                                : selectedModel.toLowerCase(),
                              selectedProgLang === "Language"
                                ? "typescript"
                                : selectedProgLang.toLowerCase(),
                            );
                          } else {
                            dispatch(
                              sendMessage({
                                prompt: archPrompt,
                                model: "default",
                                domain: "Code",
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
                      <p>System Architecture</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Wand2
                        className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300"
                        onClick={() => {
                          const refactorPrompt =
                            prompt.trim() ||
                            "Refactor & Optimize: Analyze the active files, apply DRY and clean code principles, refactor complex methods, optimize performance, and inject JSDoc/TypeScript types.";

                          setPrompt(refactorPrompt);
                          if (onSend) {
                            onSend(
                              refactorPrompt,
                              selectedLanguage === "Mode"
                                ? "default"
                                : selectedLanguage.toLowerCase(),
                              selectedModel === "Stack"
                                ? "fullstack"
                                : selectedModel.toLowerCase(),
                              selectedProgLang === "Language"
                                ? "typescript"
                                : selectedProgLang.toLowerCase(),
                            );
                          } else {
                            dispatch(
                              sendMessage({
                                prompt: refactorPrompt,
                                model: "default",
                                domain: "Code",
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
                      <p>Refactor & Optimize</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BookOpen
                        className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300"
                        onClick={() => {
                          const docsPrompt =
                            prompt.trim() ||
                            "Write Documentation: Scan the codebase components, analyze implementation details, and generate comprehensive markdown API documentation, architectural summaries, or README guides.";

                          setPrompt(docsPrompt);
                          if (onSend) {
                            onSend(
                              docsPrompt,
                              selectedLanguage === "Mode"
                                ? "default"
                                : selectedLanguage.toLowerCase(),
                              selectedModel === "Stack"
                                ? "fullstack"
                                : selectedModel.toLowerCase(),
                              selectedProgLang === "Language"
                                ? "typescript"
                                : selectedProgLang.toLowerCase(),
                            );
                          } else {
                            dispatch(
                              sendMessage({
                                prompt: docsPrompt,
                                model: "default",
                                domain: "Documentation",
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
                      <p>Write Documentation</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle
                        className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300"
                        onClick={() => {
                          const explainPrompt =
                            prompt.trim() ||
                            "Explain Code: Trace the execution flow of the active files, provide a line-by-line conceptual walkthrough, explain technical trade-offs, and detail how the components interact.";

                          setPrompt(explainPrompt);
                          if (onSend) {
                            onSend(
                              explainPrompt,
                              selectedLanguage === "Mode"
                                ? "default"
                                : selectedLanguage.toLowerCase(),
                              selectedModel === "Stack"
                                ? "fullstack"
                                : selectedModel.toLowerCase(),
                              selectedProgLang === "Language"
                                ? "typescript"
                                : selectedProgLang.toLowerCase(),
                            );
                          } else {
                            dispatch(
                              sendMessage({
                                prompt: explainPrompt,
                                model: "default",
                                domain: "Code",
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
                      <p>Explain Code</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Database
                        className="size-6 flex-none cursor-pointer rounded-full border-2 p-1 text-white transition-transform hover:scale-110 active:scale-95 bg-black border-gray-300"
                        onClick={() => {
                          const dbPrompt =
                            prompt.trim() ||
                            "Database Designer: Architect the relational database schema, design Prisma or Mongoose models, write SQL migration scripts, optimize indexes, and map out entity relationships.";

                          setPrompt(dbPrompt);
                          if (onSend) {
                            onSend(
                              dbPrompt,
                              selectedLanguage === "Mode"
                                ? "default"
                                : selectedLanguage.toLowerCase(),
                              selectedModel === "Stack"
                                ? "fullstack"
                                : selectedModel.toLowerCase(),
                              selectedProgLang === "Language"
                                ? "typescript"
                                : selectedProgLang.toLowerCase(),
                            );
                          } else {
                            dispatch(
                              sendMessage({
                                prompt: dbPrompt,
                                model: "default",
                                domain: "Code",
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
                      <p>Database Designer</p>
                    </TooltipContent>
                  </Tooltip>

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
                          const pushPrompt =
                            prompt.trim() ||
                            "Push to GitHub: Stage all refined codebase modifications, perform licensing and security compliance checks, compile a precise conventional commit message, and push the verified changes to the remote branch.";

                          setPrompt(pushPrompt);
                          if (onSend) {
                            onSend(
                              pushPrompt,
                              selectedLanguage === "Mode"
                                ? "default"
                                : selectedLanguage.toLowerCase(),
                              selectedModel === "Stack"
                                ? "fullstack"
                                : selectedModel.toLowerCase(),
                              selectedProgLang === "Language"
                                ? "typescript"
                                : selectedProgLang.toLowerCase(),
                            );
                          } else {
                            dispatch(
                              sendMessage({
                                prompt: pushPrompt,
                                model: "default",
                                domain: "Code",
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
        hideAgents={hideAgents}
        hideDropdown={hideDropdown}
        hideRunLocally={hideRunLocally}
        isTestWorkspace={isTestWorkspace}
        placeholder={placeholder}
        prompt={prompt}
        rightActions={rightActions}
        setPrompt={(val) => {
          const newVal = typeof val === "function" ? val(prompt) : val;

          if (onChange) onChange(newVal);
          else setInternalPrompt(newVal);
        }}
        showFigmaButton={showFigmaButton}
        showModelDropdown={showModelDropdown}
        showResponsiveButton={showResponsiveButton}
        showSandboxButton={showSandboxButton}
        onSend={onSend}
      />
    </div>
  );
}
