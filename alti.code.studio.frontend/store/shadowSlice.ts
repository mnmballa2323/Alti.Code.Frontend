import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ShadowState {
  isEnabled: boolean;
  isInitializing: boolean;
  status: "idle" | "running" | "committed" | "error";
  lastRunResult: any | null;
}

const initialState: ShadowState = {
  isEnabled: false, // Default to production (safe)
  isInitializing: false,
  status: "idle",
  lastRunResult: null,
};

export const shadowSlice = createSlice({
  name: "shadow",
  initialState,
  reducers: {
    toggleShadowMode: (state) => {
      state.isEnabled = !state.isEnabled;
    },
    setShadowMode: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },
    setShadowStatus: (state, action: PayloadAction<ShadowState["status"]>) => {
      state.status = action.payload;
    },
    setLastRunResult: (state, action: PayloadAction<any>) => {
      state.lastRunResult = action.payload;
    },
  },
});

export const {
  toggleShadowMode,
  setShadowMode,
  setShadowStatus,
  setLastRunResult,
} = shadowSlice.actions;

export default shadowSlice.reducer;
