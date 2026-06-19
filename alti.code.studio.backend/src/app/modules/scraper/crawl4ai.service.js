/**
 * Copyright (c) 2026 Inso Code
 *
 * crawl4ai.service.js — Intelligent Scraper Wrapper
 * Resolves pages using Crawl4AI microservice or falls back to Puppeteer.
 */

import { Crawl4AiAgentService } from '../crawl4aiAgent/crawl4aiAgent.service.js';
import { PageBrowserAutomation } from '../browser/page_browser_automation.js';
import { logger } from '../../../shared/logger.js';

export class Crawl4AiService {
    /**
     * Crawls a page using Crawl4AI, falling back to Puppeteer if the service is offline.
     * @param {string} url 
     * @param {object} options
     * @returns {Promise<{success: boolean, title: string, content: string, source: 'crawl4ai' | 'puppeteer'}>}
     */
    static async crawl(url, options = {}) {
        logger.info(`🌐 [Scraper Wrapper] Scrape request initiated for: ${url}`);
        
        // 1. Try Crawl4AI
        try {
            logger.info('🌐 [Scraper Wrapper] Attempting scrape via Crawl4AI microservice...');
            const crawlResult = await Crawl4AiAgentService.crawlAndExtract(url, 'markdown');
            if (crawlResult && (crawlResult.markdown || crawlResult.content)) {
                return {
                    success: true,
                    title: crawlResult.title || 'Extracted Page',
                    content: crawlResult.markdown || crawlResult.content,
                    source: 'crawl4ai'
                };
            }
        } catch (error) {
            logger.warn(`⚠️ [Scraper Wrapper] Crawl4AI request failed: ${error.message}. Triggering Puppeteer fallback...`);
        }

        // 2. Fallback to PageBrowserAutomation (Puppeteer)
        try {
            const fallbackResult = await PageBrowserAutomation.scrapePage(url, options);
            if (fallbackResult.success) {
                return {
                    success: true,
                    title: fallbackResult.title || 'Scraped Page',
                    content: fallbackResult.extractedText,
                    source: 'puppeteer'
                };
            } else {
                throw new Error(fallbackResult.error || 'Puppeteer extraction returned unsuccessful.');
            }
        } catch (fallbackError) {
            logger.error(`❌ [Scraper Wrapper] Both Crawl4AI and Puppeteer fallback failed: ${fallbackError.message}`);
            return {
                success: false,
                title: 'Error',
                content: fallbackError.message,
                source: 'puppeteer'
            };
        }
    }
}
export default Crawl4AiService;
