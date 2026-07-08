import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WorkspaceTab {
  id: string; // Unique tab ID
  title: string; // Tab title (e.g. project name)
  projectPath: string; // Path or slug of project
  activeView: string; // e.g. "/chat", "/code", "/database"
  chatSessionId: string | null; // Selected chat inside this tab
}

interface TabsState {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
}

const initialState: TabsState = {
  tabs: [
    {
      id: "default-tab",
      title: "alti.code.studio",
      projectPath: "alti.code.studio",
      activeView: "/chat",
      chatSessionId: null,
    },
    ...Array.from({ length: 29 }).map((_, i) => ({
      id: `mock-tab-${i}`,
      title: `workspace-service-${i + 1}`,
      projectPath: `workspace-service-${i + 1}`,
      activeView: "/chat",
      chatSessionId: null,
    })),
  ],
  activeTabId: "default-tab",
};

export const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    addTab: (state, action: PayloadAction<Omit<WorkspaceTab, "id">>) => {
      // Check if a tab with the same projectPath is already open
      const existingTab = state.tabs.find(
        (t) => t.projectPath === action.payload.projectPath,
      );

      if (existingTab) {
        state.activeTabId = existingTab.id;

        return;
      }

      const newId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTab: WorkspaceTab = {
        ...action.payload,
        id: newId,
      };

      state.tabs.push(newTab);
      state.activeTabId = newId;
    },
    removeTab: (state, action: PayloadAction<string>) => {
      const tabIdToRemove = action.payload;
      const tabIndex = state.tabs.findIndex((t) => t.id === tabIdToRemove);

      if (tabIndex === -1) return;

      // Filter out the tab
      state.tabs = state.tabs.filter((t) => t.id !== tabIdToRemove);

      // If we closed the active tab, we need to activate another one
      if (state.activeTabId === tabIdToRemove) {
        if (state.tabs.length > 0) {
          // Activate the tab at the same index, or the last tab
          const newActiveIndex = Math.min(tabIndex, state.tabs.length - 1);

          state.activeTabId = state.tabs[newActiveIndex].id;
        } else {
          state.activeTabId = null;
        }
      }
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTabId = action.payload;
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

export const { addTab, removeTab, setActiveTab, updateTabContext } =
  tabsSlice.actions;
export default tabsSlice.reducer;
