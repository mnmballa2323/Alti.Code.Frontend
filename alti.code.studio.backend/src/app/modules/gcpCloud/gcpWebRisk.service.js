import { logger } from '../../../shared/logger.js';

class GcpWebRiskService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_PROJECT_ID) {
        const { WebRiskServiceClient } = await import('@google-cloud/web-risk');
        this.client = new WebRiskServiceClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Web Risk: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Web Risk init failed: ${e.message}`);
    }
  }

  /**
   * Check a URL against Google's threat intelligence database.
   * @param {string} url - URL to check for threats
   * @returns {Promise<object>} Threat assessment result
   */
  async checkUrl(url) {
    if (this.isInitialized && this.client) {
      try {
        const [response] = await this.client.searchUris({
          uri: url,
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING',
            'UNWANTED_SOFTWARE',
          ],
        });

        const threats = response.threat?.threatTypes || [];
        const isSafe = threats.length === 0;

        logger.info(`🛡️ Web Risk: ${url} → ${isSafe ? 'SAFE' : `THREATS: ${threats.join(', ')}`}`);

        return {
          url,
          isSafe,
          threats,
          expireTime: response.threat?.expireTime,
        };
      } catch (e) {
        logger.error(`❌ Web Risk checkUrl failed: ${e.message}`);
      }
    }

    logger.info(`🛡️ Web Risk Mock: Checking ${url}`);
    return { url, isSafe: true, threats: [] };
  }

  /**
   * Batch check multiple URLs for threats.
   * @param {string[]} urls - Array of URLs to check
   * @returns {Promise<object[]>} Array of threat results
   */
  async checkUrls(urls) {
    const results = [];
    for (const url of urls) {
      const result = await this.checkUrl(url);
      results.push(result);
    }
    return results;
  }

  /**
   * Submit a URL for evaluation (report a potentially malicious URL).
   */
  async submitUri(url, threatType = 'SOCIAL_ENGINEERING') {
    if (this.isInitialized && this.client) {
      try {
        const projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
        const [response] = await this.client.createSubmission({
          parent: `projects/${projectId}`,
          submission: {
            uri: url,
            threatTypes: [threatType],
          },
        });

        logger.info(`🛡️ Web Risk: Submitted URL for review — ${url}`);
        return { uri: response.uri, submitted: true };
      } catch (e) {
        logger.error(`❌ Web Risk submitUri failed: ${e.message}`);
      }
    }

    return { uri: url, submitted: false };
  }
}

export const gcpWebRiskService = new GcpWebRiskService();
