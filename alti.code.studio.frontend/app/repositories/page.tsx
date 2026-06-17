"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@heroui/react";
import {
  Code,
  Scale,
  FileText,
  Shield,
  Check,
  ChevronLeft,
  ArrowUp,
  ArrowRight,
  Search,
  Trash2,
  Terminal,
  Link,
} from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import { AppDispatch } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";
import { addRepository, updateRepository } from "@/store/systemSlice";

interface RuleItem {
  id: string;
  text: string;
  timestamp: string;
}

const LICENSES = [
  { id: "MIT", name: "MIT License" },
  { id: "Apache 2.0", name: "Apache 2.0" },
  { id: "GPL v2", name: "GPL v2" },
  { id: "GPL v3", name: "GPL v3" },
  { id: "AGPL v3", name: "AGPL v3" },
  { id: "BSD 2-Clause", name: "BSD 2-Clause" },
  { id: "BSD 3-Clause", name: "BSD 3-Clause" },
  { id: "Mozilla Public 2.0", name: "Mozilla Public 2.0" },
  { id: "Eclipse Public 2.0", name: "Eclipse Public 2.0" },
  { id: "Creative Commons Zero v1.0 Universal", name: "Creative Commons Zero" },
  { id: "Unlicense", name: "The Unlicense" },
  { id: "Proprietary or Custom", name: "Proprietary or Custom" },
];

