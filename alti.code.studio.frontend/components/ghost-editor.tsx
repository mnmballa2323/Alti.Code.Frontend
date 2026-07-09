"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import { X, Code2, Copy, Check } from "lucide-react";
import { Button } from "@heroui/react";
import { loader } from "@monaco-editor/react";

import type { RootState } from "@/store";
import { closeGhostEditor } from "@/store/uiSlice";

// Configure Monaco to work inside Tauri's restricted webview.
// Disable web workers to avoid CSP/cross-origin blob: failures.
if (typeof window !== "undefined") {
  (window as any).MonacoEnvironment = {
    getWorker: () => undefined,
  };

  loader.config({
    paths: {
      vs: "/monaco/min/vs",
    },
  });
}

/**
 * Sovereign Monaco Controller.
 * Asynchronously orchestrated for zero-latency performance.
 */
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-white text-default-400 font-mono text-[10px] animate-pulse uppercase tracking-widest">
      Orchestrating Sovereign Sentinel...
    </div>
  ),
});

/**
 * Inso Ghost Editor — The Sovereign IDE Layer.
 * Renders as a centered card matching the prompt box's max-w-4xl width.
 */
export default function GhostEditor() {
  const dispatch = useDispatch();
  const { isGhostEditorOpen, editorContent, editorLanguage, editorTitle } =
    useSelector((state: RootState) => state.ui);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(editorContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex-1 flex flex-col bg-white dark:bg-black overflow-hidden">
        {/* Header — Matches prompt box aesthetic */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-default-100 bg-default-50/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 text-[11px] font-medium text-default-500">
            <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white dark:bg-default-100 text-default-700 shadow-sm border border-default-200">
              <Code2 className="size-3" />
              <span className="uppercase tracking-widest">
                {editorLanguage}
              </span>
            </div>
            <div className="h-4 w-px bg-default-200" />
            <span className="text-default-400 font-mono italic text-[10px]">
              {editorTitle}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              className="size-7 rounded-md text-default-400 hover:bg-default-100 hover:text-default-900"
              size="sm"
              variant="light"
              onClick={handleCopy}
            >
              {isCopied ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
            <Button
              isIconOnly
              className="size-7 rounded-md text-default-400 hover:bg-danger/10 hover:text-danger"
              size="sm"
              variant="light"
              onClick={() => dispatch(closeGhostEditor())}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Monaco Editor — Fills remaining space */}
        <div className="flex-1 w-full bg-white dark:bg-black overflow-hidden relative">
          <Editor
            defaultLanguage={editorLanguage}
            height="100%"
            language={editorLanguage}
            loading={
              <div className="flex-1 flex items-center justify-center bg-white text-default-400 font-mono text-[10px] animate-pulse uppercase tracking-widest pt-[100px]">
                Orchestrating Sovereign Sentinel...
              </div>
            }
            options={{
              minimap: { enabled: false },
              fontSize: 12.5,
              lineHeight: 1.6,
              lineNumbers: "on",
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 4,
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              cursorBlinking: "phase",
              cursorSmoothCaretAnimation: "on",
              renderLineHighlight: "all",
              scrollbar: {
                vertical: "hidden",
                horizontal: "hidden",
              },
            }}
            theme="light"
            value={editorContent}
            onMount={() =>
              console.info(
                "🚀 [Inso-Sentinel] Monaco Mission Control established.",
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
