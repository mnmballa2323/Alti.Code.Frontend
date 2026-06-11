import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isGhostEditorOpen: boolean;
  editorContent: string;
  editorLanguage: string;
  editorTitle: string;
  activeMemberName: string | null;
}

const initialState: UIState = {
  isGhostEditorOpen: false,
  editorContent:
    "// Inso Ghost Editor v1.0.0\n// Industrial Code Orchestration Active.",
  editorLanguage: "javascript",
  editorTitle: "Inso Sentinel - Code View",
  activeMemberName: null,
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
} = uiSlice.actions;

export default uiSlice.reducer;
