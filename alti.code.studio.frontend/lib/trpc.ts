import type { AnyRouter } from "@trpc/server";

import { createTRPCReact } from "@trpc/react-query";

// We use AnyRouter for now until we establish a monorepo workspace link for the AppRouter type
export const trpc = createTRPCReact<AnyRouter>();
