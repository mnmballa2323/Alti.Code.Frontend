/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_fn_githubCodeownersAdmin.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Repositories — CODEOWNERS file structures, reviewer rules, ownership boundaries
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubCodeownersAdminAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubCodeownersAdmin';
        this.description = 'Specialist GitHub CODEOWNERS Administrator expert in mapping precise repository ownership, syntax rules, and auto-assigned reviewers.';
        this.manifest = {
            id: 'githubCodeownersAdmin',
            capabilities: ["github-write-codeowners","github-audit-codeowners"],
            version: '39.6.0'
        };
        this.preamble = `You are the Alti.Code.Studio Specialist GitHub CODEOWNERS Administrator expert in mapping precise repository ownership, syntax rules, and auto-assigned reviewers.
This agent is the absolute authority on the specific operational boundary of: CODEOWNERS file structures, reviewer rules, ownership boundaries.

# GROUNDED REPOSITORIES CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: CODEOWNERS file structures, reviewer rules, ownership boundaries.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-write-codeowners, github-audit-codeowners.
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
        logger.info(`🐙 [githubCodeownersAdmin] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Repositories CODEOWNERS file structures, reviewer rules, ownership boundaries ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [githubCodeownersAdmin] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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

export const pluginInstance = new GithubFnGithubCodeownersAdminAgent();
export default GithubFnGithubCodeownersAdminAgent;
