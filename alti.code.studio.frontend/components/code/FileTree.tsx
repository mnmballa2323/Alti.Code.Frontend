"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@heroui/button";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { 
  Folder, 
  FolderOpen, 
  FileCode2, 
  FileJson, 
  FileText, 
  Settings, 
  File, 
  ChevronDown, 
  ChevronRight, 
  RefreshCw 
} from "lucide-react";

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
    if (node.type === "file") {
      onSelectFile(node.path);

      return;
    }

    const newStructure = [...structure];
    const updateNode = async (nodes: FileNode[]): Promise<FileNode[]> => {
      return Promise.all(
        nodes.map(async (n): Promise<FileNode> => {
          if (n.path === node.path) {
            if (n.isOpen) {
              return { ...n, isOpen: false };
            } else {
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "tsx":
      case "ts":
      case "jsx":
      case "js":
        return <FileCode2 className="size-4 text-sky-400 shrink-0" />;
      case "json":
      case "lock":
        return <FileJson className="size-4 text-amber-400 shrink-0" />;
      case "py":
        return <FileCode2 className="size-4 text-emerald-400 shrink-0" />;
      case "md":
        return <FileText className="size-4 text-indigo-400 shrink-0" />;
      case "env":
      case "gitignore":
        return <Settings className="size-4 text-rose-400 shrink-0" />;
      default:
        return <File className="size-4 text-gray-400 shrink-0" />;
    }
  };

  const getFolderIcon = (isOpen: boolean) => {
    return isOpen ? (
      <FolderOpen className="size-4 text-yellow-500 dark:text-yellow-400 shrink-0" />
    ) : (
      <Folder className="size-4 text-yellow-500 dark:text-yellow-400 shrink-0" />
    );
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path} style={{ paddingLeft: `${depth * 12}px` }}>
        <div
          className={`
            flex items-center gap-2 py-1.5 px-2.5 cursor-pointer text-sm rounded-lg transition-all select-none mb-0.5
            ${currentFile === node.path 
              ? "bg-primary/10 text-primary-400 font-medium" 
              : "text-gray-400 hover:bg-default-100 hover:text-foreground"
            }
          `}
          onClick={(e) => {
            e.stopPropagation();
            toggleDir(node);
          }}
        >
          {node.type === "directory" ? (
            <span className="flex items-center gap-1.5 shrink-0">
              {node.isOpen ? (
                <ChevronDown className="size-3.5 text-default-400" />
              ) : (
                <ChevronRight className="size-3.5 text-default-400" />
              )}
              {getFolderIcon(!!node.isOpen)}
            </span>
          ) : (
            <span className="pl-5 shrink-0">
              {getFileIcon(node.name)}
            </span>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {node.isOpen && node.children && (
          <div className="border-l border-default-200/50 dark:border-gray-800/80 ml-4 pl-1">
            {renderTree(node.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-[#0d1117] border-r border-gray-800">
      <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-[#161b22] h-10 select-none">
        <h3 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">
          Explorer
        </h3>
        <Button 
          isIconOnly 
          size="sm" 
          variant="light" 
          onClick={loadRoot}
          className="hover:bg-default-100 text-default-400 hover:text-foreground rounded-lg"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
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
