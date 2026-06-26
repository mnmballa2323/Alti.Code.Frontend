/**
 * Copyright (c) 2026 Inso Code
 *
 * github_expert.agent.js — Swarm Marketplace Dynamic Plugin
 * Authoritative Specialist for all GitHub Developer Documentation, APIs, Actions, and CLI.
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubExpertAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'githubExpert';
    this.description =
      'Dynamic GitHub Expert Specialist leveraging the ingested GitHub Developer Documentation to provide highly grounded assistance on GitHub APIs, Actions, and CLI.';
    this.manifest = {
      id: 'githubExpert',
      capabilities: [
        'github-documentation',
        'github-api',
        'github-actions',
        'github-cli',
      ],
      version: '39.1.0',
    };
    this.preamble = `You are the Inso Code GitHub Expert Agent, the absolute authority on the entire GitHub Developer Ecosystem.

# GROUNDED KNOWLEDGE & CAPABILITIES
1. **GitHub Documentation & Knowledge**: Dynamically answer questions using highly accurate and precise developer documentation ingested directly from GitHub's official databases.
2. **GitHub API (REST/GraphQL)**: Guide developers on REST and GraphQL API design, webhooks configuration, authentication (OAuth, PATs, GitHub App tokens), rate limit optimizations, and Octokit SDK integration.
3. **GitHub Actions**: Help write, debug, and optimize CI/CD workflows, configure environments, leverage custom Actions, self-hosted runners, and manage secrets securely.
4. **GitHub CLI (gh)**: Provide definitive and accurate terminal commands utilizing \`gh\` (such as \`gh pr\`, \`gh issue\`, \`gh repo\`, \`gh workflow\`) to elevate command line productivity.

# BEHAVIORAL PROTOCOLS
- You MUST base your suggestions strictly on the official grounded developer documentation context provided to you.
- Never invent parameters, APIs, or workflow properties that are not documented.
- Respond with clear, structured markdown. When generating code blocks, provide clean, production-grade code (TypeScript/JavaScript for APIs, YAML for Actions).`;
  }

  /**
   * Specialized LLM invocation grounded dynamically by RAG similarity search.
   * @param {string} prompt       - Validated user request
   * @param {string} contextBlock - Pre-sanitized and truncated context files
   * @returns {Promise<string>}   - Grounded specialist synthesis response
   */
  async _invoke(prompt, contextBlock) {
    logger.info(
      `🐙 [GitHub Expert] Grounding query in ingested developer docs: "${prompt.substring(0, 60)}..."`,
    );

    let docsContext = '';
    try {
      // Semantically retrieve the top relevant documentation chunks from our local RAG store
      docsContext = await githubDocsService.searchDocs(prompt, 5);
    } catch (err) {
      logger.warn(
        `🐙 [GitHub Expert] Failed to query local RAG documentation. Proceeding with fallback. Error: ${err.message}`,
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

export const pluginInstance = new GithubExpertAgent();
export default GithubExpertAgent;
