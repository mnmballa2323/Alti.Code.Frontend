import { logger } from '../../../shared/logger.js';

class GcpContainerAnalysisService {
  constructor() {
    this.client = null;
    this.grafeasClient = null;
    this.isInitialized = false;
    this._init();
  }

  async _init() {
    if (process.env.NODE_ENV === 'test' && process.env.GCP_REAL_SERVICES !== 'true') return;
    try {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCP_PROJECT_ID) {
        const { ContainerAnalysisClient } = await import('@google-cloud/containeranalysis');
        this.client = new ContainerAnalysisClient();
        this.grafeasClient = this.client.getGrafeasClient();
        this.isInitialized = true;
        logger.info('✅ Google Cloud Container Analysis: SDK initialized');
      }
    } catch (e) {
      logger.warn(`⚠️ Google Cloud Container Analysis init failed: ${e.message}`);
    }
  }

  /**
   * List vulnerability occurrences for a container image.
   * @param {string} imageUri - Container image URI (e.g. "gcr.io/project/image@sha256:...")
   * @returns {Promise<object[]>} Array of vulnerability occurrences
   */
  async listVulnerabilities(imageUri) {
    if (this.isInitialized && this.grafeasClient) {
      try {
        const projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
        const parent = `projects/${projectId}`;
        const filter = `kind="VULNERABILITY" AND resourceUrl="${imageUri}"`;

        const [occurrences] = await this.grafeasClient.listOccurrences({
          parent,
          filter,
        });

        logger.info(`🔬 Container Analysis: Found ${occurrences.length} vulnerabilities for ${imageUri}`);
        return occurrences;
      } catch (e) {
        logger.error(`❌ Container Analysis listVulnerabilities failed: ${e.message}`);
      }
    }

    logger.info(`🔬 Container Analysis Mock: listVulnerabilities(${imageUri})`);
    return [];
  }

  /**
   * Get all occurrences for a given resource URI.
   * @param {string} resourceUri - Full resource URI to query
   * @returns {Promise<object[]>} Array of occurrences
   */
  async getOccurrences(resourceUri) {
    if (this.isInitialized && this.grafeasClient) {
      try {
        const projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
        const parent = `projects/${projectId}`;
        const filter = `resourceUrl="${resourceUri}"`;

        const [occurrences] = await this.grafeasClient.listOccurrences({
          parent,
          filter,
        });

        logger.info(`📋 Container Analysis: ${occurrences.length} occurrences for ${resourceUri}`);
        return occurrences;
      } catch (e) {
        logger.error(`❌ Container Analysis getOccurrences failed: ${e.message}`);
      }
    }

    logger.info(`📋 Container Analysis Mock: getOccurrences(${resourceUri})`);
    return [];
  }

  /**
   * Create a note (vulnerability source, attestation authority, etc.).
   * @param {string} noteId - Unique note identifier
   * @param {object} body - Note body with vulnerability, attestation, or other details
   * @returns {Promise<object>} Created note
   */
  async createNote(noteId, body) {
    if (this.isInitialized && this.grafeasClient) {
      try {
        const projectId = process.env.GCP_PROJECT_ID || process.env.GCLOUD_PROJECT;
        const parent = `projects/${projectId}`;

        const [note] = await this.grafeasClient.createNote({
          parent,
          noteId,
          note: body,
        });

        logger.info(`📝 Container Analysis: Created note ${noteId}`);
        return note;
      } catch (e) {
        logger.error(`❌ Container Analysis createNote failed: ${e.message}`);
      }
    }

    logger.info(`📝 Container Analysis Mock: createNote(${noteId})`);
    return { name: `projects/mock/notes/${noteId}`, created: false };
  }
}

export const gcpContainerAnalysisService = new GcpContainerAnalysisService();
