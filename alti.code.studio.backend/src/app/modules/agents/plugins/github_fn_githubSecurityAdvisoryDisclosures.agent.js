/**
 * Copyright (c) 2026 Inso Code
 *
 * github_fn_githubSecurityAdvisoryDisclosures.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitHub Security & Compliance — private security advisory disclosures, collaborative vulnerability fixes
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { githubDocsService } from '../../githubDocs/githubDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubFnGithubSecurityAdvisoryDisclosuresAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'githubSecurityAdvisoryDisclosures';
    this.description =
      'Specialist GitHub Security Advisory Disclosures expert in private vulnerability tracking and fixes coordination.';
    this.manifest = {
      id: 'githubSecurityAdvisoryDisclosures',
      capabilities: ['github-create-security-advisory'],
      version: '39.6.0',
    };
    this.preamble = `You are the Inso Code Specialist GitHub Security Advisory Disclosures expert in private vulnerability tracking and fixes coordination.
This agent is the absolute authority on the specific operational boundary of: private security advisory disclosures, collaborative vulnerability fixes.

# GROUNDED SECURITY & COMPLIANCE CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: private security advisory disclosures, collaborative vulnerability fixes.
2. **REST/GraphQL API Execution**: Orchestrate the exact REST and GraphQL operations mapping to capabilities: github-create-security-advisory.
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
      `🐙 [githubSecurityAdvisoryDisclosures] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`,
    );

    let docsContext = '';
    try {
      // Retrieve domain-specific documentation chunks
      docsContext = await githubDocsService.searchDocs(
        `GitHub Security & Compliance private security advisory disclosures, collaborative vulnerability fixes ${prompt}`,
        5,
      );
    } catch (err) {
      logger.warn(
        `🐙 [githubSecurityAdvisoryDisclosures] Failed to query RAG documentation. Fallback used. Error: ${err.message}`,
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
  new GithubFnGithubSecurityAdvisoryDisclosuresAgent();
export default GithubFnGithubSecurityAdvisoryDisclosuresAgent;
