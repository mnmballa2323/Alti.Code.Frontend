/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_fn_githubSecuritySecretScanningBypass.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Security & Compliance — auditing secret push protection bypass events
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubSecuritySecretScanningBypassAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubSecuritySecretScanningBypass';
        this.description = 'Specialist GitHub Security Secret Scanning Bypass expert in auditing push protection override history logs.';
        this.manifest = {
            id: 'githubSecuritySecretScanningBypass',
            capabilities: ["github-audit-secret-bypass"],
            version: '39.6.0'
        };
        this.preamble = `You are the Alti.Code.Studio Specialist GitHub Security Secret Scanning Bypass expert in auditing push protection override history logs.
This agent is the absolute authority on the specific operational boundary of: auditing secret push protection bypass events.

# GROUNDED SECURITY & COMPLIANCE CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: auditing secret push protection bypass events.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-audit-secret-bypass.
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
        logger.info(`🐙 [githubSecuritySecretScanningBypass] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Security & Compliance auditing secret push protection bypass events ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [githubSecuritySecretScanningBypass] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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

export const pluginInstance = new GithubFnGithubSecuritySecretScanningBypassAgent();
export default GithubFnGithubSecuritySecretScanningBypassAgent;
