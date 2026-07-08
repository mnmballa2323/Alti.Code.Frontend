import { logger } from '../../../shared/logger.js';

class GcpAlloyDBService {
  constructor() {
    this.auth = null;
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
        const { GoogleAuth } = await import('google-auth-library');
        this.auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        this.client = await this.auth.getClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud AlloyDB: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud AlloyDB init failed: ${e.message}`);
    }
  }

  _baseUrl() {
    return `https://alloydb.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}`;
  }

  /**
   * List all AlloyDB clusters in the configured region.
   * @returns {Promise<object[]>} Array of AlloyDB clusters
   */
  async listClusters() {
    if (this.isInitialized && this.client) {
      try {
        const url = `${this._baseUrl()}/clusters`;
        const res = await this.client.request({ url, method: 'GET' });
        const clusters = res.data.clusters || [];
        logger.info(`🗄️ AlloyDB: ${clusters.length} clusters found`);
        return clusters;
      } catch (e) {
        logger.warn(`⚠️ AlloyDB listClusters failed: ${e.message}`);
      }
    }

    logger.info('⚡ AlloyDB Mock: listClusters()');
    return [];
  }

  /**
   * Get details for a specific AlloyDB cluster.
   * @param {string} clusterName - Short cluster ID or fully qualified name
   * @returns {Promise<object>} Cluster details
   */
  async getCluster(clusterName) {
    const fullName = clusterName.startsWith('projects/')
      ? clusterName
      : `${this._baseUrl()}/clusters/${clusterName}`;

    if (this.isInitialized && this.client) {
      try {
        const url = clusterName.startsWith('projects/')
          ? `https://alloydb.googleapis.com/v1/${clusterName}`
          : `${this._baseUrl()}/clusters/${clusterName}`;
        const res = await this.client.request({ url, method: 'GET' });
        logger.info(`🗄️ AlloyDB: Retrieved cluster ${clusterName}`);
        return res.data;
      } catch (e) {
        logger.warn(`⚠️ AlloyDB getCluster failed: ${e.message}`);
      }
    }

    logger.info(`⚡ AlloyDB Mock: getCluster(${clusterName})`);
    return { name: fullName, state: 'READY', databaseVersion: 'POSTGRES_15' };
  }

  /**
   * List instances within an AlloyDB cluster.
   * @param {string} clusterName - Short cluster ID
   * @returns {Promise<object[]>} Array of instances
   */
  async listInstances(clusterName) {
    if (this.isInitialized && this.client) {
      try {
        const url = `${this._baseUrl()}/clusters/${clusterName}/instances`;
        const res = await this.client.request({ url, method: 'GET' });
        const instances = res.data.instances || [];
        logger.info(`🗄️ AlloyDB: ${instances.length} instances in cluster ${clusterName}`);
        return instances;
      } catch (e) {
        logger.warn(`⚠️ AlloyDB listInstances failed: ${e.message}`);
      }
    }

    logger.info(`⚡ AlloyDB Mock: listInstances(${clusterName})`);
    return [];
  }

  /**
   * Get connection info for an AlloyDB instance (IP, SSL config).
   * @param {string} instanceName - Fully qualified instance name or short ID within a cluster
   * @returns {Promise<object>} Connection information including IP address
   */
  async getConnectionInfo(instanceName) {
    if (this.isInitialized && this.client) {
      try {
        const url = instanceName.startsWith('projects/')
          ? `https://alloydb.googleapis.com/v1/${instanceName}/connectionInfo`
          : `${this._baseUrl()}/clusters/-/instances/${instanceName}/connectionInfo`;
        const res = await this.client.request({ url, method: 'GET' });
        logger.info(`🗄️ AlloyDB: Retrieved connection info for ${instanceName}`);
        return res.data;
      } catch (e) {
        logger.warn(`⚠️ AlloyDB getConnectionInfo failed: ${e.message}`);
      }
    }

    logger.info(`⚡ AlloyDB Mock: getConnectionInfo(${instanceName})`);
    return { ipAddress: '10.0.0.1', instanceUid: instanceName, pemCertificateChain: [] };
  }
}

export const gcpAlloyDBService = new GcpAlloyDBService();
