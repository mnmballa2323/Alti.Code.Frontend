/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Web Price Tracker" — Tier 13 Specialist
 * Automates browser-based product search and price comparison via Browser-Use.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { browserUseAgent } from './browser_use.agent.js';
import { logger } from '../../../shared/logger.js';

class WebPriceTrackerAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'WebPriceTracker';
    this.description = 'Web Price Comparison & Tracking Specialist';
    this.tier = 'Tier 13';
  }

  async _invoke(context, contextBlock) {
    let product;
    let isDirectInvoke = false;
    let options = {};

    if (typeof context === 'object' && context !== null) {
      product = context.product || context.goal || context.query;
      isDirectInvoke = true;
      options = {
        headless: context.headless !== undefined ? context.headless : true,
      };
    } else if (typeof context === 'string') {
      product = context;
    }

    if (!product) {
      throw new Error('Web price tracker requires a product name or model.');
    }

    logger.info(
      `🤖 Web Price Tracker: Tracking prices for product: "${product}"`,
    );

    const refinedPrompt = `Open the browser, go to Google Shopping or Amazon, search for "${product}", scrape the top 3 pricing offers (including price, vendor, shipping cost, and product listing title), and format the comparison.`;

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
          action: 'price-track',
          refinedPrompt: refinedPrompt,
          data: output,
          message: `Successfully monitored and compared prices for ${product}.`,
        };
      }

      return JSON.stringify(
        {
          status: 'success',
          agent: this.name,
          action: 'price-track',
          data: output,
        },
        null,
        2,
      );
    } catch (error) {
      logger.error(
        `❌ Web Price Tracker: Browser automation failed: ${error.message}`,
      );
      throw error;
    }
  }
}

export const webPriceTrackerAgent = new WebPriceTrackerAgent();
