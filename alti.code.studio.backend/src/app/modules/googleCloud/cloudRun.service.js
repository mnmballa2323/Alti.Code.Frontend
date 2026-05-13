import { JobsClient } from '@google-cloud/run';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';
import ApiError from '../../../errors/ApiError.js';
import httpStatus from 'http-status';
import { SecretManagerService } from './secretManager.service.js';

let runClient = null;
const getClient = () => {
    if (!runClient) runClient = new JobsClient();
    return runClient;
};

/**
 * Execute an autonomous coding job on Google Cloud Run
 * This is the 'Jules' philosophy: asynchronous, secure, VM-based coding.
 * @param {string} jobId - Unique name for the job
 * @param {string} image - Container image (e.g. gcr.io/project/alti-jules-worker)
 * @param {object} envVars - Environment variables for the task
 * @param {string[]} secretIds - Optional IDs of secrets to fetch and inject
 */
const executeCodingJob = async (jobId, image, envVars = {}, secretIds = []) => {
    try {
        const project = config.gcp.project_id;
        const location = config.gcp.location;
        const parent = `projects/${project}/locations/${location}`;

        logger.info(`🚀 [CloudRun] Spawning autonomous coding job: ${jobId}`);

        // Fetch required secrets from Google Secret Manager
        const injectedSecrets = {};
        for (const secretId of secretIds) {
            try {
                const value = await SecretManagerService.getSecret(secretId);
                injectedSecrets[secretId] = value;
            } catch (err) {
                logger.warn(`⚠️ [CloudRun] Failed to fetch secret ${secretId} for job ${jobId}`);
            }
        }

        const [operation] = await runClient.runJob({
            name: `${parent}/jobs/${jobId}`,
            overrides: {
                containerOverrides: [
                    {
                        env: [
                            ...Object.entries(envVars).map(([name, value]) => ({ name, value })),
                            ...Object.entries(injectedSecrets).map(([name, value]) => ({ name, value: String(value) }))
                        ],
                    },
                ],
            },
        });

        logger.info(`✅ [CloudRun] Job ${jobId} dispatched. Operation: ${operation.name}`);
        return {
            jobId,
            operation: operation.name,
            status: 'dispatched'
        };
    } catch (error) {
        logger.error('Cloud Run Job Dispatch Error:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Cloud Run Job failed: ${error.message}`);
    }
};

export const GoogleCloudRunService = {
    executeCodingJob
};
