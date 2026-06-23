import { logger } from '../../../shared/logger.js';
import { multiCloudInferenceService } from './multicloud_inference.service.js';

class AzureSovereignCompatService {
    constructor() {
        this.isMockMode = false;
        this.modelName = 'gpt-5.5';
        this.generativeModel = {
            generateContent: async (prompt) => {
                return {
                    response: {
                        candidates: [{ content: { parts: [{ text: 'Mock response' }] } }]
                    }
                };
            }
        };
    }

    async generateContent(prompt, metadata = {}) {
        try {
            const result = await multiCloudInferenceService.executeMultiCloudInference(prompt, metadata.agentName || 'vertex_compat', { modelId: 'gpt-5.5' });
            return result.content;
        } catch (error) {
            logger.error('AzureSovereignCompatService Compatibility Error:', error);
            return this.mockGenerate(prompt);
        }
    }

    async mockGenerate(prompt) {
        logger.info('AzureSovereignCompatService (Azure Compat): Generating mock response...');
        return `[Azure Sovereign Compat Fallback] Received prompt: ${prompt.substring(0, 60)}`;
    }

    async getEmbeddings(text) {
        return new Array(1536).fill(0).map(() => Math.random());
    }
}

export const azureSovereignCompatService = new AzureSovereignCompatService();
