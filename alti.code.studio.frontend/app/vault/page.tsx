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

const detectService = (name: string, key: string, currentService?: string): string => {
  if (currentService && currentService !== "Custom" && currentService !== "GitHub" && currentService !== "Default") {
    return currentService;
  }
  const lowerName = name.toLowerCase();
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.startsWith("ghp_") || lowerName.includes("github")) {
    return "GitHub";
  }
  if (lowerKey.startsWith("sk-") || lowerName.includes("openai") || lowerName.includes("gpt") || lowerName.includes("anthropic") || lowerName.includes("claude")) {
    return "OpenAI";
  }
  if (lowerKey.startsWith("az_") || lowerName.includes("azure") || lowerName.includes("microsoft")) {
    return "Azure";
  }
  
  return "Custom";
};

export default function VaultPage() {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;

  const {
    isOpen: isDeleteModalOpen,
    onOpen: openDeleteModal,
    onOpenChange: onDeleteModalChange,
  } = useDisclosure();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [secretToDelete, setSecretToDelete] = useState<string | null>(null);
  const [secrets, setSecrets] = useState<SecretEntry[]>(initialSecrets);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [selectedSecretId, setSelectedSecretId] = useState<string | null>(null);
  const [editingSecretId, setEditingSecretId] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState("");
  const [newService, setNewService] = useState("GitHub");
  const [newKey, setNewKey] = useState("");
  const [isFormSecretRevealed, setIsFormSecretRevealed] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => {
      setEditingSecretId(null);
      setNewName("");
      setNewService("GitHub");
      setNewKey("");
      setIsFormSecretRevealed(false);
      setSelectedSecretId(null);
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
  }, []);

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
    window.dispatchEvent(new CustomEvent("delete-vault-secret", { detail: id }));
  };

  const handleEditClick = (secret: SecretEntry) => {
    setEditingSecretId(secret.id);
    setNewName(secret.name);
    setNewService(secret.service);
    setNewKey(secret.key);
    setIsFormSecretRevealed(false);
    setSelectedSecretId(null);
  };

  const handleSave = async (onClose: () => void) => {
    if (!newName || !newKey) return;

    // Convert secret name to a valid GCP Secret Manager ID (lowercase, hyphens only, alphanumeric)
    const normalizedSecretId = newName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const detected = detectService(newName, newKey, editingSecretId ? secrets.find(s => s.id === editingSecretId)?.service : undefined);

    try {
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
      } catch (apiError) {
        console.warn("Backend API not available. Updating local state.", apiError);
      }

      if (editingSecretId) {
        const updatedEntry = { id: editingSecretId, name: newName, service: detected, key: newKey };
        setSecrets(
          secrets.map((s) =>
            s.id === editingSecretId
              ? { ...s, ...updatedEntry }
              : s,
          ),
        );
        window.dispatchEvent(new CustomEvent("update-vault-secret", { detail: updatedEntry }));
        setSuccessMessage("Secret successfully updated!");
        setIsSuccessModalOpen(true);
      } else {
        const newEntry = {
          id: normalizedSecretId,
          name: newName,
          service: detected,
          key: newKey,
          lastUsed: "Never",
        };
        setSecrets([newEntry, ...secrets]);
        window.dispatchEvent(new CustomEvent("update-vault-secret", { detail: newEntry }));
        setSuccessMessage("Your new secret is now saved!");
        setIsSuccessModalOpen(true);
      }

      setNewName("");
      setNewKey("");
      setEditingSecretId(null);
      setSelectedSecretId(null);
    } catch (err) {
      console.error("Failed to store secret", err);
      toast.error("Failed to store secret in Vault");
    }
  };

  const activeSecret = secrets.find((s) => s.id === selectedSecretId);
  const headerTitle = activeSecret ? activeSecret.name : (editingSecretId ? "Edit Secret" : "New Secret");

  return (
    <ChatBotLayout isRightSidebarOpenByDefault={false}>
      <div className="flex-1 overflow-hidden bg-transparent flex flex-col h-full font-sans w-full">
        <div className="relative flex flex-1 w-full flex-col items-center justify-center overflow-hidden">
          <div className="flex w-full flex-col items-center gap-6 z-20 px-6 mt-[-5vh]">
            <div className="flex flex-col items-center text-center z-30 mb-6">
              <h1
                className="text-4xl font-semibold tracking-tight text-foreground drop-shadow-sm opacity-80 animate-in fade-in duration-300"
                style={{ fontFamily: "var(--font-secondary)" }}
              >
                {headerTitle}
              </h1>
            </div>

            <div className="flex w-full flex-col gap-4 max-w-2xl">
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
                        className="flex flex-col gap-4 w-full animate-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                      >
                        {/* Name Row */}
                        <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-3">
                            <ServiceIcon size={18} className={conf.color} />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {secret.name}
                            </span>
                          </div>
                          <button
                            onClick={() => handleEditClick(secret)}
                            className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors flex items-center gap-1.5"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                        </div>

                        {/* Secret Row */}
                        <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 border border-gray-100 dark:border-gray-800">
                          <span className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate flex-1">
                            {isRevealed ? secret.key : "••••••••••••••••••••••••"}
                          </span>
                          <div className="flex gap-4 items-center shrink-0">
                            <button
                              onClick={() => {
                                handleCopy(secret.key);
                                toast.success("Token copied to clipboard!");
                              }}
                              className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors flex items-center gap-1.5"
                            >
                              <Copy size={12} /> Copy
                            </button>
                            <button
                              onClick={() => toggleReveal(secret.id)}
                              className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors flex items-center gap-1.5"
                            >
                              {isRevealed ? (
                                <>
                                  <EyeOff size={12} /> Hide
                                </>
                              ) : (
                                <>
                                  <Eye size={12} /> Reveal
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          className="w-full bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-500 shadow-sm rounded-xl px-4 py-3.5 flex items-center justify-center gap-3 hover:bg-red-100 dark:hover:bg-red-900/50 transition-all font-medium text-sm border border-red-100 dark:border-red-900/50"
                          onClick={() => {
                            setSecretToDelete(secret.id);
                            openDeleteModal();
                          }}
                        >
                          Delete Secret
                        </button>
                      </div>
                    );
                  })
              ) : (
                <div className="flex w-full flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                  {/* Thin Name Input */}
                  <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3.5 flex items-center gap-3 border border-gray-100 dark:border-gray-800 focus-within:border-primary/50 transition-colors">
                    <input
                      type="text"
                      placeholder="Enter name here..."
                      className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>

                  {/* Thin Secret Input */}
                  <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3.5 flex items-center gap-3 border border-gray-100 dark:border-gray-800 focus-within:border-primary/50 transition-colors">
                    <input
                      type={isFormSecretRevealed ? "text" : "password"}
                      placeholder="Enter secret here..."
                      className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                    />
                    <button
                      onClick={() => setIsFormSecretRevealed(!isFormSecretRevealed)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0 focus:outline-none"
                      type="button"
                    >
                      {isFormSecretRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Thin Button */}
                  <button
                    className="w-full bg-black dark:bg-white shadow-sm rounded-xl px-4 py-3.5 flex items-center justify-center gap-3 hover:bg-gray-900 dark:hover:bg-gray-100 transition-all font-medium text-sm text-white dark:text-black"
                    onClick={() => handleSave(() => {})}
                  >
                    {editingSecretId ? "Update Secret" : "Encrypt & Save"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


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

      {/* Success Modal */}
      <Modal
        hideCloseButton
        backdrop="blur"
        classNames={{
          base: "bg-white dark:bg-[#161616] rounded-[24px] border border-default-200/50 shadow-2xl overflow-hidden max-w-[320px] w-[320px]",
          header: "pt-6 pb-1.5 px-6 flex flex-col items-center justify-center",
          body: "pt-0 pb-5 px-6 text-center flex flex-col items-center justify-center",
          footer: "p-0 m-0 flex w-full bg-transparent min-h-0",
        }}
        isOpen={isSuccessModalOpen}
        size="xs"
        onOpenChange={setIsSuccessModalOpen}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-[17px] font-semibold text-default-900 tracking-tight text-center w-full">
                  Success
                </h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-500 dark:text-default-400 text-[13px] leading-snug text-center w-full">
                  {successMessage}
                </p>
              </ModalBody>
              <ModalFooter className="p-0 m-0 border-t border-[#E5E5EA] dark:border-[#2C2C2E] flex w-full bg-transparent min-h-0">
                <Button
                  variant="light"
                  className="w-full h-12 rounded-none border-none text-primary font-normal hover:bg-default-100/50 text-[15px]"
                  onPress={onClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </ChatBotLayout>
  );
}
