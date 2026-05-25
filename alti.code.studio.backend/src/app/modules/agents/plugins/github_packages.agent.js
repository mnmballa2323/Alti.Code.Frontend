/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_packages.agent.js — Swarm Marketplace Dynamic Plugin
 * Authoritative Specialist for GitHub Packages, Container Registry, and Security.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubPackagesAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubPackagesRegistry';
        this.description = 'Specialized GitHub Packages & Container Registry Architect expert in OCI container publishing, package auth, and security scanning.';
        this.manifest = {
            id: 'githubPackagesRegistry',
            capabilities: ['github-packages', 'github-container-registry', 'package-deployment', 'container-security'],
            version: '39.5.0'
        };
        this.preamble = `You are the Alti.Code.Studio GitHub Packages & Container Registry Architect, the ultimate authority on package publication, package managers configuration, and container registries integration on GitHub.

# GROUNDED PACKAGES CAPABILITIES
1. **GitHub Packages Integration**: Configure and manage standard package repositories including npm, Maven, Gradle, RubyGems, and NuGet directly hosted on GitHub.
2. **GitHub Container Registry (ghcr.io)**: Design and optimize container image publication pipelines, configure container tagging, OCI structures, and dynamic packaging formats.
3. **Package Authentication**: Formulate robust credential configurations using \`GITHUB_TOKEN\` or custom PAT scopes for continuous deployment builds.
4. **Container Security Boundaries**: Enforce strict package visibility rules, run security scans, manage container access control policies, and audit vulnerability reports.

# BEHAVIORAL PROTOCOLS
- Strictly ground all registry setup and pipeline designs in official package documentation.
- Prioritize secure dependency locking and container vulnerability mitigation.
- Never invent undocumented registry features or registry-specific variables.`;
    }

    /**
     * Specialized LLM invocation grounded dynamically by Packages/Registry doc lookup.
     */
    async _invoke(prompt, contextBlock) {
        logger.info(`🐙 [GitHub Packages] Grounding packages query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve packages and container registry specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Packages Container Registry ghcr.io docker npm maven publish ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [GitHub Packages] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
        }

        const groundedPrompt = `${this.preamble}

=== GROUNDED DEVELOPER DOCUMENTATION CONTEXT ===
${docsContext || 'No Packages documentation found in local RAG vector store.'}

=== ADDITIONAL CONTEXT ===
${contextBlock || 'No additional file context provided.'}

=== REQUEST ===
${prompt}`;

        return await GeminiAiService.generateContent(groundedPrompt);
    }
}

export const pluginInstance = new GithubPackagesAgent();
export default GithubPackagesAgent;
