import { CloudTasksClient } from '@google-cloud/tasks';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';
import { identityService } from './identity.service.js';

/**
 * Google Cloud Tasks Integration.
 * Dispatches heavy asynchronous agent workloads to Google's highly durable serverless queue.
 */
class GoogleCloudTasksService {
    constructor() {
        this.project = config.gcp.project_id;
        this.location = config.gcp.location || 'us-central1';
        this.queue = config.gcp.tasks_queue_name || 'alti-agent-queue';

        try {
            this.client = new CloudTasksClient();
        } catch (error) {
            logger.warn('⚠️ [CloudTasks] Could not initialize CloudTasksClient. Ensure APIs are enabled.');
        }
    }

    /**
     * Creates an HTTP task to be executed asynchronously.
     * @param {string} endpoint - The internal/external webhook to trigger
     * @param {object} payload - The data payload for the agent job
     * @param {number} inSeconds - Optional delay before execution
     */
    async dispatchAgentJob(endpoint, payload, inSeconds = 0) {
        logger.info(`📋 [CloudTasks] Dispatching job to queue ${this.queue}...`);
        try {
            const parent = this.client.queuePath(this.project, this.location, this.queue);

            // 🛡️ Zero-Trust Identity: Generate short-lived OIDC Token for secure HTTP Invocation
            let authorizationHeader = '';
            try {
                authorizationHeader = await identityService.generateSecureIdToken(endpoint);
            } catch (authError) {
                logger.warn(`⚠️ [CloudTasks] Could not generate OIDC Token, attempting unauthenticated dispatch...`);
            }

            const task = {
                httpRequest: {
                    httpMethod: 'POST',
                    url: endpoint,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authorizationHeader && { 'Authorization': authorizationHeader }),
                    },
                    body: Buffer.from(JSON.stringify(payload)).toString('base64'),
                },
            };

            if (inSeconds > 0) {
                // Schedule task for future execution
                task.scheduleTime = {
                    seconds: inSeconds + Date.now() / 1000,
                };
            }

            const request = { parent, task };
            
            // Execute the gRPC call
            const [response] = await this.client.createTask(request);
            logger.info(`✅ [CloudTasks] Created task ${response.name}`);
            
            return { success: true, taskName: response.name };
        } catch (error) {
            logger.error(`❌ [CloudTasks] Failed to create task:`, error.message);
            // Non-fatal catch for local dev without a real queue
            return { success: false, mode: 'fallback_local_execution' };
        }
    }
}

export const cloudTasksService = new GoogleCloudTasksService();
