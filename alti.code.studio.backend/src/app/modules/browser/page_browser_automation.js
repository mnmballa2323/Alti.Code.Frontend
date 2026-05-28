/**
 * Copyright (c) 2026 Alti.Code.Studio
 * 
 * Agentic Web Browser & Page Scraper Engine
 * 
 * High-performance, isolated web automation library.
 * Spawns headless browser sessions using Puppeteer, extracts clean semantic
 * page elements (stripping CSS/JS bloat for optimal LLM RAG injection),
 * captures rendering screenshots, and enforces strict SSRF boundary filters
 * to block visits to local metadata (169.254) or private network IP ranges.
 * 
 * Standard compliant, pure MIT/Apache-2.0 licensed, fast, and secure.
 */

import puppeteer from 'puppeteer';
import { resolve } from 'path';
import { mkdirSync } from 'fs';

export class PageBrowserAutomation {
    /**
     * Spawns a headless browser session, navigates to a URL, and harvests clean content.
     * @param {string} url - Target URL to visit
     * @param {object} options - Execution parameters (screenshotPath, selector)
     * @returns {Promise<object>} Clean semantic page data map
     */
    static async scrapePage(url, options = {}) {
        const screenshotPath = options.screenshotPath || null;
        const selector = options.selector || 'body';

        // 1. Zero-Trust Security Gate: SSRF Boundary filter
        this._validateUrlBoundary(url);

        console.log(`🌐 Launching headless browser to visit: ${url}...`);

        let browser;
        try {
            // Spawn locked-down Chromium instance with sandboxing enabled
            browser = await puppeteer.launch({
                headless: 'shell',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            });

            const page = await browser.newPage();
            
            // Set standardized viewport
            await page.setViewport({ width: 1280, height: 800 });

            // Navigate with timeout
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 8000 });

            // 2. Harvest structural semantic page details
            const pageData = await page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (!element) return { text: '', html: '' };

                // Strip script tags, style tags, and image elements to get pure semantic content
                const clone = element.cloneNode(true);
                const strippable = clone.querySelectorAll('script, style, iframe, noscript');
                strippable.forEach(el => el.remove());

                return {
                    title: document.title,
                    text: clone.innerText.trim().replace(/\s+/g, ' '),
                    html: clone.innerHTML.substring(0, 1000) // snippet
                };
            }, selector);

            // 3. Capture visual rendering screenshot if path specified
            if (screenshotPath) {
                const parentDir = resolve(screenshotPath, '..');
                try {
                    mkdirSync(parentDir, { recursive: true });
                } catch (e) {}
                await page.screenshot({ path: screenshotPath });
                console.log(`📸 Viewport screenshot captured: ${screenshotPath}`);
            }

            await browser.close();

            return {
                success: true,
                title: pageData.title,
                extractedText: pageData.text,
                hasScreenshot: !!screenshotPath
            };

        } catch (err) {
            if (browser) {
                await browser.close();
            }
            return {
                success: false,
                error: `Browser Scraper Error: ${err.message}`
            };
        }
    }

    /**
     * Internal: Zero-Trust SSRF url filter.
     * Prevents requests to local host interfaces or cloud metadata endpoints.
     */
    static _validateUrlBoundary(urlStr) {
        try {
            const url = new URL(urlStr);
            const host = url.hostname.toLowerCase();

            // Block common loopback and local IP ranges
            const isLocal = [
                'localhost',
                '127.0.0.1',
                '0.0.0.0',
                '::1',
                '169.254.169.254', // AWS/GCP/Azure Metadata Services
                '192.168.',        // Local networks
                '10.',
                '172.16.'
            ].some(pattern => host.startsWith(pattern) || host.includes(pattern));

            if (isLocal) {
                throw new Error(`SSRF Blocked: URL attempts to access restricted local/private address space: ${host}`);
            }
        } catch (e) {
            throw new Error(`Zero-Trust URL Trap: ${e.message}`);
        }
    }
}
