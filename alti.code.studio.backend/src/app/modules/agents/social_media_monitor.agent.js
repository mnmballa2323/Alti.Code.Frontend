/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Social Media Monitor" — Tier 13 Specialist
 * Automates browser-based mention and social monitoring via Browser-Use.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { browserUseAgent } from './browser_use.agent.js';
import { logger } from '../../../shared/logger.js';

class SocialMediaMonitorAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'SocialMediaMonitor';
    this.description = 'Social Media Trend & Mention Monitoring Specialist';
    this.tier = 'Tier 13';
  }

  async _invoke(context, contextBlock) {
    let keywords;
    let isDirectInvoke = false;
    let options = {};

    if (typeof context === 'object' && context !== null) {
      keywords = context.keywords || context.query || context.goal;
      isDirectInvoke = true;
      options = {
        headless: context.headless !== undefined ? context.headless : true,
        platforms: context.platforms || ['github', 'reddit'],
      };
    } else if (typeof context === 'string') {
      keywords = context;
    }

    if (!keywords) {
      throw new Error(
        'Social media monitor requires keywords or search query.',
      );
    }

    logger.info(
      `🤖 Social Media Monitor: Monitoring mentions for: "${keywords}"`,
    );

    const refinedPrompt = `Open the browser, search on platforms like GitHub and Reddit for mentions of the keywords "${keywords}", gather the top recent posts or issues (including title, URL, engagement metrics, and snippet), and format the results.`;

    try {
      const browserResponse = await browserUseAgent.consult({
        goal: refinedPrompt,
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
          action: 'social-monitor',
          refinedPrompt: refinedPrompt,
          data: output,
          message: `Successfully monitored and extracted social platform mentions.`,
        };
      }

      return JSON.stringify(
        {
          status: 'success',
          agent: this.name,
          action: 'social-monitor',
          data: output,
        },
        null,
        2,
      );
    } catch (error) {
      logger.error(
        `❌ Social Media Monitor: Browser automation failed: ${error.message}`,
      );
      throw error;
    }
  }
}

export const socialMediaMonitorAgent = new SocialMediaMonitorAgent();
