import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./mock-router";

export const trpc = createTRPCReact<AppRouter>();
