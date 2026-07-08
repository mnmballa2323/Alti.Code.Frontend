import { logger } from '../../../shared/logger.js';

class GcpDeploymentManagerService {
  constructor() {
    this.auth = null;
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID;
    this.region = process.env.GCP_REGION || 'us-central1';
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || this.projectId) {
        const { GoogleAuth } = await import('google-auth-library');
        this.auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        this.client = await this.auth.getClient();
        this.projectId = this.projectId || await this.auth.getProjectId();
        this.isInitialized = true;
        logger.info('✅ GCP Deployment Manager service initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ GCP Deployment Manager init failed: ${e.message}`);
    }
  }

  async listDeployments() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpDeploymentManager: Not initialized, returning empty');
      return { deployments: [] };
    }
    try {
      const url = `https://deploymentmanager.googleapis.com/v2/projects/${this.projectId}/global/deployments`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDeploymentManager.listDeployments failed: ${e.message}`);
      return { deployments: [] };
    }
  }

  async getDeployment(name) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://deploymentmanager.googleapis.com/v2/projects/${this.projectId}/global/deployments/${name}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDeploymentManager.getDeployment failed: ${e.message}`);
      return null;
    }
  }

  async getManifest(deploymentName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const deployment = await this.getDeployment(deploymentName);
      if (!deployment?.manifest) return null;
      const manifestUrl = deployment.manifest;
      const res = await this.client.request({ url: manifestUrl });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDeploymentManager.getManifest failed: ${e.message}`);
      return null;
    }
  }

  async listResources(deploymentName) {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpDeploymentManager: Not initialized, returning empty');
      return { resources: [] };
    }
    try {
      const url = `https://deploymentmanager.googleapis.com/v2/projects/${this.projectId}/global/deployments/${deploymentName}/resources`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDeploymentManager.listResources failed: ${e.message}`);
      return { resources: [] };
    }
  }
}

export const gcpDeploymentManagerService = new GcpDeploymentManagerService();
