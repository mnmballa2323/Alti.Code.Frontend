import { vi } from 'vitest';

export const store = {
  getState: () => ({
    user: { user: null },
    setNewChat: {},
    messages: [],
    shadow: {},
    system: {},
    ui: {}
  }),
  dispatch: vi.fn(),
  subscribe: vi.fn()
};

export const useAppDispatch = () => vi.fn();
export const useAppSelector = vi.fn((fn) => fn(store.getState()));
