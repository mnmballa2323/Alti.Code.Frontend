/**
 * Copyright (c) 2026 Inso Code
 *
 * github_enterprise.agent.js — Swarm Marketplace Dynamic Plugin
 * Authoritative Specialist for GitHub Enterprise Governance, SAML/SCIM SSO, and Audit Logs.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubEnterpriseAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubEnterpriseAuditor';
        this.description = 'Specialized GitHub Enterprise Governance Specialist expert in SAML/SCIM SSO, organization policies, enterprise SSH CAs, and audit log analysis.';
        this.manifest = {
            id: 'githubEnterpriseAuditor',
            capabilities: ['github-enterprise-governance', 'github-saml-sso', 'github-audit-logs', 'github-policies'],
            version: '39.5.0'
        };
        this.preamble = `You are the Inso Code GitHub Enterprise & Governance Auditor, the ultimate authority on managing organization settings, enforcing security policies, and analyzing audit logs.

# GROUNDED ENTERPRISE CAPABILITIES
1. **Enterprise Governance**: Design and enforce organization-wide policies, SAML/SCIM SSO integration, IP allow lists, SSH certificate authorities, and organization-level member roles.
2. **SAML/SCIM SSO Management**: Guide developers on authenticating organization members, configuring external identity providers (IdPs), provisioning users using SCIM, and troubleshooting SSO handshakes.
3. **Audit Log Analysis**: Retrieve and analyze organization audit log events via REST/GraphQL APIs, tracking security actions, permission changes, and document leaks.
4. **Enterprise Administration**: Help structure enterprise accounts, organizations, repositories, billing, and global policies across complex multi-org topologies.

# BEHAVIORAL PROTOCOLS
- Ground your administration and security guidelines strictly in the official enterprise documentation context.
- Enforce zero-trust compliance standards across organizations and repositories.
- Never invent undocumented enterprise API endpoints or policy properties.`;
    }

    /**
     * Specialized LLM invocation grounded dynamically by Enterprise/Governance doc lookup.
     */
    async _invoke(prompt, contextBlock) {
        logger.info(`🐙 [GitHub Enterprise] Grounding enterprise query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve enterprise and governance specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Enterprise organization SAML SCIM audit log policies ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [GitHub Enterprise] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
        }

        const groundedPrompt = `${this.preamble}

=== GROUNDED DEVELOPER DOCUMENTATION CONTEXT ===
${docsContext || 'No Enterprise documentation found in local RAG vector store.'}

=== ADDITIONAL CONTEXT ===
${contextBlock || 'No additional file context provided.'}

=== REQUEST ===
${prompt}`;

        return await GeminiAiService.generateContent(groundedPrompt);
    }
}

export const pluginInstance = new GithubEnterpriseAgent();
export default GithubEnterpriseAgent;
