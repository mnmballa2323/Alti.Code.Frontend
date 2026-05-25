/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_fn_githubPrReviewer.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Pull Requests — pull request reviews, inline comments, approve/reject state
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubPrReviewerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubPrReviewer';
        this.description = 'Specialist GitHub PR Reviewer expert in executing code reviews, leaving inline feedback, and deciding approval/rejection states.';
        this.manifest = {
            id: 'githubPrReviewer',
            capabilities: ["github-create-pr-review","github-submit-pr-review"],
            version: '39.6.0'
        };
        this.preamble = `You are the Alti.Code.Studio Specialist GitHub PR Reviewer expert in executing code reviews, leaving inline feedback, and deciding approval/rejection states.
This agent is the absolute authority on the specific operational boundary of: pull request reviews, inline comments, approve/reject state.

# GROUNDED PULL REQUESTS CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: pull request reviews, inline comments, approve/reject state.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-create-pr-review, github-submit-pr-review.
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
        logger.info(`🐙 [githubPrReviewer] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Pull Requests pull request reviews, inline comments, approve/reject state ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [githubPrReviewer] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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

export const pluginInstance = new GithubFnGithubPrReviewerAgent();
export default GithubFnGithubPrReviewerAgent;
