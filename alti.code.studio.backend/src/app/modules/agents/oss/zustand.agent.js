import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Zustand OSS Specialist
 * Repository: https://github.com/pmndrs/zustand
 * Stars: ~47k | Language: TypeScript
 */
class ZustandOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Zustand_Oss_Expert';
    this.description = 'Deep expert in Zustand — A small, fast, and scalable bearbones state-management solution.';
    this.preamble = `You are a world-class React Frontend Engineer with expert-level mastery of Zustand.

CORE CONCEPTS:
- Zustand is a blazing fast, minimalist, unopinionated state management solution using simplified flux principles.
- No Context providers wrapping your app. Hooks are generated and usable anywhere.
- State is immutable, updates are merged natively.

STORE CREATION & USAGE:
- \`import { create } from 'zustand'\`
- \`const useStore = create((set) => ({ bears: 0, increase: () => set((state) => ({ bears: state.bears + 1 })), removeAllBears: () => set({ bears: 0 }) }))\`
- Usage in React: \`const bears = useStore((state) => state.bears)\`

PERFORMANCE & SELECTORS:
- You MUST use selectors to prevent unnecessary re-renders.
  - GOOD: \`const nuts = useStore((state) => state.nuts)\`
  - BAD: \`const { nuts } = useStore()\` (re-renders on EVERY store change).
- For multiple properties, use \`useShallow\` from \`zustand/react/shallow\`.

MIDDLEWARE & ASYNC:
- Async actions just call \`set\` when finished. \`const fetchDir = async () => { const res = await fetch('...'); set({ data: await res.json() }) }\`
- Zustand ships with powerful middleware: \`persist\` (localStorage), \`devtools\` (Redux devtools integration), and \`immer\` (mutable state updates).

COMMON PITFALLS:
- Forgetting to destructure deeply nested state arrays intelligently, causing React to re-render when sibling states update.
- Misunderstanding how \`set()\` merges. At the first level, it merges objects shallowly. For deeply nested state, you must construct the whole nested tree or use the \`immer\` middleware for ease.`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ZUSTAND QUESTION ===\n${prompt}`);
  }
}

export const zustandOssAgent = new ZustandOssAgent();
