"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@heroui/react";
import { Code, Link } from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import { AppDispatch } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";
import { addApi, updateApi } from "@/store/systemSlice";

export default function DeveloperApiPage() {
  const dispatch = useDispatch<AppDispatch>();

  const [activeApiId, setActiveApiId] = useState<string | null>(null);
  const [newApiName, setNewApiName] = useState("");
  const [newApiUrl, setNewApiUrl] = useState("");

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));

    const handleOpenPanel = () => {
      setActiveApiId(null);
      setNewApiName("");
      setNewApiUrl("");
    };

    const handleEditApi = (e: any) => {
      const api = e.detail;

      setActiveApiId(api.id);
      setNewApiName(api.name);
      setNewApiUrl(api.url);
    };

    window.addEventListener("open-api-modal", handleOpenPanel);
    window.addEventListener("edit-api", handleEditApi);

    return () => {
      window.removeEventListener("open-api-modal", handleOpenPanel);
      window.removeEventListener("edit-api", handleEditApi);
    };
  }, [dispatch]);

  const handleSaveApi = () => {
    if (!newApiUrl || !newApiName) return;

    if (activeApiId) {
      dispatch(
        updateApi({
          id: activeApiId,
          url: newApiUrl,
          name: newApiName,
          licenseType: "",
          customInstructions: "",
          guardrails: "",
          isActive: true,
        }),
      );
    } else {
      dispatch(
        addApi({
          url: newApiUrl,
          name: newApiName,
          licenseType: "",
          customInstructions: "",
          guardrails: "",
          isActive: true,
        }),
      );
    }

    // Clear form after saving
    setActiveApiId(null);
    setNewApiName("");
    setNewApiUrl("");
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
              {activeApiId ? "Edit API" : "New API"}
            </h1>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {/* Box 1: Enter API Name */}
            <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3 flex items-center gap-3">
              <Code className="w-4 h-4 text-gray-400" />
              <input
                className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                placeholder="Enter API name..."
                type="text"
                value={newApiName}
                onChange={(e) => setNewApiName(e.target.value)}
              />
            </div>

            {/* Box 2: Enter API Link */}
            <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3 flex items-center gap-3">
              <Link className="w-4 h-4 text-gray-400" />
              <input
                className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                placeholder="Enter API link..."
                type="text"
                value={newApiUrl}
                onChange={(e) => setNewApiUrl(e.target.value)}
              />
            </div>

            {/* Save / Add Button */}
            <div className="mt-8 flex w-full gap-4">
              {activeApiId ? (
                <>
                  <Button
                    className="flex-1 py-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161b22] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-base transition-all duration-200"
                    onPress={() => {
                      setActiveApiId(null);
                      setNewApiName("");
                      setNewApiUrl("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 py-6 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    isDisabled={!newApiName.trim() || !newApiUrl.trim()}
                    onPress={handleSaveApi}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full py-6 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  isDisabled={!newApiName.trim() || !newApiUrl.trim()}
                  onPress={handleSaveApi}
                >
                  Add API
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
