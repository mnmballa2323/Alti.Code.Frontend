import neo4j from 'neo4j-driver';
import { logger } from '../../../shared/logger.js';

/**
 * Neo4j Graph Database Service
 * Licensed securely under Apache 2.0 to comply with sovereign enterprise requirements.
 * This service replaces ephemeral in-memory graph tracking, enabling infinite
 * horizontal scalability of Cognitive Swarm Memory and codebase AST maps.
 */
class Neo4jService {
    constructor() {
        // Fallback to local Neo4j desktop/docker if env vars are missing
        const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
        const user = process.env.NEO4J_USER || 'neo4j';
        const password = process.env.NEO4J_PASSWORD || 'password';
        
        try {
            // Neo4j JavaScript Driver is Apache 2.0 licensed.
            this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
            logger.info('🔷 [Neo4jService] Apache 2.0 Driver initialized for Cognitive Mapping.');
        } catch (error) {
            logger.warn('⚠️ [Neo4jService] Failed to initialize Neo4j driver. Is the database running?');
        }
    }

    /**
     * Executes an arbitrary Cypher query against the Neo4j database.
     * @param {string} query - The Cypher query string
     * @param {Object} params - Query parameters
     */
    async executeCypher(query, params = {}) {
        if (!this.driver) return [];
        const session = this.driver.session();
        try {
            const result = await session.run(query, params);
            return result.records;
        } catch (error) {
            logger.error(`❌ [Neo4jService] Error executing Cypher: ${error.message}`);
            throw error;
        } finally {
            await session.close();
        }
    }

    /**
     * Persists an agent reasoning node into the Cognitive Knowledge Graph.
     * @param {string} id - The execution ID
     * @param {string} agentName - The name of the Swarm Agent
     * @param {number} executionTimeMs - Execution duration
     */
    async logAgentReasoningNode(id, agentName, executionTimeMs) {
        logger.info(`🔷 [Neo4jService] Committing Reasoning Node [${id}] for Agent [${agentName}] to the Knowledge Graph...`);
        const query = `
            MERGE (a:Agent {name: $agentName})
            CREATE (n:ReasoningNode {id: $id, executionTimeMs: $executionTimeMs, timestamp: datetime()})
            MERGE (a)-[:EXECUTED]->(n)
        `;
        return this.executeCypher(query, { id, agentName, executionTimeMs });
    }

    /**
     * Ingests Graphify AST Output directly into Neo4j
     * @param {Object} graphifyOutput - The JSON structural output from the python extractor
     */
    async ingestAstContext(graphifyOutput) {
        if (!graphifyOutput || !graphifyOutput.nodes || !graphifyOutput.links) return;
        
        logger.info(`🔷 [Neo4jService] Ingesting ${graphifyOutput.nodes.length} AST Nodes into Neo4j...`);
        const session = this.driver.session();
        
        try {
            const tx = session.beginTransaction();
            // Process nodes
            for (const node of graphifyOutput.nodes) {
                await tx.run(
                    `MERGE (n:AstNode {id: $id}) SET n.name = $name, n.group = $group, n.val = $val`,
                    { id: node.id, name: node.name || node.id, group: node.group || 0, val: node.val || 1 }
                );
            }
            // Process links
            for (const link of graphifyOutput.links) {
                await tx.run(
                    `MATCH (source:AstNode {id: $sourceId})
                     MATCH (target:AstNode {id: $targetId})
                     MERGE (source)-[r:DEPENDS_ON]->(target)
                     SET r.weight = $weight`,
                    { sourceId: link.source, targetId: link.target, weight: link.value || 1 }
                );
            }
            await tx.commit();
            logger.info(`✅ [Neo4jService] Successfully persisted Cognitive Context to Neo4j.`);
        } catch (error) {
            logger.error(`❌ [Neo4jService] AST Ingestion failed: ${error.message}`);
        } finally {
            await session.close();
        }
    }

    async close() {
        if (this.driver) {
            await this.driver.close();
        }
    }
}

export const neo4jService = new Neo4jService();
