import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isGhostEditorOpen: boolean;
  editorContent: string;
  editorLanguage: string;
  editorTitle: string;
  activeMemberName: string | null;
  searchQuery: string;
}

const initialState: UIState = {
  isGhostEditorOpen: false,
  editorContent:
    "// Inso Ghost Editor v1.0.0\n// Industrial Code Orchestration Active.",
  editorLanguage: "javascript",
  editorTitle: "Inso Sentinel - Code View",
  activeMemberName: null,
  searchQuery: "",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleGhostEditor: (state) => {
      state.isGhostEditorOpen = !state.isGhostEditorOpen;
    },
    setGhostEditorContent: (state, action: PayloadAction<string>) => {
      state.editorContent = action.payload;
    },
    setGhostEditorLanguage: (state, action: PayloadAction<string>) => {
      state.editorLanguage = action.payload;
    },
    setGhostEditorTitle: (state, action: PayloadAction<string>) => {
      state.editorTitle = action.payload;
    },
    openGhostEditor: (state) => {
      state.isGhostEditorOpen = true;
    },
    closeGhostEditor: (state) => {
      state.isGhostEditorOpen = false;
    },
    setActiveMemberName: (state, action: PayloadAction<string | null>) => {
      state.activeMemberName = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  toggleGhostEditor,
  setGhostEditorContent,
  setGhostEditorLanguage,
  setGhostEditorTitle,
  openGhostEditor,
  closeGhostEditor,
  setActiveMemberName,
  setSearchQuery,
} = uiSlice.actions;

export default uiSlice.reducer;
