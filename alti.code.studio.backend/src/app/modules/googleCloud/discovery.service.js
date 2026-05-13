import { SearchServiceClient } from '@google-cloud/discoveryengine';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Vertex AI Discovery Engine Service (The Ultimate Code RAG).
 * This completely replaces local manual chunking and basic vector databases.
 * It uses Google's fully managed Enterprise Search to automatically parse, chunk, 
 * and semantically rank massive git repositories using proprietary Google search algorithms.
 */
class GoogleDiscoveryEngineService {
    constructor() {
        try {
            this.client = new SearchServiceClient();
            
            // Assume the Data Store was pre-configured via Terraform
            this.servingConfig = this.client.projectLocationCollectionDataStoreServingConfigPath(
                config.gcp.project_id,
                config.gcp.location || 'global',
                'default_collection',
                config.gcp.discovery_datastore || 'alti-code-rag',
                'default_search'
            );
            
            logger.info('🧠 [Discovery] Google Vertex AI Discovery Engine Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Discovery] Could not initialize Discovery Engine Client.');
        }
    }

    /**
     * Executes an Enterprise Search query against the massive codebase data store.
     * @param {string} query - Natural language or code snippet to search
     */
    async searchCodebase(query) {
        logger.info(`🧠 [Discovery] Swarm is performing Enterprise Code Search for: "${query.substring(0, 30)}..."`);
        
        try {
            const request = {
                servingConfig: this.servingConfig,
                query: query,
                pageSize: 10, // Top 10 most semantically relevant files/chunks
                contentSearchSpec: {
                    snippetSpec: {
                        returnSnippet: true, // We need the exact code snippets returned
                    },
                    extractiveContentSpec: {
                        maxExtractiveAnswerCount: 1, // Extract the absolute best answer block
                    }
                }
            };

            const [response] = await this.client.search(request);
            
            logger.info(`✅ [Discovery] Retrieved ${response.results.length} highly relevant code snippets from Enterprise Search.`);
            return response.results;
        } catch (error) {
            logger.error(`❌ [Discovery] Enterprise Search failed:`, error.message);
            return [];
        }
    }
}

export const discoveryEngineService = new GoogleDiscoveryEngineService();
