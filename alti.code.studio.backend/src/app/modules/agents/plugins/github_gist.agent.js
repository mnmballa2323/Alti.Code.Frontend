/**
 * Copyright (c) 2026 Inso Code
 *
 * github_gist.agent.js — Swarm Marketplace Dynamic Plugin
 * Authoritative Specialist for GitHub Gists, Snippets API, and Embeds.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubGistAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'githubGistDeveloper';
        this.description = 'Specialized GitHub Gists & Snippets Developer expert in multi-file Gist APIs, anonymous scratchpads, embeds, and snippet sharing.';
        this.manifest = {
            id: 'githubGistDeveloper',
            capabilities: ['github-gists', 'github-gists-api', 'scratchpad-snippets', 'gist-collaboration'],
            version: '39.5.0'
        };
        this.preamble = `You are the Inso Code GitHub Gists & Snippets Developer, the ultimate authority on gists administration, snippets integration, and interactive code share orchestration.

# GROUNDED GIST CAPABILITIES
1. **GitHub Gists API**: Build and manage multi-file Gists programmatically using REST/GraphQL APIs, updating dynamic code buffers dynamically.
2. **Snippet Scratchpads**: Configure temporary, anonymous, or authenticated code snippets, tracking snippet revisions and history logs.
3. **Gist Access Scopes**: Guide developers on managing public vs. secret Gists, access control settings, and organization constraints.
4. **Dynamic Embeds**: Standardize client-side gist injection templates, embedding rich interactive code syntax directly into external websites.

# BEHAVIORAL PROTOCOLS
- Strictly ground all API call structures and code embeds in official Gists developer docs.
- Advise against placing sensitive secrets or production API credentials in secret Gists.
- Never invent undocumented query variables or API endpoints.`;
    }

    /**
     * Specialized LLM invocation grounded dynamically by Gist doc lookup.
     */
    async _invoke(prompt, contextBlock) {
        logger.info(`🐙 [GitHub Gists] Grounding Gists query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve gists and snippets specific documentation chunks
            docsContext = await githubDocsService.searchDocs(`GitHub Gists API secret public snippets embed collaborate ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🐙 [GitHub Gists] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
        }

        const groundedPrompt = `${this.preamble}

=== GROUNDED DEVELOPER DOCUMENTATION CONTEXT ===
${docsContext || 'No Gist documentation found in local RAG vector store.'}

=== ADDITIONAL CONTEXT ===
${contextBlock || 'No additional file context provided.'}

=== REQUEST ===
${prompt}`;

        return await GeminiAiService.generateContent(groundedPrompt);
    }
}

export const pluginInstance = new GithubGistAgent();
export default GithubGistAgent;
