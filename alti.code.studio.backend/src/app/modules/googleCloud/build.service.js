import { CloudBuildClient } from '@google-cloud/cloudbuild';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Google Cloud Build Service.
 * Grants the Agent Swarm the autonomy to trigger Docker container builds,
 * package its generated code, and deploy it to the Google Artifact Registry natively.
 */
class GoogleCloudBuildService {
    constructor() {
        this.projectId = config.gcp.project_id;
        try {
            this.client = new CloudBuildClient();
        } catch (error) {
            logger.warn('⚠️ [CloudBuild] Could not initialize CloudBuildClient.');
        }
    }

    /**
     * Triggers an autonomous Docker build for a generated workspace.
     * @param {string} sourceRepo - e.g. 'github.com/alti-code-studio/workspace-123'
     * @param {string} imageName - e.g. 'us-central1-docker.pkg.dev/alti/repo/workspace-123'
     */
    async triggerContainerBuild(sourceRepo, imageName) {
        logger.info(`🏗️ [CloudBuild] Swarm is triggering autonomous container build for ${imageName}...`);

        try {
            const request = {
                projectId: this.projectId,
                build: {
                    steps: [
                        {
                            name: 'gcr.io/cloud-builders/docker',
                            args: ['build', '-t', imageName, '.'],
                        },
                    ],
                    images: [imageName],
                },
            };

            const [operation] = await this.client.createBuild(request);
            logger.info(`✅ [CloudBuild] Build triggered! Operation ID: ${operation.name}`);
            
            return {
                status: 'build_started',
                operationId: operation.name,
                image: imageName
            };
        } catch (error) {
            logger.error(`❌ [CloudBuild] Failed to trigger build:`, error.message);
            throw error;
        }
    }
}

export const cloudBuildService = new GoogleCloudBuildService();
