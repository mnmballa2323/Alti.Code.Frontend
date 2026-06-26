import { scoutAgent } from './scout.agent.js';
import { logger } from '../../../shared/logger.js';

const checkUpdates = async () => {
  return await scoutAgent.checkUpdates();
};

const analyzeMigration = async (packageName, currentVersion, targetVersion) => {
  return await scoutAgent.analyzeMigration(
    packageName,
    currentVersion,
    targetVersion,
  );
};

export const scoutService = {
  checkUpdates,
  analyzeMigration,
};
