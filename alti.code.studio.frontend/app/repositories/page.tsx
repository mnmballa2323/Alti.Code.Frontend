"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Input, Select, SelectItem, Textarea } from "@heroui/react";
import { Github } from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import { AppDispatch } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";
import { addRepository, updateRepository } from "@/store/systemSlice";

export default function Repositories() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session } = useSession();

  const [activeRepoId, setActiveRepoId] = useState<string | null>(null);

  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [newRepoLicenses, setNewRepoLicenses] = useState<any>(new Set([]));
  const [newRepoInstructions, setNewRepoInstructions] = useState("");
  const [newRepoGuardrails, setNewRepoGuardrails] = useState("");

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));

    const handleOpenPanel = () => {
      setActiveRepoId(null);
      setNewRepoName("");
      setNewRepoUrl("");
      setNewRepoLicenses(new Set([]));
      setNewRepoInstructions("");
      setNewRepoGuardrails("");
    };

    const handleEditRepository = (e: any) => {
      const repo = e.detail;

      setActiveRepoId(repo.id);
      setNewRepoName(repo.name);
      setNewRepoUrl(repo.url);
      const licensesArray = repo.licenseType
        .split(",")
        .map((l: string) => l.trim())
        .filter(Boolean);

      setNewRepoLicenses(new Set(licensesArray));
      setNewRepoInstructions(repo.customInstructions || "");
      setNewRepoGuardrails(repo.guardrails || "");
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

    if (activeRepoId) {
      dispatch(
        updateRepository({
          id: activeRepoId,
          url: newRepoUrl,
          name: newRepoName,
          licenseType: Array.from(newRepoLicenses).join(", "),
          customInstructions: newRepoInstructions,
          guardrails: newRepoGuardrails,
          isActive: true,
        }),
      );
    } else {
      dispatch(
        addRepository({
          url: newRepoUrl,
          name: newRepoName,
          licenseType: Array.from(newRepoLicenses).join(", "),
          customInstructions: newRepoInstructions,
          guardrails: newRepoGuardrails,
          isActive: true,
        }),
      );
    }

    // Clear form after saving new or editing
    setActiveRepoId(null);
    setNewRepoName("");
    setNewRepoUrl("");
    setNewRepoLicenses(new Set([]));
    setNewRepoInstructions("");
    setNewRepoGuardrails("");
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-white dark:bg-[#0A0A0A] flex flex-col h-full font-sans w-full items-center">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900 flex items-center gap-2">
                <Github size={16} /> Open Source Repositories
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content (Centered Form) */}
        <div className="flex-1 overflow-y-auto w-full pt-6 pb-12 px-6 flex justify-center">
          <div className="w-full max-w-2xl flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-default-700">
                  Repository Name
                </label>
                <Input
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5]",
                  }}
                  placeholder="e.g. Material Design Icons"
                  size="lg"
                  value={newRepoName}
                  variant="flat"
                  onChange={(e) => setNewRepoName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-default-700">
                  GitHub URL
                </label>
                <Input
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5]",
                  }}
                  placeholder="https://github.com/google/material-design-icons"
                  size="lg"
                  startContent={
                    <Github className="text-default-400 mr-2" size={16} />
                  }
                  value={newRepoUrl}
                  variant="flat"
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-default-700">
                  Applicable Licenses
                </label>
                <Select
                  classNames={{
                    trigger:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] data-[open=true]:!bg-[#f4f4f5]",
                    popoverContent:
                      "bg-white dark:bg-[#18181b] border border-default-200 shadow-2xl",
                  }}
                  placeholder="Select All That Apply"
                  selectedKeys={newRepoLicenses}
                  selectionMode="multiple"
                  size="lg"
                  variant="flat"
                  onSelectionChange={(keys: any) =>
                    setNewRepoLicenses(new Set(keys))
                  }
                >
                  <SelectItem key="MIT">MIT License</SelectItem>
                  <SelectItem key="Apache 2.0">Apache 2.0</SelectItem>
                  <SelectItem key="GPL v2">GPL v2</SelectItem>
                  <SelectItem key="GPL v3">GPL v3</SelectItem>
                  <SelectItem key="AGPL v3">AGPL v3</SelectItem>
                  <SelectItem key="BSD 2-Clause">BSD 2-Clause</SelectItem>
                  <SelectItem key="BSD 3-Clause">BSD 3-Clause</SelectItem>
                  <SelectItem key="Mozilla Public 2.0">
                    Mozilla Public 2.0
                  </SelectItem>
                  <SelectItem key="Eclipse Public 2.0">
                    Eclipse Public 2.0
                  </SelectItem>
                  <SelectItem key="Creative Commons Zero v1.0 Universal">
                    Creative Commons Zero
                  </SelectItem>
                  <SelectItem key="Unlicense">The Unlicense</SelectItem>
                  <SelectItem key="Proprietary / Custom">
                    Proprietary / Custom
                  </SelectItem>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-default-700">
                  Custom Instructions
                </label>
                <Textarea
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5]",
                  }}
                  minRows={3}
                  placeholder="E.g. Always use React 18 patterns, no class components..."
                  size="lg"
                  value={newRepoInstructions}
                  variant="flat"
                  onChange={(e) => setNewRepoInstructions(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-default-700">
                  Safety Guardrails
                </label>
                <Textarea
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5]",
                  }}
                  minRows={3}
                  placeholder="E.g. Do not use any AGPL dependencies..."
                  size="lg"
                  value={newRepoGuardrails}
                  variant="flat"
                  onChange={(e) => setNewRepoGuardrails(e.target.value)}
                />
              </div>

              <div className="pt-4 flex w-full">
                <Button
                  className="w-full font-semibold"
                  color="primary"
                  isDisabled={!newRepoUrl || !newRepoName}
                  size="lg"
                  onPress={handleSaveRepository}
                >
                  {activeRepoId ? "Save Changes" : "Add Repository"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
