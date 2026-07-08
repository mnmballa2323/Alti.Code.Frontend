import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  geminiApiKey: string;
  githubToken: string;
  defaultModel: string;
  telemetryLevel: "standard" | "verbose";
  openClawEnabled: boolean;


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
