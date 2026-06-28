"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { Button } from "@heroui/button";
import {
  Paperclip,
  Search,
  FileText,
  Trash2,
  FolderPlus,
  Folder,
  Loader2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
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

interface FolderItem {
  id: string;
  name: string;
  files: FileItem[];
  createdAt: string;
}

function KnowledgePageContent() {
  const searchParams = useSearchParams();
  const urlFolderId = searchParams.get("folderId");
  const urlFolderName = searchParams.get("folderName");
  const { data: session } = useSession();
  const token = session?.user?.accessToken ?? null;

  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderItem | null>(null);

  // 1. Fetch all folders and files from backend
  const fetchFolders = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/knowledge/folders`, {
        headers,
      });

      if (res.data?.success) {
        setFolders(res.data.data || []);
      }
    } catch (err: any) {
      toast.error("Failed to load knowledge folders.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Sync route query parameters to state
  useEffect(() => {
    if (urlFolderId && urlFolderName) {
      const existing = folders.find((f) => f.id === urlFolderId);

      if (existing) {
        setSelectedFolder(existing);
      } else {
        setSelectedFolder({
          id: urlFolderId,
          name: urlFolderName,
          files: [],
          createdAt: "",
        });
      }
    }
  }, [urlFolderId, urlFolderName, folders]);

  // Listen for sidebar trigger
  useEffect(() => {
    const handleSelectFolder = (e: any) => {
      setSelectedFolder(e.detail);
    };

    window.addEventListener("select-knowledge-folder", handleSelectFolder);

    return () =>
      window.removeEventListener("select-knowledge-folder", handleSelectFolder);
  }, []);

  // 2. Handle Folder Creation
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `${API_BASE_URL}/knowledge/folders`,
        { name: newFolderName },
        { headers },
      );

      if (res.data?.success) {
        toast.success("Folder created successfully.");
        setNewFolderName("");
        fetchFolders();
        window.dispatchEvent(new CustomEvent("refresh-sidebar-folders"));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create folder.");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // 3. Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFolder || !e.target.files || e.target.files.length === 0)
      return;

    const file = e.target.files[0];
    const formData = new FormData();

    formData.append("file", file);
    formData.append("folderId", selectedFolder.id);

    setIsUploading(true);
    const toastId = toast.loading(`Uploading and indexing "${file.name}"...`);

    try {
      const headers = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "multipart/form-data",
      };

      const res = await axios.post(
        `${API_BASE_URL}/knowledge/files/upload`,
        formData,
        { headers },
      );

      if (res.data?.success) {
        toast.success(
          `"${file.name}" successfully parsed and loaded to RAG memory.`,
          { id: toastId },
        );
        fetchFolders();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload file.", {
        id: toastId,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 4. Handle File Deletion
  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.delete(
        `${API_BASE_URL}/knowledge/files/${fileToDelete.id}`,
        { headers },
      );

      if (res.data?.success) {
        toast.success("File deleted successfully.");
        fetchFolders();
      }
    } catch (err: any) {
      toast.error("Failed to delete file.");
    } finally {
      setFileToDelete(null);
    }
  };

  // 5. Handle Folder Deletion
  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.delete(
        `${API_BASE_URL}/knowledge/folders/${folderToDelete.id}`,
        { headers },
      );

      if (res.data?.success) {
        toast.success("Folder deleted successfully.");
        setSelectedFolder(null);
        fetchFolders();
        window.dispatchEvent(new CustomEvent("refresh-sidebar-folders"));
      }
    } catch (err: any) {
      toast.error("Failed to delete folder.");
    } finally {
      setFolderToDelete(null);
    }
  };

  const activeFiles = selectedFolder
    ? folders.find((f) => f.id === selectedFolder.id)?.files || []
    : [];
  const filteredFiles = activeFiles.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ChatBotLayout>
      <div className="flex flex-col h-full bg-default-50 dark:bg-[#0A0A0A]">
        {/* Top Navbar */}
        <div className="flex items-center justify-center relative z-50 w-full h-14 px-8 border-b border-default-100 bg-white dark:bg-[#111111] shrink-0">
          <TuningTabs />
        </div>
        <div className="flex-1 overflow-hidden bg-transparent flex flex-col font-sans">
          {!selectedFolder ? (
            <div className="relative flex flex-1 w-full flex-col items-center justify-start pt-[20vh] overflow-hidden">
              <div className="flex w-full flex-col items-center gap-6 z-20 px-6 max-w-xl">
                <div className="flex flex-col items-center text-center z-30 mb-2">
                  <Folder className="w-12 h-12 text-primary/70 mb-4 animate-pulse" />
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-90">
                    Knowledge Hub
                  </h1>
                  <p className="text-xs text-default-400 mt-2">
                    Create secure directories to host private codebase document
                    files and semantic vector catalogs.
                  </p>
                </div>

                {/* Create Folder Form */}
                <form
                  className="w-full flex gap-2"
                  onSubmit={handleCreateFolder}
                >
                  <input
                    className="flex-1 bg-white dark:bg-[#161b22] border border-default-200/50 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm outline-none placeholder-gray-400"
                    placeholder="New folder name..."
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                  <Button
                    className="bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium text-xs px-4"
                    isLoading={isCreatingFolder}
                    type="submit"
                  >
                    <FolderPlus className="w-4 h-4 mr-1" /> Create
                  </Button>
                </form>

                {/* Folders List */}
                <div className="w-full flex flex-col gap-2 mt-4 max-h-[40vh] overflow-y-auto pr-1">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : folders.length === 0 ? (
                    <p className="text-center text-xs text-default-400 py-8">
                      No knowledge folders created yet.
                    </p>
                  ) : (
                    folders.map((folder) => (
                      <div
                        key={folder.id}
                        className="w-full bg-white dark:bg-[#161b22] hover:bg-default-100 dark:hover:bg-default-50 border border-default-200/50 dark:border-gray-800 shadow-sm rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer transition-all"
                        onClick={() => setSelectedFolder(folder)}
                      >
                        <div className="flex items-center gap-3">
                          <Folder className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            {folder.name}
                          </span>
                        </div>
                        <span className="text-xs text-default-400">
                          {folder.files?.length || 0} files
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-1 w-full flex-col items-center justify-start h-full overflow-y-auto animate-in fade-in duration-300 w-full px-6">
              <div className="flex w-full flex-col max-w-2xl pb-20">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-[#F4F4F6] dark:bg-background pt-8 pb-0 flex flex-col gap-4 -mx-6 px-6">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-xs text-default-400 hover:text-foreground transition-colors mr-2"
                        onClick={() => setSelectedFolder(null)}
                      >
                        &larr; Back
                      </button>
                      <Folder className="w-4 h-4 text-primary" />
                      <h2 className="text-base font-semibold text-foreground">
                        {selectedFolder.name}
                      </h2>
                    </div>
                    <button
                      className="text-xs text-red-500 hover:text-red-600 transition-colors"
                      onClick={() => setFolderToDelete(selectedFolder)}
                    >
                      Delete Folder
                    </button>
                  </div>

                  {/* Thin Upload Box */}
                  <label className="w-full bg-white dark:bg-[#161b22] shadow-sm border border-default-200/50 dark:border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                    <div className="p-1.5 bg-gray-900 dark:bg-gray-100 rounded-lg">
                      {isUploading ? (
                        <Loader2 className="w-3.5 h-3.5 text-white dark:text-gray-900 animate-spin" />
                      ) : (
                        <Paperclip className="w-3.5 h-3.5 text-white dark:text-gray-900" />
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {isUploading
                        ? "Uploading file..."
                        : "Click or drag & drop files here..."}
                    </span>
                    <input
                      className="hidden"
                      disabled={isUploading}
                      type="file"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {/* Thin Search Bar */}
                  <div className="w-full bg-white dark:bg-[#161b22] shadow-sm border border-default-200/50 dark:border-gray-800 rounded-xl px-4 py-3.5 flex items-center gap-3">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                      className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                      placeholder="Search files in folder..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="h-4 w-full bg-[#F4F4F6] dark:bg-background" />
                </div>

                {/* File List */}
                {filteredFiles.length > 0 ? (
                  <div className="w-full flex flex-col gap-2 mt-4">
                    {filteredFiles.map((file) => (
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
                ) : (
                  <p className="text-center text-xs text-default-400 py-8">
                    No files matching filter.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* File Delete Confirmation Modal */}
        {fileToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#161b22] rounded-3xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
              <div className="p-6 pt-8 pb-6 flex flex-col items-center">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Delete File
                </h3>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 px-4">
                  Are you sure you want to remove "{fileToDelete.name}"?
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

        {/* Folder Delete Confirmation Modal */}
        {folderToDelete !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#161b22] rounded-3xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
              <div className="p-6 pt-8 pb-6 flex flex-col items-center">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Folder
                </h3>
                <p className="text-sm text-center text-gray-500 dark:text-gray-400 px-4">
                  Are you sure you want to delete folder "{folderToDelete.name}
                  "? All nested files will be deleted.
                </p>
              </div>
              <div className="flex border-t border-default-200/50 dark:border-gray-800 w-full">
                <button
                  className="flex-1 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-r border-default-200/50 dark:border-gray-800"
                  onClick={() => setFolderToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-3.5 text-sm font-medium text-red-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={handleDeleteFolder}
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

export default function KnowledgePage() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full bg-[#F4F4F6] dark:bg-background" />
      }
    >
      <KnowledgePageContent />
    </Suspense>
  );
}
