import { logger } from '../../../shared/logger.js';

class GcpServiceMeshService {
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
        logger.info('✅ GCP Service Mesh service initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ GCP Service Mesh init failed: ${e.message}`);
    }
  }

  async listMeshes() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpServiceMesh: Not initialized, returning empty');
      return { meshes: [] };
    }
    try {
      const url = `https://networkservices.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/meshes`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpServiceMesh.listMeshes failed: ${e.message}`);
      return { meshes: [] };
    }
  }

  async getMesh(meshName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://networkservices.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/meshes/${meshName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpServiceMesh.getMesh failed: ${e.message}`);
      return null;
    }
  }

  async listEndpointPolicies() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpServiceMesh: Not initialized, returning empty');
      return { endpointPolicies: [] };
    }
    try {
      const url = `https://networkservices.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/endpointPolicies`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpServiceMesh.listEndpointPolicies failed: ${e.message}`);
      return { endpointPolicies: [] };
    }
  }

  async listGateways() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpServiceMesh: Not initialized, returning empty');
      return { gateways: [] };
    }
    try {
      const url = `https://networkservices.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/gateways`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpServiceMesh.listGateways failed: ${e.message}`);
      return { gateways: [] };
    }
  }
}

export const gcpServiceMeshService = new GcpServiceMeshService();
