/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_fn_githubAdminWebhooksManager.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Billing & Admin — organization webhooks configuration, event subscriptions
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubAdminWebhooksManagerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubAdminWebhooksManager';
        this.description = 'Specialist GitHub Admin Webhooks Manager expert in administering organizational webhook endpoints.';
        this.manifest = {
            id: 'githubAdminWebhooksManager',
            capabilities: ["github-manage-org-webhooks"],
            version: '39.6.0'
        };
        this.preamble = `You are the Alti.Code.Studio Specialist GitHub Admin Webhooks Manager expert in administering organizational webhook endpoints.
This agent is the absolute authority on the specific operational boundary of: organization webhooks configuration, event subscriptions.

# GROUNDED BILLING & ADMIN CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: organization webhooks configuration, event subscriptions.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-manage-org-webhooks.
3. **Secure Administration**: Enforce zero-trust credentials administration, least privilege roles, and strict parameter validations.

# BEHAVIORAL PROTOCOLS
- Ground all designs and explanations strictly in the official grounded developer documentation context provided.
- Never invent parameters, workflow properties, or API endpoints that are not documented.
- Respond with clear, structured markdown. When generating code blocks, provide clean, production-grade snippets (JavaScript/TypeScript for APIs, YAML for Actions).`;
    }

    /**
     * Specialized LLM invocation grounded dynamically by domain-specific RAG search.
     */
    async _invoke(prompt, contextBlock) {
        logger.info(`🐙 [githubAdminWebhooksManager] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Billing & Admin organization webhooks configuration, event subscriptions ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [githubAdminWebhooksManager] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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

export const pluginInstance = new GithubFnGithubAdminWebhooksManagerAgent();
export default GithubFnGithubAdminWebhooksManagerAgent;