export default function Repositories() {
  const dispatch = useDispatch<AppDispatch>();

  const [activeRepoId, setActiveRepoId] = useState<string | null>(null);

  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [newRepoLicenses, setNewRepoLicenses] = useState<any>(new Set([]));

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [instructionInput, setInstructionInput] = useState("");
  const [guardrailInput, setGuardrailInput] = useState("");
  const [instructionSearch, setInstructionSearch] = useState("");
  const [guardrailSearch, setGuardrailSearch] = useState("");
  const [instructionList, setInstructionList] = useState<RuleItem[]>([]);
  const [guardrailList, setGuardrailList] = useState<RuleItem[]>([]);

  const getFormattedTimestamp = () => {
    return new Date().toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));

    const handleOpenPanel = () => {
      setActiveRepoId(null);
      setNewRepoName("");
      setNewRepoUrl("");
      setNewRepoLicenses(new Set([]));
      setInstructionList([]);
      setGuardrailList([]);
      setInstructionInput("");
      setGuardrailInput("");
      setInstructionSearch("");
      setGuardrailSearch("");
      setCurrentStep(0);
    };

    const handleEditRepository = (e: any) => {
      const repo = e.detail;

      setActiveRepoId(repo.id);
      setNewRepoName(repo.name);
      setNewRepoUrl(repo.url);
      const licensesArray = repo.licenseType
        ? repo.licenseType
            .split(",")
            .map((l: string) => l.trim())
            .filter(Boolean)
        : [];

      setNewRepoLicenses(new Set(licensesArray));

      const instList = repo.customInstructions
        ? repo.customInstructions
            .split("\n")
            .map((s: string, idx: number) => ({
              id: `inst-${idx}-${Date.now()}`,
              text: s.trim(),
              timestamp: getFormattedTimestamp(),
            }))
            .filter((item: any) => item.text)
        : [];

      setInstructionList(instList);

      const gdList = repo.guardrails
        ? repo.guardrails
            .split("\n")
            .map((s: string, idx: number) => ({
              id: `gd-${idx}-${Date.now()}`,
              text: s.trim(),
              timestamp: getFormattedTimestamp(),
            }))
            .filter((item: any) => item.text)
        : [];

      setGuardrailList(gdList);

      setInstructionInput("");
      setGuardrailInput("");
      setInstructionSearch("");
      setGuardrailSearch("");
      setCurrentStep(0);
    };

    window.addEventListener("open-repository-modal", handleOpenPanel);
    window.addEventListener("edit-repository", handleEditRepository);

    return () => {
      window.removeEventListener("open-repository-modal", handleOpenPanel);
      window.removeEventListener("edit-repository", handleEditRepository);
    };
  }, [dispatch]);

  const handleSaveRepository = () => {
    if (!newRepoUrl || !newRepoName) return;

    const customInstructionsStr = instructionList.map((i) => i.text).join("\n");
    const guardrailsStr = guardrailList.map((g) => g.text).join("\n");
    const licenseTypeStr = Array.from(newRepoLicenses).join(", ");

    if (activeRepoId) {
      dispatch(
        updateRepository({
          id: activeRepoId,
          url: newRepoUrl,
          name: newRepoName,
          licenseType: licenseTypeStr,
          customInstructions: customInstructionsStr,
          guardrails: guardrailsStr,
          isActive: true,
        }),
      );
    } else {
      dispatch(
        addRepository({
          url: newRepoUrl,
          name: newRepoName,
          licenseType: licenseTypeStr,
          customInstructions: customInstructionsStr,
          guardrails: guardrailsStr,
          isActive: true,
        }),
      );
    }

    // Clear form after saving new or editing
    setActiveRepoId(null);
    setNewRepoName("");
    setNewRepoUrl("");
    setNewRepoLicenses(new Set([]));
    setInstructionList([]);
    setGuardrailList([]);
    setInstructionInput("");
    setGuardrailInput("");
    setInstructionSearch("");
    setGuardrailSearch("");
    setCurrentStep(0);
  };

  const handleAddInstruction = () => {
    if (!instructionInput.trim()) return;
    const newItem: RuleItem = {
      id: `inst-${Date.now()}-${Math.random()}`,
      text: instructionInput.trim(),
      timestamp: getFormattedTimestamp(),
    };

    setInstructionList((prev) => [...prev, newItem]);
    setInstructionInput("");
  };

  const handleAddGuardrail = () => {
    if (!guardrailInput.trim()) return;
    const newItem: RuleItem = {
      id: `gd-${Date.now()}-${Math.random()}`,
      text: guardrailInput.trim(),
      timestamp: getFormattedTimestamp(),
    };

    setGuardrailList((prev) => [...prev, newItem]);
    setGuardrailInput("");
  };

  const handleDeleteInstruction = (id: string) => {
    setInstructionList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteGuardrail = (id: string) => {
    setGuardrailList((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleLicense = (licenseId: string) => {
    setNewRepoLicenses((prev: any) => {
      const next = new Set(prev);

      if (next.has(licenseId)) {
        next.delete(licenseId);
      } else {
        next.add(licenseId);
      }

      return next;
    });
  };

  const filteredInstructions = instructionList.filter((item) =>
    item.text.toLowerCase().includes(instructionSearch.toLowerCase()),
  );

  const filteredGuardrails = guardrailList.filter((item) =>
    item.text.toLowerCase().includes(guardrailSearch.toLowerCase()),
  );

  const steps = [
    { label: "NAME", icon: Code },
    { label: "URL", icon: Link },
    { label: "LICENSE", icon: Scale },
    { label: "INSTRUCTIONS", icon: FileText },
    { label: "GUARDRAILS", icon: Shield },
  ];

  // Validation to proceed forward
  const isNextDisabled = () => {
    if (currentStep === 0) {
      return !newRepoName.trim();
    }
    if (currentStep === 1) {
      return !newRepoUrl.trim();
    }

    return false;
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-white dark:bg-[#0A0A0A] flex flex-col h-full font-sans w-full items-center">
        {/* Stepper progress bar */}
        <div className="w-full max-w-3xl mt-8 px-6">
          <div className="relative flex items-center justify-between w-full">
            {/* Background connecting line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-neutral-200 dark:bg-neutral-800 -z-10" />

            {/* Active/completed line segment overlay */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-black dark:bg-white transition-all duration-300 -z-10"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;

              return (
                <div
                  key={step.label}
                  className="flex flex-col items-center gap-2 relative bg-white dark:bg-[#0A0A0A] px-4"
                >
                  <button
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 outline-none ${
                      isCompleted
                        ? "bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white cursor-pointer hover:opacity-85"
                        : isActive
                          ? "bg-white dark:bg-[#18181b] border-2 border-black dark:border-white text-black dark:text-white"
                          : "bg-white dark:bg-[#0A0A0A] border-2 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                    }`}
                    disabled={idx >= currentStep}
                    onClick={() => {
                      if (idx < currentStep) {
                        setCurrentStep(idx);
                      }
                    }}
                  >
                    {isCompleted ? (
                      <Check size={18} strokeWidth={2.5} />
                    ) : (
                      <StepIcon size={18} />
                    )}
                  </button>
                  <span
                    className={`text-[10px] font-bold tracking-wider transition-colors duration-300 ${
                      isActive
                        ? "text-black dark:text-white"
                        : "text-neutral-400 dark:text-neutral-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow flex-1 overflow-y-auto w-full max-w-2xl px-6 flex flex-col items-center min-h-0">
          {currentStep === 0 && (
            <div className="w-full flex-grow flex-1 flex flex-col items-center justify-center max-w-xl py-12">
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-200 mb-8 text-center">
                Enter Repository Name
              </h2>

              {/* Input container */}
              <div className="w-full flex items-center gap-3 bg-[#f4f4f5] dark:bg-[#18181b] p-2 rounded-2xl border border-transparent focus-within:border-black dark:focus-within:border-white focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white transition-all duration-200">
                {/* Input field */}
                <input
                  className="flex-1 bg-transparent border-none outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-600 px-4 py-3 text-base"
                  placeholder="Enter repository name..."
                  type="text"
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newRepoName.trim()) {
                      setCurrentStep(1);
                    }
                  }}
                />

                {/* Next button */}
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    newRepoName.trim()
                      ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 cursor-pointer"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                  }`}
                  disabled={!newRepoName.trim()}
                  title="Next Step"
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowUp size={20} />
                </button>
              </div>

              <div className="mt-12 flex justify-center w-full">
                <Button
                  className="px-8 py-6 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-semibold text-base shadow-lg transition-all duration-200 flex items-center gap-2"
                  isDisabled={isNextDisabled()}
                  onPress={() => setCurrentStep(1)}
                >
                  Next Step
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="w-full flex-grow flex-1 flex flex-col items-center justify-center max-w-xl py-12">
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-200 mb-8 text-center">
                Enter GitHub URL
              </h2>

              {/* Input container */}
              <div className="w-full flex items-center gap-3 bg-[#f4f4f5] dark:bg-[#18181b] p-2 rounded-2xl border border-transparent focus-within:border-black dark:focus-within:border-white focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white transition-all duration-200">
                {/* Back button */}
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 transition-all duration-200 flex-shrink-0"
                  title="Previous Step"
                  onClick={() => setCurrentStep(0)}
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Input field */}
                <input
                  className="flex-1 bg-transparent border-none outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-600 px-2 py-3 text-base"
                  placeholder="Enter GitHub URL..."
                  type="text"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newRepoUrl.trim()) {
                      setCurrentStep(2);
                    }
                  }}
                />

                {/* Next button */}
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    newRepoUrl.trim()
                      ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 cursor-pointer"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                  }`}
                  disabled={!newRepoUrl.trim()}
                  title="Next Step"
                  onClick={() => setCurrentStep(2)}
                >
                  <ArrowUp size={20} />
                </button>
              </div>

              <div className="mt-12 flex justify-center w-full gap-4">
                <Button
                  className="px-6 py-6 rounded-full border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 font-semibold text-base transition-all duration-200"
                  onPress={() => setCurrentStep(0)}
                >
                  Back
                </Button>
                <Button
                  className="px-8 py-6 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-semibold text-base shadow-lg transition-all duration-200 flex items-center gap-2"
                  isDisabled={isNextDisabled()}
                  onPress={() => setCurrentStep(2)}
                >
                  Next Step
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="w-full flex-grow flex-1 flex flex-col items-center justify-center max-w-2xl py-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
                {LICENSES.map((license) => {
                  const isSelected = newRepoLicenses.has(license.id);

                  return (
                    <button
                      key={license.id}
                      className={`relative p-5 rounded-2xl border-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none h-24 focus:outline-none ${
                        isSelected
                          ? "bg-black/5 dark:bg-white/10 border-black dark:border-white text-black dark:text-white font-medium"
                          : "bg-[#f4f4f5]/40 dark:bg-[#18181b]/40 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200"
                      }`}
                      type="button"
                      onClick={() => toggleLicense(license.id)}
                    >
                      <span className="text-sm leading-snug">
                        {license.name}
                      </span>
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-12 flex justify-center w-full gap-4">
                <Button
                  className="px-6 py-6 rounded-full border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 font-semibold text-base transition-all duration-200"
                  onPress={() => setCurrentStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="px-8 py-6 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-semibold text-base shadow-lg transition-all duration-200 flex items-center gap-2"
                  onPress={() => setCurrentStep(3)}
                >
                  Next Step
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="w-full flex flex-col items-center py-8">
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-200 mb-8 text-center">
                Enter Instructions
              </h2>

              {/* Input container */}
              <div className="w-full flex items-center gap-3 bg-[#f4f4f5] dark:bg-[#18181b] p-2 rounded-2xl border border-transparent focus-within:border-black dark:focus-within:border-white focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white transition-all duration-200">
                {/* Back button */}
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 transition-all duration-200 flex-shrink-0"
                  title="Previous Step"
                  onClick={() => setCurrentStep(2)}
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Input field */}
                <input
                  className="flex-1 bg-transparent border-none outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-600 px-2 py-3 text-base"
                  placeholder="Enter instructions here..."
                  type="text"
                  value={instructionInput}
                  onChange={(e) => setInstructionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddInstruction();
                    }
                  }}
                />

                {/* Add button */}
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    instructionInput.trim()
                      ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 cursor-pointer"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                  }`}
                  disabled={!instructionInput.trim()}
                  title="Add Instruction"
                  onClick={handleAddInstruction}
                >
                  <ArrowUp size={20} />
                </button>
              </div>

              {/* Search bar */}
              <div className="w-full mt-6 flex items-center gap-2 bg-[#f4f4f5]/60 dark:bg-[#18181b]/60 px-4 py-2.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 focus-within:border-neutral-300 dark:focus-within:border-neutral-700 transition-all duration-200">
                <Search
                  className="text-neutral-400 dark:text-neutral-500"
                  size={16}
                />
                <input
                  className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 dark:placeholder-neutral-600"
                  placeholder="Search instructions..."
                  type="text"
                  value={instructionSearch}
                  onChange={(e) => setInstructionSearch(e.target.value)}
                />
              </div>

              {/* Rules list */}
              <div className="w-full mt-6 flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
                {filteredInstructions.map((rule) => (
                  <div
                    key={rule.id}
                    className="group relative flex items-center gap-4 bg-neutral-50 dark:bg-[#111] p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200"
                  >
                    {/* Console prompt icon */}
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 flex-shrink-0">
                      <Terminal size={14} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col min-w-0 pr-8">
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 break-words leading-relaxed">
                        {rule.text}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-1">
                        PROMPT RULE • {rule.timestamp}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 active:scale-95 transition-all duration-200 p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                      title="Delete Instruction"
                      onClick={() => handleDeleteInstruction(rule.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex justify-center w-full">
                <Button
                  className="px-8 py-6 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-semibold text-base shadow-lg transition-all duration-200 flex items-center gap-2"
                  onPress={() => setCurrentStep(4)}
                >
                  Next Step
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="w-full flex flex-col items-center py-8">
              <h2 className="text-3xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-200 mb-8 text-center">
                Enter Guardrails
              </h2>

              {/* Input container */}
              <div className="w-full flex items-center gap-3 bg-[#f4f4f5] dark:bg-[#18181b] p-2 rounded-2xl border border-transparent focus-within:border-black dark:focus-within:border-white focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white transition-all duration-200">
                {/* Back button */}
                <button
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 transition-all duration-200 flex-shrink-0"
                  title="Previous Step"
                  onClick={() => setCurrentStep(3)}
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Input field */}
                <input
                  className="flex-1 bg-transparent border-none outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-600 px-2 py-3 text-base"
                  placeholder="Enter guardrails here..."
                  type="text"
                  value={guardrailInput}
                  onChange={(e) => setGuardrailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddGuardrail();
                    }
                  }}
                />

                {/* Add button */}
                <button
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    guardrailInput.trim()
                      ? "bg-black dark:bg-white text-white dark:text-black hover:opacity-90 active:scale-95 cursor-pointer"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                  }`}
                  disabled={!guardrailInput.trim()}
                  title="Add Guardrail"
                  onClick={handleAddGuardrail}
                >
                  <ArrowUp size={20} />
                </button>
              </div>

              {/* Search bar */}
              <div className="w-full mt-6 flex items-center gap-2 bg-[#f4f4f5]/60 dark:bg-[#18181b]/60 px-4 py-2.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 focus-within:border-neutral-300 dark:focus-within:border-neutral-700 transition-all duration-200">
                <Search
                  className="text-neutral-400 dark:text-neutral-500"
                  size={16}
                />
                <input
                  className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 dark:placeholder-neutral-600"
                  placeholder="Search guardrails..."
                  type="text"
                  value={guardrailSearch}
                  onChange={(e) => setGuardrailSearch(e.target.value)}
                />
              </div>

              {/* Rules list */}
              <div className="w-full mt-6 flex flex-col gap-3 max-h-[280px] overflow-y-auto pr-1">
                {filteredGuardrails.map((rule) => (
                  <div
                    key={rule.id}
                    className="group relative flex items-center gap-4 bg-neutral-50 dark:bg-[#111] p-4 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200"
                  >
                    {/* Console prompt icon */}
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-[#111] flex items-center justify-center text-neutral-600 dark:text-neutral-400 flex-shrink-0">
                      <Terminal size={14} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col min-w-0 pr-8">
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 break-words leading-relaxed">
                        {rule.text}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-1">
                        GUARDRAIL RULE • {rule.timestamp}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 active:scale-95 transition-all duration-200 p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                      title="Delete Guardrail"
                      onClick={() => handleDeleteGuardrail(rule.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-12 flex justify-center w-full">
                <Button
                  className="px-8 py-6 rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-90 font-semibold text-base shadow-lg transition-all duration-200 flex items-center gap-2"
                  onPress={handleSaveRepository}
                >
                  {activeRepoId ? "Save Changes" : "Add Repository"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ChatBotLayout>
  );
}
