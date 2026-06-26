/**
 * Copyright (c) 2024 Inso Code
 *
 * The Ambassador: GitHub PR Integration Service
 * Autonomously opens Pull Requests for completed sprints and listens
 * for human review comments to dynamically schedule fix-up sprints.
 */

import { Octokit } from '@octokit/rest';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { sprintSchedulerService } from '../sprintScheduler/sprintScheduler.service.js';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

class GithubPrService {
  constructor() {
    this.octokit = null;
    this.repoOwner = '';
    this.repoName = '';
    this.isInitialized = false;
  }

  init() {
    if (!process.env.GITHUB_TOKEN) {
      logger.warn(
        '👔 The Ambassador: GitHub Token missing. GitHub PR automation disabled.',
      );
      return;
    }

    try {
      this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
      this.repoOwner = process.env.GITHUB_OWNER || 'mnmballa2323';
      this.repoName = process.env.GITHUB_REPO || 'alti.code.studio';
      this.isInitialized = true;
      logger.info('👔 The Ambassador: GitHub PR Service initialized.');
    } catch (error) {
      logger.error(
        `❌ The Ambassador: GitHub Service failed to start: ${error.message}`,
      );
    }
  }

  /**
   * Autonomously opens a Pull Request from a feature branch back to main.
   */
  async createAutonomousPR({ branch, title, body, reviewers = [] }) {
    if (!this.isInitialized) return null;

    try {
      logger.info(
        `🐙 The Ambassador: Opening Pull Request for branch ${branch}...`,
      );

      const { data: pr } = await this.octokit.rest.pulls.create({
        owner: this.repoOwner,
        repo: this.repoName,
        title: `[AUTONOMOUS] ${title}`,
        head: branch,
        base: 'main',
        body: `${body}\n\n---\n*This Pull Request was authored entirely by the Inso Code Swarm.*`,
      });

      if (reviewers.length > 0) {
        await this.octokit.rest.pulls.requestReviewers({
          owner: this.repoOwner,
          repo: this.repoName,
          pull_number: pr.number,
          reviewers,
        });
      }

      logger.info(`✅ The Ambassador: PR opened successfully → ${pr.html_url}`);
      return pr;
    } catch (error) {
      logger.error(`❌ The Ambassador: Failed to open PR: ${error.message}`);
      return null;
    }
  }

  /**
   * Webhook handler for PR review comments.
   * Express route should pass the req.body and headers here.
   */
  async handleWebhook(req, res) {
    if (!this.isInitialized)
      return res.status(503).json({ error: 'GitHub service disabled' });

    const event = req.headers['x-github-event'];

    // Optional: verify webhook signature here if GITHUB_WEBHOOK_SECRET is set
    if (process.env.GITHUB_WEBHOOK_SECRET) {
      const signature = req.headers['x-hub-signature-256'];
      const hmac = crypto.createHmac(
        'sha256',
        process.env.GITHUB_WEBHOOK_SECRET,
      );
      const digest =
        'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
      if (signature !== digest) {
        return res.status(401).send("Signatures didn't match!");
      }
    }

    // We only care about PR review comments
    if (
      event === 'pull_request_review_comment' &&
      req.body.action === 'created'
    ) {
      const comment = req.body.comment;
      const pr = req.body.pull_request;
      const author = comment.user.login;

      // Ignore our own comments
      if (author.includes('[bot]') || author === 'insocode-bot') {
        return res.status(200).send('Ignored bot comment');
      }

      logger.info(
        `💬 The Ambassador: Human PR comment detected from @${author}`,
      );

      try {
        // Synthesize the requested code change from the human comment
        const prompt = `You are The Ambassador. A human engineer left a code review comment on an autonomous Pull Request.
PR Title: "${pr.title}"
File path: ${comment.path}
Human Comment: "${comment.body}"

Write a highly focused, 1-2 sentence declarative Sprint Goal to fix this specific issue on this specific branch.`;

        const translatedGoal = await GeminiAiService.generateContent(prompt);
        const cleanGoal = translatedGoal
          .replace(/^["'\`]+|["'\`]+$/g, '')
          .trim();

        // Add to the autonomous backlog as an absolute Priority 1 task
        await sprintSchedulerService.addGoalToBacklog(
          `[PR FIX-UP ${pr.number}] On branch ${pr.head.ref}: ${cleanGoal}`,
          1,
          {
            source: 'github',
            branch: pr.head.ref,
            prNumber: pr.number,
            author,
          },
        );

        // Reply to the comment letting the human know we are on it
        await this.octokit.rest.pulls.createReplyForReviewComment({
          owner: this.repoOwner,
          repo: this.repoName,
          pull_number: pr.number,
          comment_id: comment.id,
          body: `🤖 *The Swarm acknowledges your feedback.* I have scheduled a priority sprint to address this: \n> "${cleanGoal}"\nI will push the updates to this branch shortly.`,
        });

        logger.info(
          `✅ The Ambassador: PR feedback synthesized into Sprint Goal.`,
        );
        return res.status(200).send('Review handled successfully');
      } catch (err) {
        logger.error(
          `❌ The Ambassador: Failed to handle PR review: ${err.message}`,
        );
        return res.status(500).send('Failed to handle review');
      }
    }

    res.status(200).send('Event ignored');
  }
}

export const githubPrService = new GithubPrService();
