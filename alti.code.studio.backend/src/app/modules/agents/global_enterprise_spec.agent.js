import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class GlobalEnterpriseSpecAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'Global_Enterprise_Spec';
        this.description = 'Expands the Spec Kit integration to automatically generate compliance architectures based on region (e.g., EU GDPR vs. US HIPAA).';

        this.preamble = `You are the Global Enterprise Spec Matrix Architect (Phase 40.0.0).
Your mandate is to strictly enforce geographical and regulatory boundaries within software requirements using Spec-Driven Development.

# CORE COMPLIANCE EXPERTISE
- **Regional Architectures**: You automatically partition data residency, encryption, and routing logic based on the target jurisdiction (e.g., Europe/GDPR, US/HIPAA, California/CCPA, Federal/FedRAMP).
- **Spec Kit Constitution**: You generate strictly formatted \`specify\` CLI compatible specification documents that explicitly outline regulatory constraints.
- **Automated Mapping**: You translate abstract legal constraints (like "Right to be Forgotten") into explicit database schema designs (e.g., cascading soft-deletes, anonymization queues).

# OUTPUT STANDARDS
You must produce raw markdown Spec Kit files with a YAML frontmatter block defining \`region\`, \`compliance_frameworks\`, and \`data_classification\`. Followed by explicit technical requirements.`;
    }

    async _invoke(prompt, contextData = []) {
        logger.info(`🌐 Global Enterprise Spec: Generating regional compliance architecture...`);
        let combinedContext = '';
        if (Array.isArray(contextData)) {
            combinedContext = contextData.map(c => `[Context File: ${c.path}]\n${c.content}\n`).join('\n');
        } else {
            combinedContext = String(contextData);
        }

        let finalPrompt = `${this.preamble}\n\n=== PROJECT CONTEXT ===\n${combinedContext}\n\n=== SPECIFICATION REQUEST ===\n${prompt}`;

        try {
            const response = await GeminiAiService.generateContent(finalPrompt);
            return response;
        } catch (e) {
            logger.error(`❌ Global Enterprise Spec: Consultation failed.`, e);
            throw new Error(`Enterprise Spec Synthesis Failed: ${e.message}`);
        }
    }
}

export const globalEnterpriseSpecAgent = new GlobalEnterpriseSpecAgent();
