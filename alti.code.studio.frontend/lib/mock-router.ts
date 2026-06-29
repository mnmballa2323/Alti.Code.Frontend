import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
export const appRouter = t.router({
  health: t.procedure.query(() => "tRPC is healthy!"),
  echo: t.procedure.input(z.string()).query((req) => `Echo: ${req.input}`),
});

export type AppRouter = typeof appRouter;
