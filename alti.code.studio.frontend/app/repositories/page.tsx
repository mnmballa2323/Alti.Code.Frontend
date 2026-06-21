"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@heroui/react";
import { Code, Link } from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import { AppDispatch } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";
import { addRepository, updateRepository } from "@/store/systemSlice";

export default function Repositories() {
  const dispatch = useDispatch<AppDispatch>();

  const [activeRepoId, setActiveRepoId] = useState<string | null>(null);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoUrl, setNewRepoUrl] = useState("");

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));

    const handleOpenPanel = () => {
      setActiveRepoId(null);
      setNewRepoName("");
      setNewRepoUrl("");
    };

    const handleEditRepository = (e: any) => {
      const repo = e.detail;

      setActiveRepoId(repo.id);
      setNewRepoName(repo.name);
      setNewRepoUrl(repo.url);
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
          licenseType: "",
          customInstructions: "",
          guardrails: "",
          isActive: true,
        }),
      );
    } else {
      dispatch(
        addRepository({
          url: newRepoUrl,
          name: newRepoName,
          licenseType: "",
          customInstructions: "",
          guardrails: "",
          isActive: true,
        }),
      );
    }

    // Clear form after saving
    setActiveRepoId(null);
    setNewRepoName("");
    setNewRepoUrl("");
  };

  return (
    <ChatBotLayout>
      <div className="relative flex flex-1 w-full flex-col items-center justify-center h-full overflow-y-auto animate-in fade-in duration-300 w-full px-6">
        <div className="flex w-full flex-col max-w-2xl pb-20">
          <div className="flex flex-col items-center text-center mb-8">
            <h1
              className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80"
              style={{ fontFamily: "var(--font-secondary)" }}
            >
              {activeRepoId ? "Edit Repository" : "New Repository"}
            </h1>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {/* Box 1: Enter Repository Name */}
            <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3 flex items-center gap-3">
              <Code className="w-4 h-4 text-gray-400" />
              <input
                className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                placeholder="Enter repository name..."
                type="text"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
              />
            </div>

            {/* Box 2: Enter Repository Link */}
            <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3 flex items-center gap-3">
              <Link className="w-4 h-4 text-gray-400" />
              <input
                className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                placeholder="Enter repository link..."
                type="text"
                value={newRepoUrl}
                onChange={(e) => setNewRepoUrl(e.target.value)}
              />
            </div>

            {/* Save / Add Button */}
            <div className="mt-8 flex w-full gap-4">
              {activeRepoId ? (
                <>
                  <Button
                    className="flex-1 py-6 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-base transition-all duration-200"
                    onPress={() => {
                      setActiveRepoId(null);
                      setNewRepoName("");
                      setNewRepoUrl("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 py-6 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    isDisabled={!newRepoName.trim() || !newRepoUrl.trim()}
                    onPress={handleSaveRepository}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full py-6 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  isDisabled={!newRepoName.trim() || !newRepoUrl.trim()}
                  onPress={handleSaveRepository}
                >
                  Add Repository
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
