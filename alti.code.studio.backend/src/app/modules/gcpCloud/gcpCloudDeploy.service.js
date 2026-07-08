import { logger } from '../../../shared/logger.js';

class GcpCloudDeployService {
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
        const { CloudDeployClient } = await import('@google-cloud/deploy');
        this.client = new CloudDeployClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Deploy: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Deploy init failed: ${e.message}`);
    }
  }

  _parentPath() {
    return `projects/${this.projectId}/locations/${this.region}`;
  }

  /**
   * Create a delivery pipeline for progressive rollouts.
   * @param {string} pipelineId - Pipeline identifier
   * @param {object} pipeline - Pipeline configuration
   */
  async createDeliveryPipeline(pipelineId, pipeline) {
    if (this.isInitialized && this.client) {
      try {
        const [operation] = await this.client.createDeliveryPipeline({
          parent: this._parentPath(),
          deliveryPipelineId: pipelineId,
          deliveryPipeline: {
            description: pipeline.description || `Alti Code Studio - ${pipelineId}`,
            serialPipeline: {
              stages: pipeline.stages || [
                { targetId: 'dev', profiles: ['dev'] },
                { targetId: 'staging', profiles: ['staging'] },
                {
                  targetId: 'production',
                  profiles: ['production'],
                  strategy: {
                    canary: {
                      runtimeConfig: {
                        cloudRun: { automaticTrafficControl: true },
                      },
                      canaryDeployment: {
                        percentages: [10, 25, 50],
                        verify: true,
                      },
                    },
                  },
                },
              ],
            },
            labels: {
              managed_by: 'alti-code-studio',
              environment: process.env.NODE_ENV || 'development',
            },
          },
        });

        const [result] = await operation.promise();
        logger.info(`🚀 Cloud Deploy: Pipeline created — ${result.name}`);
        return { name: result.name, uid: result.uid };
      } catch (e) {
        logger.error(`❌ Cloud Deploy createDeliveryPipeline failed: ${e.message}`);
      }
    }

    logger.info(`🚀 Cloud Deploy Mock: Created pipeline ${pipelineId}`);
    return { name: `${this._parentPath()}/deliveryPipelines/${pipelineId}`, uid: `mock-${Date.now()}` };
  }

  /**
   * Create a release for a delivery pipeline.
   */
  async createRelease(pipelineName, releaseId, release) {
    if (this.isInitialized && this.client) {
      try {
        const [operation] = await this.client.createRelease({
          parent: pipelineName,
          releaseId,
          release: {
            description: release.description || `Release ${releaseId}`,
            buildArtifacts: release.buildArtifacts || [],
            skaffoldConfigUri: release.skaffoldConfigUri,
            skaffoldConfigPath: release.skaffoldConfigPath || 'skaffold.yaml',
            labels: {
              release_id: releaseId,
              managed_by: 'alti-code-studio',
            },
          },
        });

        const [result] = await operation.promise();
        logger.info(`🚀 Cloud Deploy: Release created — ${result.name}`);
        return { name: result.name, uid: result.uid, renderState: result.renderState };
      } catch (e) {
        logger.error(`❌ Cloud Deploy createRelease failed: ${e.message}`);
      }
    }

    return { name: `${pipelineName}/releases/${releaseId}`, uid: `mock-${Date.now()}` };
  }

  /**
   * Approve a rollout to proceed to the next stage.
   */
  async approveRollout(rolloutName) {
    if (this.isInitialized && this.client) {
      try {
        await this.client.approveRollout({
          name: rolloutName,
          approved: true,
        });
        logger.info(`✅ Cloud Deploy: Rollout approved — ${rolloutName}`);
        return { approved: true };
      } catch (e) {
        logger.error(`❌ Cloud Deploy approveRollout failed: ${e.message}`);
      }
    }

    return { approved: false };
  }

  /**
   * Get release status.
   */
  async getRelease(releaseName) {
    if (this.isInitialized && this.client) {
      try {
        const [release] = await this.client.getRelease({ name: releaseName });
        return {
          name: release.name,
          renderState: release.renderState,
          condition: release.condition,
          createTime: release.createTime,
          targetRenders: release.targetRenders,
        };
      } catch (e) {
        logger.error(`❌ Cloud Deploy getRelease failed: ${e.message}`);
      }
    }

    return { name: releaseName, renderState: 'UNKNOWN' };
  }

  /**
   * List delivery pipelines.
   */
  async listPipelines() {
    if (this.isInitialized && this.client) {
      try {
        const [pipelines] = await this.client.listDeliveryPipelines({ parent: this._parentPath() });
        return pipelines.map((p) => ({
          name: p.name,
          uid: p.uid,
          description: p.description,
          createTime: p.createTime,
        }));
      } catch (e) {
        logger.error(`❌ Cloud Deploy listPipelines failed: ${e.message}`);
      }
    }

    return [];
  }
}

export const gcpCloudDeployService = new GcpCloudDeployService();
