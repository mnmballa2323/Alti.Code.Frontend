/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Research Scraper" — Tier 13 Specialist
 * Automates browser-based academic search and extraction via Browser-Use.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { browserUseAgent } from './browser_use.agent.js';
import { logger } from '../../../shared/logger.js';

class ResearchPaperScraperAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'ResearchPaperScraper';
    this.description = 'Academic Research Paper Browser & Scraper Specialist';
    this.tier = 'Tier 13';
  }

  async _invoke(context, contextBlock) {
    let topic;
    let isDirectInvoke = false;
    let options = {};

    if (typeof context === 'object' && context !== null) {
      topic = context.topic || context.goal || context.query;
      isDirectInvoke = true;
      options = {
        headless: context.headless !== undefined ? context.headless : true,
        maxResults: context.maxResults || 5,
      };
    } else if (typeof context === 'string') {
      topic = context;
    }

    if (!topic) {
      throw new Error(
        'Research paper scraper requires a search topic or keyword.',
      );
    }

    logger.info(
      `🤖 Research Paper Scraper: Browsing academic sites for topic: "${topic}"`,
    );

    const refinedSearchPrompt = `Go to https://arxiv.org/, search for "${topic}", scrape the top ${options.maxResults || 5} search results (including titles, authors, links, and abstracts), and return them as a clean structured list.`;

    try {
      const browserResponse = await browserUseAgent.consult({
        goal: refinedSearchPrompt,
        headless: options.headless,
      });

      const output =
        typeof browserResponse === 'string'
          ? JSON.parse(browserResponse)
          : browserResponse;

      if (isDirectInvoke) {
        return {
          status: 'success',
          agent: this.name,
          action: 'research-scrape',
          refinedPrompt: refinedSearchPrompt,
          data: output,
          message: `Successfully searched and scraped research papers.`,
        };
      }

      return JSON.stringify(
        {
          status: 'success',
          agent: this.name,
          action: 'research-scrape',
          data: output,
        },
        null,
        2,
      );
    } catch (error) {
      logger.error(
        `❌ Research Paper Scraper: Browser automation failed: ${error.message}`,
      );
      throw error;
    }
  }
}

export const researchPaperScraperAgent = new ResearchPaperScraperAgent();
