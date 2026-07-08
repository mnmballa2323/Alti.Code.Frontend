import { logger } from '../../../shared/logger.js';

class GcpBatchService {
  constructor() {
    this.batchClient = null;
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
        const { BatchServiceClient } = await import('@google-cloud/batch');
        const { GoogleAuth } = await import('google-auth-library');
        this.batchClient = new BatchServiceClient();
        this.auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
        this.isInitialized = true;
        logger.info('✅ Google Cloud Batch: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Batch init failed: ${e.message}. Using mock.`);
    }
  }

  /**
   * Fetch an access token for REST API calls.
   */
  async _getAccessToken() {
    const client = await this.auth.getClient();
    const token = await client.getAccessToken();
    return token.token;
  }

  /**
   * Submit a container batch compute job via Google Cloud Batch.
   */
  async submitComputeJob(jobId, dockerImage, commands) {
    if (this.isInitialized && this.batchClient) {
      try {
        const parent = `projects/${this.projectId}/locations/${this.region}`;

        logger.info(`⚙️ Google Cloud Batch: Submitting container job ${jobId}`);

        const [response] = await this.batchClient.createJob({
          parent,
          jobId,
          job: {
            taskGroups: [
              {
                taskSpec: {
                  runnables: [
                    {
                      container: {
                        imageUri: dockerImage,
                        commands: Array.isArray(commands) ? commands : [commands],
                      },
                    },
                  ],
                  maxRetryCount: 2,
                  maxRunDuration: { seconds: 3600 },
                },
                taskCount: 1,
                parallelism: 1,
              },
            ],
            logsPolicy: {
              destination: 'CLOUD_LOGGING',
            },
            labels: {
              environment: process.env.NODE_ENV || 'development',
              managed_by: 'alti-code-studio',
            },
          },
        });

        logger.info(`⚙️ Google Cloud Batch: Job created — ${response.name}, status: ${response.status?.state}`);

        return {
          jobId: response.name,
          status: response.status?.state || 'QUEUED',
          createTime: response.createTime,
        };
      } catch (e) {
        logger.error(`❌ Cloud Batch job submission failed: ${e.message}`);
      }
    }

    logger.info(`⚙️ Google Cloud Batch Mock: Submitted container job ${jobId} with image ${dockerImage}`);
    return { jobId, status: 'submitted' };
  }

  /**
   * Trigger a container build via Google Cloud Build REST API.
   */
  async triggerContainerBuild(repoUri, imageName) {
    if (this.isInitialized && this.auth) {
      try {
        const token = await this._getAccessToken();
        const url = `https://cloudbuild.googleapis.com/v1/projects/${this.projectId}/builds`;

        logger.info(`⚙️ Google Cloud Build: Triggering build for ${imageName}`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: {
              repoSource: {
                repoName: repoUri,
                branchName: 'main',
              },
            },
            steps: [
              {
                name: 'gcr.io/cloud-builders/docker',
                args: [
                  'build',
                  '-t',
                  `${this.region}-docker.pkg.dev/${this.projectId}/alti-images/${imageName}:$SHORT_SHA`,
                  '.',
                ],
              },
              {
                name: 'gcr.io/cloud-builders/docker',
                args: [
                  'push',
                  `${this.region}-docker.pkg.dev/${this.projectId}/alti-images/${imageName}:$SHORT_SHA`,
                ],
              },
            ],
            images: [
              `${this.region}-docker.pkg.dev/${this.projectId}/alti-images/${imageName}:$SHORT_SHA`,
            ],
            options: {
              logging: 'CLOUD_LOGGING_ONLY',
              machineType: 'E2_HIGHCPU_8',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const buildId = data.metadata?.build?.id || `gcb-${Date.now()}`;
          logger.info(`⚙️ Google Cloud Build: Build triggered — ${buildId}`);
          return { buildId, status: 'QUEUED' };
        }

        throw new Error(`Cloud Build API returned ${response.status}`);
      } catch (e) {
        logger.error(`❌ Cloud Build trigger failed: ${e.message}`);
      }
    }

    logger.info(`⚙️ Google Cloud Build Mock: Triggered build for ${imageName}`);
    return { buildId: `gcb-build-${Date.now()}`, status: 'success' };
  }

  /**
   * Submit a Vertex AI Custom Training Job for GPU/TPU workloads.
   */
  async triggerTpuOrchestration(modelName) {
    if (this.isInitialized && this.auth) {
      try {
        const token = await this._getAccessToken();
        const url = `https://${this.region}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/customJobs`;

        logger.info(`⚙️ Vertex AI: Creating custom training job for ${modelName}`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            displayName: `alti-training-${modelName}-${Date.now()}`,
            jobSpec: {
              workerPoolSpecs: [
                {
                  machineSpec: {
                    machineType: 'n1-standard-8',
                    acceleratorType: 'NVIDIA_TESLA_T4',
                    acceleratorCount: 1,
                  },
                  replicaCount: 1,
                  containerSpec: {
                    imageUri: `${this.region}-docker.pkg.dev/${this.projectId}/alti-images/training:latest`,
                    args: ['--model', modelName],
                  },
                },
              ],
            },
            labels: {
              model: modelName.replace(/[^a-z0-9-]/g, '-'),
              managed_by: 'alti-code-studio',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          logger.info(`⚙️ Vertex AI: Custom job created — ${data.name}`);
          return { clusterId: data.name, status: 'PENDING' };
        }

        throw new Error(`Vertex AI API returned ${response.status}`);
      } catch (e) {
        logger.error(`❌ Vertex AI custom job failed: ${e.message}`);
      }
    }

    logger.info(`⚙️ Vertex AI Mock: Allocating cluster for ${modelName}`);
    return { clusterId: `tpu-cluster-${Date.now()}`, status: 'allocated' };
  }

  /**
   * Run a Cloud Run Job execution.
   */
  async runCloudJob(jobName) {
    if (this.isInitialized && this.auth) {
      try {
        const token = await this._getAccessToken();
        const url = `https://run.googleapis.com/v2/projects/${this.projectId}/locations/${this.region}/jobs/${jobName}:run`;

        logger.info(`⚙️ Google Cloud Run Jobs: Triggering ${jobName}`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const executionName = data.metadata?.name || data.name;
          logger.info(`⚙️ Google Cloud Run Jobs: Execution started — ${executionName}`);
          return { executionId: executionName, status: 'RUNNING' };
        }

        throw new Error(`Cloud Run Jobs API returned ${response.status}`);
      } catch (e) {
        logger.error(`❌ Cloud Run Jobs execution failed: ${e.message}`);
      }
    }

    logger.info(`⚙️ Google Cloud Run Jobs Mock: Triggered job ${jobName}`);
    return { executionId: `gcr-exec-${Date.now()}` };
  }

  /**
   * Get Cloud Batch job status.
   */
  async getJobStatus(jobName) {
    if (this.isInitialized && this.batchClient) {
      try {
        const [job] = await this.batchClient.getJob({ name: jobName });
        return {
          name: job.name,
          state: job.status?.state,
          events: job.status?.statusEvents?.slice(-5),
          createTime: job.createTime,
          updateTime: job.updateTime,
        };
      } catch (e) {
        logger.error(`❌ Cloud Batch getJob failed: ${e.message}`);
      }
    }

    return { name: jobName, state: 'UNKNOWN' };
  }
}

export const gcpBatchService = new GcpBatchService();
export const cloudBatchService = gcpBatchService;
export const cloudBuildService = gcpBatchService;
export const tpuOrchestratorService = gcpBatchService;
export const cloudRunJobsService = gcpBatchService;
