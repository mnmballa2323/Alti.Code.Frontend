import batch from '@google-cloud/batch';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Batch (Apache 2.0 SDK) Service.
 * Allows the Swarm to dynamically spin up massive parallel compute clusters
 * to execute background data processing or large-scale AI evaluations autonomously.
 */
class GoogleCloudBatchService {
    constructor() {
        this.client = new batch.v1.BatchServiceClient();
        this.projectId = config.gcp_project_id || process.env.GOOGLE_CLOUD_PROJECT || 'alti-code-studio';
        this.location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    }

    /**
     * Submits a high-performance compute job to Google Cloud Batch.
     * @param {string} jobId - Unique identifier for the batch job
     * @param {string} dockerImage - The container image to execute
     * @param {Array<string>} commands - The entrypoint commands
     */
    async submitComputeJob(jobId, dockerImage, commands) {
        logger.info(`🚀 [Cloud Batch] Swarm is allocating massive compute cluster for job: ${jobId}`);

        try {
            const request = {
                parent: `projects/${this.projectId}/locations/${this.location}`,
                jobId: jobId,
                job: {
                    taskGroups: [
                        {
                            taskCount: 1,
                            taskSpec: {
                                runnables: [
                                    {
                                        container: {
                                            imageUri: dockerImage,
                                            commands: commands,
                                        },
                                    },
                                ],
                                computeResource: {
                                    cpuMilli: 2000, // 2 vCPUs
                                    memoryMib: 2048, // 2 GB RAM
                                },
                            },
                        },
                    ],
                    allocationPolicy: {
                        instances: [
                            {
                                policy: {
                                    provisioningModel: 'SPOT', // Autonomous FinOps: Always use cheap Spot instances
                                    machineType: 'e2-standard-2',
                                },
                            },
                        ],
                    },
                    logsPolicy: {
                        destination: 'CLOUD_LOGGING',
                    },
                },
            };

            const [response] = await this.client.createJob(request);
            logger.info(`✅ [Cloud Batch] Compute cluster allocated successfully. Job Name: ${response.name}`);
            
            return {
                success: true,
                jobName: response.name,
                uid: response.uid
            };
        } catch (error) {
            logger.error(`❌ [Cloud Batch] Failed to allocate compute cluster:`, error.message);
            return { success: false, error: error.message };
        }
    }
}

export const cloudBatchService = new GoogleCloudBatchService();
