import { create } from "zustand";

interface TerminalState {
  isOpen: boolean;
  activeCommand: string;
  history: string[];
  toggleTerminal: () => void;
  executeCommand: (cmd: string) => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
  isOpen: false,
  activeCommand: "",
  history: [],
  toggleTerminal: () => set((state) => ({ isOpen: !state.isOpen })),
  executeCommand: (cmd) =>
    set((state) => ({
      activeCommand: cmd,
      history: [...state.history, cmd],
    })),
}));
