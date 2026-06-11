"use client";

import React, { useState, useRef } from "react";
import { Upload, Search, FileText, Trash2 } from "lucide-react";

interface KnowledgeFile {
  name: string;
  size: string;
  type: string;
}

const initialFiles: KnowledgeFile[] = [
  { name: "inso code black.png", size: "0.02 MB", type: "PNG" },
  { name: "inso code icon copy.png", size: "0.08 MB", type: "PNG" },
  { name: "Inso Code Icon.png", size: "0.33 MB", type: "PNG" },
  { name: "inso code black copy.png", size: "0.06 MB", type: "PNG" },
];

export default function KnowledgePage() {
  const [files, setFiles] = useState<KnowledgeFile[]>(initialFiles);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFilesArray: KnowledgeFile[] = Array.from(selectedFiles).map((file) => {
      const sizeMB = file.size / (1024 * 1024);
      return {
        name: file.name,
        size: `${sizeMB.toFixed(2)} MB`,
        type: file.name.split(".").pop()?.toUpperCase() || "FILE",
      };
    });

    setFiles((prev) => [...newFilesArray, ...prev]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = (name: string) => {
    setFileToDelete(name);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      setFiles((prev) => prev.filter((f) => f.name !== fileToDelete));
      setFileToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="w-full flex flex-col h-full justify-start pt-6">
      <div className="space-y-6">
        {/* Unified Clickable Upload Bar */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`w-full h-11 flex items-stretch bg-white dark:bg-[#161b22] rounded-xl border transition-all cursor-pointer overflow-hidden group ${
            isDragging
              ? "border-neutral-400 dark:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-800/20"
              : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          {/* Left side text/placeholder */}
          <div className="flex-1 px-4 text-sm text-neutral-400 dark:text-neutral-500 select-none truncate font-medium flex items-center">
            Attach files or drag and drop here...
          </div>
          
          {/* Right side upload button - directly adjacent with no gap */}
          <div className="px-5 bg-neutral-900 dark:bg-neutral-100 group-hover:bg-neutral-800 dark:group-hover:bg-white text-white dark:text-neutral-900 font-semibold text-sm flex items-center gap-2 transition-all shrink-0 select-none">
            <Upload className="w-4 h-4" />
            Upload
          </div>
        </div>

        {/* Search Row */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            className="w-full h-11 bg-white dark:bg-[#161b22] pl-11 pr-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-all"
            placeholder="Search knowledge"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* File Cards List */}
        <div className="flex flex-col gap-3 pt-2">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-4 bg-white dark:bg-[#161b22] border border-neutral-100 dark:border-neutral-800/80 rounded-2xl transition-all shadow-sm hover:shadow-md/5 duration-200"
              >
                <div className="flex items-center gap-4">
                  {/* File Icon Box */}
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <FileText className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-white text-sm">
                      {file.name}
                    </h3>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {file.size} - {file.type}
                    </p>
                  </div>
                </div>

                <button
                  className="p-2 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
                  onClick={() => handleDeleteClick(file.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl text-neutral-400">
              No files found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmOpen && fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-full max-w-[380px] bg-white dark:bg-[#161b22] border border-neutral-200/50 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h2 className="text-base font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                Remove Knowledge File
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 px-4 leading-normal">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 font-mono break-all">
                  {fileToDelete}
                </span>
                ?
              </p>
            </div>
            
            {/* Horizontal border line */}
            <div className="border-t border-neutral-100 dark:border-neutral-800" />
            
            {/* Footer Buttons Split by Vertical Line */}
            <div className="flex w-full">
              <button
                className="flex-1 py-3 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-[#1f242c] transition-colors focus:outline-none"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setFileToDelete(null);
                }}
              >
                Cancel
              </button>
              
              {/* Vertical divider line */}
              <div className="border-r border-neutral-100 dark:border-neutral-800" />
              
              <button
                className="flex-1 py-3 text-sm font-medium text-red-500 hover:bg-neutral-50 dark:hover:bg-[#1f242c] transition-colors focus:outline-none"
                onClick={confirmDelete}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
