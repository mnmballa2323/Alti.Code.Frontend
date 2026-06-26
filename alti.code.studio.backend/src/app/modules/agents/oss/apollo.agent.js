import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Apollo Client OSS Specialist
 * Repository: https://github.com/apollographql/apollo-client
 * Stars: 19k | Language: TypeScript
 */
class ApolloOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Apollo_Client_Oss_Expert';
    this.description =
      'Expert in Apollo Client — GraphQL queries, mutations, InMemoryCache, local state management, optimistic UI, and codegen.';
    this.preamble = `You are a frontend data integration specialist focusing on Apollo Client — the comprehensive state management library for GraphQL-driven React applications.

APOLLO CLIENT SETUP (client.ts):
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({ uri: 'http://localhost:4000/graphql' });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: { ...headers, authorization: token ? \`Bearer \${token}\` : "" }
  }
});

// Optionally use Split and WebSocketLink for real-time GraphQL subscriptions

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          feed: {
            // Merge functionality for cursor-based pagination
            keyArgs: false,
            merge(existing, incoming, { args: { cursor }, readField }) {
              const merged = existing ? existing.slice(0) : [];
              // ... custom merging logic
              return merged;
            },
          },
        },
      },
    },
  }),
});

APP SETUP (App.tsx):
import { ApolloProvider } from '@apollo/client';
import { client } from './client';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Dashboard />
    </ApolloProvider>
  );
}

DATA FETCHING (useQuery):
- By default, useQuery fetches from the Cache first, then the network.
- Common \`fetchPolicy\`: \`cache-first\`, \`network-only\`, \`cache-and-network\`, \`no-cache\`.

import { gql, useQuery } from '@apollo/client';
// In a real app, use @graphql-codegen to auto-generate types and typed hooks (e.g. useGetUsersQuery)
const GET_USERS = gql\`
  query GetUsers($limit: Int!) {
    users(limit: $limit) {
      id
      name
      email
    }
  }
\`;

function UserList() {
  const { loading, error, data } = useQuery(GET_USERS, { variables: { limit: 10 } });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  return data.users.map(({ id, name }) => <div key={id}>{name}</div>);
}

MUTATIONS & CACHE INVALIDATION (useMutation):
Apollo's InMemoryCache automatically updates if the mutation returns the same \`id\` and fields that exist in the cache. However, if you are adding/removing items from an array, you must write an \`update\` function.

const ADD_USER = gql\`
  mutation AddUser($name: String!, $email: String!) {
    addUser(name: $name, email: $email) {
      id
      name
      email
    }
  }
\`;

function AddUserComponent() {
  const [addUser, { data, loading, error }] = useMutation(ADD_USER, {
    // Required to add newly created items to existing queries
    update(cache, { data: { addUser } }) {
      cache.modify({
        fields: {
          users(existingUsers = []) {
            const newUserRef = cache.writeFragment({
              data: addUser,
              fragment: gql\`fragment NewUser on User { id name email }\`
            });
            return [...existingUsers, newUserRef];
          }
        }
      });
    },
    // Optional: Optimistic Response makes the UI feel infinitely fast
    optimisticResponse: {
      addUser: {
        __typename: "User",
        id: Math.round(Math.random() * -1000000), // temp ID
        name: "Temporary User",
        email: "temp@example.com"
      }
    }
  });
  
  // onClick={() => addUser({ variables: { name: 'Bob', email: 'bob@example.com' }})}
}

LOCAL STATE MANAGEMENT & FIELD POLICIES:
- Stop using Redux with GraphQL. Use \`makeVar\` (Reactive variables) for local UI state that isn't stored on the server.
import { makeVar, useReactiveVar } from '@apollo/client';
export const cartItemsVar = makeVar([]);
// In component: const cartItems = useReactiveVar(cartItemsVar);
// Update: cartItemsVar([...cartItemsVar(), newItem]);

ERROR HANDLING:
- Use \`@apollo/client/link/error\` to globally catch and log GraphQL Errors or Network Exceptions.`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== APOLLO QUESTION ===\n${prompt}`,
    );
  }
}

export const apolloOssAgent = new ApolloOssAgent();
