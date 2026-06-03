"use client";

import React, { useState, useRef } from "react";
import {
  User,
  AlignLeft,
  FileText,
  Shield,
  Database,
  Check,
  ArrowUp,
  ChevronLeft,
  Search,
  TerminalSquare,
  Upload,
} from "lucide-react";
import { cn } from "@heroui/react";

import PromptInputFullLineWithBottomActions from "@/components/input-actions";

const STEPS = [
  { id: "name", label: "NAME", icon: User, title: "Enter Project Name" },
  {
    id: "description",
    label: "DESCRIPTION",
    icon: AlignLeft,
    title: "Enter Description",
  },
  {
    id: "instructions",
    label: "INSTRUCTIONS",
    icon: FileText,
    title: "Enter Instructions",
  },
  {
    id: "guardrails",
    label: "GUARDRAILS",
    icon: Shield,
    title: "Enter Guardrails",
  },
  { id: "knowledge", label: "DATA", icon: Database, title: "Add Knowledge" },
  { id: "publish", label: "PUBLISH", icon: Upload, title: "Publish Agent" },
];

export default function AgentCreationWizard({
  onComplete,
}: {
  onComplete: (data: any) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState<
    { id: string; text: string; date: string }[]
  >([]);
  const [instructionInput, setInstructionInput] = useState("");
  const [guardrails, setGuardrails] = useState<
    { id: string; text: string; date: string }[]
  >([]);
  const [guardrailInput, setGuardrailInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [publishPrompt, setPublishPrompt] = useState("");

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete({ name, description, instructions, guardrails });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const addInstruction = () => {
    if (!instructionInput.trim()) return;
    const now = new Date();

    setInstructions((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        text: instructionInput,
        date: `${now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}, ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
      },
      ...prev,
    ]);
    setInstructionInput("");
  };

  const addGuardrail = () => {
    if (!guardrailInput.trim()) return;
    const now = new Date();

    setGuardrails((prev) => [
      {
        id: Math.random().toString(36).substring(7),
        text: guardrailInput,
        date: `${now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}, ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
      },
      ...prev,
    ]);
    setGuardrailInput("");
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto h-full px-6 relative">
      {/* Stepper Header (Absolute positioned at the top) */}
      {currentStep < 5 && (
        <div className="absolute top-0 left-0 right-0 w-full pt-16 px-2 z-40">
          <div className="relative flex items-start justify-between w-full max-w-4xl mx-auto">
            {/* Dynamic Background Line */}
            <div className="absolute top-[20px] md:top-[24px] left-[8%] right-[8%] h-[3px] bg-white border-y border-gray-200 z-0 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-black transition-all duration-700 ease-in-out"
                style={{
                  width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
                }}
              />
            </div>

            {STEPS.map((step, index) => {
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center relative z-10 w-16 sm:w-20 md:w-24 shrink-0"
                >
                  <div
                    className={cn(
                      "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 shrink-0",
                      isCompleted
                        ? "bg-black text-white"
                        : isActive
                          ? "bg-white border-2 border-black text-black shadow-sm"
                          : "bg-white border-2 border-gray-100 text-gray-300",
                    )}
                  >
                    {isCompleted ? (
                      <Check size={18} strokeWidth={3} />
                    ) : (
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] md:text-[10px] font-bold tracking-wider uppercase mt-3 transition-colors duration-300 text-center",
                      isCompleted || isActive ? "text-black" : "text-gray-400",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content (Mimicking chat/page.tsx spacing) */}
      <div className="relative flex flex-1 w-full flex-col items-center justify-start pt-[35vh] overflow-hidden">
        <div className="flex w-full flex-col items-center gap-6 z-20 px-6">
          {/* Title */}
          <div className="flex flex-col items-center text-center z-30 mb-6">
            <h1
              className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80 animate-in fade-in duration-300"
              style={{ fontFamily: "var(--font-secondary)" }}
            >
              {STEPS[currentStep].title}
            </h1>
          </div>

          {/* Content Area */}
          <div className="flex w-full flex-col gap-4 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 h-full overflow-y-auto scrollbar-hide">
            {/* Step 1: NAME */}
            {currentStep === 0 && (
              <div className="relative w-full flex items-center bg-white border border-gray-200 rounded-full px-2 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow focus-within:shadow-[0_2px_15px_rgba(0,0,0,0.05)] focus-within:border-gray-300">
                <input
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-[15px] text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter project name..."
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && name.trim() && handleNext()
                  }
                />
                <button
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 disabled:opacity-50",
                    name.trim()
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-100 text-gray-400",
                  )}
                  disabled={!name.trim()}
                  onClick={handleNext}
                >
                  <ArrowUp size={16} strokeWidth={3} />
                </button>
              </div>
            )}

            {/* Step 2: DESCRIPTION */}
            {currentStep === 1 && (
              <div className="relative w-full flex items-center bg-white border border-gray-200 rounded-full px-2 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow focus-within:shadow-[0_2px_15px_rgba(0,0,0,0.05)] focus-within:border-gray-300">
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 bg-black text-white hover:bg-gray-800 ml-1 shadow-sm"
                  onClick={handleBack}
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                <input
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-[15px] text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter description..."
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && description.trim() && handleNext()
                  }
                />
                <button
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 disabled:opacity-50",
                    description.trim()
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-100 text-gray-400",
                  )}
                  disabled={!description.trim()}
                  onClick={handleNext}
                >
                  <ArrowUp size={16} strokeWidth={3} />
                </button>
              </div>
            )}

            {/* Step 3: INSTRUCTIONS */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-4">
                {/* Input Form */}
                <div className="relative w-full flex items-center bg-white border border-gray-200 rounded-full px-2 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow focus-within:shadow-[0_2px_15px_rgba(0,0,0,0.05)] focus-within:border-gray-300">
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 bg-black text-white hover:bg-gray-800 ml-1 shadow-sm"
                    onClick={handleBack}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <input
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-[15px] text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter instructions here..."
                    type="text"
                    value={instructionInput}
                    onChange={(e) => setInstructionInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addInstruction()}
                  />
                  <button
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 disabled:opacity-50",
                      instructionInput.trim()
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-100 text-gray-400",
                    )}
                    disabled={!instructionInput.trim()}
                    onClick={addInstruction}
                  >
                    <ArrowUp size={16} strokeWidth={3} />
                  </button>
                </div>

                {/* Search */}
                <div className="relative w-full flex items-center bg-white border border-gray-200 rounded-full px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <Search className="text-gray-400 shrink-0" size={18} />
                  <input
                    className="flex-1 bg-transparent border-none outline-none px-3 text-[15px] text-gray-900 placeholder:text-gray-400"
                    placeholder="Search instructions..."
                    type="text"
                  />
                </div>

                {/* List */}
                <div className="flex flex-col gap-3 mt-2">
                  {instructions.map((inst) => (
                    <div
                      key={inst.id}
                      className="flex items-center gap-4 w-full bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:border-gray-200 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <TerminalSquare size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-medium text-gray-900 leading-snug">
                          {inst.text}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">
                          PROMPT RULE • {inst.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: GUARDRAILS */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-4">
                {/* Input Form */}
                <div className="relative w-full flex items-center bg-white border border-gray-200 rounded-full px-2 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow focus-within:shadow-[0_2px_15px_rgba(0,0,0,0.05)] focus-within:border-gray-300">
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 bg-black text-white hover:bg-gray-800 ml-1 shadow-sm"
                    onClick={handleBack}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <input
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-[15px] text-gray-900 placeholder:text-gray-400"
                    placeholder="Enter guardrails here..."
                    type="text"
                    value={guardrailInput}
                    onChange={(e) => setGuardrailInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addGuardrail()}
                  />
                  <button
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 disabled:opacity-50",
                      guardrailInput.trim()
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-100 text-gray-400",
                    )}
                    disabled={!guardrailInput.trim()}
                    onClick={addGuardrail}
                  >
                    <ArrowUp size={16} strokeWidth={3} />
                  </button>
                </div>
                {/* Search */}
                <div className="relative w-full flex items-center bg-white border border-gray-200 rounded-full px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <Search className="text-gray-400 shrink-0" size={18} />
                  <input
                    className="flex-1 bg-transparent border-none outline-none px-3 text-[15px] text-gray-900 placeholder:text-gray-400"
                    placeholder="Search guardrails..."
                    type="text"
                  />
                </div>

                {/* List */}
                <div className="flex flex-col gap-3 mt-2">
                  {guardrails.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center gap-4 w-full bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:border-gray-200 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <Shield size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-medium text-gray-900 leading-snug">
                          {g.text}
                        </span>
                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">
                          GUARDRAIL • {g.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: DATA */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-4">
                {/* File Upload Form */}
                <div
                  className="relative w-full flex items-center bg-white border border-gray-200 rounded-full px-2 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_2px_15px_rgba(0,0,0,0.05)] hover:border-gray-300 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    multiple
                    className="hidden"
                    type="file"
                    onChange={(e) => {
                      if (e.target.files) {
                        setFiles((prev) => [
                          ...prev,
                          ...Array.from(e.target.files!),
                        ]);
                      }
                    }}
                  />
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 bg-black text-white hover:bg-gray-800 ml-1 shadow-sm relative z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBack();
                    }}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>
                  <input
                    readOnly
                    className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-[15px] text-gray-900 placeholder:text-gray-400 cursor-pointer pointer-events-none"
                    placeholder="Click or drag & drop files here..."
                    type="text"
                  />
                </div>

                {/* Search */}
                <div className="relative w-full flex items-center bg-white border border-gray-200 rounded-full px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-gray-300 transition-colors">
                  <Search
                    className="text-gray-400 shrink-0 ml-1"
                    size={16}
                    strokeWidth={2.5}
                  />
                  <input
                    className="flex-1 bg-transparent border-none outline-none px-3 text-[15px] text-gray-900 placeholder:text-gray-400"
                    placeholder="Search files..."
                    type="text"
                  />
                </div>

                {/* List */}
                {files.length > 0 && (
                  <div className="flex flex-col gap-3 mt-2">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 w-full bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:border-gray-200 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-medium text-gray-900 leading-snug">
                            {file.name}
                          </span>
                          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mt-0.5">
                            DOCUMENT • {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 6: PUBLISH */}
            {currentStep === 5 && (
              <div 
                className="relative w-full flex items-center bg-white border border-gray-200 rounded-full px-2 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_2px_15px_rgba(0,0,0,0.05)] hover:border-gray-300 animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer group"
                onClick={() => {
                  onComplete({
                    name,
                    description,
                    instructions,
                    guardrails,
                    files,
                    prompt: "",
                  });
                }}
              >
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 bg-black text-white hover:bg-gray-800 ml-1 shadow-sm z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBack();
                  }}
                >
                  <ChevronLeft size={16} strokeWidth={2.5} />
                </button>
                
                <div className="flex-1 flex justify-center items-center pointer-events-none">
                  <span className="text-[15px] font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                    Publish Agent
                  </span>
                </div>

                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 bg-black text-white hover:bg-gray-800 shadow-sm z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete({
                      name,
                      description,
                      instructions,
                      guardrails,
                      files,
                      prompt: "",
                    });
                  }}
                >
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* Next Button (Only for steps >= 2 and < 5) */}
            {currentStep >= 2 && currentStep < 5 && (
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#f4f4f6] via-[#f4f4f6] to-transparent pt-8 pb-4 flex justify-center z-50 pointer-events-none px-6">
                <div className="w-full max-w-2xl flex justify-end">
                  <button
                    className="bg-black text-white px-8 py-3 rounded-full font-medium text-sm hover:bg-gray-900 transition-colors shadow-[0_4px_14px_rgba(0,0,0,0.1)] flex items-center gap-2 pointer-events-auto"
                    onClick={handleNext}
                  >
                    {currentStep === STEPS.length - 1
                      ? "Publish Agent"
                      : "Next Step"}
                    {currentStep < STEPS.length - 1 && (
                      <ChevronLeft className="rotate-180" size={16} />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
