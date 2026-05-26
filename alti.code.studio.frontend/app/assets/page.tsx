"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { Button, Input } from "@heroui/react";
import {
  Link as LinkIcon,
  UploadCloud,
} from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import { AppDispatch } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";
import { addAsset, updateAsset } from "@/store/systemSlice";

export default function Assets() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { data: session } = useSession();

  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);

  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetUrl, setNewAssetUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));

    const handleOpenPanel = () => {
      setActiveAssetId(null);
      setNewAssetName("");
      setNewAssetUrl("");
    };

    const handleEditAsset = (e: any) => {
      const asset = e.detail;

      setActiveAssetId(asset.id);
      setNewAssetName(asset.name);
      setNewAssetUrl(asset.url);
    };

    window.addEventListener("open-asset-modal", handleOpenPanel);
    window.addEventListener("edit-asset", handleEditAsset);

    return () => {
      window.removeEventListener("open-asset-modal", handleOpenPanel);
      window.removeEventListener("edit-asset", handleEditAsset);
    };
  }, [dispatch]);

  const handleSaveAsset = () => {
    if (!newAssetUrl || !newAssetName) return;

    if (activeAssetId) {
      dispatch(
        updateAsset({
          id: activeAssetId,
          url: newAssetUrl,
          name: newAssetName,
          assetType: "auto",
          isActive: true,
        }),
      );
    } else {
      dispatch(
        addAsset({
          url: newAssetUrl,
          name: newAssetName,
          assetType: "auto",
          isActive: true,
        }),
      );
    }

    // Clear form after saving new or editing
    setActiveAssetId(null);
    setNewAssetName("");
    setNewAssetUrl("");
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-white dark:bg-[#0A0A0A] flex flex-col h-full font-sans w-full items-center">
        {/* Standardized Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center z-50 relative w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-[14px] font-semibold tracking-tight text-default-900 flex items-center gap-2">
                Company Assets
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content (Centered Form with premium styling, smooth transitions, and rounded elements) */}
        <div className="flex-1 overflow-y-auto w-full px-6 flex items-center justify-center bg-gray-50/20 dark:bg-black/5 py-12">
          <div className="w-full max-w-lg bg-white dark:bg-[#121212]/40 border border-default-200 dark:border-default-100/50 rounded-3xl p-8 shadow-sm flex flex-col gap-6 hover:shadow-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold text-default-900 tracking-tight">
                {activeAssetId ? "Edit Brand Asset" : "Register Brand Asset"}
              </h2>
              <p className="text-xs text-default-400 leading-normal">
                Register vector graphs, typography guidelines, and Figma anchors to synchronize AI design agents.
              </p>
            </div>

            <hr className="border-default-100" />

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-default-700">
                  Asset Name
                </label>
                <Input
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5] rounded-xl border border-transparent focus-within:border-primary/50 transition-all duration-200",
                  }}
                  placeholder="e.g. Primary Brand Logo"
                  size="lg"
                  value={newAssetName}
                  variant="flat"
                  onChange={(e) => setNewAssetName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-default-700">
                  Asset File or URL
                </label>

                <div
                  className="border-2 border-dashed border-default-300 dark:border-default-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 transition-all cursor-pointer bg-[#f4f4f5]/50 dark:bg-[#27272a]/20 hover:bg-[#e4e4e7]/60 dark:hover:bg-[#27272a]/40 group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (file) {
                        setNewAssetUrl(file.name);
                        // If user hasn't typed a name yet, auto-fill it with the filename without extension
                        if (!newAssetName) {
                          setNewAssetName(file.name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                  />
                  <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud size={22} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-default-700">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-default-400 max-w-[280px] mx-auto leading-normal">
                      Supports all file formats (Images, Vectors, Audio, 3D, etc.)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-px bg-default-100" />
                  <span className="text-[9px] uppercase text-default-400 font-bold tracking-widest select-none">
                    OR URL
                  </span>
                  <div className="flex-1 h-px bg-default-100" />
                </div>

                <Input
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5] rounded-xl border border-transparent focus-within:border-primary/50 transition-all duration-200",
                  }}
                  placeholder="https://figma.com/file/... or /path/to/asset"
                  size="lg"
                  startContent={
                    <LinkIcon className="text-default-400 mr-2" size={16} />
                  }
                  value={newAssetUrl}
                  variant="flat"
                  onChange={(e) => setNewAssetUrl(e.target.value)}
                />
              </div>

              <div className="pt-4 flex w-full">
                <Button
                  className="w-full font-bold text-sm h-12 rounded-xl transition-all active:scale-95 hover:opacity-90"
                  color="primary"
                  isDisabled={!newAssetUrl || !newAssetName}
                  size="lg"
                  onPress={handleSaveAsset}
                >
                  {activeAssetId ? "Save Changes" : "Add Asset"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
