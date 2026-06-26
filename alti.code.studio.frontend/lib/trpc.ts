import { createTRPCReact } from "@trpc/react-query";
import type { appRouter } from "../../alti.code.studio.backend/src/app/trpc/router";

export type AppRouter = typeof appRouter;
export const trpc = createTRPCReact<AppRouter>();
