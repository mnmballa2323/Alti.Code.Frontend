"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@heroui/react";
import { Code, Link } from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import { AppDispatch } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";
import { addSdk, updateSdk } from "@/store/systemSlice";

export default function SdkPage() {
  const dispatch = useDispatch<AppDispatch>();

  const [activeSdkId, setActiveSdkId] = useState<string | null>(null);
  const [newSdkName, setNewSdkName] = useState("");
  const [newSdkUrl, setNewSdkUrl] = useState("");

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));

    const handleOpenPanel = () => {
      setActiveSdkId(null);
      setNewSdkName("");
      setNewSdkUrl("");
    };

    const handleEditSdk = (e: any) => {
      const sdk = e.detail;

      setActiveSdkId(sdk.id);
      setNewSdkName(sdk.name);
      setNewSdkUrl(sdk.url);
    };

    window.addEventListener("open-sdk-modal", handleOpenPanel);
    window.addEventListener("edit-sdk", handleEditSdk);

    return () => {
      window.removeEventListener("open-sdk-modal", handleOpenPanel);
      window.removeEventListener("edit-sdk", handleEditSdk);
    };
  }, [dispatch]);

  const handleSaveSdk = () => {
    if (!newSdkUrl || !newSdkName) return;

    if (activeSdkId) {
      dispatch(
        updateSdk({
          id: activeSdkId,
          url: newSdkUrl,
          name: newSdkName,
          licenseType: "",
          customInstructions: "",
          guardrails: "",
          isActive: true,
        }),
      );
    } else {
      dispatch(
        addSdk({
          url: newSdkUrl,
          name: newSdkName,
          licenseType: "",
          customInstructions: "",
          guardrails: "",
          isActive: true,
        }),
      );
    }

    // Clear form after saving
    setActiveSdkId(null);
    setNewSdkName("");
    setNewSdkUrl("");
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
              {activeSdkId ? "Edit SDK" : "New SDK"}
            </h1>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {/* Box 1: Enter SDK Name */}
            <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3 flex items-center gap-3">
              <Code className="w-4 h-4 text-gray-400" />
              <input
                className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                placeholder="Enter SDK name..."
                type="text"
                value={newSdkName}
                onChange={(e) => setNewSdkName(e.target.value)}
              />
            </div>

            {/* Box 2: Enter SDK Link */}
            <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3 flex items-center gap-3">
              <Link className="w-4 h-4 text-gray-400" />
              <input
                className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                placeholder="Enter SDK link..."
                type="text"
                value={newSdkUrl}
                onChange={(e) => setNewSdkUrl(e.target.value)}
              />
            </div>

            {/* Save / Add Button */}
            <div className="mt-8 flex w-full gap-4">
              {activeSdkId ? (
                <>
                  <Button
                    className="flex-1 py-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#161b22] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-base transition-all duration-200"
                    onPress={() => {
                      setActiveSdkId(null);
                      setNewSdkName("");
                      setNewSdkUrl("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 py-6 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                    isDisabled={!newSdkName.trim() || !newSdkUrl.trim()}
                    onPress={handleSaveSdk}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full py-6 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-90 text-base shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  isDisabled={!newSdkName.trim() || !newSdkUrl.trim()}
                  onPress={handleSaveSdk}
                >
                  Add SDK
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
