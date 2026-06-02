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
  addDocument,
  updateDocument,
  removeDocument,
  toggleDocument,
  setActiveWorkspace,
} = systemSlice.actions;
export const systemController = systemSlice; // Consistent naming
export default systemSlice.reducer;
