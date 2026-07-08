import { logger } from '../../../shared/logger.js';

class GcpCertificateManagerService {
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
      logger.info('✅ GCP Certificate Manager service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Certificate Manager init failed: ${e.message}`);
    }
  }

  async listCertificates() {
    if (!this.isInitialized || !this.client) return { certificates: [] };
    try {
      const url = `https://certificatemanager.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/certificates`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCertificateManager.listCertificates failed: ${e.message}`);
      return { certificates: [] };
    }
  }

  async getCertificate(certName) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://certificatemanager.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/certificates/${certName}`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCertificateManager.getCertificate failed: ${e.message}`);
      return null;
    }
  }

  async createCertificate(domain) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const certId = `alti-cert-${domain.replace(/\./g, '-')}`;
      const url = `https://certificatemanager.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/certificates?certificateId=${certId}`;
      const body = {
        managed: { domains: [domain] },
        scope: 'DEFAULT',
      };
      const res = await this.client.request({ url, method: 'POST', data: body });
      return res.data;
    } catch (e) {
      logger.warn(`GcpCertificateManager.createCertificate failed: ${e.message}`);
      return null;
    }
  }

  async checkExpiry(certName) {
    const cert = await this.getCertificate(certName);
    if (!cert) return null;
    const expiry = new Date(cert.expireTime);
    const daysUntilExpiry = Math.floor((expiry - Date.now()) / (1000 * 60 * 60 * 24));
    return { certName, expiry: cert.expireTime, daysUntilExpiry, isExpiringSoon: daysUntilExpiry < 30 };
  }
}

export const gcpCertificateManagerService = new GcpCertificateManagerService();
