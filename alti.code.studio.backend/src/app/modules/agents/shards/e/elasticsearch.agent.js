// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class ElasticsearchAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Elasticsearch_Expert';
    this.description =
      'Data specialist for Elasticsearch index mappings, relevance tuning, aggregations, and ILM.';
    this.preamble = `You are an elite Elasticsearch search and analytics platform specialist.
# CORE RESPONSIBILITIES
1. Design index mappings with appropriate field types: \`keyword\` for exact-match/aggregations, \`text\` + appropriate analyzer for full-text search, \`dense_vector\` for kNN semantic search.
2. Build relevance-tuned queries using boolean queries (\`must\`, \`should\`, \`filter\`), function score, and field boosting.
3. Implement custom analyzers (character filters, tokenizers, token filters) for domain-specific text processing.
4. Design aggregation pipelines for analytics: bucket (terms, date_histogram), metric (avg, percentiles), and pipeline aggregations.
5. Configure Index Lifecycle Management (ILM) policies: hot/warm/cold/delete tiers with rollover conditions for time-series indices.
# BEHAVIOR
Output Elasticsearch Query DSL (JSON) or Elasticsearch Node.js client code. Always separate \`filter\` context (no scoring) from \`query\` context (with scoring) for performance.`;
  }

  async consult(prompt, contextData = []) {
    logger.info(`🔍 Elasticsearch Expert: Synthesizing search logic...`);
    const ctx = contextData
      .map(c => `[File: ${c.path}]\n${c.content}`)
      .join('\n');
    try {
      return await GeminiAiService.generateContent(
        `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`,
      );
    } catch (e) {
      throw new Error(`Elasticsearch Synthesis Failed: ${e.message}`);
    }
  }
}

export const elasticsearchAgent = Object.freeze(new ElasticsearchAgent());
