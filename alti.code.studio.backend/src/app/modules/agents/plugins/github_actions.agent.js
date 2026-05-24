/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_actions.agent.js — Swarm Marketplace Dynamic Plugin
 * Authoritative Specialist for all GitHub Actions, Workflows, Custom Actions, and CI/CD.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubActionsAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubActionsSpecialist';
        this.description = 'Specialized GitHub Actions & CI/CD Engineer expert in high-performance YAML workflows, custom action synthesis, runner optimization, and credentials security.';
        this.manifest = {
            id: 'githubActionsSpecialist',
            capabilities: ['github-actions-workflow', 'github-actions-runner', 'github-custom-actions', 'ci-cd-optimization'],
            version: '39.2.0'
        };
        this.preamble = `You are the Alti.Code.Studio GitHub Actions Specialist, the ultimate authority on all CI/CD, automation, and workflow integration capabilities on GitHub.

# GROUNDED ACTIONS CAPABILITIES
1. **Workflow YAML Synthesis**: Generate, refactor, and audit GitHub Actions workflow configurations. Standardize job dependency matrices, concurrency control, caching strategies, and environment configurations.
2. **Custom Actions Development**: Build highly secure and compiled JavaScript/Node.js or Docker-based custom Actions, specifying inputs, outputs, and runner permissions.
3. **Runner Configuration**: Guide developers on setting up and optimizing self-hosted or GitHub-hosted runners, configuring runner groups, using labels, and scaling concurrency.
4. **CI/CD Security Boundary**: Enforce OIDC (OpenID Connect) for secure cloud credentials ingestion, strictly audit job-level write permissions (\`permissions: read-all\` or explicit fine-grained policies), and prevent secret leakage.

# BEHAVIORAL PROTOCOLS
- Ground all workflow configurations strictly in the official documentation context provided.
- Ensure YAML syntax is clean, using standard practices (e.g. correct indentation, semantic stage names).
- Never invent undocumented triggers or workflow properties.`;
    }

    /**
     * Specialized LLM invocation grounded dynamically by Actions-related doc lookup.
     */
    async _invoke(prompt, contextBlock) {
        logger.info(`🐙 [GitHub Actions] Grounding CI/CD query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve actions and workflow specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Actions workflow syntax runner ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [GitHub Actions] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
        }

        const groundedPrompt = `${this.preamble}

=== GROUNDED DEVELOPER DOCUMENTATION CONTEXT ===
${docsContext || 'No Actions documentation found in local RAG vector store.'}

=== ADDITIONAL CONTEXT ===
${contextBlock || 'No additional file context provided.'}

=== REQUEST ===
${prompt}`;

        return await GeminiAiService.generateContent(groundedPrompt);
    }
}

export const pluginInstance = new GithubActionsAgent();
export default GithubActionsAgent;
