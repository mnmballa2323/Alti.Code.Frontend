import type { appRouter } from "../../alti.code.studio.backend/src/app/trpc/router";

import { createTRPCReact } from "@trpc/react-query";

export type AppRouter = typeof appRouter;
export const trpc = createTRPCReact<AppRouter>();
