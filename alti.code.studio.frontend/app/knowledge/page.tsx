"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@heroui/button";
import ChatBotLayout from "@/components/ChatbotLayout";
import { UploadCloud, Paperclip, Search, FileText, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

function KnowledgePageContent() {
  const searchParams = useSearchParams();
  const urlFolderId = searchParams.get("folderId");
  const urlFolderName = searchParams.get("folderName");

  const [selectedFolder, setSelectedFolder] = useState<{ id: string; name: string } | null>(null);
  const [files, setFiles] = useState<{name: string, size: number, type: string}[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileToDelete, setFileToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (urlFolderId && urlFolderName) {
      setSelectedFolder({ id: urlFolderId, name: urlFolderName });
    }
  }, [urlFolderId, urlFolderName]);

  useEffect(() => {
    const handleSelectFolder = (e: any) => {
      setSelectedFolder(e.detail);
    };
    window.addEventListener("select-knowledge-folder", handleSelectFolder);
    return () => window.removeEventListener("select-knowledge-folder", handleSelectFolder);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size, type: f.type }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 h-[calc(100vh-80px)] w-full">
        {!selectedFolder ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <Button
              className="bg-white text-black font-medium rounded-xl shadow-sm hover:bg-gray-100 px-8 py-6 h-auto text-sm"
              onPress={() => window.dispatchEvent(new CustomEvent("open-knowledge-modal"))}
            >
              Create Knowledge Folder
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-start pt-20 h-full animate-in fade-in zoom-in duration-300 w-full">
            <div className="flex w-full flex-col gap-4 max-w-3xl">
              
              {/* Thin Upload Box */}
              <label className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border border-gray-100 dark:border-gray-800">
                <div className="p-1.5 bg-gray-900 dark:bg-gray-100 rounded-lg">
                  <Paperclip className="w-3.5 h-3.5 text-white dark:text-gray-900" />
                </div>
                <span className="text-sm text-gray-400">Click or drag & drop files here...</span>
                <input type="file" className="hidden" multiple onChange={handleFileUpload} />
              </label>

              {/* Thin Search Bar */}
              <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3.5 flex items-center gap-3 border border-gray-100 dark:border-gray-800">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search files..."
                  className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* File List */}
              {filteredFiles.length > 0 && (
                <div className="w-full flex flex-col gap-2 mt-4">
                  {filteredFiles.map((file, i) => (
                    <div key={i} className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3 flex items-center justify-between border border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                        <button onClick={() => setFileToDelete(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {fileToDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#161b22] rounded-3xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
            <div className="p-6 pt-8 pb-6 flex flex-col items-center">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Delete</h3>
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Are you sure you want to remove this file?
              </p>
            </div>
            <div className="flex border-t border-gray-100 dark:border-gray-800 w-full">
              <button 
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-r border-gray-100 dark:border-gray-800"
              >
                Cancel
              </button>
              <button 
                onClick={() => { 
                  removeFile(fileToDelete); 
                  setFileToDelete(null); 
                }}
                className="flex-1 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </ChatBotLayout>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={<div className="h-full w-full bg-default-50 dark:bg-background" />}>
      <KnowledgePageContent />
    </Suspense>
  );
}
