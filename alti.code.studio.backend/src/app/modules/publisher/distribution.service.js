/**
 * Copyright (c) 2024 Inso Code
 *
 * The Publisher: Distribution Service
 * Natively executes `npm publish` and builds/pushes Docker images
 * so the Swarm can autonomously distribute the fruits of its labor.
 */

import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { logger } from '../../../shared/logger.js';
import { slackAmbassadorService } from '../ambassador/slack.service.js';

const execAsync = promisify(exec);

class DistributionService {
  constructor() {
    this.rootDir = path.join(process.cwd(), '..');
  }

  /**
   * Executes the CI/CD pipeline to distribute the latest tagged release.
   */
  async distributeRelease(version) {
    if (process.env.AUTO_PUBLISH !== 'true') {
      logger.warn(
        `⚠️ The Publisher: AUTO_PUBLISH is disabled. Skipping distribution for v${version}.`,
      );
      return;
    }

    logger.info(
      `📦 The Publisher: Commencing global distribution for v${version}...`,
    );

    try {
      // 1. Publish to npm (Backend or SDK)
      logger.info(
        '📦 The Publisher: Running `npm publish` for the backend package...',
      );
      const backendDir = process.cwd();
      await execAsync(`npm publish --access public`, { cwd: backendDir });
      logger.info('✅ The Publisher: Successfully published to npm registry.');

      // 2. Build and Push Docker Image
      const dockerRepo =
        process.env.DOCKER_REPO || 'mnmballa2323/alti.code.studio';
      logger.info(
        `🐳 The Publisher: Building Docker image ${dockerRepo}:${version}...`,
      );
      await execAsync(
        `docker build -t ${dockerRepo}:${version} -t ${dockerRepo}:latest ${this.rootDir}`,
      );

      logger.info(`🐳 The Publisher: Pushing Docker image to registry...`);
      await execAsync(`docker push ${dockerRepo}:${version}`);
      await execAsync(`docker push ${dockerRepo}:latest`);
      logger.info(
        '✅ The Publisher: Successfully pushed images to Docker Hub.',
      );

      // 3. Notify Stakeholders
      if (slackAmbassadorService.isInitialized) {
        // Fetch the release notes (commits since previous version)
        const { stdout: commits } = await execAsync(
          `git -C ${this.rootDir} log HEAD~10..HEAD --oneline`,
        );

        const message = `🚀 *New Autonomous Release: v${version}* 🚀
The Swarm has successfully analyzed, built, versioned, and distributed the latest platform upgrade!

*Distribution Points:*
- NPM Public Registry
- Docker Hub (\`${dockerRepo}:${version}\`)
- GitHub Release Tag

*Recent Changes Included:*
\`\`\`
${commits.split('\\n').slice(0, 5).join('\\n')}
\`\`\`
_Powered by The Publisher Service_`;

        // Hacky way since we don't have a specific channel target saved in the service
        if (slackAmbassadorService.app) {
          await slackAmbassadorService.app.client.chat.postMessage({
            channel: process.env.SLACK_ANNOUNCE_CHANNEL || '#engineering',
            text: message,
          });
        }
      }

      logger.info(
        `🎉 The Publisher: Global distribution for v${version} fully completed.`,
      );
    } catch (error) {
      logger.error(`❌ The Publisher: Distribution failed: ${error.message}`);

      // Attempt to notify failure via Slack
      if (slackAmbassadorService.isInitialized && slackAmbassadorService.app) {
        await slackAmbassadorService.app.client.chat.postMessage({
          channel: config.SLACK_ANNOUNCE_CHANNEL || '#engineering',
          text: `🚨 *Autonomous Release Failed!* 🚨\nThe Publisher failed to distribute v${version}: ${error.message}`,
        });
      }
    }
  }
}

export const distributionService = new DistributionService();
