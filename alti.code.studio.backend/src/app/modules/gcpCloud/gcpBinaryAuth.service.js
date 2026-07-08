import { logger } from '../../../shared/logger.js';

class GcpBinaryAuthService {
  constructor() {
    this.authClient = null;
    this.projectId = null;
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_PROJECT_ID) {
        const { GoogleAuth } = await import('google-auth-library');
        const auth = new GoogleAuth({
          scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        this.authClient = await auth.getClient();
        this.projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
        this.isInitialized = true;
        logger.info('✅ Google Cloud Binary Authorization: REST client initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Binary Authorization init failed: ${e.message}`);
    }
  }

  /**
   * Get the Binary Authorization policy for the project.
   * @returns {Promise<object>} The project's Binary Authorization policy
   */
  async getPolicy() {
    if (this.isInitialized && this.authClient) {
      try {
        const url = `https://binaryauthorization.googleapis.com/v1/projects/${this.projectId}/policy`;
        const response = await this.authClient.request({ url, method: 'GET' });

        logger.info(`🔐 Binary Auth: Retrieved policy for project ${this.projectId}`);
        return response.data;
      } catch (e) {
        logger.error(`❌ Binary Auth getPolicy failed: ${e.message}`);
      }
    }

    logger.info(`🔐 Binary Auth Mock: getPolicy()`);
    return {
      defaultAdmissionRule: { evaluationMode: 'ALWAYS_ALLOW', enforcementMode: 'ENFORCED_BLOCK_AND_AUDIT_LOG' },
      clusterAdmissionRules: {},
    };
  }

  /**
   * Create an attestor for verifying container image signatures.
   * @param {string} attestorId - Unique attestor identifier
   * @param {string} noteReference - Fully qualified note name (e.g. "projects/my-project/notes/my-note")
   * @returns {Promise<object>} Created attestor
   */
  async createAttestor(attestorId, noteReference) {
    if (this.isInitialized && this.authClient) {
      try {
        const url = `https://binaryauthorization.googleapis.com/v1/projects/${this.projectId}/attestors?attestorId=${encodeURIComponent(attestorId)}`;
        const body = {
          userOwnedGrafeasNote: {
            noteReference,
          },
        };

        const response = await this.authClient.request({
          url,
          method: 'POST',
          data: body,
        });

        logger.info(`🔐 Binary Auth: Created attestor ${attestorId}`);
        return response.data;
      } catch (e) {
        logger.error(`❌ Binary Auth createAttestor failed: ${e.message}`);
      }
    }

    logger.info(`🔐 Binary Auth Mock: createAttestor(${attestorId})`);
    return { name: `projects/mock/attestors/${attestorId}`, created: false };
  }

  /**
   * Validate that an image has the required attestations for deployment.
   * @param {string} imageUri - Container image URI to validate
   * @returns {Promise<object>} Validation result
   */
  async validateAttestation(imageUri) {
    if (this.isInitialized && this.authClient) {
      try {
        const url = `https://binaryauthorization.googleapis.com/v1/projects/${this.projectId}/policy:evaluate`;
        const body = {
          resource: imageUri,
        };

        const response = await this.authClient.request({
          url,
          method: 'POST',
          data: body,
        });

        const verdict = response.data.verdict || 'UNKNOWN';
        logger.info(`🔐 Binary Auth: Validation for ${imageUri} → ${verdict}`);
        return response.data;
      } catch (e) {
        logger.error(`❌ Binary Auth validateAttestation failed: ${e.message}`);
      }
    }

    logger.info(`🔐 Binary Auth Mock: validateAttestation(${imageUri})`);
    return { imageUri, verdict: 'MOCK_ALLOW', attested: false };
  }
}

export const gcpBinaryAuthService = new GcpBinaryAuthService();
