import { z } from 'zod';
import { router, publicProcedure } from './trpc.js';

export const appRouter = router({
    health: publicProcedure.query(() => {
        return 'tRPC is healthy!';
    }),
    echo: publicProcedure
        .input(z.string())
        .query((req) => {
            return `Echo: ${req.input}`;
        }),
});
