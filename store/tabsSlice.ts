import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WorkspaceTab {
  id: string; // Unique tab ID
  title: string; // Tab title (e.g. project name)
  projectPath: string; // Path or slug of project
  activeView: string; // e.g. "/chat", "/code", "/database"
  chatSessionId: string | null; // Selected chat inside this tab
  mode?: "chat" | "code" | "create" | "cowork"; // Optional mode
}

interface TabsState {
  tabs: WorkspaceTab[];
  activeWorkspaceId: string | null;
  activeTabIds: {
    chat: string | null;
    code: string | null;
    create: string | null;
    cowork: string | null;
  };
}

const initialState: TabsState = {
  tabs: [
    {
      id: "tab-inso-code-studio",
      title: "Inso Code",
      projectPath: "inso-code",
      activeView: "/code",
      chatSessionId: null,
      mode: "code",
    },
    {
      id: "tab-inso-tech",
      title: "Inso Tech",
      projectPath: "inso-tech",
      activeView: "/code",
      chatSessionId: null,
      mode: "code",
    },
    {
      id: "tab-stoneroc",
      title: "Stoneroc",
      projectPath: "stoneroc",
      activeView: "/code",
      chatSessionId: null,
      mode: "code",
    },
    {
      id: "tab-research-lab",
      title: "Research Lab",
      projectPath: "research-lab",
      activeView: "/chat",
      chatSessionId: null,
      mode: "chat",
    },
    {
      id: "tab-design-studio",
      title: "Design Studio",
      projectPath: "design-studio",
      activeView: "/create",
      chatSessionId: null,
      mode: "create",
    },
    {
      id: "tab-agent-swarm",
      title: "Agent Swarm",
      projectPath: "agent-swarm",
      activeView: "/cowork",
      chatSessionId: null,
      mode: "cowork",
    },
  ],
  activeWorkspaceId: "tab-inso-code-studio",
  activeTabIds: {
    chat: "tab-research-lab",
    code: "tab-inso-code-studio",
    create: "tab-design-studio",
    cowork: "tab-agent-swarm",
  },
};

export const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<Omit<WorkspaceTab, "id">>) => {
      // Check if a tab with the same projectPath is already open
      const existingTab = state.tabs.find(
        (t) =>
          t.projectPath === action.payload.projectPath &&
          t.mode === action.payload.mode,
      );

      if (existingTab) {
        if (existingTab.mode) {
          state.activeTabIds[existingTab.mode] = existingTab.id;
        }

        return;
      }

      const newId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTab: WorkspaceTab = {
        ...action.payload,
        id: newId,
      };

      state.tabs.unshift(newTab);
      if (action.payload.mode) {
        state.activeTabIds[action.payload.mode] = newId;
      }
    },
    removeTab: (state, action: PayloadAction<string>) => {
      const tabIdToRemove = action.payload;
      const tabToRemove = state.tabs.find((t) => t.id === tabIdToRemove);
      const tabIndex = state.tabs.findIndex((t) => t.id === tabIdToRemove);

      if (tabIndex === -1 || !tabToRemove) return;

      // Filter out the tab
      state.tabs = state.tabs.filter((t) => t.id !== tabIdToRemove);

      // If we closed the active tab, we need to activate another one in the same mode
      if (
        tabToRemove.mode &&
        state.activeTabIds[tabToRemove.mode] === tabIdToRemove
      ) {
        const remainingModeTabs = state.tabs.filter(
          (t) => t.mode === tabToRemove.mode,
        );

        if (remainingModeTabs.length > 0) {
          state.activeTabIds[tabToRemove.mode] =
            remainingModeTabs[Math.max(0, remainingModeTabs.length - 1)].id;
        } else {
          state.activeTabIds[tabToRemove.mode] = null;
        }
      }
    },
    setActiveTab: (
      state,
      action: PayloadAction<{
        id: string | null;
        mode: "chat" | "code" | "create" | "cowork";
      }>,
    ) => {
      state.activeTabIds[action.payload.mode] = action.payload.id;
      if (action.payload.id) {
        state.activeWorkspaceId = action.payload.id;
      }
    },
    setActiveWorkspaceTab: (state, action: PayloadAction<string | null>) => {
      state.activeWorkspaceId = action.payload;
    },
    updateTabContext: (
      state,
      action: PayloadAction<{
        id: string;
        chatSessionId?: string | null;
        activeView?: string;
        title?: string;
      }>,
    ) => {
      const tab = state.tabs.find((t) => t.id === action.payload.id);

      if (tab) {
        if (action.payload.chatSessionId !== undefined) {
          tab.chatSessionId = action.payload.chatSessionId;
        }
        if (action.payload.activeView !== undefined) {
          tab.activeView = action.payload.activeView;
        }
        if (action.payload.title !== undefined) {
          tab.title = action.payload.title;
        }
      }
    },
  },
});

export const {
  addTab,
  removeTab,
  setActiveTab,
  setActiveWorkspaceTab,
  updateTabContext,
} = tabsSlice.actions;
export default tabsSlice.reducer;
