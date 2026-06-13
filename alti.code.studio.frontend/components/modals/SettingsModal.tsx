"use client";

import React, { useEffect } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  Input,
  Select,
  SelectItem,
  Divider,
  cn,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";

import { useModalStore } from "@/store/useModalStore";
import { useSettingsStore } from "@/store/useSettingsStore";

const SettingsModal = () => {
  const { theme, setTheme } = useTheme();
  const { isOpen, onClose } = useModalStore();
  const {
    geminiApiKey,
    githubToken,
    defaultModel,
    telemetryLevel,
    openClawEnabled,
    editorFontSize,
    editorWordWrap,
    editorMinimap,
    editorVimMode,
    maxConcurrentAgents,
    agentTimeoutSecs,

    // Vault-bound credentials
    azureEndpoint,
    azureApiKey,
    gcpProjectId,
    gcpClientEmail,
    gcpPrivateKey,

    setGeminiApiKey,
    setGithubToken,
    setDefaultModel,
    setTelemetryLevel,
    setOpenClawEnabled,
    setAzureEndpoint,
    setAzureApiKey,
    setGcpProjectId,
    setGcpClientEmail,
    setGcpPrivateKey,
    setEditorFontSize,
    setEditorWordWrap,
    setEditorMinimap,
    setEditorVimMode,
    setMaxConcurrentAgents,
    setAgentTimeoutSecs,
  } = useSettingsStore();

  // Load masked keys from secure backend Vault database on modal open
  useEffect(() => {
    const loadVaultKeys = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${apiUrl}/vault/keys`);
        const responseData = await res.json();

        if (responseData?.success && responseData?.data) {
          const keys = responseData.data;

          if (keys.geminiApiKey) setGeminiApiKey(keys.geminiApiKey);
          if (keys.azureEndpoint) setAzureEndpoint(keys.azureEndpoint);
          if (keys.azureApiKey) setAzureApiKey(keys.azureApiKey);
          if (keys.gcpProjectId) setGcpProjectId(keys.gcpProjectId);
          if (keys.gcpClientEmail) setGcpClientEmail(keys.gcpClientEmail);
          if (keys.gcpPrivateKey) setGcpPrivateKey(keys.gcpPrivateKey);
        }
      } catch (e) {
        console.error("Failed to load keys from Vault:", e);
      }
    };

    if (isOpen) {
      loadVaultKeys();
    }
  }, [
    isOpen,
    setGeminiApiKey,
    setAzureEndpoint,
    setAzureApiKey,
    setGcpProjectId,
    setGcpClientEmail,
    setGcpPrivateKey,
  ]);

  const handleSave = async () => {
    // POST raw keys securely to backend Tink-encrypted Vault
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

      await fetch(`${apiUrl}/vault/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          geminiApiKey,
          azureEndpoint,
          azureApiKey,
          gcpProjectId,
          gcpClientEmail,
          gcpPrivateKey,
        }),
      });
    } catch (e) {
      console.error("Failed to sync keys to Vault:", e);
    }
    onClose();
  };

  const changeTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <div>
      {/* Settings Modal */}
      <Modal
        classNames={{
          base: "dark:bg-default-100 bg-white",
          header: "border-b dark:border-default-200 border-gray-200",
          body: "py-6",
          footer: "border-t dark:border-default-200 border-gray-200",
        }}
        isOpen={isOpen}
        placement="center"
        scrollBehavior="inside"
        size="2xl"
        onOpenChange={onClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="dark:text-white text-black text-xl font-semibold">
                    Platform Settings
                  </span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-8">
                  {/* Appearance Section */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                      Appearance
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="dark:text-white text-black font-medium">
                          Theme
                        </span>
                        <span className="dark:text-default-400 text-gray-500 text-sm">
                          Switch between light and dark theme.
                        </span>
                      </div>
                      <Switch
                        classNames={{
                          base: cn(
                            "inline-flex flex-row-reverse bg-content1",
                            "items-center justify-between cursor-pointer rounded-lg",
                          ),
                          wrapper: "p-0 h-4 overflow-visible",
                          thumb: cn(
                            "w-6 h-6 border-2 shadow-lg",
                            "group-data-[hover=true]:border-primary",
                            "group-data-[selected=true]:ml-6",
                            "group-data-[pressed=true]:w-7",
                            "group-data-[selected]:group-data-[pressed]:ml-4",
                          ),
                        }}
                        endContent={<Icon icon="solar:moon-bold" width={16} />}
                        isSelected={theme === "dark"}
                        startContent={<Icon icon="solar:sun-bold" width={16} />}
                        onValueChange={changeTheme}
                      />
                    </div>
                  </div>

                  <Divider />

                  {/* IDE & Editor Preferences Section */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                      IDE Editor Preferences
                    </h3>

                    <Input
                      label="Editor Font Size"
                      placeholder="14"
                      type="number"
                      value={editorFontSize.toString()}
                      variant="bordered"
                      onValueChange={(val) =>
                        setEditorFontSize(Number(val) || 14)
                      }
                    />

                    <div className="flex items-center justify-between mt-2">
                      <span className="dark:text-white text-black font-medium text-sm">
                        Enable Word Wrap
                      </span>
                      <Switch
                        color="primary"
                        isSelected={editorWordWrap}
                        size="sm"
                        onValueChange={setEditorWordWrap}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="dark:text-white text-black font-medium text-sm">
                        Show Minimap
                      </span>
                      <Switch
                        color="primary"
                        isSelected={editorMinimap}
                        size="sm"
                        onValueChange={setEditorMinimap}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="dark:text-white text-black font-medium text-sm">
                        Vim Keybindings
                      </span>
                      <Switch
                        color="warning"
                        isSelected={editorVimMode}
                        size="sm"
                        onValueChange={setEditorVimMode}
                      />
                    </div>
                  </div>

                  <Divider />

                  {/* API Keys & Secure Vault Section */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                      Cloud Providers & Secure Keys (Vault)
                    </h3>

                    <div className="text-xs text-gray-500 mb-2">
                      All keys and credentials are encrypted at-rest inside our
                      local PostgreSQL secure Vault utilizing field-level
                      military-grade Tink AEAD encryption.
                    </div>


                    <Input
                      label="Gemini API Key"
                      placeholder="AIzaSy..."
                      type="password"
                      value={geminiApiKey}
                      variant="bordered"
                      onValueChange={setGeminiApiKey}
                    />
                    <Input
                      label="GitHub Personal Access Token"
                      placeholder="ghp_..."
                      type="password"
                      value={githubToken}
                      variant="bordered"
                      onValueChange={setGithubToken}
                    />

                    <Divider className="my-2" />

                    <div className="text-xs font-semibold text-gray-400">
                      Azure OpenAI Foundry
                    </div>
                    <Input
                      label="Azure Endpoint URL"
                      placeholder="https://myendpoint.openai.azure.com"
                      type="text"
                      value={azureEndpoint}
                      variant="bordered"
                      onValueChange={setAzureEndpoint}
                    />
                    <Input
                      label="Azure API Key"
                      placeholder="Azure API Key..."
                      type="password"
                      value={azureApiKey}
                      variant="bordered"
                      onValueChange={setAzureApiKey}
                    />

                    <Divider className="my-2" />

                    <div className="text-xs font-semibold text-gray-400">
                      Google Vertex AI (Enterprise)
                    </div>
                    <Input
                      label="GCP Project ID"
                      placeholder="my-gcp-project-123"
                      type="text"
                      value={gcpProjectId}
                      variant="bordered"
                      onValueChange={setGcpProjectId}
                    />
                    <Input
                      label="GCP Client Email"
                      placeholder="sa@my-gcp-project.iam.gserviceaccount.com"
                      type="email"
                      value={gcpClientEmail}
                      variant="bordered"
                      onValueChange={setGcpClientEmail}
                    />
                    <Input
                      label="GCP Private Key"
                      placeholder="-----BEGIN PRIVATE KEY-----..."
                      type="password"
                      value={gcpPrivateKey}
                      variant="bordered"
                      onValueChange={setGcpPrivateKey}
                    />
                  </div>

                  <Divider />

                  {/* AI Model Preferences Section */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                      AI Preferences
                    </h3>
                    <Select
                      label="Default LLM Model"
                      placeholder="Select a default model"
                      selectedKeys={[defaultModel]}
                      variant="bordered"
                      onChange={(e) => setDefaultModel(e.target.value)}
                    >
                      <SelectItem key="gemini-3.1-pro">
                        Gemini 3.1 Pro
                      </SelectItem>
                      <SelectItem key="gemini-3.1-flash">
                        Gemini 3.1 Flash
                      </SelectItem>
                      <SelectItem key="gpt-4o">GPT-4o (Direct)</SelectItem>
                      <SelectItem key="gpt-4">GPT-4 (Direct)</SelectItem>
                      <SelectItem key="azure/gpt-4o">
                        GPT-4o (Azure Foundry)
                      </SelectItem>
                      <SelectItem key="claude-3-5-sonnet-20241022">
                        Claude 3.5 Sonnet
                      </SelectItem>
                      <SelectItem key="mistral-large-latest">
                        Mistral Large 2
                      </SelectItem>
                    </Select>
                  </div>

                  <Divider />

                  {/* Swarm & Agent Limits Section */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                      Swarm Engine Limits
                    </h3>
                    <Input
                      description="Hard cap on fan-out execution threads."
                      label="Max Concurrent Agents"
                      placeholder="10"
                      type="number"
                      value={maxConcurrentAgents.toString()}
                      variant="bordered"
                      onValueChange={(val) =>
                        setMaxConcurrentAgents(Number(val) || 10)
                      }
                    />
                    <Input
                      description="Circuit breaker trip threshold per autonomous task."
                      label="Agent Timeout (Seconds)"
                      placeholder="30"
                      type="number"
                      value={agentTimeoutSecs.toString()}
                      variant="bordered"
                      onValueChange={(val) =>
                        setAgentTimeoutSecs(Number(val) || 30)
                      }
                    />
                  </div>

                  <Divider />

                  {/* Telemetry & Execution Section */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                      Telemetry & Local Exec
                    </h3>
                    <Select
                      label="Telemetry Logging Level"
                      placeholder="Select logging level"
                      selectedKeys={[telemetryLevel]}
                      variant="bordered"
                      onChange={(e) =>
                        setTelemetryLevel(
                          e.target.value as "standard" | "verbose",
                        )
                      }
                    >
                      <SelectItem key="standard">
                        Standard (Safe logs only)
                      </SelectItem>
                      <SelectItem key="verbose">
                        Verbose (Includes AST execution contexts)
                      </SelectItem>
                    </Select>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-col gap-1">
                        <span className="dark:text-white text-black font-medium">
                          OpenClaw Native Execution
                        </span>
                        <span className="dark:text-default-400 text-gray-500 text-sm">
                          Allow agents to execute terminal proxy commands
                          locally via the OpenClaw Surrogate Daemon.
                        </span>
                      </div>
                      <Switch
                        classNames={{
                          base: cn(
                            "inline-flex flex-row-reverse bg-content1",
                            "items-center justify-between cursor-pointer rounded-lg",
                          ),
                          wrapper: "p-0 h-4 overflow-visible",
                          thumb: cn(
                            "w-6 h-6 border-2 shadow-lg",
                            "group-data-[hover=true]:border-primary",
                            "group-data-[selected=true]:ml-6",
                            "group-data-[pressed=true]:w-7",
                            "group-data-[selected]:group-data-[pressed]:ml-4",
                          ),
                        }}
                        color="primary"
                        isSelected={openClawEnabled}
                        onValueChange={(isSelected) =>
                          setOpenClawEnabled(isSelected)
                        }
                      />
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                  onPress={handleSave}
                >
                  Save & Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SettingsModal;
