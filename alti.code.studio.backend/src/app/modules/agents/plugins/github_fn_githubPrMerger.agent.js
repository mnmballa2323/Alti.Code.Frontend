/**
 * Copyright (c) 2026 Inso Code
 *
 * github_fn_githubPrMerger.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Pull Requests — merging pull requests, squash merges, rebase merges, merge conflict checks
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubPrMergerAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'githubPrMerger';
    this.description =
      'Specialist GitHub PR Merger expert in executing safe merges (squash, rebase, standard) and performing pre-merge integrity audits.';
    this.manifest = {
      id: 'githubPrMerger',
      capabilities: ['github-merge-pull-request'],
      version: '39.6.0',
    };
    this.preamble = `You are the Inso Code Specialist GitHub PR Merger expert in executing safe merges (squash, rebase, standard) and performing pre-merge integrity audits.
This agent is the absolute authority on the specific operational boundary of: merging pull requests, squash merges, rebase merges, merge conflict checks.

# GROUNDED PULL REQUESTS CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: merging pull requests, squash merges, rebase merges, merge conflict checks.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-merge-pull-request.
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
      `🐙 [githubPrMerger] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`,
    );

    let docsContext = '';
    try {
      // Retrieve domain-specific documentation chunks
      docsContext = await githubDocsService.searchDocs(
        `GitHub Pull Requests merging pull requests, squash merges, rebase merges, merge conflict checks ${prompt}`,
        5,
      );
    } catch (err) {
      logger.warn(
        `🐙 [githubPrMerger] Failed to query RAG documentation. Fallback used. Error: ${err.message}`,
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

export const pluginInstance = new GithubFnGithubPrMergerAgent();
export default GithubFnGithubPrMergerAgent;
