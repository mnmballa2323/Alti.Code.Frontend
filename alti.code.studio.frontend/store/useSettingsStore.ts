import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  geminiApiKey: string;
  githubToken: string;
  defaultModel: string;
  telemetryLevel: "standard" | "verbose";
  openClawEnabled: boolean;

  // New secure Vault database credentials
  azureEndpoint: string;
  azureApiKey: string;
  azureSovereignTenantId: string;
  azureSovereignClientId: string;
  azureSovereignClientSecret: string;

  // IDE & Editor Preferences
  editorFontSize: number;
  editorWordWrap: boolean;
  editorMinimap: boolean;
  editorVimMode: boolean;

  // Swarm & Agent Limits
  maxConcurrentAgents: number;
  agentTimeoutSecs: number;

  setGeminiApiKey: (key: string) => void;
  setGithubToken: (key: string) => void;
  setDefaultModel: (model: string) => void;
  setTelemetryLevel: (level: "standard" | "verbose") => void;
  setOpenClawEnabled: (enabled: boolean) => void;

  setAzureEndpoint: (endpoint: string) => void;
  setAzureApiKey: (key: string) => void;
  setAzureSovereignTenantId: (projectId: string) => void;
  setAzureSovereignClientId: (email: string) => void;
  setAzureSovereignClientSecret: (key: string) => void;

  setEditorFontSize: (size: number) => void;
  setEditorWordWrap: (enabled: boolean) => void;
  setEditorMinimap: (enabled: boolean) => void;
  setEditorVimMode: (enabled: boolean) => void;
  setMaxConcurrentAgents: (max: number) => void;
  setAgentTimeoutSecs: (secs: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      geminiApiKey: "",
      githubToken: "",
      defaultModel: "",
      telemetryLevel: "standard",
      openClawEnabled: false,

      // Defaults for Vault credentials
      azureEndpoint: "",
      azureApiKey: "",
      azureSovereignTenantId: "",
      azureSovereignClientId: "",
      azureSovereignClientSecret: "",

      editorFontSize: 14,
      editorWordWrap: true,
      editorMinimap: true,
      editorVimMode: false,
      maxConcurrentAgents: 10,
      agentTimeoutSecs: 30,

      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setGithubToken: (key) => set({ githubToken: key }),
      setDefaultModel: (model) => set({ defaultModel: model }),
      setTelemetryLevel: (level) => set({ telemetryLevel: level }),
      setOpenClawEnabled: (enabled) => set({ openClawEnabled: enabled }),

      setAzureEndpoint: (endpoint) => set({ azureEndpoint: endpoint }),
      setAzureApiKey: (key) => set({ azureApiKey: key }),
      setAzureSovereignTenantId: (projectId) => set({ azureSovereignTenantId: projectId }),
      setAzureSovereignClientId: (email) => set({ azureSovereignClientId: email }),
      setAzureSovereignClientSecret: (key) => set({ azureSovereignClientSecret: key }),

      setEditorFontSize: (size) => set({ editorFontSize: size }),
      setEditorWordWrap: (enabled) => set({ editorWordWrap: enabled }),
      setEditorMinimap: (enabled) => set({ editorMinimap: enabled }),
      setEditorVimMode: (enabled) => set({ editorVimMode: enabled }),
      setMaxConcurrentAgents: (max) => set({ maxConcurrentAgents: max }),
      setAgentTimeoutSecs: (secs) => set({ agentTimeoutSecs: secs }),
    }),
    {
      name: "inso-settings-storage",
    },
  ),
);
