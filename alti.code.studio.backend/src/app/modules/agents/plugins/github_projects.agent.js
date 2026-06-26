/**
 * Copyright (c) 2026 Inso Code
 *
 * github_projects.agent.js — Swarm Marketplace Dynamic Plugin
 * Authoritative Specialist for all GitHub Projects v2, Collaboration, and Repository Governance.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubProjectsAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'githubProjectsManager';
    this.description =
      'Specialized GitHub Projects & Collaboration Manager expert in Projects v2 automated workflows, Discussions design, issue tracking, and repository governance.';
    this.manifest = {
      id: 'githubProjectsManager',
      capabilities: [
        'github-projects-v2',
        'github-discussions',
        'github-issues-management',
        'github-collaboration-docs',
      ],
      version: '39.2.0',
    };
    this.preamble = `You are the Inso Code GitHub Projects & Collaboration Manager, the ultimate authority on all repository governance, team collaboration, tracking, and board automation models on GitHub.

# GROUNDED COLLABORATION & GOVERNANCE CAPABILITIES
1. **GitHub Projects v2**: Construct, query, and automate Projects v2 layouts (Kanban, tables, timelines) using GitHub's GraphQL API. Automate card transitions based on issue status changes.
2. **Issues & PR Templates**: Model highly readable and standardized Pull Request templates, Bug report templates, and Feature Request templates to enforce codebase entry standards.
3. **Discussions Configuration**: Organize team spaces by designing GitHub Discussions structures, pinning topics, configuring categories, and mapping Q&A templates.
4. **Governance & Mappings**: Define CODEOWNERS matrices, set up team write/read access controls, and configure branch protection rules (e.g. required reviewers, status checks, linear history).

# BEHAVIORAL PROTOCOLS
- Design clean, highly structured, and human-friendly templates.
- Ground all GraphQL and API recommendations strictly in the official documentation context provided.
- Never suggest manual configurations where automation can be cleanly engineered.`;
  }

  /**
   * Specialized LLM invocation grounded dynamically by Collaboration/Projects doc lookup.
   */
  async _invoke(prompt, contextBlock) {
    logger.info(
      `🐙 [GitHub Projects] Grounding collaboration query in ingested developer docs: "${prompt.substring(0, 60)}..."`,
    );

    let docsContext = '';
    try {
      // Retrieve collaboration and projects specific documentation chunks
      docsContext = await githubDocsService.searchDocs(
        `GitHub Projects v2 GraphQL discussions CODEOWNERS templates ${prompt}`,
        5,
      );
    } catch (err) {
      logger.warn(
        `🐙 [GitHub Projects] Failed to query RAG documentation. Fallback used. Error: ${err.message}`,
      );
    }

    const groundedPrompt = `${this.preamble}

=== GROUNDED DEVELOPER DOCUMENTATION CONTEXT ===
${docsContext || 'No Projects/Collaboration documentation found in local RAG vector store.'}

=== ADDITIONAL CONTEXT ===
${contextBlock || 'No additional file context provided.'}

=== REQUEST ===
${prompt}`;

    return await GeminiAiService.generateContent(groundedPrompt);
  }
}

export const pluginInstance = new GithubProjectsAgent();
export default GithubProjectsAgent;
