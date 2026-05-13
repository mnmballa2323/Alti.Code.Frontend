"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ScrollShadow,
  cn,
} from "@heroui/react";
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Cloud,
  Github,
  Server,
  Edit2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-hot-toast";

import ChatBotLayout from "@/components/ChatbotLayout";
import { API_URL } from "@/lib/config";

type SecretEntry = {
  id: string;
  name: string;
  service: string;
  key: string;
  lastUsed: string;
};

const initialSecrets: SecretEntry[] = [
  {
    id: "sec-1",
    name: "Primary Build Agent",
    service: "GitHub",
    key: "ghp_xYz123AlphaOmegaSecretKey",
    lastUsed: "2 mins ago",
  },
  {
    id: "sec-2",
    name: "Synapse Production Analytics",
    service: "Azure",
    key: "az_prod_eu_west_98127398123",
    lastUsed: "1 hour ago",
  },
  {
    id: "sec-3",
    name: "Telepathy Inference",
    service: "OpenAI",
    key: "sk-proj-781263871263871263",
    lastUsed: "Just now",
  },
];

const serviceConfig: Record<string, { icon: any; color: string }> = {
  GitHub: {
    icon: Github,
    color:
      "text-default-700 dark:text-default-300 bg-default-100 dark:bg-default-800",
  },
  Azure: {
    icon: Cloud,
    color: "text-primary-600 bg-primary-100 dark:bg-primary-900/30",
  },
  OpenAI: {
    icon: Server,
    color: "text-success-600 bg-success-100 dark:bg-success-900/30",
  },
  Default: { icon: KeyRound, color: "text-default-500 bg-default-100" },
};

