import { logger } from '../../../shared/logger.js';

class GcpDocumentAIService {
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
      logger.info('✅ GCP Document AI service initialized');
    } catch (e) {
      logger.warn(`⚠️ GCP Document AI init failed: ${e.message}`);
    }
  }

  /**
   * Process a document using a specified processor.
   * @param {string} processorName - Full processor resource name (projects/{project}/locations/{location}/processors/{processor})
   * @param {object} rawDocument - { content: base64String, mimeType: 'application/pdf' }
   * @returns {Promise<object|null>} Processed document result
   */
  async processDocument(processorName, rawDocument) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://documentai.googleapis.com/v1/${processorName}:process`;
      const body = { rawDocument };
      const res = await this.client.request({ url, method: 'POST', data: body });
      logger.info(`GcpDocumentAI: Document processed via ${processorName}`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpDocumentAI.processDocument failed: ${e.message}`);
      return null;
    }
  }

  /**
   * List all Document AI processors in the project.
   * @returns {Promise<object>} Processors list
   */
  async listProcessors() {
    if (!this.isInitialized || !this.client) return { processors: [] };
    try {
      const url = `https://documentai.googleapis.com/v1/projects/${this.projectId}/locations/${this.region}/processors`;
      const res = await this.client.request({ url });
      return res.data;
    } catch (e) {
      logger.warn(`GcpDocumentAI.listProcessors failed: ${e.message}`);
      return { processors: [] };
    }
  }

  /**
   * Batch process documents (long-running operation).
   * @param {string} processorName - Full processor resource name
   * @param {string} inputUri - GCS URI for input documents (e.g., gs://bucket/input/)
   * @param {string} outputUri - GCS URI for output results (e.g., gs://bucket/output/)
   * @returns {Promise<object|null>} Long-running operation
   */
  async batchProcess(processorName, inputUri, outputUri) {
    if (!this.isInitialized || !this.client) return null;
    try {
      const url = `https://documentai.googleapis.com/v1/${processorName}:batchProcess`;
      const body = {
        inputDocuments: {
          gcsDocuments: {
            documents: [{ gcsUri: inputUri, mimeType: 'application/pdf' }],
          },
        },
        documentOutputConfig: {
          gcsOutputConfig: { gcsUri: outputUri },
        },
      };
      const res = await this.client.request({ url, method: 'POST', data: body });
      logger.info(`GcpDocumentAI: Batch process started: ${res.data.name}`);
      return res.data;
    } catch (e) {
      logger.warn(`GcpDocumentAI.batchProcess failed: ${e.message}`);
      return null;
    }
  }
}

export const gcpDocumentAIService = new GcpDocumentAIService();
