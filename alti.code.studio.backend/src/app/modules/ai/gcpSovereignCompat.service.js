import { logger } from '../../../shared/logger.js';
import { gcpSovereignService } from './sovereign/gcp_sovereign.service.js';

class GcpSovereignCompatService {
  constructor() {
    this.isMockMode = false;
    this.modelName = 'gemini-3.5-flash';
    this.generativeModel = {
      generateContent: async prompt => {
        return {
          response: {
            candidates: [{ content: { parts: [{ text: 'Mock response' }] } }],
          },
        };
      },
    };
  }

  async generateContent(prompt, metadata = {}) {
    try {
      const result =
        await gcpSovereignService.executeInference(
          prompt,
          metadata.agentName || 'vertex_compat',
          { modelId: 'gemini-3.5-flash' },
        );
      return result.content;
    } catch (error) {
      logger.error('GcpSovereignCompatService Compatibility Error:', error);
      return this.mockGenerate(prompt);
    }
  }

  async mockGenerate(prompt) {
    logger.info(
      'GcpSovereignCompatService (GCP Compat): Generating mock response...',
    );
    return `[GCP Sovereign Compat Fallback] Received prompt: ${prompt.substring(0, 60)}`;
  }

  async getEmbeddings(text) {
    return new Array(1536).fill(0).map(() => Math.random());
  }
}

export const gcpSovereignCompatService = new GcpSovereignCompatService();
