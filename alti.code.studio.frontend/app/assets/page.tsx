"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { Button, Input } from "@heroui/react";
import {
  Image as ImageIcon,
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
                <ImageIcon size={16} /> Company Assets
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content (Centered Form) */}
        <div className="flex-1 overflow-y-auto w-full pt-4 pb-2 px-6 flex justify-center">
          <div className="w-full max-w-2xl flex flex-col">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-default-700">
                  Asset Name
                </label>
                <Input
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5]",
                  }}
                  placeholder="e.g. Primary Brand Logo"
                  size="lg"
                  value={newAssetName}
                  variant="flat"
                  onChange={(e) => setNewAssetName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-default-700">
                  Asset File or URL
                </label>

                <div
                  className="border-2 border-dashed border-default-300 dark:border-default-400/50 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2 transition-colors cursor-pointer bg-[#f4f4f5] dark:bg-[#27272a] hover:bg-[#e4e4e7] dark:hover:bg-[#3f3f46]"
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
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <UploadCloud size={20} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-default-700">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-default-400">
                      Supports all file formats (Images, Vectors, Audio, 3D,
                      etc.)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 my-1">
                  <div className="flex-1 h-px bg-default-200 dark:bg-[#27272a]" />
                  <span className="text-[10px] uppercase text-default-400 font-bold">
                    OR URL
                  </span>
                  <div className="flex-1 h-px bg-default-200 dark:bg-[#27272a]" />
                </div>

                <Input
                  classNames={{
                    inputWrapper:
                      "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5]",
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

              <div className="pt-2 flex w-full">
                <Button
                  className="w-full font-semibold"
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
