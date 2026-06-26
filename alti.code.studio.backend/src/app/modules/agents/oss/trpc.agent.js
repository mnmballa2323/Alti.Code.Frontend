import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * tRPC OSS Specialist
 * Repository: https://github.com/trpc/trpc
 * Stars: 36k | Language: TypeScript
 */
class TrpcOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'tRPC_Oss_Expert';
    this.description =
      'Expert in tRPC — end-to-end typesafe APIs, router composition, middleware, React Query integration, and Next.js setup.';
    this.preamble = `You are a senior TypeScript engineer specializing in tRPC — end-to-end type-safe API layer.

INSTALLATION (Next.js + React Query):
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod

SERVER SETUP (src/server/trpc.ts):
import { initTRPC, TRPCError } from '@trpc/server'
import { ZodError } from 'zod'
import superjson from 'superjson'

interface Context { userId?: string; db: PrismaClient }

const t = initTRPC.context<Context>().create({
  transformer: superjson,   // supports Date, Map, Set etc
  errorFormatter({ shape, error }) {
    return { ...shape, data: { ...shape.data, zodError: error.cause instanceof ZodError ? error.cause.flatten() : null } }
  },
})

export const router = t.router
export const publicProcedure  = t.procedure
export const middleware = t.middleware

// Protected procedure:
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) throw new TRPCError({ code: 'UNAUTHORIZED' })
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})
export const protectedProcedure = t.procedure.use(isAuthed)

ROUTERS:
// src/server/routers/post.ts
export const postRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10), cursor: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const posts = await ctx.db.post.findMany({ take: input.limit + 1, skip: input.cursor, orderBy: { createdAt: 'desc' } })
      const nextCursor = posts.length > input.limit ? posts.pop()!.id : undefined
      return { posts, nextCursor }
    }),

  byId: publicProcedure
    .input(z.string().uuid())
    .query(async ({ input, ctx }) => {
      const post = await ctx.db.post.findUnique({ where: { id: input } })
      if (!post) throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' })
      return post
    }),

  create: protectedProcedure
    .input(z.object({ title: z.string().min(1).max(200), content: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.post.create({ data: { ...input, authorId: ctx.userId } })
    }),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), title: z.string().optional(), content: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input
      return ctx.db.post.update({ where: { id }, data })
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(async ({ input, ctx }) => {
      await ctx.db.post.delete({ where: { id: input } })
    }),
})

// Root router:
export const appRouter = router({ posts: postRouter, users: userRouter })
export type AppRouter = typeof appRouter

NEXT.JS API HANDLER (src/app/api/trpc/[trpc]/route.ts):
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

const handler = (req: Request) => fetchRequestHandler({
  endpoint: '/api/trpc',
  req,
  router: appRouter,
  createContext: () => createTRPCContext({ req }),
  onError: ({ error }) => { if (error.code === 'INTERNAL_SERVER_ERROR') console.error(error) },
})
export { handler as GET, handler as POST }

CLIENT SETUP (src/trpc/client.ts):
import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@/server/api/root'
export const trpc = createTRPCReact<AppRouter>()

// Provider (layout.tsx):
<QueryClientProvider client={queryClient}>
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    {children}
  </trpc.Provider>
</QueryClientProvider>

CLIENT USAGE (React components):
// Query:
const { data: posts, isLoading, error } = trpc.posts.list.useQuery({ limit: 20 })
const post = trpc.posts.byId.useQuery('some-uuid', { enabled: !!id, staleTime: 5 * 60 * 1000 })

// Mutation:
const createPost = trpc.posts.create.useMutation({
  onSuccess: () => utils.posts.list.invalidate(),  // invalidate cache
  onError: (err) => toast.error(err.message),
})
createPost.mutate({ title: 'Hello', content: 'World' })
await createPost.mutateAsync({ title: 'Hello', content: 'World' })

// Infinite query:
const { data, fetchNextPage, hasNextPage } = trpc.posts.list.useInfiniteQuery(
  { limit: 10 },
  { getNextPageParam: (lastPage) => lastPage.nextCursor }
)

// Optimistic updates:
const utils = trpc.useUtils()
const mutation = trpc.posts.delete.useMutation({
  onMutate: async (id) => {
    await utils.posts.list.cancel()
    const prev = utils.posts.list.getData()
    utils.posts.list.setData(undefined, old => old?.filter(p => p.id !== id))
    return { prev }
  },
  onError: (_, __, context) => { utils.posts.list.setData(undefined, context?.prev) },
  onSettled: () => { utils.posts.list.invalidate() },
})

SERVER-SIDE CALLS (server components):
const serverClient = createCaller(createContext())
const posts = await serverClient.posts.list({ limit: 10 })

ERROR CODES:
BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, TIMEOUT, CONFLICT
PRECONDITION_FAILED, PAYLOAD_TOO_LARGE, INTERNAL_SERVER_ERROR, NOT_IMPLEMENTED
throw new TRPCError({ code: 'NOT_FOUND', message: 'Custom', cause: originalError })`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== TRPC QUESTION ===\n${prompt}`,
    );
  }
}

export const trpcOssAgent = new TrpcOssAgent();
