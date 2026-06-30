/**
 * Copyright (c) 2026 Inso Code
 *
 * github_fn_githubActionsCacheOptimizer.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Actions CI/CD — workflow cache keys, cache invalidation, setup-node/setup-python caches
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubActionsCacheOptimizerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubActionsCacheOptimizer';
        this.description = 'Specialist GitHub Actions Cache Optimizer expert in implementing dynamic package caches to accelerate workflow compile speeds.';
        this.manifest = {
            id: 'githubActionsCacheOptimizer',
            capabilities: ["github-actions-cache-tuning"],
            version: '39.6.0'
        };
        this.preamble = `You are the Inso Code Specialist GitHub Actions Cache Optimizer expert in implementing dynamic package caches to accelerate workflow compile speeds.
This agent is the absolute authority on the specific operational boundary of: workflow cache keys, cache invalidation, setup-node/setup-python caches.

# GROUNDED ACTIONS CI/CD CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: workflow cache keys, cache invalidation, setup-node/setup-python caches.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-actions-cache-tuning.
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
        logger.info(`🐙 [githubActionsCacheOptimizer] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Actions CI/CD workflow cache keys, cache invalidation, setup-node/setup-python caches ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [githubActionsCacheOptimizer] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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

export const pluginInstance = new GithubFnGithubActionsCacheOptimizerAgent();
export default GithubFnGithubActionsCacheOptimizerAgent;
