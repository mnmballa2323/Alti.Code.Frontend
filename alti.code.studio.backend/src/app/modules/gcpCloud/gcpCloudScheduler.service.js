import { logger } from '../../../shared/logger.js';

class GcpCloudSchedulerService {
  constructor() {
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
    this.region = process.env.GCP_REGION || 'us-central1';
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || this.projectId) {
        const { CloudSchedulerClient } = await import('@google-cloud/scheduler');
        this.client = new CloudSchedulerClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Scheduler: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Scheduler init failed: ${e.message}`);
    }
  }

  _parentPath() {
    return `projects/${this.projectId}/locations/${this.region}`;
  }

  /**
   * Create a scheduled HTTP job.
   * @param {string} jobId - Unique job identifier
   * @param {string} schedule - Cron expression (e.g., '0 * / 6 * * *' without spaces)
   * @param {string} url - Target HTTP endpoint
   * @param {object} [body] - Optional JSON body
   */
  async createHttpJob(jobId, schedule, url, body) {
    const parent = this._parentPath();

    if (this.isInitialized && this.client) {
      try {
        const [job] = await this.client.createJob({
          parent,
          job: {
            name: `${parent}/jobs/${jobId}`,
            schedule,
            timeZone: 'UTC',
            httpTarget: {
              uri: url,
              httpMethod: 'POST',
              body: body ? Buffer.from(JSON.stringify(body)).toString('base64') : undefined,
              headers: { 'Content-Type': 'application/json' },
            },
            retryConfig: {
              retryCount: 3,
              maxRetryDuration: { seconds: 300 },
              minBackoffDuration: { seconds: 5 },
              maxBackoffDuration: { seconds: 60 },
            },
          },
        });

        logger.info(`✅ Cloud Scheduler: Job created — ${job.name}`);
        return { name: job.name, schedule: job.schedule, state: job.state };
      } catch (e) {
        logger.error(`❌ Cloud Scheduler createJob failed: ${e.message}`);
      }
    }

    logger.info(`⚡ Cloud Scheduler Mock: Created job ${jobId} with schedule ${schedule}`);
    return { name: `${parent}/jobs/${jobId}`, schedule, state: 'ENABLED' };
  }

  /**
   * Create a scheduled Pub/Sub job.
   */
  async createPubSubJob(jobId, schedule, topicName, data) {
    const parent = this._parentPath();

    if (this.isInitialized && this.client) {
      try {
        const [job] = await this.client.createJob({
          parent,
          job: {
            name: `${parent}/jobs/${jobId}`,
            schedule,
            timeZone: 'UTC',
            pubsubTarget: {
              topicName: `projects/${this.projectId}/topics/${topicName}`,
              data: Buffer.from(JSON.stringify(data)).toString('base64'),
            },
          },
        });

        logger.info(`✅ Cloud Scheduler: Pub/Sub job created — ${job.name}`);
        return { name: job.name, schedule: job.schedule };
      } catch (e) {
        logger.error(`❌ Cloud Scheduler createPubSubJob failed: ${e.message}`);
      }
    }

    return { name: `${parent}/jobs/${jobId}`, schedule };
  }

  async pauseJob(jobName) {
    if (this.isInitialized && this.client) {
      try {
        const [job] = await this.client.pauseJob({ name: jobName });
        logger.info(`⏸️ Cloud Scheduler: Paused job ${jobName}`);
        return { name: job.name, state: job.state };
      } catch (e) {
        logger.error(`❌ Cloud Scheduler pauseJob failed: ${e.message}`);
      }
    }
    return { name: jobName, state: 'PAUSED' };
  }

  async resumeJob(jobName) {
    if (this.isInitialized && this.client) {
      try {
        const [job] = await this.client.resumeJob({ name: jobName });
        logger.info(`▶️ Cloud Scheduler: Resumed job ${jobName}`);
        return { name: job.name, state: job.state };
      } catch (e) {
        logger.error(`❌ Cloud Scheduler resumeJob failed: ${e.message}`);
      }
    }
    return { name: jobName, state: 'ENABLED' };
  }

  async deleteJob(jobName) {
    if (this.isInitialized && this.client) {
      try {
        await this.client.deleteJob({ name: jobName });
        logger.info(`🗑️ Cloud Scheduler: Deleted job ${jobName}`);
        return { deleted: true };
      } catch (e) {
        logger.error(`❌ Cloud Scheduler deleteJob failed: ${e.message}`);
      }
    }
    return { deleted: false };
  }

  async listJobs() {
    if (this.isInitialized && this.client) {
      try {
        const [jobs] = await this.client.listJobs({ parent: this._parentPath() });
        return jobs.map((j) => ({
          name: j.name,
          schedule: j.schedule,
          state: j.state,
          lastAttemptTime: j.lastAttemptTime,
          scheduleTime: j.scheduleTime,
        }));
      } catch (e) {
        logger.error(`❌ Cloud Scheduler listJobs failed: ${e.message}`);
      }
    }
    return [];
  }
}

export const gcpCloudSchedulerService = new GcpCloudSchedulerService();
