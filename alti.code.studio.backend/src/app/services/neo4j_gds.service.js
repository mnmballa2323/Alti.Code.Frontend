import { neo4jService } from './neo4j.service.js';
import { logger } from '../shared/logger.js';

/**
 * Neo4j Graph Data Science (GDS) Service
 * Runs advanced algorithmic analysis (PageRank, Node2Vec, Dijkstra) over the Cognitive Graph.
 * Note: Requires the GDS Plugin to be installed on the Neo4j Database Instance.
 */
class Neo4jGDSService {

    /**
     * Executes PageRank on the AST codebase graph to identify the most critical/central files.
     * Useful for Swarm Agents deciding where to focus bug hunting or refactoring.
     */
    async calculatePageRank() {
        logger.info('🔷 [Neo4jGDS] Swarm is initiating PageRank algorithm across the Cognitive Graph...');
        
        try {
            // 1. Create an in-memory graph projection for performance
            await neo4jService.executeCypher(`
                CALL gds.graph.project(
                    'astGraph',
                    'AstNode',
                    'DEPENDS_ON'
                )
            `);

            // 2. Run PageRank and stream results
            const results = await neo4jService.executeCypher(`
                CALL gds.pageRank.stream('astGraph')
                YIELD nodeId, score
                RETURN gds.util.asNode(nodeId).name AS name, score
                ORDER BY score DESC, name ASC
                LIMIT 10
            `);

            // 3. Drop the projection to free memory
            await neo4jService.executeCypher(`CALL gds.graph.drop('astGraph')`);

            const topNodes = results.map(r => ({
                name: r.get('name'),
                score: r.get('score')
            }));

            logger.info(`✅ [Neo4jGDS] PageRank complete. Top architectural nexus: ${topNodes[0]?.name || 'N/A'}`);
            return topNodes;
            
        } catch (error) {
            logger.warn(`⚠️ [Neo4jGDS] PageRank failed. Ensure the Neo4j GDS Plugin is installed on the database instance. Error: ${error.message}`);
            return [];
        }
    }

    /**
     * Uses Node Similarity (Jaccard) to find architectural twins or duplicate code logic
     * based on their dependency relationships.
     */
    async findArchitecturalTwins() {
        logger.info('🔷 [Neo4jGDS] Swarm is initiating Node Similarity analysis...');
        
        try {
            await neo4jService.executeCypher(`
                CALL gds.graph.project(
                    'similarityGraph',
                    'AstNode',
                    'DEPENDS_ON'
                )
            `);

            const results = await neo4jService.executeCypher(`
                CALL gds.nodeSimilarity.stream('similarityGraph')
                YIELD node1, node2, similarity
                RETURN gds.util.asNode(node1).name AS node1Name, gds.util.asNode(node2).name AS node2Name, similarity
                ORDER BY similarity DESC
                LIMIT 5
            `);

            await neo4jService.executeCypher(`CALL gds.graph.drop('similarityGraph')`);

            return results.map(r => ({
                node1: r.get('node1Name'),
                node2: r.get('node2Name'),
                similarity: r.get('similarity')
            }));
            
        } catch (error) {
            logger.warn(`⚠️ [Neo4jGDS] Node Similarity failed: ${error.message}`);
            return [];
        }
    }
}

export const neo4jGdsService = new Neo4jGDSService();
