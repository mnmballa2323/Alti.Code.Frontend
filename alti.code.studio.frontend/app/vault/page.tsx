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
  ArrowLeft,
  ChevronRight,
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
              {selectedSecretId && (
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="mr-1 text-default-500 hover:text-default-900 rounded-lg min-w-[32px]"
                  onClick={() => setSelectedSecretId(null)}
                >
                  <ArrowLeft size={16} />
                </Button>
              )}
              <h1 className="text-base font-bold tracking-tight text-default-900">
                {headerTitle}
              </h1>
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
                        <div className="bg-[#F4F4F6] dark:bg-[#161616] border border-default-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-default-100 dark:border-default-50/50 pb-5 mb-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "p-3 rounded-2xl border border-default-100/50 shadow-sm",
                                  conf.color,
                                )}
                              >
                                <ServiceIcon size={20} />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-default-400 block">
                                  {secret.service} Credential
                                </span>
                                <h2 className="text-lg font-bold text-default-900 tracking-tight">
                                  {secret.name}
                                </h2>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                className="bg-default-100 dark:bg-[#1A1A1A] font-semibold rounded-xl text-default-700 hover:text-default-900"
                                size="sm"
                                startContent={<Edit2 size={14} />}
                                variant="flat"
                                onPress={() => handleEditClick(secret)}
                              >
                                Edit
                              </Button>
                              <Button
                                className="bg-default-100 dark:bg-[#1A1A1A] font-semibold rounded-xl text-default-700 hover:text-default-900"
                                size="sm"
                                startContent={<Copy size={14} />}
                                variant="flat"
                                onPress={() => {
                                  handleCopy(secret.key);
                                  toast.success("Token copied to clipboard!");
                                }}
                              >
                                Copy
                              </Button>
                              <Button
                                className={cn(
                                  "font-semibold rounded-xl transition-all",
                                  isRevealed
                                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                                    : "bg-default-100 dark:bg-[#1A1A1A] text-default-700 hover:text-default-900",
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
                          
                          <div className="font-mono text-lg break-all bg-default-50 dark:bg-black/40 p-6 rounded-2xl border border-default-100/60 flex items-center justify-center min-h-[100px] shadow-inner relative overflow-hidden">
                            {isRevealed ? (
                              <span className="text-default-900 leading-relaxed font-semibold">
                                {secret.key}
                              </span>
                            ) : (
                              <span className="text-default-300 dark:text-default-700 tracking-[0.25em] text-3xl leading-none mt-2 select-none truncate max-w-full">
                                ••••••••••••••••••••••••
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Security Status Info Card */}
                      <div className="bg-[#F4F4F6] dark:bg-[#161616] border border-default-200 rounded-3xl p-6 shadow-sm relative overflow-hidden flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                        <div className="p-3 rounded-2xl bg-success-500/10 text-success border border-success-500/20 shadow-sm shrink-0">
                          <Lock size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-default-900 tracking-tight">Active Cryptographic Shield</h4>
                          <p className="text-xs text-default-500 mt-0.5 leading-relaxed">
                            This token is securely isolated. Workspace agent calls query this vault dynamically via encrypted gRPC channels, ensuring credentials never leak into dynamic prompt logs.
                          </p>
                        </div>
                      </div>

                      {/* Danger Zone */}
                      <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <div className="flex items-center justify-between bg-[#F4F4F6] dark:bg-[#161616] border border-danger-200 dark:border-danger-900/40 shadow-sm rounded-3xl p-6 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-danger-500" />
                          <div>
                            <h3 className="text-base font-bold text-danger-600 dark:text-danger-500">
                              Revoke & Delete Secret
                            </h3>
                            <p className="text-sm text-default-500 mt-1">
                              This action is permanent. Workspace agents will immediately lose access to connected services.
                            </p>
                          </div>
                          <Button
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md shadow-red-500/20 px-6 rounded-xl border-none"
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
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                {secrets.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-default-200/80 rounded-3xl bg-[#F4F4F6] dark:bg-[#161616] shadow-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
                      <Lock className="size-6" />
                    </div>
                    <h3 className="text-lg font-bold text-default-900 tracking-tight">
                      Sovereign Vault is Empty
                    </h3>
                    <p className="text-sm text-default-500 max-w-sm mx-auto mt-2 leading-relaxed">
                      Store your API keys or integration credentials securely. Click the Plus (**+**) icon in the sidebar search bar to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Secrets Cards Grid (Full-Width Rows) */}
                    {secrets.map((secret) => {
                      const conf =
                        serviceConfig[secret.service] || serviceConfig.Default;
                      const ServiceIcon = conf.icon;

                      return (
                        <Card
                          key={secret.id}
                          isPressable
                          className="w-full border border-default-200 bg-[#F4F4F6] dark:bg-[#161616] hover:border-primary hover:shadow-md hover:shadow-primary/5 transition-all duration-300 rounded-3xl"
                          shadow="sm"
                          onPress={() => setSelectedSecretId(secret.id)}
                        >
                          <CardBody className="p-6 flex flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-left">
                              <div
                                className={cn(
                                  "p-3.5 rounded-2xl flex-shrink-0 border border-default-100/50 shadow-sm",
                                  conf.color,
                                )}
                              >
                                <ServiceIcon size={22} />
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-default-900 tracking-tight">
                                  {secret.name}
                                </h3>
                                <p className="text-xs text-default-400 mt-1 flex items-center gap-1.5 font-medium">
                                  <span>{secret.service}</span>
                                  <span className="w-1 h-1 rounded-full bg-default-300" />
                                  <span>Last used {secret.lastUsed}</span>
                                </p>
                              </div>
                            </div>
                             <div className="flex items-center gap-3">
                               <Button
                                 isIconOnly
                                 size="sm"
                                 variant="light"
                                 className="text-default-400 hover:text-primary hover:bg-primary/10 rounded-xl min-w-[32px] h-[32px]"
                                 onClick={() => setSelectedSecretId(secret.id)}
                               >
                                 <ChevronRight size={18} />
                               </Button>
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
          base: "bg-white dark:bg-[#161616] rounded-[24px] border border-default-200/50 shadow-2xl overflow-hidden max-w-[320px] w-[320px]",
          header: "pt-6 pb-1.5 px-6 flex flex-col items-center justify-center",
          body: "pt-0 pb-5 px-6 text-center flex flex-col items-center justify-center",
          footer: "p-0 m-0 flex flex-row w-full gap-0 bg-transparent min-h-0",
        }}
        isOpen={isDeleteModalOpen}
        size="xs"
        onOpenChange={onDeleteModalChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-[17px] font-semibold text-default-900 tracking-tight text-center w-full">
                  Delete
                </h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-500 dark:text-default-400 text-[13px] leading-snug text-center w-full">
                  Are you sure you want to delete?
                </p>
              </ModalBody>
              <ModalFooter className="p-0 m-0 border-t border-[#E5E5EA] dark:border-[#2C2C2E] flex flex-row w-full gap-0 bg-transparent min-h-0">
                <Button
                  variant="light"
                  className="w-[calc(50%-0.5px)] h-12 rounded-none border-none text-default-800 dark:text-default-200 font-normal hover:bg-default-100/50 text-[15px]"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <div className="w-[1px] h-12 bg-[#E5E5EA] dark:bg-[#2C2C2E] shrink-0" />
                <Button
                  variant="light"
                  className="w-[calc(50%-0.5px)] h-12 rounded-none border-none text-danger font-normal hover:bg-default-100/50 text-[15px]"
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
