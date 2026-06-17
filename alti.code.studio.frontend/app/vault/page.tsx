"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Cloud,
  Github,
  Server,
  Edit2,
  ChevronDown,
  Check,
} from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-hot-toast";

import ChatBotLayout from "@/components/ChatbotLayout";
import { API_URL } from "@/lib/config";

// ─── Types ───────────────────────────────────────────────────────────────────

type VaultMode =
  | "api-key"
  | "login"
  | "ssh"
  | "database"
  | "oauth"
  | "cloud-iam"
  | "encryption"
  | "env-config";

type SecretEntry = {
  id: string;
  name: string;
  service: string;
  key: string;
  lastUsed: string;
  type?: VaultMode;
};

const VAULT_TABS: { id: VaultMode; label: string }[] = [
  { id: "api-key", label: "API Key" },
  { id: "login", label: "Login" },
  { id: "ssh", label: "SSH Key" },
  { id: "database", label: "Database" },
  { id: "oauth", label: "OAuth" },
  { id: "cloud-iam", label: "Cloud IAM" },
  { id: "encryption", label: "Encryption" },
  { id: "env-config", label: "Environment" },
];

// ─── Initial demo data ───────────────────────────────────────────────────────

const initialSecrets: SecretEntry[] = [
  {
    id: "sec-1",
    name: "Primary Build Agent",
    service: "API Key",
    key: "AKIAIOSFODNN7EXAMPLE",
    lastUsed: "2 mins ago",
  },
  {
    id: "sec-2",
    name: "Synapse Production Analytics",
    service: "Cloud IAM",
    key: JSON.stringify({
      provider: "Azure",
      keyId: "az_prod_eu_west",
      secret: "98127398123",
    }),
    lastUsed: "1 hour ago",
  },
  {
    id: "sec-3",
    name: "Telepathy Inference",
    service: "API Key",
    key: "gcp_vtx_781263871263871263",
    lastUsed: "Just now",
  },
];

const serviceConfig: Record<string, { icon: any; color: string }> = {
  GitHub: {
    icon: Github,
    color:
      "text-default-700 dark:text-default-300 bg-default-100 dark:bg-default-800",
  },
  "API Key": {
    icon: KeyRound,
    color: "text-warning-600 bg-warning-100 dark:bg-warning-900/30",
  },
  "Cloud IAM": {
    icon: Cloud,
    color: "text-primary-600 bg-primary-100 dark:bg-primary-900/30",
  },
  Database: {
    icon: Server,
    color: "text-success-600 bg-success-100 dark:bg-success-900/30",
  },
  Default: { icon: KeyRound, color: "text-default-500 bg-default-100" },
};

// ─── Small reusable field components ─────────────────────────────────────────

