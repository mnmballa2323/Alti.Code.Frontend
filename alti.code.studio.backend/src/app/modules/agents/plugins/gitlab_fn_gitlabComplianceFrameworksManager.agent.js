/**
 * Copyright (c) 2026 Inso Code
 *
 * gitlab_fn_gitlabComplianceFrameworksManager.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitLab Security & Compliance — compliance frameworks, pipeline compliance controls, security templates
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { gitlabDocsService } from '../../gitlabDocs/gitlabDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GitlabFnGitlabComplianceFrameworksManagerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'gitlabComplianceFrameworksManager';
        this.description = 'Specialist GitLab Compliance Frameworks Manager expert in compliance framework tagging.';
        this.manifest = {
            id: 'gitlabComplianceFrameworksManager',
            capabilities: ["gitlab-get-compliance-frameworks"],
            version: '39.6.0'
        };
        this.preamble = `You are the Inso Code Specialist GitLab Compliance Frameworks Manager expert in compliance framework tagging.
This agent is the absolute authority on the specific operational boundary of: compliance frameworks, pipeline compliance controls, security templates.

# GROUNDED SECURITY & COMPLIANCE CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: compliance frameworks, pipeline compliance controls, security templates.
2. **REST API Execution**: Orchestrate the exact REST operations mapping to capabilities: gitlab-get-compliance-frameworks.
3. **Secure Administration**: Enforce zero-trust credentials administration, least privilege roles, and strict parameter validations.

# BEHAVIORAL PROTOCOLS
- Ground all designs and explanations strictly in the official grounded developer documentation context provided.
- Never invent parameters, workflow properties, or API endpoints that are not documented.
- Respond with clear, structured markdown. When generating code blocks, provide clean, production-grade snippets (JavaScript/TypeScript for APIs).`;
    }

    /**
     * Specialized LLM invocation grounded dynamically by domain-specific RAG search.
     */
    async _invoke(prompt, contextBlock) {
        logger.info(`🦊 [gitlabComplianceFrameworksManager] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await gitlabDocsService.searchDocs(`GitLab Security & Compliance compliance frameworks, pipeline compliance controls, security templates ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🦊 [gitlabComplianceFrameworksManager] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
        }

        const groundedPrompt = `${this.preamble}

=== GROUNDED DEVELOPER DOCUMENTATION CONTEXT ===
${docsContext || 'No documentation found in local RAG vector store.'}

=== ADDITIONAL CONTEXT ===
${contextBlock || 'No additional file context provided.'}

=== REQUEST ===
${prompt}`;

        return await GeminiAiService.generateContent(groundedPrompt);
    }
}

export const pluginInstance = new GitlabFnGitlabComplianceFrameworksManagerAgent();
export default GitlabFnGitlabComplianceFrameworksManagerAgent;
