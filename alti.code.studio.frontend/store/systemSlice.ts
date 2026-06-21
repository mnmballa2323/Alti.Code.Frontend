import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SystemLog {
  id: string;
  source: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
}

export interface RepositoryRule {
  id: string;
  url: string;
  name: string;
  licenseType: string;
  customInstructions: string;
  guardrails: string;
  isActive: boolean;
}

export interface ApiRule {
  id: string;
  url: string;
  name: string;
  licenseType: string;
  customInstructions: string;
  guardrails: string;
  isActive: boolean;
}

export interface SdkRule {
  id: string;
  url: string;
  name: string;
  licenseType: string;
  customInstructions: string;
  guardrails: string;
  isActive: boolean;
}

export interface DocumentRule {
  id: string;
  url: string;
  name: string;
  apiKey: string;
  customInstructions: string;
  guardrails: string;
  isActive: boolean;
}

export interface AgentStatus {
  id: string;
  name: string;
  agentName?: string;
  status: "idle" | "watching" | "active" | "error";
  task: string;
  capabilities?: string[];
}

interface SystemState {
  logs: SystemLog[];
  agents: AgentStatus[];
  connectedClouds: string[];
  repositories: RepositoryRule[];
  documents: DocumentRule[];
  apis: ApiRule[];
  sdks: SdkRule[];
  activeWorkspace: string | null;
}

const initialState: SystemState = {
  logs: [],
  agents: [
    {
      id: "guardian",
      name: "Guardian Agent",
      status: "idle",
      task: "Connecting...",
    },
    {
      id: "synapse",
      name: "Synapse (A2A)",
      status: "idle",
      task: "Connecting...",
    },
    {
      id: "mcp",
      name: "Universe (MCP)",
      status: "idle",
      task: "Connecting...",
    },
  ],
  connectedClouds: [],
  repositories: [],
  documents: [],
  apis: [],
  sdks: [],
  activeWorkspace: "alti.code.studio",
};

export const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    addLog: (
      state,
      action: PayloadAction<Omit<SystemLog, "id" | "timestamp">>,
    ) => {
      const newLog = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
      };

      // Keep only last 100 logs
      state.logs = [newLog, ...state.logs].slice(0, 100);
    },
    updateAgentStatus: (state, action: PayloadAction<AgentStatus>) => {
      const index = state.agents.findIndex((a) => a.id === action.payload.id);

      if (index !== -1) {
        state.agents[index] = action.payload;
      } else {
        state.agents.push(action.payload);
      }
    },
    setAgents: (state, action: PayloadAction<AgentStatus[]>) => {
      state.agents = action.payload;
    },
    connectCloud: (state, action: PayloadAction<string>) => {
      if (!state.connectedClouds.includes(action.payload)) {
        state.connectedClouds.push(action.payload);
      }
    },
    disconnectCloud: (state, action: PayloadAction<string>) => {
      state.connectedClouds = state.connectedClouds.filter(
        (c) => c !== action.payload,
      );
    },
    addRepository: (
      state,
      action: PayloadAction<Omit<RepositoryRule, "id">>,
    ) => {
      state.repositories.push({
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
      });
    },
    updateRepository: (state, action: PayloadAction<RepositoryRule>) => {
      const index = state.repositories.findIndex(
        (r) => r.id === action.payload.id,
      );

      if (index !== -1) {
        state.repositories[index] = action.payload;
      }
    },
    removeRepository: (state, action: PayloadAction<string>) => {
      state.repositories = state.repositories.filter(
        (r) => r.id !== action.payload,
      );
    },
    toggleRepository: (state, action: PayloadAction<string>) => {
      const repo = state.repositories.find((r) => r.id === action.payload);

      if (repo) {
        repo.isActive = !repo.isActive;
      }
    },
    addApi: (state, action: PayloadAction<Omit<ApiRule, "id">>) => {
      state.apis.push({
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
      });
    },
    updateApi: (state, action: PayloadAction<ApiRule>) => {
      const index = state.apis.findIndex((r) => r.id === action.payload.id);

      if (index !== -1) {
        state.apis[index] = action.payload;
      }
    },
    removeApi: (state, action: PayloadAction<string>) => {
      state.apis = state.apis.filter((r) => r.id !== action.payload);
    },
    toggleApi: (state, action: PayloadAction<string>) => {
      const api = state.apis.find((r) => r.id === action.payload);

      if (api) {
        api.isActive = !api.isActive;
      }
    },
    addSdk: (state, action: PayloadAction<Omit<SdkRule, "id">>) => {
      state.sdks.push({
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
      });
    },
    updateSdk: (state, action: PayloadAction<SdkRule>) => {
      const index = state.sdks.findIndex((r) => r.id === action.payload.id);

      if (index !== -1) {
        state.sdks[index] = action.payload;
      }
    },
    removeSdk: (state, action: PayloadAction<string>) => {
      state.sdks = state.sdks.filter((r) => r.id !== action.payload);
    },
    toggleSdk: (state, action: PayloadAction<string>) => {
      const sdk = state.sdks.find((r) => r.id === action.payload);

      if (sdk) {
        sdk.isActive = !sdk.isActive;
      }
    },
    addDocument: (state, action: PayloadAction<Omit<DocumentRule, "id">>) => {
      state.documents.push({
        ...action.payload,
        id:
          "doc-" +
          Date.now().toString() +
          "-" +
          Math.random().toString(36).substr(2, 9),
      });
    },
    updateDocument: (state, action: PayloadAction<DocumentRule>) => {
      const index = state.documents.findIndex(
        (r) => r.id === action.payload.id,
      );

      if (index !== -1) {
        state.documents[index] = action.payload;
      }
    },
    removeDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter((r) => r.id !== action.payload);
    },
    toggleDocument: (state, action: PayloadAction<string>) => {
      const doc = state.documents.find((r) => r.id === action.payload);

      if (doc) {
        doc.isActive = !doc.isActive;
      }
    },
    setActiveWorkspace: (state, action: PayloadAction<string>) => {
      state.activeWorkspace = action.payload;
    },
  },
});

export const {
  addLog,
  updateAgentStatus,
  setAgents,
  connectCloud,
  disconnectCloud,
  addRepository,
  updateRepository,
  removeRepository,
  toggleRepository,
  addApi,
  updateApi,
  removeApi,
  toggleApi,
  addSdk,
  updateSdk,
  removeSdk,
  toggleSdk,
  addDocument,
  updateDocument,
  removeDocument,
  toggleDocument,
  setActiveWorkspace,
} = systemSlice.actions;
export const systemController = systemSlice; // Consistent naming
export default systemSlice.reducer;
