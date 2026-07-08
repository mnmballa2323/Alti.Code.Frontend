import { director } from './Director.js';
import { maestro } from './Maestro.js';
import { logger } from '../../../shared/logger.js';

/**
 * Grand Unification Test
 * Verifies the integration of the Borg Engine components: Director -> Maestro -> Swarm.
 */
const runTest = async () => {
  logger.info('Starting Grand Unification Test...');

  try {
    // 1. Test Maestro Direct Provisioning
    logger.info('TEST 1: Maestro Provisioning');
    const swarmId = 'test-swarm-001';
    const path = await maestro.provisionWorktree(swarmId);
    logger.info(`[PASS] Maestro provisioned worktree at: ${path}`);
    await maestro.cleanupWorktree(swarmId);
    logger.info(`[PASS] Maestro cleanup successful`);

    // 2. Test Director Full Mission Cycle
    logger.info('TEST 2: Director Mission Cycle');
    const goal = 'Analyze the project structure';
    const userId = 'test-user';

    const missionId = await director.startMission(goal, userId);
    logger.info(`Director started mission: ${missionId}`);

    // Poll for status
    let status = director.getMissionStatus(missionId);
    while (
      status &&
      status.status !== 'completed' &&
      status.status !== 'failed'
    ) {
      await new Promise(r => setTimeout(r, 500));
      status = director.getMissionStatus(missionId);
      process.stdout.write(`.`);
    }
    process.stdout.write(`\n`);

    if (status.status === 'completed') {
      logger.info(`[PASS] Mission completed successfully.`);
      logger.info('Mission Logs:');
      status.logs.forEach(log =>
        logger.info(`  - ${log.timestamp.toISOString()}: ${log.message}`),
      );
    } else {
      logger.error(`[FAIL] Mission failed: ${status.error}`);
      process.exit(1);
    }

    logger.info('GRAND UNIFICATION SUCCESSFUL: THE BORG IS ONLINE.');
    process.exit(0);
  } catch (e) {
    logger.error(`GRAND UNIFICATION FAILED: ${e.message}`);
    logger.error(e);
    process.exit(1);
  }
};

runTest();
