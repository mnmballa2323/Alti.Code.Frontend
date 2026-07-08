import { logger } from '../../../shared/logger.js';

class GcpAuditLogsService {
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
      logger.info('✅ GCP Audit Logs service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Audit Logs init failed: ${e.message}`);
    }
  }

  async listAuditLogs(filter = '', hours = 24) {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpAuditLogs: Not initialized, returning fallback');
      return { entries: [] };
    }
    try {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      const baseFilter = `logName:"cloudaudit.googleapis.com" AND timestamp>="${cutoff}"`;
      const fullFilter = filter ? `${baseFilter} AND ${filter}` : baseFilter;

      const url = 'https://logging.googleapis.com/v2/entries:list';
      const res = await this.client.request({
        url,
        method: 'POST',
        data: {
          resourceNames: [`projects/${this.projectId}`],
          filter: fullFilter,
          orderBy: 'timestamp desc',
          pageSize: 100,
        },
      });
      return res.data;
    } catch (e) {
      logger.warn(`GcpAuditLogs.listAuditLogs failed: ${e.message}`);
      return { entries: [] };
    }
  }

  async getAdminActivity(hours = 24) {
    if (!this.isInitialized || !this.client) return { entries: [] };
    try {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      const filter = `logName="projects/${this.projectId}/logs/cloudaudit.googleapis.com%2Factivity" AND timestamp>="${cutoff}"`;

      const url = 'https://logging.googleapis.com/v2/entries:list';
      const res = await this.client.request({
        url,
        method: 'POST',
        data: {
          resourceNames: [`projects/${this.projectId}`],
          filter,
          orderBy: 'timestamp desc',
          pageSize: 100,
        },
      });
      return res.data;
    } catch (e) {
      logger.warn(`GcpAuditLogs.getAdminActivity failed: ${e.message}`);
      return { entries: [] };
    }
  }

  async getDataAccess(hours = 24) {
    if (!this.isInitialized || !this.client) return { entries: [] };
    try {
      const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
      const filter = `logName="projects/${this.projectId}/logs/cloudaudit.googleapis.com%2Fdata_access" AND timestamp>="${cutoff}"`;

      const url = 'https://logging.googleapis.com/v2/entries:list';
      const res = await this.client.request({
        url,
        method: 'POST',
        data: {
          resourceNames: [`projects/${this.projectId}`],
          filter,
          orderBy: 'timestamp desc',
          pageSize: 100,
        },
      });
      return res.data;
    } catch (e) {
      logger.warn(`GcpAuditLogs.getDataAccess failed: ${e.message}`);
      return { entries: [] };
    }
  }
}

export const gcpAuditLogsService = new GcpAuditLogsService();
