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
  gcpProjectId: string;
  gcpClientEmail: string;
  gcpPrivateKey: string;

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
  setGcpProjectId: (projectId: string) => void;
  setGcpClientEmail: (email: string) => void;
  setGcpPrivateKey: (key: string) => void;

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
      gcpProjectId: "",
      gcpClientEmail: "",
      gcpPrivateKey: "",

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
      setGcpProjectId: (projectId) => set({ gcpProjectId: projectId }),
      setGcpClientEmail: (email) => set({ gcpClientEmail: email }),
      setGcpPrivateKey: (key) => set({ gcpPrivateKey: key }),

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
