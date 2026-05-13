/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import puppeteer from 'puppeteer';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

class SurferAgent {
    constructor() {
        this.browser = null;
    }

    async init() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }

    async research(url, query) {
        logger.info(`🏄 Surfer: Visiting ${url}...`);
        await this.init();

        const page = await this.browser.newPage();
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Extract text content
            const content = await page.evaluate(() => document.body.innerText);

            // Limit content length for AI context
            const truncatedContent = content.substring(0, 10000);

            // Ask AI to analyze
            const prompt = `
            You are a Research Assistant.
            
            Source Content (from ${url}):
            """
            ${truncatedContent}
            """
            
            User Query: "${query}"
            
            Synthesize an answer based on the source content.
            `;

            const analysis = await GeminiAiService.generateContent(prompt);
            return analysis;

        } catch (error) {
            logger.error(`❌ Surfer Error: ${error.message}`);
            return `Failed to browse ${url}: ${error.message}`;
        } finally {
            await page.close();
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

export const surferAgent = new SurferAgent();
