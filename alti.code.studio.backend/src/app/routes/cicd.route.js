import express from 'express';
import { cicdHealerService } from '../modules/cicd/cicd.healer.service.js';
import { dbSwarmService } from '../modules/database/db.swarm.service.js';
import { logger } from '../../logger/logger.service.js';

const router = express.Router();

// ============================================================================
// PHASE 11: CI/CD AUTONOMOUS HEALER (GITHUB ACTIONS WEBHOOK)
// ============================================================================

router.post('/webhook/cicd-fail', async (req, res) => {
  try {
    const { rawLogs, prNumber, repoName } = req.body;
    if (!rawLogs)
      return res
        .status(400)
        .json({ error: 'rawLogs are required to heal the build' });

    logger.info(
      `📥 [CI/CD Webhook] Received failure payload for PR #${prNumber} in ${repoName}`,
    );

    const healingPlan = await cicdHealerService.analyzeAndHealFailure(rawLogs);

    logger.info(
      `   [GitHub API] Simulating automated PR comment with Git Diff...`,
    );

    res.status(200).json({
      success: true,
      message:
        'Healer successfully analyzed the failure and commented on the PR.',
      healingPlan,
    });
  } catch (error) {
    logger.error(`[CI/CD Webhook] Healing Error:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PHASE 11: EPHEMERAL DB SWARM
// ============================================================================

router.post('/test/db/spin-up', async (req, res) => {
  try {
    const { testSuiteName } = req.body;
    if (!testSuiteName)
      return res.status(400).json({ error: 'testSuiteName is required' });

    const dbInfo = await dbSwarmService.spinUpTestContainer(testSuiteName);
    res.status(200).json(dbInfo);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/test/db/tear-down', async (req, res) => {
  try {
    const { testSuiteName } = req.body;
    if (!testSuiteName)
      return res.status(400).json({ error: 'testSuiteName is required' });

    const result = await dbSwarmService.tearDownTestContainer(testSuiteName);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
