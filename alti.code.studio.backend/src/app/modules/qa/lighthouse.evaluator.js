import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { logger } from '../../../shared/logger.js';

/**
 * Autonomous Lighthouse Evaluator.
 * Grants the Swarm the ability to mathematically audit its own generated frontend code.
 * Instead of relying on LLM heuristics (like Cursor/Windsurf), the Swarm spins up a headless
 * V8 Chrome instance, runs the code, and requires a perfect 100/100 score before returning it.
 */
class LighthouseEvaluator {
    constructor() {
        logger.info('🚦 [Lighthouse] Autonomous Frontend Evaluator initialized.');
    }

    /**
     * Spins up an ephemeral Chrome instance, evaluates a URL, and returns the audit.
     * @param {string} url - The URL to evaluate (typically the Swarm's local dev server)
     */
    async evaluate(url) {
        logger.info(`🚦 [Lighthouse] Swarm initiating mathematical audit of frontend output at ${url}...`);
        
        let chrome;
        try {
            chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'] });
            
            const options = {
                logLevel: 'error',
                output: 'json',
                onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
                port: chrome.port
            };
            
            const runnerResult = await lighthouse(url, options);
            
            const report = {
                performance: runnerResult.lhr.categories.performance.score * 100,
                accessibility: runnerResult.lhr.categories.accessibility.score * 100,
                bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
                seo: runnerResult.lhr.categories.seo.score * 100,
            };

            logger.info(`✅ [Lighthouse] Audit complete. Scores: PERF: ${report.performance}, A11Y: ${report.accessibility}, SEO: ${report.seo}`);
            
            await chrome.kill();
            return report;
        } catch (error) {
            logger.error(`❌ [Lighthouse] Audit failed:`, error.message);
            if (chrome) await chrome.kill();
            return null;
        }
    }
}

export const lighthouseEvaluator = new LighthouseEvaluator();
