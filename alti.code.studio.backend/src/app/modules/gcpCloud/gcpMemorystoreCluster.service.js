import { logger } from '../../../shared/logger.js';

class GcpMemorystoreClusterService {
  constructor() {
    this.auth = null;
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID;
    this.region = process.env.GCP_REGION || 'us-central1';
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    try {
      if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !this.projectId) return;

      const { GoogleAuth } = await import('google-auth-library');
      this.auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
      this.client = await this.auth.getClient();
      this.projectId = this.projectId || await this.auth.getProjectId();
      this.isInitialized = true;
      logger.info('✅ GCP Memorystore Cluster service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Memorystore Cluster init failed: ${e.message}`);
    }
  }

  async listClusters() {
    if (!this.isInitialized || !this.client) return { clusters: [] };
    try {
      const url = `https://redis.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/clusters`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpMemorystoreCluster.listClusters failed: ${e.message}`);
      return { clusters: [] };
    }
  }

  async getCluster(clusterName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://redis.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/clusters/${clusterName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpMemorystoreCluster.getCluster failed: ${e.message}`);
      return null;
    }
  }

  async getClusterNodes(clusterName) {
    const cluster = await this.getCluster(clusterName);
    if (!cluster) return [];
    return cluster.discoveryEndpoints || [];
  }

  async getMetrics(clusterName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const now = new Date();
      const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const url = `https://monitoring.googleapis.com/v3/projects/${this.projectId}/timeSeries?filter=resource.type%3D%22redis.googleapis.com%2FCluster%22%20AND%20resource.labels.cluster_id%3D%22${clusterName}%22&interval.endTime=${now.toISOString()}&interval.startTime=${fiveMinAgo.toISOString()}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpMemorystoreCluster.getMetrics failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpMemorystoreClusterService = new GcpMemorystoreClusterService();
