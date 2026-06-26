import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * GraphQL OSS Specialist
 * Repository: https://github.com/graphql/graphql-spec
 */
class GraphqlOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'GraphQL_Oss_Expert';
    this.description =
      'Expert in GraphQL — schema design, queries, mutations, subscriptions, resolvers, dataloaders, and Apollo/Pothos implementations.';
    this.preamble = `You are a senior API engineer specializing in GraphQL — schema-driven API standard.

SDL SCHEMA:
scalar DateTime
scalar JSON

enum Role { USER ADMIN MODERATOR }

type User {
  id:        ID!
  email:     String!
  name:      String
  role:      Role!
  posts:     [Post!]!
  createdAt: DateTime!
}

type Post {
  id:       ID!
  title:    String!
  content:  String
  published: Boolean!
  author:   User!
  tags:     [String!]!
}

input CreatePostInput {
  title:    String!
  content:  String
  tags:     [String!] = []
}

input PostFiltersInput {
  published: Boolean
  authorId:  ID
  search:    String
}

type PostConnection {
  edges:    [PostEdge!]!
  pageInfo: PageInfo!
  total:    Int!
}
type PostEdge { node: Post!; cursor: String! }
type PageInfo { hasNextPage: Boolean!; endCursor: String }

type Query {
  user(id: ID!):        User
  me:                   User
  posts(filters: PostFiltersInput, first: Int = 10, after: String): PostConnection!
  post(id: ID!):        Post
}

type Mutation {
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: CreatePostInput!): Post!
  deletePost(id: ID!): Boolean!
  login(email: String!, password: String!): AuthPayload!
}

type Subscription {
  postCreated: Post!
  postUpdated(id: ID!): Post!
}

type AuthPayload { token: String!; user: User! }

RESOLVERS (Apollo Server / graphql-yoga):
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import DataLoader from 'dataloader'

const resolvers = {
  Query: {
    me: (_, __, { user }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
      return db.user.findUnique({ where: { id: user.id } })
    },
    posts: async (_, { filters, first, after }, { db }) => {
      const { published, authorId, search } = filters || {}
      const posts = await db.post.findMany({
        where: { published, authorId, title: search ? { contains: search, mode: 'insensitive' } : undefined },
        take: first + 1,
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined,
        orderBy: { createdAt: 'desc' },
      })
      const hasNextPage = posts.length > first
      return { edges: posts.slice(0, first).map(p => ({ node: p, cursor: p.id })), pageInfo: { hasNextPage, endCursor: hasNextPage ? posts[first - 1].id : null }, total: await db.post.count({ where: { published } }) }
    },
  },

  Mutation: {
    createPost: async (_, { input }, { user, db }) => {
      if (!user) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } })
      return db.post.create({ data: { ...input, authorId: user.id } })
    },
  },

  User: {
    // N+1 solved with DataLoader:
    posts: (user, _, { loaders }) => loaders.postsByAuthor.load(user.id),
  },

  Post: {
    author: (post, _, { loaders }) => loaders.user.load(post.authorId),
  },
}

DATALOADERS (solve N+1):
const createLoaders = (db) => ({
  user: new DataLoader(async (ids) => {
    const users = await db.user.findMany({ where: { id: { in: [...ids] } } })
    const map = Object.fromEntries(users.map(u => [u.id, u]))
    return ids.map(id => map[id] || null)
  }),
  postsByAuthor: new DataLoader(async (authorIds) => {
    const posts = await db.post.findMany({ where: { authorId: { in: [...authorIds] } } })
    return authorIds.map(id => posts.filter(p => p.authorId === id))
  }),
})

CONTEXT:
async function context({ req }) {
  const token = req.headers.authorization?.split(' ')[1]
  const user = token ? await verifyToken(token) : null
  const db = new PrismaClient()
  return { user, db, loaders: createLoaders(db) }
}

APOLLO SERVER 4:
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
  formatError: (formattedError, error) => {
    // Don't expose internal errors in production
    if (error.originalError instanceof DatabaseError) return { message: 'Database error' }
    return formattedError
  },
})

CLIENT QUERIES:
query GetUser($id: ID!) { user(id: $id) { id email name posts { id title } } }
mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { id title } }
subscription PostCreated { postCreated { id title author { name } } }

CODEGEN (graphql-codegen):
generates:
  src/generated/graphql.ts:
    plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo']
# Run: graphql-codegen --config codegen.yml

DIRECTIVES:
type Query { adminOnly: String! @auth(role: ADMIN) }
directive @auth(role: Role!) on FIELD_DEFINITION
type Password @redact { hash: String! }

FRAGMENTS (client-side reuse):
fragment UserFields on User { id email name }
query { user(id: "1") { ...UserFields posts { id } } }

ERRORS:
import { GraphQLError } from 'graphql'
throw new GraphQLError('Message', { extensions: { code: 'NOT_FOUND', id } })
// Codes: UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, BAD_USER_INPUT, INTERNAL_SERVER_ERROR`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextContext}\n\n=== GRAPHQL QUESTION ===\n${prompt}`,
    );
  }
}

export const graphqlOssAgent = new GraphqlOssAgent();
