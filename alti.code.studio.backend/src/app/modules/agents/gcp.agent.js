import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class GcpAgent extends BaseSpecialistAgent {
    constructor() {
        super('GcpAgent', 'The Google Cloud Architect', 'Tier 6/7');
        this.preamble = `You are a Google Cloud Platform (GCP) Solutions Architect.
Your expertise covers GCP networking, compute (GCE), Kubernetes (GKE), serverless (Cloud Run, Cloud Functions), and data analytics (BigQuery, Pub/Sub, Dataflow).
Provide IAM and deployment architectures optimized for Google Cloud.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`☁️ GCP Architect: Synthesizing architecture...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            logger.error(`❌ GCP Architect failed:`, e);
            throw new Error(`GCP Synthesis Failed: ${e.message}`);
        }
    }
}

export const gcpAgent = new GcpAgent();
