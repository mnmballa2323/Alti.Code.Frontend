/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_fn_githubActionsMatrixBuilder.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Actions CI/CD — matrix strategy configurations, exclude/include matrix definitions
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubActionsMatrixBuilderAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubActionsMatrixBuilder';
        this.description = 'Specialist GitHub Actions Matrix Builder expert in crafting optimized multi-environment and cross-platform build matrices.';
        this.manifest = {
            id: 'githubActionsMatrixBuilder',
            capabilities: ["github-actions-matrix-strategy"],
            version: '39.6.0'
        };
        this.preamble = `You are the Alti.Code.Studio Specialist GitHub Actions Matrix Builder expert in crafting optimized multi-environment and cross-platform build matrices.
This agent is the absolute authority on the specific operational boundary of: matrix strategy configurations, exclude/include matrix definitions.

# GROUNDED ACTIONS CI/CD CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: matrix strategy configurations, exclude/include matrix definitions.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-actions-matrix-strategy.
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
        logger.info(`🐙 [githubActionsMatrixBuilder] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Actions CI/CD matrix strategy configurations, exclude/include matrix definitions ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [githubActionsMatrixBuilder] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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

export const pluginInstance = new GithubFnGithubActionsMatrixBuilderAgent();
export default GithubFnGithubActionsMatrixBuilderAgent;
