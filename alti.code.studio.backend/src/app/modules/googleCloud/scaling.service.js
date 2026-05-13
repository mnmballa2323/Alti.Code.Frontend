import { ContainerServiceClient } from '@google-cloud/container';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

const gkeClient = new ContainerServiceClient();

/**
 * Service for Horizontal Swarm Scaling via GKE Autopilot.
 * This provides Alti with 'Infinite Capacity' by dynamically spawning agent pods.
 */
const adjustSwarmCapacity = async (targetWorkerCount) => {
    logger.info(`🚀 [Scaling] Discarding single-thread limits. Launching ${targetWorkerCount} parallel Cloud Run Jobs...`);

    try {
        const { ExecutionsClient } = await import('@google-cloud/run');
        const runClient = new ExecutionsClient();

        // Natively dispatch massively-parallel agent workloads to Google Cloud Run
        const parent = `projects/${config.gcp.project_id}/locations/${config.gcp.location}/jobs/alti-agent-worker`;
        
        const request = {
            name: parent,
            // Override job configuration to spawn exactly `targetWorkerCount` parallel tasks
            overrides: {
                taskCount: targetWorkerCount,
            }
        };

        const [operation] = await runClient.runJob(request);
        logger.info(`✅ [Scaling] Cloud Run Jobs dispatched! Operation: ${operation.name}`);
        
        return {
            status: 'scaling_in_progress',
            target: targetWorkerCount,
            operationId: operation.name
        };
    } catch (error) {
        logger.error('Cloud Run Jobs Scaling Error:', error.message);
        // Soft fail: on local dev, we simulate scaling
        return { status: 'simulated_scale', target: targetWorkerCount };
    }
};

export const ScalingService = {
    adjustSwarmCapacity
};
