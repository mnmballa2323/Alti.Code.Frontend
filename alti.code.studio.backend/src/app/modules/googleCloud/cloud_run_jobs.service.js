import { JobsClient } from '@google-cloud/run';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Run Jobs Service (Infinite Parallel Execution).
 * Grants the Swarm the ability to programmatically spawn thousands of parallel
 * Cloud Run Jobs. It distributes its test executions and massive code compilations
 * across Google's global serverless infrastructure, turning a 10-minute operation
 * into a 10-second parallel blast.
 */
class GoogleCloudRunJobsService {
    constructor() {
        try {
            this.client = new JobsClient();
            this.parent = `projects/${config.gcp.project_id}/locations/${config.gcp.location || 'us-central1'}`;
            logger.info('🚀 [Cloud Run] Google Cloud Run Jobs Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Cloud Run] Could not initialize Cloud Run Jobs Client.');
        }
    }

    /**
     * Programmatically provisions a brand new Cloud Run Job dynamically.
     * @param {string} jobId - Unique identifier for the job
     * @param {string} imageUri - Docker image URI from Google Artifact Registry
     */
    async createAutonomousJob(jobId, imageUri) {
        logger.info(`🏗️ [Cloud Run] Provisioning new serverless job container: ${jobId}`);
        
        try {
            const request = {
                parent: this.parent,
                jobId: jobId,
                job: {
                    template: {
                        template: {
                            containers: [{ image: imageUri }]
                        }
                    }
                }
            };

            const [operation] = await this.client.createJob(request);
            logger.info(`⏳ [Cloud Run] Provisioning job ${jobId}...`);
            const [response] = await operation.promise();
            
            logger.info(`✅ [Cloud Run] Job ${jobId} provisioned successfully in GCP.`);
            return response;
        } catch (error) {
            if (error.code === 6) { // ALREADY_EXISTS
                logger.info(`ℹ️ [Cloud Run] Job ${jobId} already exists. Proceeding.`);
                return true;
            }
            logger.error(`❌ [Cloud Run] Failed to provision job ${jobId}:`, error.message);
            throw error;
        }
    }

    /**
     * Programmatically triggers a parallel execution Cloud Run Job.
     * @param {string} jobId - The name of the Cloud Run Job
     * @param {object} args - Arguments to pass to the job container
     */
    async executeParallelJob(jobId, args = {}) {
        logger.info(`🚀 [Cloud Run] Swarm is spawning parallel job [${jobId}]...`);
        
        try {
            const name = `${this.parent}/jobs/${jobId}`;
            
            // To pass dynamic args to the job, we override the container args
            const request = {
                name: name,
                overrides: {
                    containerOverrides: [
                        {
                            args: [JSON.stringify(args)]
                        }
                    ]
                }
            };

            const [operation] = await this.client.runJob(request);
            logger.info(`⏳ [Cloud Run] Job triggered. Waiting for parallel execution...`);
            
            const [response] = await operation.promise();
            logger.info(`✅ [Cloud Run] Parallel execution completed successfully!`);
            
            return response;
        } catch (error) {
            logger.error(`❌ [Cloud Run] Failed to execute parallel job:`, error.message);
            return null;
        }
    }
}

export const cloudRunJobsService = new GoogleCloudRunJobsService();
