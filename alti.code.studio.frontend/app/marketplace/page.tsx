"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useSession } from "next-auth/react";

import { API_URL } from "@/lib/config";
import ChatBotLayout from "@/components/ChatbotLayout";
import { AgentCard } from "@/components/marketplace/AgentCard";

interface AgentCatalogEntry {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  price: string;
  version: string;
  downloads: number;
  installed: boolean;
}

const CATEGORIES = [
  "all",
  "data",
  "systems",
  "security",
  "mobile",
  "infrastructure",
  "backend",
  "frontend",
];

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md border ${
        type === "success"
          ? "bg-success/20 border-success/30 text-success"
          : "bg-danger/20 border-danger/30 text-danger"
      }`}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
    >
      <Icon
        className="text-xl"
        icon={
          type === "success"
            ? "solar:check-circle-bold"
            : "solar:danger-circle-bold"
        }
      />
      <span className="font-semibold text-sm">{message}</span>
    </motion.div>
  );
}

export default function MarketplacePage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const [agents, setAgents] = useState<AgentCatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};

      if (search) params.search = search;
      if (activeCategory !== "all") params.category = activeCategory;

      const res = await axios.get(`${API_URL}/marketplace/agents`, {
        params,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (res.data.success) setAgents(res.data.data);
    } catch {
      showToast(
        "Failed to load agent catalog. Is the backend running?",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [search, activeCategory]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchAgents(), 300); // debounce search

    return () => clearTimeout(timeout);
  }, [fetchAgents]);

  const handleInstall = async (agentId: string) => {
    setInstallingId(agentId);
    try {
      const res = await axios.post(
        `${API_URL}/marketplace/install`,
        { agentId },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );

      if (res.data.success) {
        setAgents((prev) =>
          prev.map((a) => (a.id === agentId ? { ...a, installed: true } : a)),
        );
        showToast(res.data.message, "success");
      } else {
        showToast(res.data.message || "Installation failed.", "error");
      }
    } catch (err: any) {
      showToast(
        err?.response?.data?.message || "Installation failed.",
        "error",
      );
    } finally {
      setInstallingId(null);
    }
  };

  const handleUninstall = async (agentId: string) => {
    setInstallingId(agentId);
    try {
      const res = await axios.delete(
        `${API_URL}/marketplace/uninstall/${agentId}`,
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );

      if (res.data.success) {
        setAgents((prev) =>
          prev.map((a) => (a.id === agentId ? { ...a, installed: false } : a)),
        );
        showToast(res.data.message, "success");
      } else {
        showToast(res.data.message || "Uninstall failed.", "error");
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Uninstall failed.", "error");
    } finally {
      setInstallingId(null);
    }
  };

  const installedCount = agents.filter((a) => a.installed).length;

  return (
    <ChatBotLayout>
      <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-80px)] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 drop-shadow-sm">
              Agent Store
            </h1>
            <p className="text-default-500 mt-2 text-lg">
              Discover, install, and manage specialist agents for your swarm
            </p>
            {installedCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Chip
                  classNames={{
                    base: "bg-success/15 border-success/30",
                    content: "text-success font-semibold text-xs",
                  }}
                  size="sm"
                  startContent={<Icon icon="solar:check-circle-bold" />}
                  variant="flat"
                >
                  {installedCount} installed
                </Chip>
              </div>
            )}
          </div>

          <div className="w-full md:w-72">
            <Input
              isClearable
              classNames={{
                input: "text-white",
                inputWrapper:
                  "bg-white/5 border border-white/10 hover:border-white/20 focus-within:border-violet-500/60 backdrop-blur-md",
              }}
              id="marketplace-search"
              placeholder="Search agents…"
              startContent={
                <Icon
                  className="text-default-400"
                  icon="solar:magnifer-linear"
                />
              }
              value={search}
              onClear={() => setSearch("")}
              onValueChange={setSearch}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              className={
                activeCategory === cat
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold capitalize"
                  : "bg-white/5 border border-white/10 text-default-400 hover:text-white hover:bg-white/10 capitalize"
              }
              size="sm"
              variant={activeCategory === cat ? "shadow" : "flat"}
              onPress={() => setActiveCategory(cat)}
            >
              {cat === "all" ? "🌐 All" : cat}
            </Button>
          ))}
        </div>

        {/* Agent Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Spinner color="secondary" size="lg" />
            <p className="text-default-400 text-sm">Loading agent catalog…</p>
          </div>
        ) : agents.length === 0 ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 gap-4 text-default-400"
            initial={{ opacity: 0 }}
          >
            <Icon className="text-5xl" icon="solar:ghost-bold" />
            <p className="font-semibold text-lg">No agents found</p>
            <p className="text-sm opacity-70">
              Try a different search or category
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                installing={installingId === agent.id}
                onInstall={handleInstall}
                onUninstall={handleUninstall}
              />
            ))}
          </motion.div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-default-500 mt-10 pb-4">
          <Icon className="inline mr-1" icon="solar:info-circle-linear" />
          Newly installed agents activate on the next server reload ·
          Alti.Code.Studio v3.1.0
        </p>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </ChatBotLayout>
  );
}
