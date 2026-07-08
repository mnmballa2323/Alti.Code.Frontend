import { logger } from '../../../shared/logger.js';

class GcpCloudBillingService {
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
      logger.info('✅ GCP Cloud Billing service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Cloud Billing init failed: ${e.message}`);
    }
  }

  async getProjectBillingInfo() {
    if (!this.isInitialized || !this.client) {
      logger.warn('GcpCloudBilling: Not initialized, returning fallback');
      return null;
    }
    try {
      const url = `https://cloudbilling.googleapis.com/v1/projects/${this.projectId}/billingInfo`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudBilling.getProjectBillingInfo failed: ${e.message}`);
      return null;
    }
  }

  async getBillingAccount(accountName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://cloudbilling.googleapis.com/v1/${accountName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudBilling.getBillingAccount failed: ${e.message}`);
      return null;
    }
  }

  async listBudgets() {
    if (!this.isInitialized || !this.client) return { budgets: [] };
    try {
      const billingInfo = await this.getProjectBillingInfo();
      if (!billingInfo?.billingAccountName) return { budgets: [] };
      const url = `https://billingbudgets.googleapis.com/v1/${billingInfo.billingAccountName}/budgets`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudBilling.listBudgets failed: ${e.message}`);
      return { budgets: [] };
    }
  }

  async getCostForecast(months = 3) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const now = new Date();
      const startDate = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
      const end = new Date(now);
      end.setMonth(end.getMonth() + months);
      const endDate = { year: end.getFullYear(), month: end.getMonth() + 1, day: end.getDate() };

      const billingInfo = await this.getProjectBillingInfo();
      if (!billingInfo?.billingAccountName) return null;

      const url = `https://cloudbilling.googleapis.com/v1/${billingInfo.billingAccountName}:forecastCosts`;
      const res = await this.client.request({
        url,
        method: 'POST',
        data: {
          forecastPeriod: { startDate, endDate },
        },
      });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCloudBilling.getCostForecast failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpCloudBillingService = new GcpCloudBillingService();
