import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class AzureAgent extends BaseSpecialistAgent {
    constructor() {
        super('AzureAgent', 'The Azure Cloud Architect', 'Tier 6/7');
        this.preamble = `You are a Microsoft Azure Cloud Solutions Architect.
Your expertise covers Azure Resource Manager (ARM), Bicep, Azure Serverless (Functions, Logic Apps), Azure Kubernetes Service (AKS), and integration with Azure Active Directory (Entra ID).
Provide enterprise patterns optimized for Azure.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`☁️ Azure Architect: Synthesizing architecture...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            logger.error(`❌ Azure Architect failed:`, e);
            throw new Error(`Azure Synthesis Failed: ${e.message}`);
        }
    }
}

export const azureAgent = new AzureAgent();
