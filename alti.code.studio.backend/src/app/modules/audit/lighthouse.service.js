import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { logger } from '../../../shared/logger.js';
import { sentinelService } from '../security/sentinel.service.js';

/**
 * Google Lighthouse & Chrome Launcher (Apache 2.0) Autonomous Auditing Service.
 * Deploys headless Chrome to execute deep diagnostic performance, security, and SEO audits.
 */
class GoogleLighthouseService {
  /**
   * Executes an autonomous Lighthouse audit on a target URL.
   * @param {string} url - The URL to audit
   */
  async executeAudit(url) {
    logger.info(
      `🔍 [Lighthouse] Initiating Google Lighthouse autonomous audit for: ${url}`,
    );
    let chrome;
    try {
      // Launch Headless Chrome via Google's chrome-launcher
      chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
      });

      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
        port: chrome.port,
      };

      // Execute the Lighthouse Audit
      const runnerResult = await lighthouse(url, options);

      // Extract the core scores (0 to 100)
      const scores = {
        performance: runnerResult.lhr.categories.performance.score * 100,
        accessibility: runnerResult.lhr.categories.accessibility.score * 100,
        bestPractices:
          runnerResult.lhr.categories['best-practices'].score * 100,
        seo: runnerResult.lhr.categories.seo.score * 100,
      };

      logger.info(
        `✅ [Lighthouse] Audit completed for ${url}. Scores: ${JSON.stringify(scores)}`,
      );

      // Security Boundary: If "best-practices" dips below 70, flag it to Sentinel
      if (scores.bestPractices < 70) {
        logger.warn(
          `⚠️ [Lighthouse] Best Practices score critically low (${scores.bestPractices}). Engaging Sentinel.`,
        );
        await sentinelService.reportEvent(
          'LIGHTHOUSE_AUDIT_FAILURE',
          'MEDIUM',
          {
            url,
            scores,
            report:
              'Google Lighthouse detected significant degradation in web best practices or security configurations.',
          },
        );
      }

      return {
        success: true,
        url: runnerResult.lhr.finalDisplayedUrl,
        scores: scores,
        // We return the raw JSON report if the frontend wants to render the Lighthouse Viewer
        rawReport: runnerResult.report,
      };
    } catch (error) {
      logger.error(`❌ [Lighthouse] Audit failed for ${url}:`, error.message);
      return { success: false, error: error.message };
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  }
}

export const lighthouseService = new GoogleLighthouseService();
