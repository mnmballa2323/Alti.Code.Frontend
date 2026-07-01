"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@heroui/react";
import {
  FileText,
  Trash2,
  Loader2,
  Upload,
  ArrowUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";

import { TuningTabs } from "@/components/tuning-tabs";
import ChatBotLayout from "@/components/ChatbotLayout";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
}

export default function KnowledgePage() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all files (flat)
  const fetchFiles = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/knowledge/files`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setFiles(res.data.data || []);
        // Sync sidebar
        window.dispatchEvent(
          new CustomEvent("refresh-knowledge-files", {
            detail: res.data.data || [],
          }),
        );
      }
    } catch {
      // Silent fail on initial load
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Upload file(s)
  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !token) return;

    setIsUploading(true);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append("file", file);

      const toastId = toast.loading(`Uploading "${file.name}"...`);

      try {
        await axios.post(
          `${API_BASE_URL}/knowledge/files/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        toast.success(`"${file.name}" uploaded and indexed.`, { id: toastId });
      } catch {
        toast.error(`Failed to upload "${file.name}".`, { id: toastId });
      }
    }

    setIsUploading(false);
    fetchFiles();
  };

  // Delete file
  const handleDeleteFile = async () => {
    if (!fileToDelete || !token) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/knowledge/files/${fileToDelete.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("File deleted.");
      fetchFiles();
    } catch {
      toast.error("Failed to delete file.");
    } finally {
      setFileToDelete(null);
    }
  };

  // Drag handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <ChatBotLayout>
      <div className="flex flex-col h-full bg-default-100 dark:bg-default-50">
        <div className="flex-1 overflow-y-auto p-8 font-sans scrollbar-hide flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl flex flex-col items-center gap-4 mb-8">
            <TuningTabs />
          </div>
          <div className="w-full max-w-2xl mb-14">
            {/* Upload zone — styled like the input bar on other tabs */}
            <div
              className={`relative flex items-center w-full rounded-2xl border transition-all cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-default-200 dark:border-default-100 bg-white dark:bg-[#111111] shadow-sm"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex items-center gap-3 px-4 py-4 w-full h-14">
                <span className="text-sm text-default-400 select-none">
                  {isUploading
                    ? "Uploading..."
                    : isDragging
                      ? "Drop files here..."
                      : "Click to select files or drag & drop here..."}
                </span>
              </div>
              <Button
                isIconOnly
                className="absolute right-2 rounded-xl h-10 w-10 bg-primary text-primary-foreground"
                isLoading={isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <ArrowUp className="size-5" />
              </Button>
              <input
                ref={fileInputRef}
                multiple
                accept=".txt,.md,.json,.js,.ts,.html,.css,.csv,.yaml,.yml,.pdf,.py,.go,.rs,.java,.xml,.toml"
                className="hidden"
                type="file"
                onChange={(e) => handleUpload(e.target.files)}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="w-full flex flex-col gap-2 mt-6">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3 flex items-center justify-between border border-default-200/50 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-2"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => setFileToDelete(file)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {fileToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#161b22] rounded-3xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
              <div className="p-6 pt-8 pb-6 flex flex-col items-center">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Delete File
                </h3>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 px-4">
                  Are you sure you want to remove &quot;{fileToDelete.name}&quot;?
                </p>
              </div>
              <div className="flex border-t border-default-200/50 dark:border-gray-800 w-full">
                <button
                  className="flex-1 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-r border-default-200/50 dark:border-gray-800"
                  onClick={() => setFileToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-3.5 text-sm font-medium text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={handleDeleteFile}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ChatBotLayout>
  );
}
