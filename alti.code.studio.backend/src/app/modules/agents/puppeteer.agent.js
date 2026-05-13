import puppeteer from 'puppeteer';
import { logger } from '../../../shared/logger.js';
import { sentinelService } from '../security/sentinel.service.js';

/**
 * Google Puppeteer (Apache 2.0) Autonomous Web Explorer.
 * Grants the Swarm the physical capability to open headless Chromium, 
 * execute JavaScript on third-party sites, and scrape rendered DOM context
 * to fuel real-time Agentic Retrieval-Augmented Generation (RAG).
 */
class GooglePuppeteerAgent {
    /**
     * Autonomously navigates to a URL, renders the JS, and extracts text context.
     * @param {string} url - The target URL to explore
     * @returns {Promise<string>} The parsed text content of the page
     */
    async scrapeRenderedContext(url) {
        logger.info(`🕸️ [Puppeteer] Swarm is autonomously navigating to: ${url}`);
        
        // 🛡️ Sovereign Security Boundary: Restrict local network traversal
        if (url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('file://')) {
            const warning = `Swarm attempted illegal local network traversal to: ${url}`;
            logger.warn(`🚨 [Puppeteer] ${warning}`);
            sentinelService.reportEvent('ILLEGAL_NETWORK_TRAVERSAL_ATTEMPT', 'CRITICAL', { url });
            return "ACCESS DENIED: Internal network traversal is strictly prohibited.";
        }

        let browser;
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
            });

            const page = await browser.newPage();
            
            // Mask as a standard Chrome user to prevent immediate blocking
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            // Navigate and wait for network to idle (meaning JS frameworks like React/Vue have rendered)
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });

            // Extract the purely rendered text from the document body
            const contextText = await page.evaluate(() => {
                // Remove noisy tags like scripts, styles, and SVGs before extracting text
                const elementsToRemove = document.querySelectorAll('script, style, svg, iframe, noscript');
                elementsToRemove.forEach(el => el.remove());
                
                return document.body.innerText || '';
            });

            logger.info(`✅ [Puppeteer] Successfully extracted ${contextText.length} bytes of raw rendered context.`);
            
            return contextText.substring(0, 50000); // Hard cap at 50k chars to prevent memory flooding

        } catch (error) {
            logger.error(`❌ [Puppeteer] Exploration failed for ${url}:`, error.message);
            return `Exploration failed: ${error.message}`;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

export const puppeteerAgent = new GooglePuppeteerAgent();
