/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import puppeteer from 'puppeteer';
import { logger } from '../../../shared/logger.js';

class BrowserService {
    constructor() {
        this.browser = null;
        this.isMockMode = false;
    }

    async launch() {
        if (this.browser) return;

        try {
            logger.info('🌐 BrowserService: Launching Puppeteer...');
            this.browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        } catch (error) {
            logger.error('🌐 BrowserService: Failed to launch. Switching to Mock Mode.', error);
            this.isMockMode = true;
        }
    }

    async browse(url) {
        if (this.isMockMode) {
            return this._mockBrowse(url);
        }

        if (!this.browser) await this.launch();

        let page = null;
        try {
            page = await this.browser.newPage();
            // Set viewport to a standard desktop size
            await page.setViewport({ width: 1280, height: 800 });

            logger.info(`🌐 Browsing: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            const title = await page.title();

            // Extract text from body
            const text = await page.evaluate(() => document.body.innerText);

            // Take screenshot (binary buffer)
            const screenshot = await page.screenshot({ encoding: 'binary' });

            return {
                url,
                title,
                text: text.substring(0, 10000), // Limit text size
                screenshot: screenshot.toString('base64') // Return base64 for JSON transport (MCP)
            };

        } catch (error) {
            logger.error(`🌐 Browser error for ${url}`, error);
            return {
                url,
                error: error.message
            };
        } finally {
            if (page) await page.close();
        }
    }

    _mockBrowse(url) {
        return {
            url,
            title: "Mock Page Title",
            text: "This is a mock response because Puppeteer failed to launch.",
            screenshot: ""
        };
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

export const browserService = new BrowserService();