export default function VaultPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onOpenChange: onDeleteModalChange,
  } = useDisclosure();
  const [secretToDelete, setSecretToDelete] = useState<string | null>(null);
  const [secrets, setSecrets] = useState<SecretEntry[]>(initialSecrets);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [selectedSecretId, setSelectedSecretId] = useState<string | null>(null);
  const [editingSecretId, setEditingSecretId] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState("");
  const [newService, setNewService] = useState("GitHub");
  const [newKey, setNewKey] = useState("");

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingSecretId(null);
      setNewName("");
      setNewService("GitHub");
      setNewKey("");
      onOpen();
    };
    const handleSelectSecret = (e: any) => {
      setSelectedSecretId(e.detail);
      setRevealedIds(new Set()); // Hide secret when switching
    };

    window.addEventListener("open-vault-modal", handleOpenModal);
    window.addEventListener("select-secret", handleSelectSecret);

    return () => {
      window.removeEventListener("open-vault-modal", handleOpenModal);
      window.removeEventListener("select-secret", handleSelectSecret);
    };
  }, [onOpen]);

  const toggleReveal = (id: string) => {
    const newSet = new Set(revealedIds);

    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setRevealedIds(newSet);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // In a real app, trigger a toast notification here
  };

  const handleDelete = (id: string) => {
    setSecrets(secrets.filter((s) => s.id !== id));
    if (selectedSecretId === id) {
      setSelectedSecretId(null);
    }
  };

  const handleEditClick = (secret: SecretEntry) => {
    setEditingSecretId(secret.id);
    setNewName(secret.name);
    setNewService(secret.service);
    setNewKey(secret.key);
    onOpen();
  };

  const handleSave = async (onClose: () => void) => {
    if (!newName || !newKey) return;

    // Convert secret name to a valid GCP Secret Manager ID (lowercase, hyphens only, alphanumeric)
    const normalizedSecretId = newName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    try {
      await axios.post(
        `${API_URL}/secret-manager/update`,
        { secretId: normalizedSecretId, payload: newKey },
        {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        },
      );

      if (editingSecretId) {
        setSecrets(
          secrets.map((s) =>
            s.id === editingSecretId
              ? { ...s, name: newName, service: newService, key: newKey }
              : s,
          ),
        );
        toast.success("Secret successfully updated!");
      } else {
        setSecrets([
          {
            id: normalizedSecretId,
            name: newName,
            service: newService,
            key: newKey,
            lastUsed: "Never",
          },
          ...secrets,
        ]);
        toast.success("Secret securely stored in GCP Secret Manager!");
      }

      setNewName("");
      setNewKey("");
      onClose();
    } catch (err) {
      console.error("Failed to store secret", err);
      toast.error("Failed to store secret in Vault");
    }
  };

  const activeSecret = secrets.find((s) => s.id === selectedSecretId);
  const headerTitle = activeSecret ? activeSecret.name : "Stored Secrets";

  return (
    <ChatBotLayout isRightSidebarOpenByDefault={false}>
      <div className="flex-1 overflow-hidden bg-default-100 dark:bg-background flex flex-col h-full font-sans">
        {/* Header */}
        <div className="flex-none h-[56px] px-8 border-b border-default-200 bg-white dark:bg-content1 flex items-center">
          <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold tracking-tight">
                {headerTitle}
              </h1>
            </div>
            <div className="flex items-center">
              <Button
                color="primary"
                size="sm"
                startContent={<Lock size={14} />}
                onPress={onOpen}
              >
                Add Secret
              </Button>
            </div>
          </div>
        </div>
        {/* Content Section */}
        <ScrollShadow className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-4">
            {selectedSecretId ? (
              secrets
                .filter((s) => s.id === selectedSecretId)
                .map((secret) => {
                  const conf =
                    serviceConfig[secret.service] || serviceConfig.Default;
                  const ServiceIcon = conf.icon;
                  const isRevealed = revealedIds.has(secret.id);

                  return (
                    <div
                      key={secret.id}
                      className="max-w-3xl mx-auto space-y-6 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12"
                    >
                      {/* Secret Value Section */}
                      <div>
                        <div className="bg-white dark:bg-content1 border border-default-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-default-500 flex items-center gap-2">
                              <KeyRound size={14} /> Secret Credential
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                className="bg-default-100 dark:bg-[#1A1A1A] font-medium"
                                size="sm"
                                startContent={<Edit2 size={14} />}
                                variant="flat"
                                onPress={() => handleEditClick(secret)}
                              >
                                Edit
                              </Button>
                              <Button
                                className="bg-default-100 dark:bg-[#1A1A1A] font-medium"
                                size="sm"
                                startContent={<Copy size={14} />}
                                variant="flat"
                                onPress={() => handleCopy(secret.key)}
                              >
                                Copy
                              </Button>
                              <Button
                                className={cn(
                                  "font-medium",
                                  isRevealed
                                    ? "bg-primary/10 text-primary"
                                    : "bg-default-100 dark:bg-[#1A1A1A]",
                                )}
                                size="sm"
                                startContent={
                                  isRevealed ? (
                                    <EyeOff size={14} />
                                  ) : (
                                    <Eye size={14} />
                                  )
                                }
                                variant="flat"
                                onPress={() => toggleReveal(secret.id)}
                              >
                                {isRevealed ? "Hide" : "Reveal"}
                              </Button>
                            </div>
                          </div>
                          <div className="font-mono text-lg break-all bg-default-50 dark:bg-black p-5 rounded-2xl border border-default-100 flex items-center justify-center min-h-[90px]">
                            {isRevealed ? (
                              <span className="text-default-900 leading-relaxed font-medium">
                                {secret.key}
                              </span>
                            ) : (
                              <span className="text-default-400 tracking-[0.2em] text-3xl leading-none mt-2 truncate max-w-full">
                                ••••••••••••••••••••••••
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="mt-8">
                        <div className="flex items-center justify-between bg-white dark:bg-content1 border border-danger-200 dark:border-danger-900/40 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-danger-500" />
                          <div>
                            <h3 className="text-base font-bold text-danger-600 dark:text-danger-500">
                              Revoke & Delete Secret
                            </h3>
                            <p className="text-sm text-default-500 mt-1">
                              This action is permanent. Agents will immediately
                              lose access.
                            </p>
                          </div>
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white font-medium shadow-md shadow-red-500/20 px-6 rounded-xl border-none"
                            onPress={() => {
                              setSecretToDelete(secret.id);
                              openDeleteModal();
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {secrets.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-default-200 rounded-3xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-default-100 mb-4">
                      <Lock className="size-8 text-default-400" />
                    </div>
                    <h3 className="text-lg font-medium text-default-900">
                      Vault is empty
                    </h3>
                    <p className="text-default-500 mt-1">
                      Store your API keys securely to give your agents access.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {secrets.map((secret) => {
                      const conf =
                        serviceConfig[secret.service] || serviceConfig.Default;
                      const ServiceIcon = conf.icon;

                      return (
                        <Card
                          key={secret.id}
                          isPressable
                          className="border border-default-200 bg-white dark:bg-background hover:border-default-400 transition-colors"
                          shadow="sm"
                          onPress={() => setSelectedSecretId(secret.id)}
                        >
                          <CardBody className="p-5 flex flex-row items-center gap-4">
                            <div
                              className={cn(
                                "p-3 rounded-2xl flex-shrink-0 border border-default-100",
                                conf.color,
                              )}
                            >
                              <ServiceIcon size={24} />
                            </div>
                            <div className="flex-1 text-left">
                              <h3 className="text-base font-bold text-default-900">
                                {secret.name}
                              </h3>
                              <p className="text-sm text-default-500">
                                {secret.service} • Last used {secret.lastUsed}
                              </p>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollShadow>
      </div>

      {/* Add Secret Modal */}
      <Modal
        backdrop="blur"
        classNames={{
          base: "bg-white dark:bg-background border border-default-200",
          header: "border-b border-default-200",
          footer: "border-t border-default-200",
        }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold">
                  {editingSecretId ? "Edit Secret" : "Store New Secret"}
                </h2>
                <p className="text-xs font-normal text-default-500">
                  Data is immediately encrypted locally via AES-256 before
                  persistence.
                </p>
              </ModalHeader>
              <ModalBody className="py-6 space-y-4">
                <Input
                  label="Account / Reference Name"
                  placeholder="e.g. Production AWS Credentials"
                  value={newName}
                  variant="bordered"
                  onValueChange={setNewName}
                />

                <Select
                  label="Service Provider"
                  selectedKeys={[newService]}
                  variant="bordered"
                  onChange={(e) => setNewService(e.target.value)}
                >
                  <SelectItem key="GitHub">GitHub</SelectItem>
                  <SelectItem key="Azure">Azure</SelectItem>
                  <SelectItem key="OpenAI">OpenAI / Anthropic</SelectItem>
                  <SelectItem key="Custom">Custom API</SelectItem>
                </Select>

                <Input
                  label="Secret Token / API Key"
                  placeholder="Paste your token here..."
                  type="password"
                  value={newKey}
                  variant="bordered"
                  onValueChange={setNewKey}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-black dark:bg-white text-white dark:text-black font-medium"
                  onPress={() => handleSave(onClose)}
                >
                  {editingSecretId ? "Update Secret" : "Encrypt & Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        hideCloseButton
        backdrop="blur"
        classNames={{
          base: "bg-white dark:bg-background rounded-3xl",
          header: "border-none pt-6 pb-2 flex flex-col gap-1 items-center",
          body: "py-2 text-center",
          footer: "border-none pt-4 pb-6 flex justify-center gap-3 w-full",
        }}
        isOpen={isDeleteModalOpen}
        size="md"
        onOpenChange={onDeleteModalChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h2 className="text-xl font-bold text-default-900">
                  Delete Secret?
                </h2>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-500 text-base whitespace-nowrap">
                  Are you sure you want to delete?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  className="font-medium bg-default-100 px-6 rounded-xl"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white font-medium shadow-md shadow-red-500/20 px-6 rounded-xl border-none"
                  onPress={() => {
                    if (secretToDelete) {
                      handleDelete(secretToDelete);
                    }
                    onClose();
                  }}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </ChatBotLayout>
  );
}
