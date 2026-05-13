"use client";

import React, { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import {
  Card,
  CardHeader,
  CardBody,
  Avatar,
  AvatarGroup,
  Chip,
} from "@heroui/react";

export default function LiveCollaborationEditor({
  documentId = "swarm-crdt-demo-1",
}: {
  documentId?: string;
}) {
  const editorRef = useRef<any>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);

  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;

    // 1. Initialize Yjs CRDT Document
    const ydoc = new Y.Doc();

    // 2. Connect to the Google Cloud backend CRDT Websocket
    // We use our own backend socket /api/v1/lsp/telepathy or a dedicated CRDT route
    const provider = new WebsocketProvider(
      "ws://localhost:8080/crdt",
      documentId,
      ydoc,
    );

    // 3. Bind Yjs to the Monaco Editor
    const type = ydoc.getText("monaco");
    const binding = new MonacoBinding(
      type,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness,
    );

    // 4. Awareness Protocol (Live Cursors)
    // Set the current human user's cursor
    provider.awareness.setLocalStateField("user", {
      name: "Human Architect",
      color: "#0066ff",
    });

    // Simulate Agent Collaborators joining the session dynamically
    setTimeout(() => {
      setCollaborators((prev) => [
        ...prev,
        { name: "Gemini Security Agent", color: "#ff0033" },
      ]);
    }, 2000);

    setTimeout(() => {
      setCollaborators((prev) => [
        ...prev,
        { name: "React UI Agent", color: "#00ff66" },
      ]);
    }, 5000);

    // Listen for remote awareness changes (Swarm Agents moving cursors)
    provider.awareness.on("change", () => {
      const states = Array.from(provider.awareness.getStates().values());
      // Filter to actual users/agents
      const activeUsers = states.filter((state) => state.user);
      // setCollaborators(activeUsers.map(s => s.user)); // In real implementation
    });

    return () => {
      binding.destroy();
      provider.disconnect();
      ydoc.destroy();
    };
  }

  return (
    <Card className="w-full h-[600px] bg-[#1e1e1e] border-zinc-800">
      <CardHeader className="flex justify-between items-center bg-[#2d2d2d] border-b border-zinc-800 px-4 py-3">
        <div className="flex gap-3 items-center">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-zinc-400 font-mono text-sm ml-2">
            architecture.service.ts
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Chip className="font-mono" color="warning" size="sm" variant="flat">
            YJS CRDT SYNC
          </Chip>
          <AvatarGroup isBordered max={4} size="sm">
            <Avatar
              className="border-[#0066ff]"
              src="https://avatars.githubusercontent.com/u/1?v=4"
            />
            {collaborators.map((collab, i) => (
              <Avatar
                key={i}
                className="bg-zinc-800 text-white font-mono text-xs"
                name={collab.name.substring(0, 2)}
                style={{ borderColor: collab.color }}
              />
            ))}
          </AvatarGroup>
        </div>
      </CardHeader>
      <CardBody className="p-0 overflow-hidden">
        <Editor
          defaultLanguage="typescript"
          height="100%"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
          }}
          theme="vs-dark"
          onMount={handleEditorDidMount}
        />
      </CardBody>
    </Card>
  );
}
