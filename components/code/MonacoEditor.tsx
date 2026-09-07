"use client";

import type { OnMount } from "@monaco-editor/react";

import React, { useRef } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-grow flex items-center justify-center bg-zinc-950 text-default-400 font-mono text-xs">
      Orchestrating Editor...
    </div>
  ),
});

import * as monaco from "monaco-editor";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { toast } from "sonner";

import { API_URL, SOCKET_URL } from "@/lib/config";
interface MonacoEditorProps {
  value: string;
  language?: string;
  onChange: (value: string | undefined) => void;
  theme?: "vs-dark" | "light";
  documentId?: string; // Phase 2: CRDT Support
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language = "javascript",
  onChange,
  theme = "vs-dark",
  documentId = "workspace-123", // Default mock documentId for connection
}) => {
  const [isRefactoring, setIsRefactoring] = React.useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Phase 48: True CRDT Synchronization via Yjs
  const handleEditorDidMount: OnMount = (editor, _monaco) => {
    editorRef.current = editor;
    editor.focus();

    // 1. Initialize Yjs Document
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("monaco");

    // 2. Connect to the WebSocket Swarm Bridge
    const wsUrl = SOCKET_URL.replace(/^http/, "ws") + "/api/internal/crdt";
    const wsProvider = new WebsocketProvider(wsUrl, documentId, ydoc);

    wsProvider.on("status", (event: { status: string }) => {
      if (event.status === "connected") {
        toast.success("Ghost Typing Bridge: Connected");
      }
    });

    // 3. Bind Yjs to Monaco
    const binding = new MonacoBinding(
      ytext,
      editor.getModel()!,
      new Set([editor]),
      wsProvider.awareness,
    );

    // Initial value load if provided
    if (value && ytext.toString() === "") {
      ytext.insert(0, value);
    }
  };

  const handleRefactor = async () => {
    if (!value) return;
    setIsRefactoring(true);
    try {
      // TODO: Import axios and toast properly or pass as props if preferred.
      // For now assuming direct usage as this is a "smart" component in this context.
      const response = await fetch(`${API_URL}/refactor-agent/refactor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          code: value,
          instruction: "Refactor this code to be cleaner and more efficient.", // Default instruction
        }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (data.success && onChange) {
        onChange(data.data.refactored);
        // toast.success('Refactored successfully!');
      }
    } catch (error) {
      console.error("Refactor failed", error);
      // toast.error('Refactor failed');
    } finally {
      setIsRefactoring(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative group">
      <div className="absolute top-2 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded shadow-md flex items-center gap-2"
          disabled={isRefactoring}
          onClick={handleRefactor}
        >
          {isRefactoring ? "Refactoring..." : "✨ AI Refactor"}
        </button>
      </div>
      <Editor
        height="100%"
        language={language}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "Fira Code, monospace",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
        }}
        theme={theme}
        value={value}
        width="100%"
        onChange={onChange}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};
