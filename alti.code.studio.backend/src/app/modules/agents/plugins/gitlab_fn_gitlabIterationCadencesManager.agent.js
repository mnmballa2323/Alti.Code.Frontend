/**
 * Copyright (c) 2026 Inso Code
 *
 * gitlab_fn_gitlabIterationCadencesManager.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitLab Milestones & Iterations — iteration cadences, automated iteration generation, rolling cadences
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { gitlabDocsService } from '../../gitlabDocs/gitlabDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GitlabFnGitlabIterationCadencesManagerAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'gitlabIterationCadencesManager';
    this.description =
      'Specialist GitLab Iteration Cadences Manager expert in configuring group iteration cadences.';
    this.manifest = {
      id: 'gitlabIterationCadencesManager',
      capabilities: [
        'gitlab-create-iteration-cadence',
        'gitlab-delete-iteration-cadence',
      ],
      version: '39.6.0',
    };
    this.preamble = `You are the Inso Code Specialist GitLab Iteration Cadences Manager expert in configuring group iteration cadences.
This agent is the absolute authority on the specific operational boundary of: iteration cadences, automated iteration generation, rolling cadences.

# GROUNDED MILESTONES & ITERATIONS CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: iteration cadences, automated iteration generation, rolling cadences.
2. **REST API Execution**: Orchestrate the exact REST operations mapping to capabilities: gitlab-create-iteration-cadence, gitlab-delete-iteration-cadence.
3. **Secure Administration**: Enforce zero-trust credentials administration, least privilege roles, and strict parameter validations.

# BEHAVIORAL PROTOCOLS
- Ground all designs and explanations strictly in the official grounded developer documentation context provided.
- Never invent parameters, workflow properties, or API endpoints that are not documented.
- Respond with clear, structured markdown. When generating code blocks, provide clean, production-grade snippets (JavaScript/TypeScript for APIs).`;
  }

  /**
   * Specialized LLM invocation grounded dynamically by domain-specific RAG search.
   */
  async _invoke(prompt, contextBlock) {
    logger.info(
      `🦊 [gitlabIterationCadencesManager] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`,
    );

    let docsContext = '';
    try {
      // Retrieve domain-specific documentation chunks
      docsContext = await gitlabDocsService.searchDocs(
        `GitLab Milestones & Iterations iteration cadences, automated iteration generation, rolling cadences ${prompt}`,
        5,
      );
    } catch (err) {
      logger.warn(
        `🦊 [gitlabIterationCadencesManager] Failed to query RAG documentation. Fallback used. Error: ${err.message}`,
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

export const pluginInstance = new GitlabFnGitlabIterationCadencesManagerAgent();
export default GitlabFnGitlabIterationCadencesManagerAgent;
