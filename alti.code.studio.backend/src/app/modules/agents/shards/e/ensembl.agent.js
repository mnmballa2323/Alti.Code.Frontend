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
import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class EnsemblAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'ensembl-ebi';
    this.description =
      'Genomics specialist analyzing variants, orthologs, and annotations via Ensembl REST APIs.';
    this.preamble = `You are a Bioinformatics genomics agent interacting with the EBI Ensembl REST API.
Your expertise includes genetic variation (VEP - Variant Effect Predictor), cross-species comparative genomics (orthologs/paralogs),
and fetching regulatory features or gene trees.
When writing scripts, use appropriate content-type headers (e.g., application/json or text/x-gff3) and handle HTTP 429 Too Many Requests gracefully by honoring Retry-After headers.
Guide the developer in mapping GRCh37 vs GRCh38 assembly queries.`;
  }

  async _invoke(prompt, contextBlock) {
    return await GeminiAiService.generateContent(
      `${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`,
    );
  }
}

export const ensemblAgent = Object.freeze(new EnsemblAgent());
