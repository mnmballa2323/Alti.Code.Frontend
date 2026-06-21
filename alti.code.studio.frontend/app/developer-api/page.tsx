"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Input,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  cn,
} from "@heroui/react";
import {
  Key,
  Plus,
  Trash2,
  ShieldAlert,
  Check,
  Copy,
  HelpCircle,
} from "lucide-react";

import ChatBotLayout from "@/components/ChatbotLayout";
import { AppDispatch } from "@/store";
import { setChatContext, startNewChat } from "@/store/messagesSlice";
import { AgentCommandCenter } from "@/components/AgentCommandCenter";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  created: string;
  lastUsed: string;
  scope: "Read" | "Read/Write" | "Admin";
};

export default function DeveloperApiPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Prod Deployment Swarm",
      keyPrefix: "sk_live_8f3a...9d2e",
      created: "2026-05-12",
      lastUsed: "2026-06-21 02:30",
      scope: "Admin",
    },
    {
      id: "2",
      name: "CI/CD Auto-Reviewer",
      keyPrefix: "sk_live_4b1c...7f6a",
      created: "2026-06-01",
      lastUsed: "2026-06-20 18:45",
      scope: "Read/Write",
    },
    {
      id: "3",
      name: "Local Testing Environment",
      keyPrefix: "sk_test_2a9e...0c1b",
      created: "2026-06-15",
      lastUsed: "2026-06-21 01:15",
      scope: "Read",
    },
  ]);

  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState<
    "Read" | "Read/Write" | "Admin"
  >("Read/Write");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    dispatch(startNewChat());
    dispatch(setChatContext({ sessionId: null, model: "default" }));
  }, [dispatch]);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");

    const prefix =
      newKeyScope === "Admin"
        ? "sk_admin_"
        : newKeyScope === "Read/Write"
          ? "sk_live_"
          : "sk_test_";
    const fullKey = `${prefix}${randomHex}`;
    const truncatedPrefix = `${fullKey.slice(0, 11)}...${fullKey.slice(-4)}`;

    const newKeyItem: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      keyPrefix: truncatedPrefix,
      created: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      scope: newKeyScope,
    };

    setKeys([newKeyItem, ...keys]);
    setGeneratedKey(fullKey);
    setNewKeyName("");
    onOpen();
  };

  const handleRevokeKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ChatBotLayout>
      <div className="flex-1 overflow-y-auto bg-transparent flex flex-col h-full font-sans text-foreground">
        <div className="relative flex flex-col w-full items-center justify-start py-12 px-6 md:px-12">
          {/* Visual abstract overlay */}
          <div className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none blur-sm mix-blend-screen">
            <AgentCommandCenter />
          </div>

          <div className="flex w-full max-w-4xl flex-col gap-8 z-10">
            {/* Header section */}
            <div className="flex flex-col gap-2 border-b border-default-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <Key className="size-6" />
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                  API Keys
                </h1>
              </div>
              <p className="text-sm text-default-500 max-w-2xl mt-1">
                Authenticate your scripts and external services to securely
                access Alti’s background agent orchestration, repository
                indexing, and security analysis pipelines.
              </p>
            </div>

            {/* Create API Key Form card */}
            <div className="bg-[#FCFCFD] dark:bg-default-50/50 border border-default-200/60 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
              <h2 className="text-lg font-medium text-foreground">
                Generate New API Key
              </h2>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 flex flex-col gap-2 w-full">
                  <label className="text-xs font-semibold text-default-500 uppercase tracking-wider">
                    Key Name
                  </label>
                  <Input
                    className="max-w-md"
                    placeholder="e.g. Production Jenkins Hook"
                    radius="md"
                    value={newKeyName}
                    variant="bordered"
                    onValueChange={setNewKeyName}
                  />
                </div>

                <div className="flex flex-col gap-2 w-full md:w-48">
                  <label className="text-xs font-semibold text-default-500 uppercase tracking-wider">
                    Permissions / Scope
                  </label>
                  <select
                    className="h-10 px-3 rounded-lg border-2 border-default-200 bg-transparent text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                    value={newKeyScope}
                    onChange={(e) => setNewKeyScope(e.target.value as any)}
                  >
                    <option value="Read">Read Only</option>
                    <option value="Read/Write">Read & Write</option>
                    <option value="Admin">Full Admin</option>
                  </select>
                </div>

                <Button
                  className="font-medium h-10 w-full md:w-auto px-6 shrink-0"
                  color="primary"
                  isDisabled={!newKeyName.trim()}
                  radius="md"
                  startContent={<Plus className="size-4" />}
                  onPress={handleCreateKey}
                >
                  Create Key
                </Button>
              </div>
            </div>

            {/* API Keys Table / list */}
            <div className="bg-white dark:bg-default-50 border border-default-200/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-default-100 flex items-center justify-between">
                <h2 className="text-lg font-medium text-foreground">
                  Active Keys
                </h2>
                <span className="text-xs px-2.5 py-1 bg-default-100 rounded-full font-medium text-default-600">
                  {keys.length} Keys Active
                </span>
              </div>

              {keys.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <div className="p-3 bg-default-100 rounded-full text-default-400">
                    <Key className="size-6" />
                  </div>
                  <h3 className="text-sm font-medium text-foreground">
                    No active keys
                  </h3>
                  <p className="text-xs text-default-500 max-w-sm">
                    You don't have any active API credentials. Generate one
                    above to access the API.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-default-50/50 border-b border-default-100 text-xs font-semibold text-default-500 uppercase tracking-wider">
                        <th className="py-3 px-6">Name</th>
                        <th className="py-3 px-6">Scope</th>
                        <th className="py-3 px-6">Key Preview</th>
                        <th className="py-3 px-6">Created</th>
                        <th className="py-3 px-6">Last Used</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-default-100">
                      {keys.map((key) => (
                        <tr
                          key={key.id}
                          className="hover:bg-default-50/20 transition-colors"
                        >
                          <td className="py-4 px-6 font-medium text-foreground">
                            {key.name}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded-full font-semibold border",
                                key.scope === "Admin"
                                  ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400"
                                  : key.scope === "Read/Write"
                                    ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400"
                                    : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400",
                              )}
                            >
                              {key.scope}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono text-xs text-default-600">
                            {key.keyPrefix}
                          </td>
                          <td className="py-4 px-6 text-default-500 text-xs">
                            {key.created}
                          </td>
                          <td className="py-4 px-6 text-default-500 text-xs">
                            {key.lastUsed}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Tooltip
                              closeDelay={0}
                              color="danger"
                              content="Revoke Access"
                            >
                              <Button
                                isIconOnly
                                color="danger"
                                radius="md"
                                size="sm"
                                variant="light"
                                onPress={() => handleRevokeKey(key.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </Tooltip>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Rate limits card */}
            <div className="bg-[#FCFCFD] dark:bg-default-50/50 border border-default-200/60 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
              <div className="p-3 bg-amber-500/10 rounded-full text-amber-600 shrink-0">
                <ShieldAlert className="size-6" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-base font-semibold text-foreground flex items-center justify-center md:justify-start gap-1.5">
                  Standard Rate Limits
                  <HelpCircle className="size-4 text-default-400 cursor-help" />
                </h3>
                <p className="text-xs text-default-500 mt-1 max-w-xl">
                  By default, API keys are constrained to{" "}
                  <strong>120 requests/minute</strong> and{" "}
                  <strong>10,000 requests/day</strong>. Contact the platform
                  administrator to request elevated custom limits for deployment
                  nodes.
                </p>
              </div>
              <Button
                className="font-medium shrink-0 border-default-300 dark:border-default-700"
                radius="md"
                size="sm"
                variant="bordered"
              >
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Newly Generated Secret Key */}
      <Modal
        hideCloseButton
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
              <Key className="size-5 text-primary" />
              API Key Created Successfully
            </h3>
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4">
            <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 p-3 rounded-lg border border-amber-500/20 text-xs">
              <strong>CRITICAL WARNING:</strong> Copy this secret API key now.
              For security purposes, it will never be displayed in the panel
              again. If lost, you must create a new one.
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-default-500 uppercase tracking-wider">
                Secret Token
              </label>
              <div className="flex items-center gap-2 bg-default-100 dark:bg-default-50 border border-default-200 rounded-lg p-2 font-mono text-xs overflow-x-auto select-all">
                <span className="flex-1 break-all pr-2 text-foreground select-all">
                  {generatedKey}
                </span>
                <Button
                  isIconOnly
                  className="shrink-0"
                  size="sm"
                  variant="flat"
                  onPress={() => generatedKey && copyToClipboard(generatedKey)}
                >
                  {copied ? (
                    <Check className="size-3.5 text-success" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              className="font-medium"
              color="primary"
              radius="md"
              onPress={() => {
                setGeneratedKey(null);
                onOpenChange();
              }}
            >
              I Have Saved This Key
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChatBotLayout>
  );
}
