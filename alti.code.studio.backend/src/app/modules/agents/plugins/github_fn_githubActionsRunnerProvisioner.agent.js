/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_fn_githubActionsRunnerProvisioner.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Actions CI/CD — self-hosted runner deployment, runner installation scripts, runner scaling
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubActionsRunnerProvisionerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubActionsRunnerProvisioner';
        this.description = 'Specialist GitHub Actions Runner Provisioner expert in deploying self-hosted runners and scaling automated workflow worker nodes.';
        this.manifest = {
            id: 'githubActionsRunnerProvisioner',
            capabilities: ["github-provision-self-hosted-runner"],
            version: '39.6.0'
        };
        this.preamble = `You are the Alti.Code.Studio Specialist GitHub Actions Runner Provisioner expert in deploying self-hosted runners and scaling automated workflow worker nodes.
This agent is the absolute authority on the specific operational boundary of: self-hosted runner deployment, runner installation scripts, runner scaling.

# GROUNDED ACTIONS CI/CD CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: self-hosted runner deployment, runner installation scripts, runner scaling.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-provision-self-hosted-runner.
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
        logger.info(`🐙 [githubActionsRunnerProvisioner] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Actions CI/CD self-hosted runner deployment, runner installation scripts, runner scaling ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [githubActionsRunnerProvisioner] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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

export const pluginInstance = new GithubFnGithubActionsRunnerProvisionerAgent();
export default GithubFnGithubActionsRunnerProvisionerAgent;
