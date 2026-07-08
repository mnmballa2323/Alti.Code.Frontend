import { logger } from '../../../shared/logger.js';

class GcpDataflowService {
  constructor() {
    this.auth = null;
    this.projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
    this.region = process.env.GCP_REGION || 'us-central1';
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || this.projectId) {
        const { GoogleAuth } = await import('google-auth-library');
        this.auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
        this.isInitialized = true;
        logger.info('✅ Google Cloud Dataflow: REST API initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Dataflow init failed: ${e.message}`);
    }
  }

  async _getAccessToken() {
    const client = await this.auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
  }

  _baseUrl() {
    return `https://dataflow.googleapis.com/v1b3/projects/${this.projectId}/locations/${this.region}`;
  }

  /**
   * Create a Dataflow job from a template.
   * @param {string} jobName - Display name for the job
   * @param {string} templatePath - GCS path to the Dataflow template
   * @param {object} parameters - Template parameters
   */
  async createTemplateJob(jobName, templatePath, parameters = {}) {
    if (this.isInitialized && this.auth) {
      try {
        const token = await this._getAccessToken();
        const url = `${this._baseUrl()}/templates:launch`;

        logger.info(`📊 Dataflow: Launching template job ${jobName}`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobName,
            parameters,
            environment: {
              tempLocation: `gs://${this.projectId}-dataflow-temp/tmp`,
              machineType: 'n1-standard-4',
              maxWorkers: 10,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          logger.info(`📊 Dataflow: Job launched — ${data.job?.id}`);
          return { jobId: data.job?.id, name: data.job?.name, state: data.job?.currentState };
        }

        throw new Error(`Dataflow API returned ${response.status}`);
      } catch (e) {
        logger.error(`❌ Dataflow createTemplateJob failed: ${e.message}`);
      }
    }

    logger.info(`📊 Dataflow Mock: Would launch job ${jobName}`);
    return { jobId: `df-mock-${Date.now()}`, name: jobName, state: 'JOB_STATE_QUEUED' };
  }

  /**
   * Get the status of a Dataflow job.
   */
  async getJobStatus(jobId) {
    if (this.isInitialized && this.auth) {
      try {
        const token = await this._getAccessToken();
        const url = `${this._baseUrl()}/jobs/${jobId}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          return {
            jobId: data.id,
            name: data.name,
            state: data.currentState,
            createTime: data.createTime,
            type: data.type,
            stageStates: data.stageStates?.map((s) => ({
              name: s.executionStageName,
              state: s.executionStageState,
            })),
          };
        }

        throw new Error(`Dataflow API returned ${response.status}`);
      } catch (e) {
        logger.error(`❌ Dataflow getJobStatus failed: ${e.message}`);
      }
    }

    return { jobId, state: 'UNKNOWN' };
  }

  /**
   * Cancel a running Dataflow job.
   */
  async cancelJob(jobId) {
    if (this.isInitialized && this.auth) {
      try {
        const token = await this._getAccessToken();
        const url = `${this._baseUrl()}/jobs/${jobId}`;

        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestedState: 'JOB_STATE_CANCELLED',
          }),
        });

        if (response.ok) {
          logger.info(`📊 Dataflow: Job ${jobId} cancelled`);
          return { jobId, state: 'JOB_STATE_CANCELLED' };
        }

        throw new Error(`Dataflow API returned ${response.status}`);
      } catch (e) {
        logger.error(`❌ Dataflow cancelJob failed: ${e.message}`);
      }
    }

    return { jobId, state: 'UNKNOWN' };
  }

  /**
   * List active Dataflow jobs.
   */
  async listJobs(filter = 'ACTIVE') {
    if (this.isInitialized && this.auth) {
      try {
        const token = await this._getAccessToken();
        const url = `${this._baseUrl()}/jobs?filter=${filter}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          return (data.jobs || []).map((j) => ({
            jobId: j.id,
            name: j.name,
            state: j.currentState,
            type: j.type,
            createTime: j.createTime,
          }));
        }
      } catch (e) {
        logger.error(`❌ Dataflow listJobs failed: ${e.message}`);
      }
    }

    return [];
  }
}

export const gcpDataflowService = new GcpDataflowService();
