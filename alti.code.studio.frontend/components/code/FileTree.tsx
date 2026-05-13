"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";

import { API_URL } from "@/lib/config";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  isOpen?: boolean;
}

interface FileTreeProps {
  onSelectFile: (path: string) => void;
  currentFile?: string;
}

export const FileTree: React.FC<FileTreeProps> = ({
  onSelectFile,
  currentFile,
}) => {
  const [structure, setStructure] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDir = async (path: string = ".") => {
    try {
      const res = await axios.post(`${API_URL}/code-editor/fs`, {
        action: "list_directory",
        path: path,
      });

      return res.data.data.map((name: string) => ({
        name,
        path: path === "." ? name : `${path}/${name}`,
        type: name.includes(".") ? "file" : "directory",
        children: [],
      }));
    } catch (error) {
      console.error("Failed to list directory", error);

      return [];
    }
  };

  const loadRoot = async () => {
    setLoading(true);
    const rootItems = await fetchDir(".");

    setStructure(rootItems);
    setLoading(false);
  };

  useEffect(() => {
    loadRoot();
  }, []);

  const toggleDir = async (node: FileNode) => {
    // If already loaded children, just toggle open state locally
    // But for deep nesting, we might need recursive update logic
    // For MVP, simplified:
    if (node.type === "file") {
      onSelectFile(node.path);

      return;
    }

    const newStructure = [...structure]; // Deep clone needed for deep updates
    const updateNode = async (nodes: FileNode[]): Promise<FileNode[]> => {
      return Promise.all(
        nodes.map(async (n): Promise<FileNode> => {
          if (n.path === node.path) {
            if (n.isOpen) {
              return { ...n, isOpen: false };
            } else {
              // Load children if empty
              const children =
                n.children && n.children.length > 0
                  ? n.children
                  : await fetchDir(n.path);

              return { ...n, isOpen: true, children: children as FileNode[] };
            }
          }
          if (n.children) {
            return { ...n, children: await updateNode(n.children) };
          }

          return n;
        }),
      );
    };

    setStructure(await updateNode(newStructure));
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path} style={{ paddingLeft: `${depth * 12}px` }}>
        <div
          className={`
                        flex items-center gap-2 py-1 px-2 cursor-pointer text-sm
                        hover:bg-gray-800 rounded-md transition-colors
                        ${currentFile === node.path ? "bg-blue-900/50 text-blue-300" : "text-gray-400"}
                    `}
          onClick={(e) => {
            e.stopPropagation();
            toggleDir(node);
          }}
        >
          <span className="opacity-70">
            {node.type === "directory" ? (node.isOpen ? "📂" : "📁") : "📄"}
          </span>
          <span className="truncate">{node.name}</span>
        </div>
        {node.isOpen && node.children && (
          <div className="border-l border-gray-800 ml-2">
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-r border-gray-800">
      <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-[#161b22]">
        <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">
          Explorer
        </h3>
        <Button isIconOnly size="sm" variant="light" onClick={loadRoot}>
          🔄
        </Button>
      </div>
      <ScrollShadow className="flex-1 p-2">
        {loading ? (
          <div className="flex justify-center p-4 text-gray-500 text-xs animate-pulse">
            Loading...
          </div>
        ) : (
          renderTree(structure)
        )}
      </ScrollShadow>
    </div>
  );
};
