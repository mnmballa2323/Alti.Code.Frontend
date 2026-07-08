import { logger } from '../../../shared/logger.js';

class GcpBigtableService {
  constructor() {
    this.auth = null;
    this.client = null;
    this.projectId = process.env.GCP_PROJECT_ID;
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
      logger.info('✅ GCP Cloud Bigtable service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Cloud Bigtable init failed: ${e.message}`);
    }
  }

  /**
   * List all Bigtable instances in the project.
   * @returns {Promise<object>} Instances list
   */
  async listInstances() {
    if (!this.isInitialized || !this.client) return { instances: [] };
    try {
      const url = `https://bigtableadmin.googleapis.com/v2/projects/${this.projectId}/instances`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpBigtable.listInstances failed: ${e.message}`);
      return { instances: [] };
    }
  }

  /**
   * List all tables in a Bigtable instance.
   * @param {string} instanceName - Full instance resource name (projects/{project}/instances/{instance})
   * @returns {Promise<object>} Tables list
   */
  async listTables(instanceName) {
    if (!this.isInitialized || !this.client) return { tables: [] };
    try {
      const url = `https://bigtableadmin.googleapis.com/v2/${instanceName}/tables`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpBigtable.listTables failed: ${e.message}`);
      return { tables: [] };
    }
  }

  /**
   * Read rows from a Bigtable table.
   * @param {string} instanceName - Full instance resource name
   * @param {string} tableName - Table name
   * @param {object} [filter] - Optional RowFilter
   * @returns {Promise<object>} Read rows response
   */
  async readRows(instanceName, tableName, filter = {}) {
    if (!this.isInitialized || !this.client) return { chunks: [] };
    try {
      const url = `https://bigtableadmin.googleapis.com/v2/${instanceName}/tables/${tableName}:readRows`;
      const body = {};
      if (filter && Object.keys(filter).length > 0) {
        body.filter = filter;
      }
      const res = await this.client.request({ url, method: 'POST', data: body });
      return res.data;
    } catch (e) {
      logger.warn(`GcpBigtable.readRows failed: ${e.message}`);
      return { chunks: [] };
    }
  }

  /**
   * Write a single row to a Bigtable table.
   * @param {string} instanceName - Full instance resource name
   * @param {string} tableName - Table name
   * @param {string} rowKey - Row key (base64 encoded)
   * @param {Array<object>} columns - Array of { familyName, qualifier, value, timestampMicros }
   * @returns {Promise<object|null>} Mutation response
   */
  async writeRow(instanceName, tableName, rowKey, columns = []) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://bigtableadmin.googleapis.com/v2/${instanceName}/tables/${tableName}:mutateRow`;
      const mutations = columns.map((col) => ({
        setCell: {
          familyName: col.familyName,
          columnQualifier: Buffer.from(col.qualifier || '').toString('base64'),
          value: Buffer.from(col.value || '').toString('base64'),
          timestampMicros: col.timestampMicros || -1,
        },
      }));
      const body = {
        rowKey: Buffer.from(rowKey).toString('base64'),
        mutations,
      };
      const res = await this.client.request({ url, method: 'POST', data: body });
      logger.info(`GcpBigtable: Row written to ${tableName}`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpBigtable.writeRow failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpBigtableService = new GcpBigtableService();
