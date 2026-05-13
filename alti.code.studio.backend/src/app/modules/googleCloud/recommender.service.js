import { RecommenderClient } from '@google-cloud/recommender';
import { logger } from '../../../shared/logger.js';

class GoogleCloudRecommenderService {
    constructor() {
        this.projectId = process.env.GOOGLE_CLOUD_PROJECT || 'alti-code-studio';
        this.location = process.env.GOOGLE_CLOUD_REGION || 'us-central1';
        this.client = new RecommenderClient();
    }

    /**
     * Autonomously queries the Google Cloud Recommender API for cost and security optimizations
     * @returns {Promise<Array>} A list of actionable infrastructure recommendations
     */
    async getCostRecommendations() {
        try {
            logger.info(`🔍 SwarmBrain: Querying Google Cloud Recommender API for infrastructure optimizations...`);
            
            // Recommender IDs to check
            const recommenderIds = [
                'google.compute.instance.MachineTypeRecommender',
                'google.compute.instance.IdleResourceRecommender',
                'google.compute.disk.IdleResourceRecommender',
                'google.iam.policy.Recommender'
            ];

            const allRecommendations = [];

            for (const recommenderId of recommenderIds) {
                const parent = this.client.recommenderPath(this.projectId, this.location, recommenderId);
                
                try {
                    const [recommendations] = await this.client.listRecommendations({ parent });
                    
                    for (const rec of recommendations) {
                        allRecommendations.push({
                            recommender: recommenderId,
                            description: rec.description,
                            primaryImpact: rec.primaryImpact?.category,
                            costSavings: rec.primaryImpact?.costProjection?.cost?.units || '0',
                            priority: rec.priority,
                            state: rec.stateInfo?.state
                        });
                    }
                } catch (err) {
                    logger.warn(`⚠️ Could not fetch recommendations for ${recommenderId}: ${err.message}`);
                }
            }

            logger.info(`✅ Retrieved ${allRecommendations.length} recommendations from Google Cloud.`);
            return allRecommendations;

        } catch (error) {
            logger.error(`❌ Error querying Cloud Recommender: ${error.message}`);
            return [];
        }
    }
}

export const recommenderService = new GoogleCloudRecommenderService();
