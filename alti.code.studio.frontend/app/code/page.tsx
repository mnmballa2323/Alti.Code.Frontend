"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { toast } from "react-hot-toast";
import axios from "axios";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

import { API_URL } from "@/lib/config";
import ChatBotLayout from "@/components/ChatbotLayout";
import { EnterpriseConnectors } from "@/components/code/EnterpriseConnectors";

const FileTree: any = dynamic(
  () => import("@/components/code/FileTree").then((mod: any) => mod.FileTree),
  { ssr: false },
);
const MonacoEditor: any = dynamic(
  () =>
    import("@/components/code/MonacoEditor").then(
      (mod: any) => mod.MonacoEditor,
    ),
  { ssr: false },
);
const Terminal: any = dynamic(
  () => import("@/components/code/Terminal").then((mod: any) => mod.Terminal),
  { ssr: false },
);

export default function CodeStudioPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>(
    "// Select a file to edit",
  );
  const [language, setLanguage] = useState<string>("javascript");
  const [isSaving, setIsSaving] = useState(false);

  // Load file content when a file is selected
  const handleFileSelect = async (path: string) => {
    try {
      const res = await axios.post(
        `${API_URL}/code-editor/fs`,
        { action: "read_file", path: path },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );

      setCurrentFile(path);
      setFileContent(res.data.data);

      // Simple extension detection
      const ext = path.split(".").pop() || "txt";
      const langMap: Record<string, string> = {
        js: "javascript",
        ts: "typescript",
        py: "python",
        html: "html",
        css: "css",
        json: "json",
        md: "markdown",
      };

      setLanguage(langMap[ext] || "plaintext");
    } catch (error) {
      console.error("Failed to read file", error);
      toast.error("Failed to open file");
    }
  };

  const handleSave = async () => {
    if (!currentFile) return;
    setIsSaving(true);
    try {
      await axios.post(
        `${API_URL}/code-editor/fs`,
        { action: "write_file", path: currentFile, content: fileContent },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );
      toast.success("File saved!");
    } catch (error) {
      console.error("Failed to save file", error);
      toast.error("Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentFile, fileContent]);

  return (
    <ChatBotLayout>
      <div className="flex h-[calc(100vh-64px)] w-full bg-[#0d1117] text-gray-200 overflow-hidden">
        {/* Left Sidebar: File Explorer */}
        <div className="w-64 flex-shrink-0 bg-[#0d1117] border-r border-gray-800">
          <FileTree
            currentFile={currentFile || ""}
            onSelectFile={handleFileSelect}
          />
        </div>

        {/* Main Content: Editor & Terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor Tabs / Toolbar */}
          <div className="h-10 bg-[#161b22] border-b border-gray-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{currentFile || "No file selected"}</span>
              {currentFile && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-800">
                  {language}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                color="primary"
                isDisabled={!currentFile || isSaving}
                size="sm"
                variant={isSaving ? "flat" : "solid"}
                onClick={handleSave}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative h-[60%] border-b border-gray-800">
            {currentFile ? (
              <MonacoEditor
                language={language}
                value={fileContent}
                onChange={(val: any) => setFileContent(val || "")}
              />
            ) : (
              <div className="flex bg-[#0d1117] flex-col items-center justify-start h-full text-gray-500 overflow-y-auto w-full p-8">
                <div className="text-center mb-8 mt-4">
                  <h3 className="text-2xl font-semibold text-gray-200">
                    Inso Code Epic
                  </h3>
                  <p className="text-sm mt-2 max-w-lg mx-auto">
                    Select a file from the explorer to edit, or deploy an
                    autonomous enterprise integration specialist below.
                  </p>
                </div>
                <div className="w-full max-w-6xl">
                  <EnterpriseConnectors
                    onGenerate={async (prompt) => {
                      // In full production, this dispatches to the swarms GraphOrchestrator
                      toast.success("Swarm Nexus Prompt Synthesized");
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Terminal Area */}
          <div className="h-[40%]">
            <Terminal />
          </div>
        </div>
      </div>
    </ChatBotLayout>
  );
}
