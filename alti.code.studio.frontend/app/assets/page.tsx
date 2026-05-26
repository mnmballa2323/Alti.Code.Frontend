"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { Button, Input } from "@heroui/react";
import {
  Link as LinkIcon,
  UploadCloud,
  FileText,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [hasImageLoaded, setHasImageLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Sync state to ref to avoid closure staleness in event listeners
  useEffect(() => {
    previewUrlRef.current = previewUrl;
  }, [previewUrl]);

  // Clean up object URLs to prevent memory leaks
  const cleanupPreviewUrl = (url: string | null) => {
    if (url && url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to revoke object URL:", err);
      }
    }
  };

  // Safe cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));

    const handleOpenPanel = () => {
      setActiveAssetId(null);
      setNewAssetName("");
      setNewAssetUrl("");
      
      // Clean up local blob references
      if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewUrlRef.current);
        } catch (err) {
          console.error("Failed to revoke object URL:", err);
        }
      }
      setPreviewUrl(null);
      setPreviewError(false);
      setHasImageLoaded(false);
    };

    const handleEditAsset = (e: any) => {
      const asset = e.detail;

      setActiveAssetId(asset.id);
      setNewAssetName(asset.name);
      setNewAssetUrl(asset.url);

      // Clean up previous blob and set new preview URL
      if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewUrlRef.current);
        } catch (err) {
          console.error("Failed to revoke object URL:", err);
        }
      }
      setPreviewUrl(asset.url);
      setPreviewError(false);
      setHasImageLoaded(false);
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

    // Clear form and clean up local previews after saving new or editing
    setActiveAssetId(null);
    setNewAssetName("");
    setNewAssetUrl("");
    cleanupPreviewUrl(previewUrl);
    setPreviewUrl(null);
    setPreviewError(false);
    setHasImageLoaded(false);
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
        <div className="flex-1 overflow-y-auto w-full px-6 flex items-center justify-center py-6">
          <div className="w-full max-w-lg flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Dynamic Live Preview Section (Mounted at the top for layout fitting) */}
            <AnimatePresence>
              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-full flex flex-col gap-1.5"
                >
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                        .bg-checkered-grid {
                          background-color: #ffffff;
                          background-image: 
                            linear-gradient(45deg, #f4f4f5 25%, transparent 25%), 
                            linear-gradient(-45deg, #f4f4f5 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #f4f4f5 75%), 
                            linear-gradient(-45deg, transparent 75%, #f4f4f5 75%);
                          background-size: 16px 16px;
                          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
                        }
                        .dark .bg-checkered-grid {
                          background-color: #0c0c0e;
                          background-image: 
                            linear-gradient(45deg, #18181b 25%, transparent 25%), 
                            linear-gradient(-45deg, #18181b 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #18181b 75%), 
                            linear-gradient(-45deg, transparent 75%, #18181b 75%);
                          background-size: 16px 16px;
                          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
                        }
                      `,
                    }}
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-default-400 uppercase tracking-widest select-none">
                      Live Preview
                    </span>
                  </div>

                  <div className="w-full rounded-2xl border border-default-200 dark:border-default-100 overflow-hidden bg-default-50/50 dark:bg-default-50/5 transition-all duration-300">
                    {previewUrl.includes("figma.com") ? (
                      /* Figma Design Anchor Card */
                      <div className="p-4 flex flex-col gap-2.5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 min-h-[105px] justify-between relative group">
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-black dark:bg-[#1E1E1E] rounded-lg flex items-center justify-center shadow-md">
                              <svg width="10" height="15" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.5 13C4.5 10.5147 6.51472 8.5 9 8.5C11.4853 8.5 13.5 10.5147 13.5 13C13.5 15.4853 11.4853 17.5 9 17.5C6.51472 17.5 4.5 15.4853 4.5 13Z" fill="#1ABC9C"/>
                                <path d="M0 4.5C0 2.01472 2.01472 0 4.5 0C6.98528 0 9 2.01472 9 4.5C9 5.82054 8.4287 7.00767 7.51356 7.82869L7.5 7.83868C6.67131 8.5997 5.56826 9 4.5 9C2.01472 9 0 6.98528 0 4.5Z" fill="#F24E1E"/>
                                <path d="M9 4.5C9 2.01472 11.0147 0 13.5 0C15.9853 0 18 2.01472 18 4.5C18 6.98528 15.9853 9 13.5 9C11.0147 9 9 6.98528 9 4.5Z" fill="#FF7262"/>
                                <path d="M0 13C0 10.5147 2.01472 8.5 4.5 8.5C5.56826 8.5 6.67131 8.9003 7.5 9.66132L7.51356 9.67131C8.4287 10.4923 9 11.6795 9 13C9 15.4853 6.98528 17.5 4.5 17.5C2.01472 17.5 0 15.4853 0 13Z" fill="#A259FF"/>
                                <path d="M0 21.5C0 19.0147 2.01472 17 4.5 17C6.98528 17 9 19.0147 9 21.5C9 23.9853 6.98528 26 4.5 26C2.01472 26 0 23.9853 0 21.5Z" fill="#1ABC9C"/>
                              </svg>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-default-800 leading-tight">Figma Canvas Anchor</span>
                              <span className="text-[8px] text-default-400 leading-none">Connected Anchor Node</span>
                            </div>
                          </div>
                          <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[8px] font-bold tracking-wider uppercase rounded-full border border-indigo-500/20 shadow-sm">
                            Live
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 border border-dashed border-default-200 dark:border-default-100 rounded-lg px-2 py-1 bg-white/40 dark:bg-black/20 backdrop-blur-sm shadow-sm select-none">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                          <span className="text-[9px] font-mono text-default-600 truncate max-w-[280px]">
                            {newAssetName || "Untitled Brand Design"}
                          </span>
                          <span className="ml-auto text-[8px] text-default-400 bg-default-100 dark:bg-default-200/50 px-1 rounded">Figma</span>
                        </div>

                        <div className="flex items-center justify-between pt-0.5">
                          <span className="text-[8px] text-default-400 max-w-[240px] truncate font-mono">
                            {previewUrl}
                          </span>
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[8px] font-bold text-primary hover:underline transition-all"
                          >
                            Open Figma <ExternalLink size={8} />
                          </a>
                        </div>
                      </div>
                    ) : !previewError ? (
                      /* Image Preview Card (SVG/PNG/JPG) */
                      <div className="bg-checkered-grid p-4 min-h-[110px] flex items-center justify-center relative group">
                        <img
                          src={previewUrl}
                          alt={newAssetName || "Brand Asset Live Preview"}
                          className={`max-h-[85px] max-w-[90%] object-contain drop-shadow-md select-none transition-all duration-300 ${
                            hasImageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                          }`}
                          onLoad={() => setHasImageLoaded(true)}
                          onError={() => setPreviewError(true)}
                        />

                        {!hasImageLoaded && (
                          <div className="absolute inset-0 flex items-center justify-center bg-default-100/50 dark:bg-default-900/50 backdrop-blur-sm">
                            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                          </div>
                        )}

                        {hasImageLoaded && (
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/75 backdrop-blur-md text-white text-[8px] font-bold tracking-widest uppercase rounded border border-white/10 shadow-lg pointer-events-none select-none">
                            {previewUrl.startsWith("blob:")
                              ? "Local File"
                              : previewUrl.substring(previewUrl.lastIndexOf(".") + 1).toUpperCase().substring(0, 4) || "IMAGE"}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Document/Generic Reference Fallback */
                      <div className="p-3 flex items-center gap-3 bg-default-100/50 dark:bg-default-500/5 min-h-[56px]">
                        <div className="p-2 bg-default-200 dark:bg-default-100 rounded-lg text-default-500 flex items-center justify-center shadow-sm">
                          <FileText size={16} />
                        </div>
                        <div className="flex-1 flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-default-800 truncate">
                            {newAssetName || "Brand Asset File"}
                          </span>
                          <span className="text-[9px] text-default-400 truncate font-mono leading-none">
                            {previewUrl.startsWith("blob:") ? "Local File Path" : previewUrl}
                          </span>
                        </div>
                        <span className="px-1.5 py-0.5 bg-default-200 dark:bg-default-100 text-default-500 text-[8px] font-bold uppercase tracking-wider rounded border border-default-300/30">
                          Document
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                        cleanupPreviewUrl(previewUrl);
                        setNewAssetUrl(file.name);
                        
                        const localPreview = URL.createObjectURL(file);
                        setPreviewUrl(localPreview);
                        setPreviewError(false);
                        setHasImageLoaded(false);

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
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewAssetUrl(val);
                    
                    cleanupPreviewUrl(previewUrl);
                    setPreviewUrl(val);
                    setPreviewError(false);
                    setHasImageLoaded(false);
                  }}
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
    </ChatBotLayout>
  );
}
