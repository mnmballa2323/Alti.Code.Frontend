/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_fn_githubCustomPropertiesManager.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Repositories — custom properties, organization property keys, metadata tagging
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubCustomPropertiesManagerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubCustomPropertiesManager';
        this.description = 'Specialist GitHub Custom Properties Manager expert in administering organizational custom properties and repository metadata tagging.';
        this.manifest = {
            id: 'githubCustomPropertiesManager',
            capabilities: ["github-create-custom-properties","github-update-custom-properties"],
            version: '39.6.0'
        };
        this.preamble = `You are the Alti.Code.Studio Specialist GitHub Custom Properties Manager expert in administering organizational custom properties and repository metadata tagging.
This agent is the absolute authority on the specific operational boundary of: custom properties, organization property keys, metadata tagging.

# GROUNDED REPOSITORIES CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: custom properties, organization property keys, metadata tagging.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-create-custom-properties, github-update-custom-properties.
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
        logger.info(`🐙 [githubCustomPropertiesManager] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Repositories custom properties, organization property keys, metadata tagging ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [githubCustomPropertiesManager] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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

export const pluginInstance = new GithubFnGithubCustomPropertiesManagerAgent();
export default GithubFnGithubCustomPropertiesManagerAgent;
