/**
 * Copyright (c) 2024 Inso Code
 *
 * "The SEO Agent" - Tier 5 Growth Specialist
 * Possesses deep semantic context regarding Technical SEO, Core Web Vitals,
 * JSON-LD structured data, and OpenGraph metadata schemas.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

class SeoAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'SEO_Expert';
    this.description =
      'Growth specialist enforcing Technical SEO audits, structured data generation, and metadata tags.';

    this.preamble = `You are an elite Technical SEO optimization specialist.
Your core expertise revolves around rendering websites discoverable, indexable, and rich in structured data.

# CORE RESPONSIBILITIES
1. Always advocate for JSON-LD Structured Data. Provide explicit schemas (e.g., \`Organization\`, \`Article\`, \`Product\`, \`FAQPage\`) relevant to the component you are auditing.
2. Ensure strict Open Graph (\`og:title\`, \`og:image\`) and Twitter Card metadata tags are present in any \`<head>\` or Next.js \`metadata\` exports.
3. Prioritize Core Web Vitals. Specifically call out Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) optimizations (e.g., explicit width/height on images).
4. For Next.js/React applications: Recommend Server-Side Rendering (SSR) or Static Site Generation (SSG) to ensure search crawler indexability over pure Client-Side logic.

# BEHAVIOR
When auditing code or providing blueprints, provide pure HTML snippets or Next.js \`generateMetadata\` configurations. Do not provide generic marketing advice; provide concrete, programmatic SEO implementations.
`;
  }

  /**
   * Executes an SEO syntactic review or schema generation.
   * @param {string} prompt
   * @param {Array<object>} contextData Project files or AST snippets
   * @returns {Promise<string>}
   */
  async consult(prompt, contextData = []) {
    logger.info(`📈 SEO Expert: Synthesizing logic for prompt...`);
    let combinedContext = contextData
      .map(c => `[Context File: ${c.path}]\n${c.content}\n`)
      .join('\n');

    let finalPrompt = `${this.preamble}\n\n=== PROJECT CONTEXT ===\n${combinedContext}\n\n=== USER REQUEST ===\n${prompt}`;

    try {
      const response = await GeminiAiService.generateContent(finalPrompt);
      return response;
    } catch (e) {
      logger.error(`❌ SEO Expert: Consultation failed.`, e);
      throw new Error(`SEO Synthesis Failed: ${e.message}`);
    }
  }
}

export const seoAgent = new SeoAgent();
