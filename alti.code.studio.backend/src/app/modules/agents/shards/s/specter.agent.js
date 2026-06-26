// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { logger } from '../../../../shared/logger.js';

/**
 * The 'Specter' Agent — Autonomous Preview Environments.
 * Spins up transient, isolated clones of the application for every PR.
 */
class SpecterAgent extends BaseSpecialistAgent {
  constructor() {
    super('specter', 'Preview Environment Engine', 'Tier 2');
  }

  /**
   * Spins up a preview environment for a GitHub PR.
   */
  async launchPreview(repoContext, platform = 'vercel') {
    logger.info(
      `👻 [Specter] Launching transient preview environment for ${repoContext.repo}...`,
    );

    try {
      const { uDeploymentService } =
        await import('../../../gcpCloud/gcpServices.service.js');
      const preview = await uDeploymentService.executeAutoDeploy(platform, {
        path: repoContext.path,
        isPreview: true,
      });

      logger.info(`✅ [Specter] Preview Environment LIVE: ${preview.url}`);

      // Post back to GitHub via Octopus
      const { octopusAgent } = await import('./octopus.agent.js');
      await octopusAgent.executeMission('CREATE_PR_COMMENT', {
        owner: repoContext.owner,
        repo: repoContext.repo,
        prNumber: repoContext.prNumber,
        body: `🚀 **Alti Preview Environment Live:** ${preview.url}`,
      });

      return preview;
    } catch (error) {
      logger.error('Specter Preview Launch Failure:', error);
      throw error;
    }
  }
}

export const specterAgent = Object.freeze(new SpecterAgent());
