/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { AutomationUtils } from './automations.utils.js';

/**
 * Fetch leads from the Ad Library for a list of keywords.
 * Requests run in parallel per keyword, then results are merged.
 *
 * @param {string[]} keywords
 * @returns {Promise<{ message: string, data: string[][] }>}
 */
const getLeadsFromKeywords = async (keywords) => {
  if (!Array.isArray(keywords) || keywords.length === 0) {
    logger.warn('AutomationService: getLeadsFromKeywords called with empty keywords array.');
    return { message: 'No keywords provided', data: [] };
  }

  logger.info(`🔍 AutomationService: Scraping ${keywords.length} keyword(s) in parallel...`);

  // Run scrapes in parallel instead of sequentially
  const results = await Promise.allSettled(
    keywords.map(async (kw) => {
      logger.info(`🔍 Searching for: ${kw}`);
      const ads = await AutomationUtils.scrapeAdLibrary(kw);

      // Filter: leads with no discoverable website (no TLD match at all)
      // Previously only checked for .com — now covers .io, .dev, .co, .org etc.
      const NO_WEBSITE_RE = /\.\w{2,6}(\/|$)/;
      const leadsWithoutWebsite = ads.filter(ad => !NO_WEBSITE_RE.test(ad.link ?? ''));

      return leadsWithoutWebsite.map(ad => [ad.name, ad.link, kw]);
    })
  );

  const allLeads = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allLeads.push(...result.value);
    } else {
      logger.warn(`AutomationService: A keyword scrape failed — ${result.reason?.message}`);
    }
  }

  if (allLeads.length > 0) {
    await AutomationUtils.appendToSheet(allLeads);
    logger.info(`✅ AutomationService: ${allLeads.length} leads saved to sheet.`);
    return { message: `${allLeads.length} leads saved to sheet`, data: allLeads };
  }

  logger.info('AutomationService: No leads without a website were found.');
  return { message: 'No leads found without website', data: [] };
};

export const AutomationService = {
  getLeadsFromKeywords,
};
