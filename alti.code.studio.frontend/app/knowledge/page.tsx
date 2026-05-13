"use client";

import React, { useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Chip } from "@heroui/chip";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

import { API_URL } from "@/lib/config";
import ChatBotLayout from "@/components/ChatbotLayout";

export default function CortexPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [query, setQuery] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleQuery = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResults([]);

    try {
      const res = await axios.post(
        `${API_URL}/mcp/execute/local`,
        { toolName: "query_knowledge", args: { query } },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );

      if (res.data.success) {
        const content = res.data.data.content;
        const text = content[0]?.text;

        try {
          const parsed = JSON.parse(text);

          if (Array.isArray(parsed)) {
            setResults(parsed);
          } else {
            setResults([{ content: text, score: 1 }]);
          }
        } catch (e) {
          setResults([{ content: text, score: 1 }]);
        }
      }
    } catch (error) {
      console.error("Query failed", error);
      toast.error("Failed to query Cortex");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndex = async () => {
    if (!repoPath.trim()) return;
    const toastId = toast.loading("Indexing Repository...");

    try {
      const res = await axios.post(
        `${API_URL}/mcp/execute/local`,
        { toolName: "index_repo", args: { path: repoPath } },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );

      if (res.data.success) {
        toast.success("Indexing Complete!", { id: toastId });
      } else {
        toast.error("Indexing Failed", { id: toastId });
      }
    } catch (error) {
      console.error("Index failed", error);
      toast.error("Failed to trigger indexing", { id: toastId });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <ChatBotLayout>
      <motion.div
        animate="show"
        className="container mx-auto p-6 max-w-7xl h-[calc(100vh-80px)] flex flex-col"
        initial="hidden"
        variants={container}
      >
        <div className="mb-8 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl border border-orange-500/20">
            <Icon
              className="text-4xl text-orange-500"
              icon="solar:brain-bold"
            />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600">
              Cortex Knowledge
            </h1>
            <p className="text-default-500 font-medium">
              Semantic Neural Search & Indexing Engine
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div className="md:col-span-1" variants={item}>
            <Card className="h-full bg-default-50/50 backdrop-blur-lg border border-default-200">
              <CardHeader className="flex gap-3">
                <Icon
                  className="text-xl text-default-500"
                  icon="solar:database-bold"
                />
                <span className="font-bold text-default-700">
                  Data Ingestion
                </span>
              </CardHeader>
              <CardBody className="gap-4">
                <Input
                  label="Repository Path"
                  placeholder="/path/to/repo"
                  size="sm"
                  startContent={
                    <Icon
                      className="text-default-400"
                      icon="solar:folder-linear"
                    />
                  }
                  value={repoPath}
                  variant="bordered"
                  onValueChange={setRepoPath}
                />
                <Button
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/20"
                  startContent={<Icon icon="solar:upload-track-linear" />}
                  onClick={handleIndex}
                >
                  Index Repository
                </Button>
              </CardBody>
            </Card>
          </motion.div>

          <motion.div className="md:col-span-2" variants={item}>
            <Card className="h-full bg-default-50/50 backdrop-blur-lg border border-default-200">
              <CardHeader className="flex gap-3">
                <Icon
                  className="text-xl text-primary"
                  icon="solar:magnifer-bold"
                />
                <span className="font-bold text-default-700">Neural Query</span>
              </CardHeader>
              <CardBody className="gap-2 justify-center">
                <div className="flex gap-3">
                  <Input
                    className="flex-1"
                    placeholder="Ask about your codebase..."
                    size="lg"
                    startContent={
                      <Icon
                        className="text-primary"
                        icon="solar:magic-stick-3-linear"
                      />
                    }
                    value={query}
                    variant="bordered"
                    onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                    onValueChange={setQuery}
                  />
                  <Button
                    className="px-8 font-semibold shadow-lg shadow-primary/20"
                    color="primary"
                    isLoading={isLoading}
                    size="lg"
                    startContent={
                      !isLoading && <Icon icon="solar:arrow-right-linear" />
                    }
                    onClick={handleQuery}
                  >
                    Ask Cortex
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        <motion.div
          className="flex-1 min-h-0 bg-default-50/30 rounded-2xl border border-default-200 backdrop-blur-sm overflow-hidden flex flex-col shadow-inner"
          variants={item}
        >
          <div className="p-4 border-b border-default-200 flex justify-between items-center bg-default-100/50">
            <span className="font-mono text-xs text-default-500 uppercase tracking-widest font-bold flex items-center gap-2">
              <Icon icon="solar:list-bold" />
              Query Results
            </span>
            {results.length > 0 && (
              <Chip color="primary" size="sm" variant="flat">
                {results.length} Matches
              </Chip>
            )}
          </div>
          <ScrollShadow className="flex-1 p-6 space-y-4">
            {results.length > 0 ? (
              results.map((result, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-3 p-5 rounded-xl bg-white/60 dark:bg-black/20 border border-default-200 hover:border-primary/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Chip
                        className="font-mono"
                        color="primary"
                        size="sm"
                        variant="shadow"
                      >
                        #{i + 1}
                      </Chip>
                      <span className="text-xs font-mono text-default-400 capitalize">
                        {result.type || "Snippet"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-default-400">
                      <Icon icon="solar:graph-up-linear" />
                      Score: {result.score?.toFixed(4)}
                    </div>
                  </div>
                  <p className="text-default-700 dark:text-default-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {result.content}
                  </p>
                  {result.metadata && (
                    <div className="flex items-center gap-2 text-xs text-primary mt-2 bg-primary/5 w-fit px-2 py-1 rounded-md">
                      <Icon icon="solar:file-text-linear" />
                      Source: {result.metadata.source || "Unknown"}
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-default-300">
                <Icon
                  className="text-6xl mb-4 opacity-50"
                  icon="solar:minimalistic-magnifer-linear"
                />
                <p className="text-lg font-medium">Cortex is ready</p>
                <p className="text-sm">
                  Enter a query above to search the neural index
                </p>
              </div>
            )}
          </ScrollShadow>
        </motion.div>
      </motion.div>
    </ChatBotLayout>
  );
}
