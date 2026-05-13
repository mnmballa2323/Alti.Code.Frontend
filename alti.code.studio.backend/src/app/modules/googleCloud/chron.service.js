import { CloudSchedulerClient } from '@google-cloud/scheduler';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Scheduler Service (Temporal Autonomy).
 * Grants the Swarm the ability to programmatically schedule its own recurring 
 * GCP chron jobs. The Swarm can schedule itself to wake up automatically 
 * to perform dependency updates, refactoring, or CVE patching.
 */
class GoogleChronService {
    constructor() {
        try {
            this.client = new CloudSchedulerClient();
            this.parent = this.client.locationPath(config.gcp.project_id, config.gcp.location || 'us-central1');
            logger.info('⏰ [Chron] Google Cloud Scheduler Client initialized.');
        } catch (error) {
            logger.warn('⚠️ [Chron] Could not initialize Cloud Scheduler Client.');
        }
    }

    /**
     * Schedules a recurring job for the Swarm.
     * @param {string} jobId - Unique name for the chron job
     * @param {string} schedule - Unix cron string (e.g. '0 3 * * 0' for Sunday 3 AM)
     * @param {string} targetUrl - The webhook URL that triggers the Swarm
     */
    async scheduleAutonomousJob(jobId, schedule, targetUrl) {
        logger.info(`⏰ [Chron] Swarm is scheduling autonomous chron job [${jobId}] at [${schedule}]...`);
        
        try {
            const job = {
                name: `${this.parent}/jobs/${jobId}`,
                httpTarget: {
                    uri: targetUrl,
                    httpMethod: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    // Typically an OIDC token is attached here for secure triggering
                },
                schedule: schedule,
                timeZone: 'UTC',
            };

            const request = {
                parent: this.parent,
                job: job,
            };

            const [response] = await this.client.createJob(request);
            logger.info(`✅ [Chron] Autonomous job scheduled: ${response.name}`);
            return response;
        } catch (error) {
            logger.error(`❌ [Chron] Failed to schedule job:`, error.message);
            return null;
        }
    }
}

export const chronService = new GoogleChronService();
