import { AlloyDBAdminClient } from '@google-cloud/alloydb';
import pg from 'pg';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google AlloyDB Hybrid Relational/Semantic RAG Service.
 * Pure vector search loses structural context (like class inheritance trees).
 * The Swarm utilizes Google's AlloyDB (which uses a proprietary columnar engine 
 * to execute pgvector queries 100x faster than standard PostgreSQL) to perform 
 * Hybrid RAG. It mathematically combines semantic Vertex Vectors with rigid 
 * relational codebase metadata.
 */
class GoogleAlloyDbService {
    constructor() {
        try {
            this.adminClient = new AlloyDBAdminClient();
            
            // Assume the AlloyDB cluster and instance are pre-configured via Terraform
            // and connected via the AlloyDB Auth Proxy
            this.pool = new pg.Pool({
                host: config.gcp.alloydb_host || '127.0.0.1', // Using local auth proxy
                port: config.gcp.alloydb_port || 5432,
                user: config.gcp.alloydb_user || 'postgres',
                password: config.gcp.alloydb_password || 'secret',
                database: config.gcp.alloydb_database || 'alti_swarm_rag',
            });

            logger.info('🐘 [AlloyDB] Google AlloyDB Hybrid RAG Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [AlloyDB] Could not initialize AlloyDB connection pool.');
        }
    }

    /**
     * Executes a Hybrid RAG Query combining Semantic Vector distance and Relational filters.
     * @param {number[]} embedding - The vector of the Swarm's query
     * @param {string} fileExtension - Relational filter (e.g., '.js')
     */
    async executeHybridSearch(embedding, fileExtension) {
        logger.info(`🐘 [AlloyDB] Swarm is executing a columnar Hybrid RAG search...`);
        
        try {
            const vectorStr = `[${embedding.join(',')}]`;
            
            // This query leverages AlloyDB's advanced pgvector index acceleration
            // combining semantic distance (<->) with strict relational metadata filtering.
            const query = `
                SELECT id, file_path, code_snippet, 
                       1 - (embedding <-> $1) AS semantic_similarity
                FROM codebase_nodes
                WHERE file_extension = $2
                ORDER BY embedding <-> $1
                LIMIT 5;
            `;

            const result = await this.pool.query(query, [vectorStr, fileExtension]);
            
            logger.info(`✅ [AlloyDB] Hybrid RAG query complete. Retrieved ${result.rowCount} context nodes.`);
            return result.rows;
        } catch (error) {
            logger.error(`❌ [AlloyDB] Hybrid search failed:`, error.message);
            return [];
        }
    }
}

export const alloyDbService = new GoogleAlloyDbService();
