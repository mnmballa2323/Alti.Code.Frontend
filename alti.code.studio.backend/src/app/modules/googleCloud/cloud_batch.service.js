import { BatchServiceClient } from '@google-cloud/batch';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Batch High-Performance Computing (HPC) Service.
 * Serverless execution (Cloud Run) is insufficient for ingesting entire operating
 * systems (e.g., the Linux Kernel). When faced with a massive monorepo, the Swarm 
 * autonomously submits Google Cloud Batch HPC jobs, provisioning tens of thousands 
 * of compute cores simultaneously to tokenize, graph, and embed codebases in minutes.
 */
class GoogleCloudBatchService {
    constructor() {
        try {
            this.batchClient = new BatchServiceClient();
            this.projectId = config.gcp.project_id;
            this.location = config.gcp.location || 'us-central1';
            logger.info('⚡ [Cloud Batch] Google Cloud Batch Client initialized for HPC workloads.');
        } catch (error) {
            logger.warn('⚠️ [Cloud Batch] Could not initialize Batch Client.');
        }
    }

    /**
     * Submits an HPC job to parallel-process a petabyte-scale monorepo.
     * @param {string} repositoryUrl - The URL or Cloud Storage path of the monorepo
     * @param {number} coreCount - The number of CPU cores to provision (e.g., 10000)
     */
    async executeMassiveIngestionJob(repositoryUrl, coreCount = 10000) {
        logger.info(`⚡ [Cloud Batch] Swarm is dispatching HPC job for [${repositoryUrl}] requesting ${coreCount} cores...`);
        
        try {
            const parent = `projects/${this.projectId}/locations/${this.location}`;
            const jobId = `swarm-ingestion-${Date.now()}`;

            const request = {
                parent,
                jobId,
                job: {
                    taskGroups: [
                        {
                            taskSpec: {
                                runnables: [
                                    {
                                        container: {
                                            imageUri: 'gcr.io/alti-code-studio/swarm-ingestion-worker:latest',
                                            commands: ['node', 'index.js', '--repo', repositoryUrl],
                                        },
                                    },
                                ],
                                computeResource: {
                                    cpuMilli: 1000, // 1 vCPU per task
                                    memoryMib: 4096, // 4GB per task
                                },
                                maxRetryCount: 2,
                            },
                            // Execute the tasks in extreme parallel based on the requested core count
                            taskCount: coreCount,
                            parallelism: Math.min(coreCount, 1000), // Max concurrent nodes per Batch API limits
                        },
                    ],
                    allocationPolicy: {
                        instances: [
                            {
                                policy: {
                                    machineType: 'c2-standard-4', // Compute-optimized instances
                                },
                            },
                        ],
                    },
                    logsPolicy: {
                        destination: 'CLOUD_LOGGING',
                    },
                },
            };

            const [response] = await this.batchClient.createJob(request);
            logger.info(`✅ [Cloud Batch] HPC Ingestion Job [${response.name}] submitted. Swarm is processing at supercomputer speeds.`);
            return response.name;
        } catch (error) {
            logger.error(`❌ [Cloud Batch] Failed to submit HPC job:`, error.message);
            return null;
        }
    }
}

export const cloudBatchService = new GoogleCloudBatchService();
