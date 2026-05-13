import { FlexTemplatesServiceClient } from '@google-cloud/dataflow';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Dataflow Service (Real-Time RAG Ingestion).
 * The world's best RAG must be real-time. This service utilizes Apache Beam on
 * Cloud Dataflow. Every single time a developer pushes code, the Swarm triggers
 * a stream processing pipeline to instantly tokenize and inject the new commit 
 * into the Vertex Discovery Engine, completely eliminating RAG staleness.
 */
class GoogleDataflowService {
    constructor() {
        try {
            this.client = new FlexTemplatesServiceClient();
            this.projectId = config.gcp.project_id;
            this.location = config.gcp.location || 'us-central1';
            logger.info('🌊 [Dataflow] Google Cloud Dataflow (Apache Beam) Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Dataflow] Could not initialize Dataflow Client.');
        }
    }

    /**
     * Triggers a real-time Apache Beam pipeline to ingest a Git commit.
     * @param {string} repoUrl - The target git repository
     * @param {string} commitHash - The specific commit to ingest
     */
    async triggerRealTimeIngestion(repoUrl, commitHash) {
        logger.info(`🌊 [Dataflow] Swarm is triggering real-time RAG ingestion for commit [${commitHash}]...`);
        
        try {
            const request = {
                projectId: this.projectId,
                location: this.location,
                launchParameter: {
                    jobName: `alti-swarm-ingestion-${commitHash.substring(0, 7)}`,
                    // Assumes a pre-compiled Apache Beam template stored in GCS
                    containerSpecGcsPath: `gs://${this.projectId}-dataflow-templates/ingestion-template.json`,
                    parameters: {
                        repository_url: repoUrl,
                        commit_hash: commitHash,
                    },
                    environment: {
                        workerRegion: this.location,
                    }
                }
            };

            const [response] = await this.client.launchFlexTemplate(request);
            logger.info(`✅ [Dataflow] Apache Beam stream processing job launched: ${response.job.name}`);
            return response.job;
        } catch (error) {
            logger.error(`❌ [Dataflow] Failed to launch Dataflow pipeline:`, error.message);
            return null;
        }
    }
}

export const dataflowService = new GoogleDataflowService();
