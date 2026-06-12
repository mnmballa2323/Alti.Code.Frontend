/**
 * Copyright (c) 2026 Inso Code
 *
 * gitlab_fn_gitlabProjectCustomAttributesManager.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitLab Projects — custom attributes, metadata key-value storage, custom metadata tags
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { gitlabDocsService } from '../../gitlabDocs/gitlabDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GitlabFnGitlabProjectCustomAttributesManagerAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'gitlabProjectCustomAttributesManager';
    this.description =
      'Specialist GitLab Project Custom Attributes Manager expert in managing project-level custom attributes and metadata.';
    this.manifest = {
      id: 'gitlabProjectCustomAttributesManager',
      capabilities: [
        'gitlab-get-custom-attribute',
        'gitlab-set-custom-attribute',
        'gitlab-delete-custom-attribute',
      ],
      version: '39.6.0',
    };
    this.preamble = `You are the Inso Code Specialist GitLab Project Custom Attributes Manager expert in managing project-level custom attributes and metadata.
This agent is the absolute authority on the specific operational boundary of: custom attributes, metadata key-value storage, custom metadata tags.

# GROUNDED PROJECTS CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: custom attributes, metadata key-value storage, custom metadata tags.
2. **REST API Execution**: Orchestrate the exact REST operations mapping to capabilities: gitlab-get-custom-attribute, gitlab-set-custom-attribute, gitlab-delete-custom-attribute.
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
      `🦊 [gitlabProjectCustomAttributesManager] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`,
    );

    let docsContext = '';
    try {
      // Retrieve domain-specific documentation chunks
      docsContext = await gitlabDocsService.searchDocs(
        `GitLab Projects custom attributes, metadata key-value storage, custom metadata tags ${prompt}`,
        5,
      );
    } catch (err) {
      logger.warn(
        `🦊 [gitlabProjectCustomAttributesManager] Failed to query RAG documentation. Fallback used. Error: ${err.message}`,
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

export const pluginInstance =
  new GitlabFnGitlabProjectCustomAttributesManagerAgent();
export default GitlabFnGitlabProjectCustomAttributesManagerAgent;
