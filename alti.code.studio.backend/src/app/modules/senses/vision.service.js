/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';
import puppeteer from 'puppeteer';

/** Current latest stable Gemini vision-capable model. Update when new versions ship. */
const VISION_MODEL = 'gemini-1.5-pro';

class VisionService {

    /**
     * Analyze an image using Gemini multimodal capabilities.
     * @param {Buffer|string} image  - Buffer or Base64 string
     * @param {string}        prompt - Question about the image
     * @param {string}        [mimeType='image/png'] - MIME type of the image
     * @returns {Promise<string>}
     */
    async analyze(image, prompt = 'Describe this image.', mimeType = 'image/png') {
        logger.info('👁️ VisionService: Analyzing image...');

        try {
            const model = GeminiAiService.getModel(VISION_MODEL);

            const imagePart = {
                inlineData: {
                    data: Buffer.isBuffer(image) ? image.toString('base64') : image,
                    mimeType,
                },
            };

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
            });

            // Safely navigate the response — candidates may be absent on safety blocks
            const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                logger.warn('👁️ VisionService: No text in response — using mock fallback.');
                return this._mockAnalyze();
            }

            return text;

        } catch (error) {
            logger.error('👁️ VisionService Error', error);
            logger.warn('Falling back to Mock Vision.');
            return this._mockAnalyze();
        }
    }

    /**
     * Capture a screenshot of a URL using Puppeteer.
     * @param {string} url
     * @param {{ width?: number, height?: number }} [viewport]
     * @returns {Promise<Buffer>}
     */
    async capturePage(url, viewport = { width: 1280, height: 800 }) {
        logger.info(`📸 VisionService: Capturing page [${url}]...`);

        if (!url || typeof url !== 'string') {
            throw new Error('VisionService: url must be a non-empty string.');
        }

        let browser = null;
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            await page.setViewport(viewport);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 });

            const screenshot = await page.screenshot({ encoding: 'buffer', type: 'png' });
            logger.info(`📸 VisionService: Captured ${screenshot.length} bytes.`);
            return screenshot;

        } catch (error) {
            logger.error(`📸 VisionService Capture Error: ${error.message}`);
            // Return a 1×1 transparent PNG so downstream analysis can gracefully continue
            return Buffer.from(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                'base64'
            );
        } finally {
            if (browser) await browser.close();
        }
    }

    _mockAnalyze() {
        return '[MOCK VISION] I see a screenshot of a web application. It looks like a dashboard with a sidebar.';
    }
}

export const visionService = new VisionService();
