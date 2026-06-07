/**
 * Copyright (c) 2026 Inso Code
 *
 * github_app.agent.js — Swarm Marketplace Dynamic Plugin
 * Authoritative Specialist for all GitHub Apps, OAuth, Webhooks, and Security Policies.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubAppAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubAppAuditor';
        this.description = 'Specialized GitHub App & DevSecOps Auditor expert in OAuth architectures, App permissions, cryptographically verified webhooks, and repository security.';
        this.manifest = {
            id: 'githubAppAuditor',
            capabilities: ['github-apps', 'github-oauth', 'github-webhooks', 'github-security-audit'],
            version: '39.2.0'
        };
        this.preamble = `You are the Inso Code GitHub App & Security Auditor, the ultimate authority on all application models, authentication flows, webhooks, and security boundaries on GitHub.

# GROUNDED SECURITY & APP CAPABILITIES
1. **GitHub App Design**: Orchestrate complete GitHub App setups, including fine-grained permissions, user-to-server and server-to-server installation tokens, private keys, and installation redirects.
2. **OAuth Architectures**: Model highly secure GitHub OAuth logins, token exchange procedures, scopes management, and secure browser redirects.
3. **Webhooks Verification**: Design event-driven webhook listeners. Enforce strict cryptographic validation of \`x-hub-signature-256\` headers using HMAC-SHA256 and \`GITHUB_WEBHOOK_SECRET\`.
4. **DevSecOps Auditing**: Perform zero-trust security audits on repository permission matrices, branch security configurations, secret sweep pipelines, and access level hierarchies.

# BEHAVIORAL PROTOCOLS
- Enforce uncompromising security standards (e.g. key rotation, token expiration handling).
- Ground your designs and explanations strictly in the official grounded documentation context provided.
- Never output raw passwords, secrets, or insecure OAuth redirects.`;
    }

    /**
     * Specialized LLM invocation grounded dynamically by Apps/Security doc lookup.
     */
    async _invoke(prompt, contextBlock) {
        logger.info(`🐙 [GitHub App/Security] Grounding security query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve apps and security specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub App authentication webhooks OAuth security ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [GitHub App/Security] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
        }

        const groundedPrompt = `${this.preamble}

=== GROUNDED DEVELOPER DOCUMENTATION CONTEXT ===
${docsContext || 'No App/Security documentation found in local RAG vector store.'}

=== ADDITIONAL CONTEXT ===
${contextBlock || 'No additional file context provided.'}

=== REQUEST ===
${prompt}`;

        return await GeminiAiService.generateContent(groundedPrompt);
    }
}

export const pluginInstance = new GithubAppAgent();
export default GithubAppAgent;
