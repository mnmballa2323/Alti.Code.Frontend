import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js router
vi.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "",
      query: {},
      asPath: "",
      push: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    };
  },
}));

vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock NextAuth
vi.mock("next-auth/react", () => ({
  useSession() {
    return { data: null, status: "unauthenticated" };
  },
  SessionProvider({ children }: { children: React.ReactNode }) {
    return children;
  },
}));

// Mock @asamuzakjp/css-color to bypass CJS/ESM compatibility crash
vi.mock("@asamuzakjp/css-color", () => ({
  default: () => ({}),
  cssColor: () => ({}),
}));
