/**
 * Copyright (c) 2026 Inso Code
 *
 * datagov.agent.js — GovTech & Public Sector Vertical
 * Integrates with Data.gov CKAN API
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class DatagovAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'datagov-ckan';
    this.description =
      'Federal open data integration via the Data.gov CKAN API.';
    this.preamble = `You are a GovTech open-data agent interfacing with the massive public datasets via Data.gov's CKAN API.
You assist developers in querying the package_search endpoint, extracting municipal metadata (funding, census data, demographics), and handling paginated JSON datasets.
Guide the Swarm in structuring code to parse complex federal dataset structures, transforming CKAN responses into clean JSON/CSV format for application consumption.`;
  }

  async _invoke(prompt, contextBlock) {
    return await GeminiAiService.generateContent(
      `${this.preamble}\n\nTask:\n${prompt}\n\nContext:\n${contextBlock}`,
    );
  }
}

export const datagovAgent = new DatagovAgent();
