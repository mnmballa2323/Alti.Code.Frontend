import { logger } from '../../../shared/logger.js';

class GcpTalentService {
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
      logger.info('✅ GCP Cloud Talent Solution service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Cloud Talent Solution init failed: ${e.message}`);
    }
  }

  /**
   * Search for jobs matching a query and filters.
   * @param {string} query - Search query string
   * @param {object} [filters] - Optional filters (locationFilters, jobCategories, companyNames, etc.)
   * @returns {Promise<object>} Search results
   */
  async searchJobs(query, filters = {}) {
    if (!this.isInitialized || !this.client) return { matchingJobs: [] };
    try {
      const url = `https://jobs.googleapis.com/v4/projects/${this.projectId}/tenants/-/jobs:search`;
      const body = {
        requestMetadata: {
          domain: process.env.APP_DOMAIN || 'alti.code.studio',
          userId: 'system',
        },
        jobQuery: {
          query,
          ...filters,
        },
      };
      const res = await this.client.request({ url, method: 'POST', data: body });
      logger.info(`GcpTalent: Job search returned ${res.data.matchingJobs?.length || 0} result(s)`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpTalent.searchJobs failed: ${e.message}`);
      return { matchingJobs: [] };
    }
  }

  /**
   * Create a new job posting.
   * @param {object} job - Job resource object (company, title, description, addresses, etc.)
   * @returns {Promise<object|null>} Created job
   */
  async createJob(job) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://jobs.googleapis.com/v4/projects/${this.projectId}/tenants/-/jobs`;
      const body = { job };
      const res = await this.client.request({ url, method: 'POST', data: body });
      logger.info(`GcpTalent: Job created: ${res.data.name}`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpTalent.createJob failed: ${e.message}`);
      return null;
    }
  }

  /**
   * List all jobs in the project.
   * @returns {Promise<object>} Jobs list
   */
  async listJobs() {
    if (!this.isInitialized || !this.client) return { jobs: [] };
    try {
      const url = `https://jobs.googleapis.com/v4/projects/${this.projectId}/tenants/-/jobs`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpTalent.listJobs failed: ${e.message}`);
      return { jobs: [] };
    }
  }

  /**
   * Get a specific job by name.
   * @param {string} jobName - Full job resource name (projects/{project}/tenants/{tenant}/jobs/{job})
   * @returns {Promise<object|null>} Job details
   */
  async getJob(jobName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://jobs.googleapis.com/v4/${jobName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpTalent.getJob failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpTalentService = new GcpTalentService();
