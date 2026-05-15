"use client";

import { Badge, Button, Form, Image, cn } from "@heroui/react";
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
}) {
  const router = useRouter();
  const { onOpen } = useModalStore();
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
    const mode = selectedLanguage === "Mode" ? "Agent" : selectedLanguage;
    const domain =
      selectedModel === "Stack" || selectedModel === "Framework"
        ? "Full Stack"
        : selectedModel;
    const language =
      selectedProgLang === "Language" ? undefined : selectedProgLang;

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
    selectedLanguage,
    selectedModel,
    selectedProgLang,
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

          {customActions}

          {!hideDropdown && (
            <div className="flex flex-row items-center gap-1 flex-nowrap shrink-0">
              {!isTestWorkspace && (
                <div ref={langDropdownRef} className="relative">
                  <button
                    className="h-8 px-2 bg-transparent hover:bg-default-100 rounded-md text-[10px] font-bold text-gray-400 uppercase tracking-widest border-0 flex items-center gap-1 min-w-0 transition-colors"
                    type="button"
                    onClick={() => {
                      setLangDropdownOpen(!langDropdownOpen);
                      setModelDropdownOpen(false);
                      setProgLangDropdownOpen(false);
                    }}
                  >
                    <span>{selectedLanguage}</span>
                    <ChevronDown className="size-3.5 text-gray-400 ml-0.5" />
                  </button>

                  {langDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-40 max-h-64 overflow-y-auto bg-white dark:bg-black border border-default-200 shadow-2xl rounded-xl z-50 p-1 custom-scrollbar">
                      {[
                        "Agent",
                        "Architect",
                        "Ask",
                        "Debug",
                        "Deploy",
                        "Document",
                        "Explain",
                        "Optimize",
                        "Plan",
                        "Refactor",
                        "Review",
                        "Test",
                      ].map((mode) => (
                        <button
                          key={mode}
                          className={cn(
                            "w-full text-left whitespace-nowrap px-3 py-2 text-xs rounded-lg transition-colors font-medium",
                            selectedLanguage === mode ||
                              (selectedLanguage === "Mode" && mode === "Agent")
                              ? "bg-primary/10 text-primary"
                              : "text-default-600 hover:bg-default-100",
                          )}
                          onClick={() => {
                            setSelectedLanguage(mode);
                            setLangDropdownOpen(false);
                          }}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div ref={modelDropdownRef} className="relative">
                <button
                  className="h-8 px-2 bg-transparent hover:bg-default-100 rounded-md text-[10px] font-bold text-gray-400 uppercase tracking-widest border-0 flex items-center gap-1 min-w-0 transition-colors"
                  type="button"
                  onClick={() => {
                    setModelDropdownOpen(!modelDropdownOpen);
                    setLangDropdownOpen(false);
                    setProgLangDropdownOpen(false);
                  }}
                >
                  <span>{selectedModel}</span>
                  <ChevronDown className="size-3.5 text-gray-400 ml-0.5" />
                </button>

                {modelDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 max-h-64 overflow-y-auto bg-white dark:bg-black border border-default-200 shadow-2xl rounded-xl z-50 p-1 custom-scrollbar">
                    {(isTestWorkspace
                      ? [
                          "Jest",
                          "Vitest",
                          "Playwright",
                          "Cypress",
                          "Mocha",
                          "PyTest",
                          "JUnit",
                          "Selenium",
                          "RSpec",
                        ]
                      : [
                          "Full Stack",
                          "Frontend",
                          "Backend",
                          "Mobile",
                          "Desktop",
                          "API",
                          "UI/UX Design",
                          "DevOps",
                          "Cloud",
                          "Database",
                          "Data Engineering",
                          "Data Science",
                          "AI / ML",
                          "Security",
                          "Testing",
                          "Web3",
                          "Developer Tools",
                        ]
                    ).map((stack) => (
                      <button
                        key={stack}
                        className={cn(
                          "w-full text-left whitespace-nowrap px-3 py-2 text-xs rounded-lg transition-colors font-medium",
                          selectedModel === stack ||
                            ((selectedModel === "Stack" ||
                              selectedModel === "Framework") &&
                              stack === "Full Stack")
                            ? "bg-primary/10 text-primary"
                            : "text-default-600 hover:bg-default-100",
                        )}
                        onClick={() => {
                          setSelectedModel(stack);
                          setModelDropdownOpen(false);
                        }}
                      >
                        {stack}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div ref={progLangDropdownRef} className="relative">
                <button
                  className="h-8 px-2 bg-transparent hover:bg-default-100 rounded-md text-[10px] font-bold text-gray-400 uppercase tracking-widest border-0 flex items-center gap-1 min-w-0 transition-colors"
                  type="button"
                  onClick={() => {
                    setProgLangDropdownOpen(!progLangDropdownOpen);
                    setLangDropdownOpen(false);
                    setModelDropdownOpen(false);
                  }}
                >
                  <span>{selectedProgLang}</span>
                  <ChevronDown className="size-3.5 text-gray-400 ml-0.5" />
                </button>

                {progLangDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-40 max-h-64 overflow-y-auto bg-white dark:bg-black border border-default-200 shadow-2xl rounded-xl z-50 p-1 custom-scrollbar">
                    {[
                      "Ada",
                      "Apex",
                      "Assembly",
                      "Bash",
                      "C",
                      "C++",
                      "C#",
                      "Clojure",
                      "COBOL",
                      "Crystal",
                      "Dart",
                      "Delphi",
                      "Elixir",
                      "Erlang",
                      "F#",
                      "Fortran",
                      "Go",
                      "GDScript",
                      "Godot",
                      "Groovy",
                      "Hack",
                      "Haxe",
                      "Haskell",
                      "Java",
                      "JavaScript",
                      "Julia",
                      "Kotlin",
                      "Lua",
                      "MATLAB",
                      "Nim",
                      "Objective-C",
                      "Objective-C++",
                      "OCaml",
                      "Odin",
                      "Pascal",
                      "Perl",
                      "PHP",
                      "Pony",
                      "PowerShell",
                      "Python",
                      "R",
                      "ReasonML",
                      "ReScript",
                      "Ruby",
                      "Rust",
                      "Scala",
                      "Smalltalk",
                      "Solidity",
                      "Swift",
                      "Tcl",
                      "TypeScript",
                      "Unity",
                      "V",
                      "Verilog",
                      "VHDL",
                      "Vyper",
                      "Zig",
                    ].map((lang) => (
                      <button
                        key={lang}
                        className={cn(
                          "w-full text-left whitespace-nowrap px-3 py-2 text-xs rounded-lg transition-colors font-medium",
                          selectedProgLang === lang
                            ? "bg-primary/10 text-primary"
                            : "text-default-600 hover:bg-default-100",
                        )}
                        onClick={() => {
                          setSelectedProgLang(lang);
                          setProgLangDropdownOpen(false);
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
        setPrompt={(val) => {
          const newVal = typeof val === "function" ? val(prompt) : val;

          if (onChange) onChange(newVal);
          else setInternalPrompt(newVal);
        }}
        showFigmaButton={showFigmaButton}
        showResponsiveButton={showResponsiveButton}
        showSandboxButton={showSandboxButton}
        onSend={onSend}
      />
    </div>
  );
}
