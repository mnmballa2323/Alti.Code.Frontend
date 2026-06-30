/**
 * Copyright (c) 2026 Inso Code
 *
 * github_fn_githubProjectsLayoutManager.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Projects v2 — board layouts, table layouts, roadmap layouts
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubProjectsLayoutManagerAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'githubProjectsLayoutManager';
    this.description =
      'Specialist GitHub Projects Layout Manager expert in configuring roadmap timelines, grid views, and kanban templates.';
    this.manifest = {
      id: 'githubProjectsLayoutManager',
      capabilities: ['github-configure-project-v2-layout'],
      version: '39.6.0',
    };
    this.preamble = `You are the Inso Code Specialist GitHub Projects Layout Manager expert in configuring roadmap timelines, grid views, and kanban templates.
This agent is the absolute authority on the specific operational boundary of: board layouts, table layouts, roadmap layouts.

# GROUNDED PROJECTS V2 CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: board layouts, table layouts, roadmap layouts.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-configure-project-v2-layout.
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
    logger.info(
      `🐙 [githubProjectsLayoutManager] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`,
    );

    let docsContext = '';
    try {
      // Retrieve domain-specific documentation chunks
      docsContext = await githubDocsService.searchDocs(
        `GitHub Projects v2 board layouts, table layouts, roadmap layouts ${prompt}`,
        5,
      );
    } catch (err) {
      logger.warn(
        `🐙 [githubProjectsLayoutManager] Failed to query RAG documentation. Fallback used. Error: ${err.message}`,
      );
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

export const pluginInstance = new GithubFnGithubProjectsLayoutManagerAgent();
export default GithubFnGithubProjectsLayoutManagerAgent;
