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
  Layers,
  Palette,
  Type,
  Shapes,
  Eye,
  Check,
  Zap,
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
  const [assetType, setAssetType] = useState("Logo");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));

    const handleOpenPanel = () => {
      setActiveAssetId(null);
      setNewAssetName("");
      setNewAssetUrl("");
      setAssetType("Logo");
    };

    const handleEditAsset = (e: any) => {
      const asset = e.detail;

      setActiveAssetId(asset.id);
      setNewAssetName(asset.name);
      setNewAssetUrl(asset.url);
      if (asset.assetType) {
        setAssetType(asset.assetType);
      }
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
          assetType: assetType,
          isActive: true,
        }),
      );
    } else {
      dispatch(
        addAsset({
          url: newAssetUrl,
          name: newAssetName,
          assetType: assetType,
          isActive: true,
        }),
      );
    }

    // Clear form after saving new or editing
    setActiveAssetId(null);
    setNewAssetName("");
    setNewAssetUrl("");
    setAssetType("Logo");
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-hidden bg-white dark:bg-[#0A0A0A] flex flex-col h-full font-sans w-full items-center">
        {/* Checkered Grid Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          .bg-checkered-grid {
            background-color: #fafafa;
            background-image: linear-gradient(45deg, #eaeaea 25%, transparent 25%), linear-gradient(-45deg, #eaeaea 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eaeaea 75%), linear-gradient(-45deg, transparent 75%, #eaeaea 75%);
            background-size: 16px 16px;
            background-position: 0 0, 0 8px, 8px -8px, 8px 0;
          }
          .dark .bg-checkered-grid {
            background-color: #121212;
            background-image: linear-gradient(45deg, #1d1d20 25%, transparent 25%), linear-gradient(-45deg, #1d1d20 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1d1d20 75%), linear-gradient(-45deg, transparent 75%, #1d1d20 75%);
          }
        `}} />

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

        {/* Main Content (Centered Form split layout) */}
        <div className="flex-1 overflow-y-auto w-full pt-8 pb-6 px-8 flex justify-center bg-gray-50/20 dark:bg-black/5">
          <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Left Column: Form Panel */}
            <div className="flex-1 w-full bg-white dark:bg-[#121212] border border-default-200 dark:border-default-100/50 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-bold text-default-900 tracking-tight">
                  {activeAssetId ? "Edit Asset Parameters" : "Register Brand Asset"}
                </h2>
                <p className="text-xs text-default-500 leading-normal">
                  Register vector graphs, typography guidelines, and Figma anchors to synchronize AI design agents.
                </p>
              </div>

              <hr className="border-default-100" />

              <div className="flex flex-col gap-4">
                {/* Asset Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-default-700 flex items-center gap-1.5">
                    Asset Name <span className="text-danger">*</span>
                  </label>
                  <Input
                    classNames={{
                      inputWrapper:
                        "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5] rounded-xl border border-transparent focus-within:border-primary/50 transition-all",
                    }}
                    placeholder="e.g. Primary Corporate Logo"
                    size="lg"
                    value={newAssetName}
                    variant="flat"
                    onChange={(e) => setNewAssetName(e.target.value)}
                  />
                </div>

                {/* Asset Type Select Pill Row */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-default-700">
                    Asset Classification Category
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { type: "Logo", label: "Logo", icon: ImageIcon, color: "text-amber-500 bg-amber-500/10" },
                      { type: "Vector", label: "Vector Graphics", icon: Shapes, color: "text-blue-500 bg-blue-500/10" },
                      { type: "Figma", label: "Figma Layer", icon: Layers, color: "text-purple-500 bg-purple-500/10" },
                      { type: "Palette", label: "Color Palette", icon: Palette, color: "text-emerald-500 bg-emerald-500/10" },
                      { type: "Typography", label: "Typography", icon: Type, color: "text-rose-500 bg-rose-500/10" },
                    ].map((item) => {
                      const isSelected = assetType === item.type;
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.type}
                          type="button"
                          className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 border text-xs font-medium transition-all active:scale-95 ${
                            isSelected
                              ? "bg-black dark:bg-white text-white dark:text-black border-transparent shadow-sm"
                              : "bg-default-50 border-default-200 dark:border-default-100 hover:bg-default-100 text-default-600 dark:text-default-400"
                          }`}
                          onClick={() => setAssetType(item.type)}
                        >
                          <span className={`p-1 rounded-lg ${isSelected ? "bg-white/20 dark:bg-black/10" : item.color}`}>
                            <IconComp size={14} />
                          </span>
                          {item.label}
                          {isSelected && <Check size={12} className="ml-1 text-white dark:text-black" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Asset File or URL */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-semibold text-default-700 flex items-center gap-1.5">
                    Asset File or URL Source <span className="text-danger">*</span>
                  </label>

                  <div
                    className="border-2 border-dashed border-default-300 dark:border-default-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 transition-colors cursor-pointer bg-[#f4f4f5]/50 dark:bg-[#27272a]/20 hover:bg-[#e4e4e7]/60 dark:hover:bg-[#27272a]/40"
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
                          if (!newAssetName) {
                            setNewAssetName(file.name.replace(/\.[^/.]+$/, ""));
                          }
                        }
                      }}
                    />
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                      <UploadCloud size={24} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-default-700">
                        Click to upload local file or drag here
                      </span>
                      <span className="text-xs text-default-400 max-w-xs mx-auto">
                        Supports images (.png, .svg), fonts, or zipped source matrices.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 my-1">
                    <div className="flex-1 h-px bg-default-100" />
                    <span className="text-[10px] uppercase text-default-400 font-bold tracking-widest select-none">
                      OR ATTACH CLOUD ENDPOINT
                    </span>
                    <div className="flex-1 h-px bg-default-100" />
                  </div>

                  <Input
                    classNames={{
                      inputWrapper:
                        "!bg-[#f4f4f5] dark:!bg-[#27272a] hover:!bg-[#e4e4e7] focus-within:!bg-[#f4f4f5] rounded-xl border border-transparent focus-within:border-primary/50 transition-all",
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

                {/* Submit Button */}
                <div className="pt-4 flex w-full">
                  <Button
                    className="w-full font-bold text-sm h-12 rounded-xl transition-all active:scale-95 hover:opacity-90"
                    color="primary"
                    isDisabled={!newAssetUrl || !newAssetName}
                    size="lg"
                    onPress={handleSaveAsset}
                  >
                    {activeAssetId ? "Save Asset Parameters" : "Ingest Corporate Asset"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Sandbox Preview Panel */}
            <div className="w-full md:w-[360px] bg-white dark:bg-[#121212] border border-default-200 dark:border-default-100/50 rounded-3xl p-6 flex flex-col gap-5 shadow-sm sticky top-4 shrink-0 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-default-400 flex items-center gap-1.5">
                  <Eye size={12} className="text-default-400" /> Asset Live Sandbox
                </span>
                {newAssetUrl && (
                  <span className="flex items-center gap-1 relative">
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping absolute" />
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wide pl-1.5">Live</span>
                  </span>
                )}
              </div>

              {newAssetUrl ? (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                  {/* Checkered Canvas Area */}
                  <div className="h-[180px] w-full rounded-2xl border border-default-200 dark:border-default-100/30 flex items-center justify-center relative overflow-hidden bg-checkered-grid">
                    {/* Rendering conditional representations */}
                    {newAssetUrl.includes("figma.com") ? (
                      <div className="flex flex-col items-center gap-2.5 z-10">
                        <div className="p-4 bg-gradient-to-tr from-purple-500 to-amber-500 rounded-full text-white shadow-md">
                          <Layers size={32} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-500">Figma Connector</span>
                      </div>
                    ) : assetType === "Palette" ? (
                      <div className="flex flex-col items-center gap-3 z-10 w-full px-8">
                        <div className="flex w-full h-8 rounded-lg overflow-hidden border border-default-200 shadow-sm">
                          <div className="flex-1 bg-[#4F46E5]" />
                          <div className="flex-1 bg-[#10B981]" />
                          <div className="flex-1 bg-[#F59E0B]" />
                          <div className="flex-1 bg-[#EF4444]" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Color Palette</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2.5 z-10">
                        <div className="p-4 bg-primary/10 rounded-full text-primary shadow-sm border border-primary/20 bg-white dark:bg-black">
                          {assetType === "Typography" ? <Type size={32} /> : <ImageIcon size={32} />}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Vector Asset Spec</span>
                      </div>
                    )}
                  </div>

                  {/* Specs Details Card */}
                  <div className="bg-[#f4f4f5]/60 dark:bg-[#27272a]/20 border border-default-100 rounded-2xl p-4 flex flex-col gap-2.5 text-xs text-default-600">
                    <div className="flex justify-between items-center border-b border-default-100/50 pb-2">
                      <span className="text-default-400 font-medium">Asset Name</span>
                      <span className="font-semibold text-default-800 truncate max-w-[160px]">{newAssetName || "Untitled"}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-default-100/50 pb-2">
                      <span className="text-default-400 font-medium">Type Anchor</span>
                      <span className="font-semibold text-default-800">{assetType}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-default-100/50 pb-2">
                      <span className="text-default-400 font-medium">Local Path / URI</span>
                      <span className="font-mono text-[10px] text-default-800 truncate max-w-[160px]">{newAssetUrl}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-default-400 font-medium">Agent Sync Status</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                        <Zap size={10} className="fill-emerald-500 animate-pulse" /> Verified Clear
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 min-h-[300px] border border-dashed border-default-200 dark:border-default-100/40 rounded-2xl bg-default-50/50 relative overflow-hidden">
                  {/* Floating Glow Orb */}
                  <div className="absolute size-24 rounded-full bg-gradient-to-tr from-primary to-indigo-500 blur-2xl opacity-15 animate-pulse" />
                  
                  <Shapes className="size-10 text-default-300 dark:text-default-700 mb-3.5 z-10 animate-bounce" />
                  <h4 className="text-xs font-semibold text-default-800 tracking-tight z-10">
                    Awaiting Asset Coordinates
                  </h4>
                  <p className="text-[10px] text-default-400 leading-relaxed mt-1 max-w-[180px] z-10">
                    Select a category and input an asset filename or Figma URL source to trigger live sandbox rendering.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