function Field({
  placeholder,
  type = "text",
  value,
  onChange,
  revealable = false,
  revealed = false,
  onToggleReveal,
  textarea = false,
}: {
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  revealable?: boolean;
  revealed?: boolean;
  onToggleReveal?: () => void;
  textarea?: boolean;
}) {
  const base =
    "w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3.5 flex items-start gap-3 border border-gray-100 dark:border-gray-800 focus-within:border-gray-300 dark:focus-within:border-gray-600 transition-colors";

  if (textarea) {
    return (
      <div className={base}>
        <textarea
          className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none font-mono"
          placeholder={placeholder}
          rows={5}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className={base + " items-center"}>
      <input
        className="bg-transparent border-none outline-none w-full text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
        placeholder={placeholder}
        type={revealable ? (revealed ? "text" : "password") : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {revealable && (
        <button
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0 focus:outline-none"
          type="button"
          onClick={onToggleReveal}
        >
          {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3.5 flex items-center justify-between border border-gray-100 dark:border-gray-800 focus:border-gray-300 dark:focus:border-gray-600 transition-colors cursor-pointer text-sm focus:outline-none"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={
            value
              ? "text-gray-900 dark:text-gray-100"
              : "text-gray-400 dark:text-gray-500"
          }
        >
          {value || placeholder || "Select..."}
        </span>
        <ChevronDown
          className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          size={16}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((o) => (
            <button
              key={o}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-between transition-colors focus:outline-none"
              type="button"
              onClick={() => {
                onChange(o);
                setIsOpen(false);
              }}
            >
              <span>{o}</span>
              {value === o && (
                <Check className="text-black dark:text-white" size={14} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

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

  // ── Tab ──────────────────────────────────────────────────────────────────
  const [vaultMode, setVaultMode] = useState<VaultMode>("api-key");

  // ── Shared ───────────────────────────────────────────────────────────────
  const [newName, setNewName] = useState("");

  // ── API Key ──────────────────────────────────────────────────────────────
  const [apiKey, setApiKey] = useState("");
  const [apiProvider, setApiProvider] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  // ── Login ─────────────────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginUrl, setLoginUrl] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);

  // ── SSH / Cert ────────────────────────────────────────────────────────────
  const [sshKeyType, setSshKeyType] = useState("");
  const [sshContent, setSshContent] = useState("");
  const [sshPassphrase, setSshPassphrase] = useState("");
  const [showSshPass, setShowSshPass] = useState(false);

  // ── Database ──────────────────────────────────────────────────────────────
  const [dbHost, setDbHost] = useState("");
  const [dbPort, setDbPort] = useState("");
  const [dbName, setDbName] = useState("");
  const [dbUser, setDbUser] = useState("");
  const [dbPassword, setDbPassword] = useState("");
  const [dbDialect, setDbDialect] = useState("");
  const [showDbPw, setShowDbPw] = useState(false);

  // ── OAuth ─────────────────────────────────────────────────────────────────
  const [oauthClientId, setOauthClientId] = useState("");
  const [oauthClientSecret, setOauthClientSecret] = useState("");
  const [oauthScopes, setOauthScopes] = useState("");
  const [oauthRedirectUri, setOauthRedirectUri] = useState("");
  const [showOauthSecret, setShowOauthSecret] = useState(false);

  // ── Cloud IAM ─────────────────────────────────────────────────────────────
  const [iamProvider, setIamProvider] = useState("");
  const [iamKeyId, setIamKeyId] = useState("");
  const [iamSecret, setIamSecret] = useState("");
  const [iamRegion, setIamRegion] = useState("");
  const [showIamSecret, setShowIamSecret] = useState(false);

  // ── Encryption Key ────────────────────────────────────────────────────────
  const [encAlgorithm, setEncAlgorithm] = useState("");
  const [encKeyValue, setEncKeyValue] = useState("");
  const [showEncKey, setShowEncKey] = useState(false);

  // ── Env / Config ──────────────────────────────────────────────────────────
  const [envContent, setEnvContent] = useState("");

  // ─────────────────────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setNewName("");
    setVaultMode("api-key");
    setApiKey("");
    setApiProvider("");
    setShowApiKey(false);
    setLoginEmail("");
    setLoginUsername("");
    setLoginPassword("");
    setLoginUrl("");
    setShowLoginPw(false);
    setSshKeyType("");
    setSshContent("");
    setSshPassphrase("");
    setShowSshPass(false);
    setDbHost("");
    setDbPort("");
    setDbName("");
    setDbUser("");
    setDbPassword("");
    setDbDialect("");
    setShowDbPw(false);
    setOauthClientId("");
    setOauthClientSecret("");
    setOauthScopes("");
    setOauthRedirectUri("");
    setShowOauthSecret(false);
    setIamProvider("");
    setIamKeyId("");
    setIamSecret("");
    setIamRegion("");
    setShowIamSecret(false);
    setEncAlgorithm("");
    setEncKeyValue("");
    setShowEncKey(false);
    setEnvContent("");
    setEditingSecretId(null);
    setSelectedSecretId(null);
  }, []);

  useEffect(() => {
    const handleOpenModal = () => resetForm();
    const handleSelectSecret = (e: any) => {
      setSelectedSecretId(e.detail);
      setRevealedIds(new Set());
    };

    window.addEventListener("open-vault-modal", handleOpenModal);
    window.addEventListener("select-secret", handleSelectSecret);

    return () => {
      window.removeEventListener("open-vault-modal", handleOpenModal);
      window.removeEventListener("select-secret", handleSelectSecret);
    };
  }, [resetForm]);

  const toggleReveal = (id: string) => {
    const s = new Set(revealedIds);

    s.has(id) ? s.delete(id) : s.add(id);
    setRevealedIds(s);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = (id: string) => {
    setSecrets(secrets.filter((s) => s.id !== id));
    if (selectedSecretId === id) setSelectedSecretId(null);
    window.dispatchEvent(
      new CustomEvent("delete-vault-secret", { detail: id }),
    );
  };

  const handleEditClick = (secret: SecretEntry) => {
    setEditingSecretId(secret.id);
    setNewName(secret.name);
    setSelectedSecretId(null);
  };

  // ── Serialize fields → effectiveKey based on mode ────────────────────────
  const buildEffectiveKey = (): string => {
    switch (vaultMode) {
      case "api-key":
        return JSON.stringify({ apiKey, provider: apiProvider });
      case "login":
        return JSON.stringify({
          email: loginEmail,
          username: loginUsername,
          password: loginPassword,
          url: loginUrl,
        });
      case "ssh":
        return JSON.stringify({
          keyType: sshKeyType,
          content: sshContent,
          passphrase: sshPassphrase,
        });
      case "database":
        return JSON.stringify({
          dialect: dbDialect,
          host: dbHost,
          port: dbPort,
          database: dbName,
          username: dbUser,
          password: dbPassword,
        });
      case "oauth":
        return JSON.stringify({
          clientId: oauthClientId,
          clientSecret: oauthClientSecret,
          scopes: oauthScopes,
          redirectUri: oauthRedirectUri,
        });
      case "cloud-iam":
        return JSON.stringify({
          provider: iamProvider,
          keyId: iamKeyId,
          secret: iamSecret,
          region: iamRegion,
        });
      case "encryption":
        return JSON.stringify({ algorithm: encAlgorithm, key: encKeyValue });
      case "env-config":
        return JSON.stringify({ content: envContent });
    }
  };

  const modeLabel =
    VAULT_TABS.find((t) => t.id === vaultMode)?.label ?? "Secret";

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error("Name is required");

      return;
    }
    if (vaultMode === "ssh" && !sshKeyType) {
      toast.error("Please select a key type");

      return;
    }
    if (vaultMode === "database" && !dbDialect) {
      toast.error("Please select a database dialect");

      return;
    }
    if (vaultMode === "cloud-iam" && !iamProvider) {
      toast.error("Please select an IAM provider");

      return;
    }
    if (vaultMode === "encryption" && !encAlgorithm) {
      toast.error("Please select an encryption algorithm");

      return;
    }
    const effectiveKey = buildEffectiveKey();
    const normalizedId = newName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    try {
      try {
        await axios.post(
          `${API_URL}/secret-manager/update`,
          { secretId: normalizedId, payload: effectiveKey },
          {
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {},
          },
        );
      } catch {
        console.warn("Backend unavailable — updating local state only.");
      }

      if (editingSecretId) {
        const updated = {
          id: editingSecretId,
          name: newName,
          service: modeLabel,
          key: effectiveKey,
          type: vaultMode,
        };

        setSecrets(
          secrets.map((s) =>
            s.id === editingSecretId ? { ...s, ...updated } : s,
          ),
        );
        window.dispatchEvent(
          new CustomEvent("update-vault-secret", { detail: updated }),
        );
        setSuccessMessage("Secret successfully updated!");
      } else {
        const entry: SecretEntry = {
          id: normalizedId,
          name: newName,
          service: modeLabel,
          key: effectiveKey,
          lastUsed: "Never",
          type: vaultMode,
        };

        setSecrets([entry, ...secrets]);
        window.dispatchEvent(
          new CustomEvent("update-vault-secret", { detail: entry }),
        );
        setSuccessMessage("Your new secret is now saved!");
      }
      setIsSuccessModalOpen(true);
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to store secret in Vault");
    }
  };

  const activeSecret = secrets.find((s) => s.id === selectedSecretId);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ChatBotLayout isRightSidebarOpenByDefault={false}>
      <div className="flex-1 overflow-hidden bg-transparent flex flex-col h-full font-sans">
        <div className="relative flex flex-1 w-full flex-col items-center justify-start pt-[30vh] overflow-hidden">
          <div className="flex w-full flex-col items-center gap-5 z-20 px-6">
            {/* ── Tab toggle navbar ── */}
            {!selectedSecretId && (
              <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between w-full bg-white dark:bg-[#161b22] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-1">
                  {VAULT_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      className={`py-2 px-3 rounded-xl text-[11px] font-semibold tracking-wide whitespace-nowrap transition-all duration-200 ${
                        vaultMode === tab.id
                          ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                          : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                      type="button"
                      onClick={() => setVaultMode(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Saved secret detail view ── */}
            <div className="flex w-full flex-col gap-4 max-w-2xl">
              {selectedSecretId ? (
                (() => {
                  const secret = activeSecret!;
                  const conf =
                    serviceConfig[secret.service] ?? serviceConfig.Default;
                  const ServiceIcon = conf.icon;
                  const isRevealed = revealedIds.has(secret.id);

                  return (
                    <div className="flex flex-col gap-4 w-full animate-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                      {/* Name row */}
                      <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <ServiceIcon className={conf.color} size={18} />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {secret.name}
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            {secret.service}
                          </span>
                        </div>
                        <button
                          className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors flex items-center gap-1.5"
                          onClick={() => handleEditClick(secret)}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                      </div>
                      {/* Key row */}
                      <div className="w-full bg-white dark:bg-[#161b22] shadow-sm rounded-xl px-4 py-3.5 flex items-center justify-between gap-3 border border-gray-100 dark:border-gray-800">
                        <span className="text-sm font-mono text-gray-900 dark:text-gray-100 truncate flex-1">
                          {isRevealed ? secret.key : "••••••••••••••••••••••••"}
                        </span>
                        <div className="flex gap-4 items-center shrink-0">
                          <button
                            className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors flex items-center gap-1.5"
                            onClick={() => handleCopy(secret.key)}
                          >
                            <Copy size={12} /> Copy
                          </button>
                          <button
                            className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors flex items-center gap-1.5"
                            onClick={() => toggleReveal(secret.id)}
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
                      {/* Delete */}
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
                })()
              ) : (
                /* ── New / Edit form ── */
                <div className="flex w-full flex-col gap-3 animate-in slide-in-from-bottom-4 duration-500 fill-mode-both">
                  {/* Shared: Name */}
                  <Field
                    placeholder="Name"
                    value={newName}
                    onChange={setNewName}
                  />

                  {/* ── API Key ── */}
                  {vaultMode === "api-key" && (
                    <>
                      <Field
                        placeholder="URL"
                        value={apiProvider}
                        onChange={setApiProvider}
                      />
                      <Field
                        revealable
                        placeholder="API Key"
                        revealed={showApiKey}
                        value={apiKey}
                        onChange={setApiKey}
                        onToggleReveal={() => setShowApiKey(!showApiKey)}
                      />
                    </>
                  )}

                  {/* ── Login ── */}
                  {vaultMode === "login" && (
                    <>
                      <Field
                        placeholder="URL (e.g. https://github.com)"
                        type="url"
                        value={loginUrl}
                        onChange={setLoginUrl}
                      />
                      <Field
                        placeholder="Email address"
                        type="email"
                        value={loginEmail}
                        onChange={setLoginEmail}
                      />
                      <Field
                        placeholder="Username (optional)"
                        value={loginUsername}
                        onChange={setLoginUsername}
                      />
                      <Field
                        revealable
                        placeholder="Password"
                        revealed={showLoginPw}
                        value={loginPassword}
                        onChange={setLoginPassword}
                        onToggleReveal={() => setShowLoginPw(!showLoginPw)}
                      />
                    </>
                  )}

                  {/* ── SSH / Cert ── */}
                  {vaultMode === "ssh" && (
                    <>
                      <Select
                        options={[
                          "SSH Private Key",
                          "SSL Certificate",
                          "GPG Key",
                          "Apple Certificate",
                          "Android Keystore",
                          "Code Signing Certificate",
                        ]}
                        placeholder="Select Type"
                        value={sshKeyType}
                        onChange={setSshKeyType}
                      />
                      <Field
                        revealable
                        textarea
                        placeholder="Paste key content here..."
                        revealed={false}
                        value={sshContent}
                        onChange={setSshContent}
                      />
                      <Field
                        revealable
                        placeholder="Passphrase (optional)"
                        revealed={showSshPass}
                        value={sshPassphrase}
                        onChange={setSshPassphrase}
                        onToggleReveal={() => setShowSshPass(!showSshPass)}
                      />
                    </>
                  )}

                  {/* ── Database ── */}
                  {vaultMode === "database" && (
                    <>
                      <Select
                        options={[
                          "PostgreSQL",
                          "MySQL",
                          "SQLite",
                          "MongoDB",
                          "Redis",
                          "MSSQL",
                          "Oracle",
                          "CockroachDB",
                          "Other",
                        ]}
                        placeholder="Select Dialect"
                        value={dbDialect}
                        onChange={setDbDialect}
                      />
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Field
                            placeholder="Host"
                            value={dbHost}
                            onChange={setDbHost}
                          />
                        </div>
                        <div className="w-28">
                          <Field
                            placeholder="Port"
                            type="number"
                            value={dbPort}
                            onChange={setDbPort}
                          />
                        </div>
                      </div>
                      <Field
                        placeholder="Database name"
                        value={dbName}
                        onChange={setDbName}
                      />
                      <Field
                        placeholder="Username"
                        value={dbUser}
                        onChange={setDbUser}
                      />
                      <Field
                        revealable
                        placeholder="Password"
                        revealed={showDbPw}
                        value={dbPassword}
                        onChange={setDbPassword}
                        onToggleReveal={() => setShowDbPw(!showDbPw)}
                      />
                    </>
                  )}

                  {/* ── OAuth ── */}
                  {vaultMode === "oauth" && (
                    <>
                      <Field
                        placeholder="Client ID"
                        value={oauthClientId}
                        onChange={setOauthClientId}
                      />
                      <Field
                        revealable
                        placeholder="Client Secret"
                        revealed={showOauthSecret}
                        value={oauthClientSecret}
                        onChange={setOauthClientSecret}
                        onToggleReveal={() =>
                          setShowOauthSecret(!showOauthSecret)
                        }
                      />
                      <Field
                        placeholder="Scopes (e.g. read:user, repo)"
                        value={oauthScopes}
                        onChange={setOauthScopes}
                      />
                      <Field
                        placeholder="Redirect URI (optional)"
                        type="url"
                        value={oauthRedirectUri}
                        onChange={setOauthRedirectUri}
                      />
                    </>
                  )}

                  {/* ── Cloud IAM ── */}
                  {vaultMode === "cloud-iam" && (
                    <>
                      <Select
                        options={[
                          "AWS",
                          "GCP",
                          "Azure",
                          "DigitalOcean",
                          "Oracle Cloud",
                          "Cloudflare",
                          "Other",
                        ]}
                        placeholder="Select Provider"
                        value={iamProvider}
                        onChange={setIamProvider}
                      />
                      <Field
                        placeholder={
                          iamProvider === "AWS"
                            ? "Access Key ID"
                            : iamProvider === "GCP"
                              ? "Service Account Email"
                              : iamProvider === "Azure"
                                ? "App (Client) ID"
                                : "Key ID"
                        }
                        value={iamKeyId}
                        onChange={setIamKeyId}
                      />
                      <Field
                        revealable
                        placeholder={
                          iamProvider === "AWS"
                            ? "Secret Access Key"
                            : iamProvider === "GCP"
                              ? "Private Key JSON"
                              : iamProvider === "Azure"
                                ? "Client Secret"
                                : "Secret Key"
                        }
                        revealed={showIamSecret}
                        value={iamSecret}
                        onChange={setIamSecret}
                        onToggleReveal={() => setShowIamSecret(!showIamSecret)}
                      />
                      <Field
                        placeholder="Region (e.g. us-east-1)"
                        value={iamRegion}
                        onChange={setIamRegion}
                      />
                    </>
                  )}

                  {/* ── Encryption Key ── */}
                  {vaultMode === "encryption" && (
                    <>
                      <Select
                        options={[
                          "AES-256",
                          "AES-128",
                          "RSA-2048",
                          "RSA-4096",
                          "HMAC-SHA256",
                          "JWT Secret",
                          "TOTP Seed",
                          "Ed25519",
                          "ChaCha20",
                          "Other",
                        ]}
                        placeholder="Select Algorithm"
                        value={encAlgorithm}
                        onChange={setEncAlgorithm}
                      />
                      <Field
                        revealable
                        placeholder="Key value"
                        revealed={showEncKey}
                        value={encKeyValue}
                        onChange={setEncKeyValue}
                        onToggleReveal={() => setShowEncKey(!showEncKey)}
                      />
                    </>
                  )}

                  {/* ── Env / Config ── */}
                  {vaultMode === "env-config" && (
                    <Field
                      textarea
                      placeholder={
                        "# Paste your .env content here\nDATABASE_URL=postgres://...\nNEXT_PUBLIC_API_URL=https://...\nSECRET_KEY=..."
                      }
                      value={envContent}
                      onChange={setEnvContent}
                    />
                  )}

                  {/* Save button */}
                  <button
                    className="w-full bg-black dark:bg-white shadow-sm rounded-xl px-4 py-3.5 flex items-center justify-center font-medium text-sm text-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 transition-all mt-1"
                    onClick={handleSave}
                  >
                    {editingSecretId
                      ? `Update ${modeLabel}`
                      : `Save ${modeLabel}`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
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
                  className="w-[calc(50%-0.5px)] h-12 rounded-none border-none text-default-800 dark:text-default-200 font-normal hover:bg-default-100/50 text-[15px]"
                  variant="light"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <div className="w-[1px] h-12 bg-[#E5E5EA] dark:bg-[#2C2C2E] shrink-0" />
                <Button
                  className="w-[calc(50%-0.5px)] h-12 rounded-none border-none text-danger font-normal hover:bg-default-100/50 text-[15px]"
                  variant="light"
                  onPress={() => {
                    if (secretToDelete) handleDelete(secretToDelete);
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

      {/* ── Success modal ── */}
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
                  Saved
                </h3>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-500 dark:text-default-400 text-[13px] leading-snug text-center w-full">
                  {successMessage}
                </p>
              </ModalBody>
              <ModalFooter className="p-0 m-0 border-t border-[#E5E5EA] dark:border-[#2C2C2E] flex w-full bg-transparent min-h-0">
                <Button
                  className="w-full h-12 rounded-none border-none text-primary font-normal hover:bg-default-100/50 text-[15px]"
                  variant="light"
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
