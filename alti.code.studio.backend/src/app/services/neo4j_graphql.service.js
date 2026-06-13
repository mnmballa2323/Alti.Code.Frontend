import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Neo4jGraphQL } from '@neo4j/graphql';
import neo4j from 'neo4j-driver';
import { logger } from '../shared/logger.js';
import express from 'express';
import cors from 'cors';

/**
 * Neo4j GraphQL Service
 * Licensed securely under Apache 2.0.
 * Automatically generates a high-performance GraphQL CRUD API from Cypher schemas.
 */
const typeDefs = `#graphql
  type AstNode {
    id: String!
    name: String!
    group: Int
    val: Int
    dependencies: [AstNode!]! @relationship(type: "DEPENDS_ON", direction: OUT)
  }

  type Agent {
    name: String!
    reasoningNodes: [ReasoningNode!]! @relationship(type: "EXECUTED", direction: OUT)
  }

  type ReasoningNode {
    id: String!
    executionTimeMs: Int
    timestamp: DateTime
    agent: Agent! @relationship(type: "EXECUTED", direction: IN)
  }
`;

export const neo4jGraphQLService = {
    init: async (app) => {
        try {
            const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
            const user = process.env.NEO4J_USER || 'neo4j';
            const password = process.env.NEO4J_PASSWORD || 'password';
            
            const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
            
            const neoSchema = new Neo4jGraphQL({ typeDefs, driver });
            const schema = await neoSchema.getSchema();
            
            const server = new ApolloServer({
                schema,
            });
            
            await server.start();
            
            const { iapService } = await import('../modules/googleCloud/iap.service.js');
            
            app.use(
                '/graphql',
                cors({ origin: process.env.CLIENT_URL || "http://localhost:3001" }),
                express.json(),
                iapService.verifyIAPToken, // 🛡️ Fortune 100 Zero-Trust Perimeter
                expressMiddleware(server)
            );
            
            logger.info('🔷 [Neo4jGraphQL] Apache 2.0 GraphQL API successfully mounted at /graphql');
        } catch(e) {
            logger.warn('⚠️ [Neo4jGraphQL] Failed to mount GraphQL Server: ' + e.message);
        }
    }
};
