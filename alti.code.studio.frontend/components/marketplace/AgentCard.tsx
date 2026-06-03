"use client";

import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

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

interface AgentCardProps {
  agent: AgentCatalogEntry;
  onInstall: (id: string) => Promise<void>;
  onUninstall: (id: string) => Promise<void>;
  installing: boolean;
}

const CATEGORY_CONFIG: Record<string, { icon: string; color: string }> = {
  data: {
    icon: "solar:chart-bold",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  },
  systems: {
    icon: "solar:cpu-bold",
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30",
  },
  security: {
    icon: "solar:shield-check-bold",
    color: "from-red-500/20 to-rose-500/20 border-red-500/30",
  },
  mobile: {
    icon: "solar:smartphone-bold",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  },
  infrastructure: {
    icon: "solar:server-bold",
    color: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  },
  backend: {
    icon: "solar:database-bold",
    color: "from-slate-500/20 to-gray-500/20 border-slate-500/30",
  },
  frontend: {
    icon: "solar:window-bold",
    color: "from-pink-500/20 to-fuchsia-500/20 border-pink-500/30",
  },
  other: {
    icon: "solar:box-bold",
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
  },
};

export function AgentCard({
  agent,
  onInstall,
  onUninstall,
  installing,
}: AgentCardProps) {
  const cat = CATEGORY_CONFIG[agent.category] ?? CATEGORY_CONFIG.other;

  return (
    <motion.div
      layout
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -4 }}
    >
      <Card className="w-full border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/8 hover:border-white/20 transition-all duration-300 group h-full flex flex-col">
        <CardHeader className="flex justify-between items-start pb-0 gap-3">
          <div className="flex gap-3 items-center flex-1 min-w-0">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.color} border shrink-0 group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className="text-white/90 text-xl" icon={cat.icon} />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-base text-white tracking-tight truncate">
                {agent.name}
              </h3>
              <span className="text-[10px] text-default-400 font-mono truncate">
                by {agent.author}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Chip
              classNames={{
                base:
                  agent.price === "Free"
                    ? "bg-success/15 border-success/30"
                    : "bg-warning/15 border-warning/30",
                content:
                  agent.price === "Free"
                    ? "text-success text-[10px] font-bold"
                    : "text-warning text-[10px] font-bold",
              }}
              size="sm"
              variant="flat"
            >
              {agent.price}
            </Chip>
            <span className="text-[10px] text-default-500 font-mono">
              v{agent.version}
            </span>
          </div>
        </CardHeader>

        <CardBody className="py-4 flex-1">
          <p className="text-sm text-default-400 leading-relaxed line-clamp-3">
            {agent.description}
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-default-500 flex-wrap">
            <Icon
              className="text-primary/70"
              icon="solar:download-minimalistic-bold"
            />
            <span>{agent.downloads.toLocaleString()} installs</span>

            {(() => {
              const hash = agent.id
                .split("")
                .reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const providers = [
                {
                  name: "AWS Bedrock",
                  color:
                    "text-warning-500 bg-warning-500/10 border-warning-500/20",
                },
                {
                  name: "GCP Vertex AI",
                  color:
                    "text-success-500 bg-success-500/10 border-success-500/20",
                },
                {
                  name: "Azure Foundry",
                  color:
                    "text-primary-500 bg-primary-500/10 border-primary-500/20",
                },
              ];
              const cloud = providers[hash % providers.length];

              return (
                <Chip
                  className={`text-[9px] border ${cloud.color}`}
                  size="sm"
                  variant="flat"
                >
                  Powered by {cloud.name}
                </Chip>
              );
            })()}

            <span className="ml-auto">
              <Chip
                className="bg-white/5 text-[10px] text-default-400"
                size="sm"
                variant="flat"
              >
                {agent.category}
              </Chip>
            </span>
          </div>
        </CardBody>

        <CardFooter className="pt-0 pb-4 px-4">
          <AnimatePresence mode="wait">
            {agent.installed ? (
              <motion.div
                key="installed"
                animate={{ opacity: 1 }}
                className="flex gap-2 w-full"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                <Chip
                  classNames={{
                    base: "bg-success/15 border-success/30 flex-1 justify-center",
                    content: "text-success font-semibold text-xs",
                  }}
                  startContent={<Icon icon="solar:check-circle-bold" />}
                  variant="flat"
                >
                  Installed
                </Chip>
                <Button
                  className="shrink-0"
                  color="danger"
                  isLoading={installing}
                  size="sm"
                  startContent={
                    !installing && (
                      <Icon icon="solar:trash-bin-minimalistic-bold" />
                    )
                  }
                  variant="flat"
                  onPress={() => onUninstall(agent.id)}
                >
                  Remove
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="not-installed"
                animate={{ opacity: 1 }}
                className="w-full"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                <Button
                  fullWidth
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold"
                  color="primary"
                  isLoading={installing}
                  size="sm"
                  startContent={
                    !installing && <Icon icon="solar:download-bold" />
                  }
                  variant="shadow"
                  onPress={() => onInstall(agent.id)}
                >
                  {installing ? "Installing…" : "Install Agent"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
