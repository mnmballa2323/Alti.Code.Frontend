/**
 * Copyright (c) 2026 Alti.Code.Studio
 *
 * github_copilot.agent.js — Swarm Marketplace Dynamic Plugin
 * Authoritative Specialist for GitHub Copilot Chat Extensions, Custom Agents, and JWT Verification.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubCopilotAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubCopilotEngineer';
        this.description = 'Specialized GitHub Copilot Chat Extensions Engineer expert in building custom LLM agent integrations, streamed JSON chat protocols, and auth handshakes.';
        this.manifest = {
            id: 'githubCopilotEngineer',
            capabilities: ['github-copilot-extensions', 'github-copilot-skills', 'copilot-token-management', 'chat-schemas'],
            version: '39.5.0'
        };
        this.preamble = `You are the Alti.Code.Studio GitHub Copilot Chat Extensions Engineer, the ultimate authority on Copilot Extensions architecture, custom developer chat agents, and conversational skills design.

# GROUNDED COPILOT CAPABILITIES
1. **Copilot Extensions Architecture**: Build and deploy custom Copilot Chat Extensions that integrate proprietary systems or third-party developer APIs into GitHub Copilot.
2. **Streamed Chat Protocols**: Configure SSE (Server-Sent Events) chat response handlers, sending structured Markdown paragraphs, interactive cards, and tool calls to Copilot Chat UI.
3. **Copilot Auth Handshake**: Orchestrate secure signature verification of incoming Copilot requests, verifying JWT signatures, public keys, and token lifetimes.
4. **Conversational Skill Design**: Guide developers on structuring chat agent prompts, parsing conversational histories, configuring action capabilities, and generating JSON schemas.

# BEHAVIORAL PROTOCOLS
- Strictly ground all Copilot designs and API endpoints in the official Copilot Extension manuals.
- Enforce secure signature verification of all incoming payload signatures from GitHub's server gateway.
- Never invent undocumented conversational protocols or JSON payload properties.`;
    }

    /**
     * Specialized LLM invocation grounded dynamically by Copilot doc lookup.
     */
    async _invoke(prompt, contextBlock) {
        logger.info(`🐙 [GitHub Copilot] Grounding Copilot query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve copilot specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Copilot Chat Extensions custom agents SSE JWT tokens verification schemas ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [GitHub Copilot] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
        }

        const groundedPrompt = `${this.preamble}

=== GROUNDED DEVELOPER DOCUMENTATION CONTEXT ===
${docsContext || 'No Copilot documentation found in local RAG vector store.'}

=== ADDITIONAL CONTEXT ===
${contextBlock || 'No additional file context provided.'}

=== REQUEST ===
${prompt}`;

        return await GeminiAiService.generateContent(groundedPrompt);
    }
}

export const pluginInstance = new GithubCopilotAgent();
export default GithubCopilotAgent;
