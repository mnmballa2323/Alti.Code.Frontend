import puppeteer from 'puppeteer';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

/**
 * Official Google Puppeteer Service.
 * Grants the Agent Swarm autonomous visual web-surfing and scraping capabilities.
 */
class BrowserService {
  constructor() {
    this.browser = null;
  }

  /**
   * Initializes the headless Chrome browser instances.
   */
  async initBrowser() {
    if (!this.browser) {
      logger.info(
        '🌐 [Puppeteer] Initializing Google Chrome headless browser...',
      );
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      logger.info('✅ [Puppeteer] Browser engine online.');
    }
  }

  /**
   * Autonomously navigates to a URL and captures the text content.
   */
  async scrapeText(url) {
    await this.initBrowser();
    const page = await this.browser.newPage();

    try {
      logger.info(`🌐 [Puppeteer] Agent navigating to: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Extract all readable text from the body
      const textContent = await page.evaluate(() => document.body.innerText);
      logger.info(`✅ [Puppeteer] Scraped ${textContent.length} characters.`);

      return textContent;
    } catch (error) {
      logger.error(`❌ [Puppeteer] Failed to scrape ${url}:`, error.message);
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Takes a full-page screenshot for visual regression testing by agents.
   */
  async captureScreenshot(url, outputPath) {
    await this.initBrowser();
    const page = await this.browser.newPage();

    try {
      logger.info(`📸 [Puppeteer] Agent capturing screenshot of: ${url}`);
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(url, { waitUntil: 'networkidle0' });

      await page.screenshot({ path: outputPath, fullPage: true });
      logger.info(`✅ [Puppeteer] Screenshot saved to ${outputPath}`);

      return outputPath;
    } catch (error) {
      logger.error(
        `❌ [Puppeteer] Failed to capture screenshot of ${url}:`,
        error.message,
      );
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Closes the browser to free up memory.
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('🛑 [Puppeteer] Browser engine shut down.');
    }
  }
}

export const browserService = new BrowserService();
