import { logger } from '../../../shared/logger.js';
import axios from 'axios';
import cron from 'node-cron';
import { capabilityRouter } from './capability.router.js';

class GithubCrawlerService {
  constructor() {
    this.name = 'GithubCrawlerService';
    this.isActive = false;
    this.seenIssues = new Set();
  }

  init() {
    if (!process.env.GITHUB_PAT) {
      logger.warn(
        '⚠️ [Sentinel Crawler] Missing GITHUB_PAT env var. Proactive Bug Bounty disabled.',
      );
      return;
    }

    logger.info(
      '🕷️ [Sentinel Crawler] Initialized. Will search GitHub for open vulnerabilities every 6 hours.',
    );

    // Schedule to run every 6 hours
    cron.schedule('0 */6 * * *', () => {
      this.huntForBugs();
    });

    // Run an initial hunt after 30 seconds of server startup
    setTimeout(() => this.huntForBugs(), 30000);
    this.isActive = true;
  }

  async huntForBugs() {
    if (!this.isActive) return;

    logger.info(
      '🕷️ [Sentinel Crawler] Starting proactive scan for Unpatched CVEs & Good First Issues...',
    );

    try {
      // Search for open issues labeled "vulnerability", "security", or "bug" in popular repos
      const query = encodeURIComponent(
        `is:issue is:open label:security,vulnerability,"good first issue" created:>$(new Date(Date.now() - 7 * 24*60*60*1000).toISOString().split('T')[0]) sort:updated-desc`,
      );

      const response = await axios.get(
        `https://api.github.com/search/issues?q=\${query}&per_page=5`,
        {
          headers: {
            Authorization: `token \${process.env.GITHUB_PAT}`,
            Accept: 'application/vnd.github.v3+json',
          },
        },
      );

      const issues = response.data.items || [];

      for (const issue of issues) {
        if (this.seenIssues.has(issue.id)) continue;
        this.seenIssues.add(issue.id);

        logger.info(
          `🚨 [Sentinel Crawler] Found target: ${issue.title} (${issue.repository_url})`,
        );

        const repoUrl = issue.repository_url.replace(
          'https://api.github.com/repos/',
          'https://github.com/',
        );
        const prompt = `Inso Code Sentinel: I have found an open issue on GitHub: "${issue.title}". \nDescription: ${issue.body?.substring(0, 1000) || 'None'}\n\nPlease fork ${repoUrl}, fix the issue, and submit a PR.`;

        const contextData = {
          source: 'GITHUB_SENTINEL_CRAWLER',
          issueUrl: issue.html_url,
          repository: repoUrl,
          timestamp: Date.now(),
        };

        // Phase 50: Handoff to capability router to delegate to GitOps or Bug Bounty Agent
        logger.info(
          '🕷️ [Sentinel Crawler] Handing off to Capability Router for autonomous resolution...',
        );
        capabilityRouter.dispatch(prompt, [contextData]).catch(e => {
          logger.error(
            `[Sentinel Crawler] Swarm failed to resolve issue ${issue.id}: ${e.message}`,
          );
        });
      }
    } catch (error) {
      logger.error(`🕷️ [Sentinel Crawler] Hunt failed: ${error.message}`);
    }
  }
}

export const githubCrawlerService = new GithubCrawlerService();
