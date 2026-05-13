import { AssetServiceClient } from '@google-cloud/asset';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Asset Inventory Service.
 * Grants the Agent Swarm the administrative power to autonomously query
 * global GCP IAM policies and Cloud Resources to debug "Permission Denied" errors in real-time.
 */
class GoogleAssetService {
    constructor() {
        try {
            this.client = new AssetServiceClient();
            this.scope = `projects/${config.gcp.project_id}`;
            logger.info('🏢 [Asset] Google Cloud Asset Inventory Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Asset] Could not initialize Asset Client.');
        }
    }

    /**
     * Searches the GCP environment for a specific IAM policy or resource.
     * @param {string} query - The resource query (e.g., 'policy:roles/owner')
     */
    async searchIAMPolicy(query) {
        logger.info(`🏢 [Asset] Swarm is autonomously querying GCP IAM policies: "${query}"`);
        
        try {
            const request = {
                scope: this.scope,
                query: query,
            };

            const [response] = await this.client.searchAllIamPolicies(request);
            
            logger.info(`✅ [Asset] IAM Search complete. Found ${response.length} matching policies.`);
            return response;
        } catch (error) {
            logger.error(`❌ [Asset] Failed to search IAM policies:`, error.message);
            return [];
        }
    }

    /**
     * Searches all active GCP resources (Compute, Spanner, PubSub, etc.).
     * @param {string} query 
     */
    async searchResources(query) {
        logger.info(`🏢 [Asset] Swarm is querying global GCP resources: "${query}"`);
        
        try {
            const request = {
                scope: this.scope,
                query: query,
            };

            const [response] = await this.client.searchAllResources(request);
            
            logger.info(`✅ [Asset] Resource Search complete. Found ${response.length} matching resources.`);
            return response;
        } catch (error) {
            logger.error(`❌ [Asset] Failed to search GCP resources:`, error.message);
            return [];
        }
    }
}

export const assetService = new GoogleAssetService();
