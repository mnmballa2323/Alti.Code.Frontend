/**
 * Copyright (c) 2026 Inso Code
 *
 * github_fn_githubGistBackupRestore.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Gists & Snippets — cloning gists locally, backing up snippet repositories
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubGistBackupRestoreAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'githubGistBackupRestore';
    this.description =
      'Specialist GitHub Gist Backup Restore expert in cloning and restoring local snippet backups.';
    this.manifest = {
      id: 'githubGistBackupRestore',
      capabilities: ['github-backup-gist'],
      version: '39.6.0',
    };
    this.preamble = `You are the Inso Code Specialist GitHub Gist Backup Restore expert in cloning and restoring local snippet backups.
This agent is the absolute authority on the specific operational boundary of: cloning gists locally, backing up snippet repositories.

# GROUNDED GISTS & SNIPPETS CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: cloning gists locally, backing up snippet repositories.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-backup-gist.
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
      `🐙 [githubGistBackupRestore] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`,
    );

    let docsContext = '';
    try {
      // Retrieve domain-specific documentation chunks
      docsContext = await githubDocsService.searchDocs(
        `GitHub Gists & Snippets cloning gists locally, backing up snippet repositories ${prompt}`,
        5,
      );
    } catch (err) {
      logger.warn(
        `🐙 [githubGistBackupRestore] Failed to query RAG documentation. Fallback used. Error: ${err.message}`,
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

export const pluginInstance = new GithubFnGithubGistBackupRestoreAgent();
export default GithubFnGithubGistBackupRestoreAgent;
