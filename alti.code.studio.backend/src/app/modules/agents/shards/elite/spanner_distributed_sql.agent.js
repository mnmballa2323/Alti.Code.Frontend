// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Sovereign Elite Specialist Agent
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class SpannerDistributedSqlAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'spanner_distributed_sql',
      'Spanner Distributed SQL Specialist',
      'You are an elite Google Cloud Spanner Specialist. You design distributed SQL schemas, interleaved tables, and handle strictly consistent global transactions.',
    );
  }

  async generateSchema(objective) {
    logger.info(
      `🗄️ [SpannerDistributedSqlAgent] Architecting distributed Spanner schema...`,
    );
    const prompt = `Design the distributed SQL database requirement: ${objective}. Output valid Cloud Spanner schemas using interleaved tables and highly consistent transaction patterns.`;
    try {
      const output = await this._invoke(prompt, 'N/A - Spanner Schema Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [SpannerDistributedSqlAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const spannerDistributedSqlAgent = Object.freeze(
  new SpannerDistributedSqlAgent(),
);
