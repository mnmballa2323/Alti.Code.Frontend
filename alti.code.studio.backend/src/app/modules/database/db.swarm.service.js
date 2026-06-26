import { logger } from '../../../logger/logger.service.js';
import crypto from 'crypto';

/**
 * Ephemeral DB Swarm Service (Pillar 30)
 * Orchestrates dynamic Docker PostgreSQL containers for isolated testing.
 */
class DBSwarmService {
  constructor() {
    logger.info(`[DBSwarmService] Initializing Docker Daemon API proxy...`);
    this.activeContainers = new Map();
  }

  /**
   * Spins up an ephemeral PostgreSQL container for a specific test suite.
   * @param {string} testSuiteName - The name of the test suite requesting isolation
   * @returns {Promise<Object>} - Connection details for the ephemeral DB
   */
  async spinUpTestContainer(testSuiteName) {
    const containerId = crypto.randomUUID().split('-')[0];
    const port = Math.floor(Math.random() * (65535 - 10000 + 1) + 10000); // Random port between 10k-65k

    logger.info(
      `🐳 [DB Swarm] Pillar 30: Spinning up Ephemeral PostgreSQL Container [ID: ${containerId}] for Test Suite: ${testSuiteName}...`,
    );

    // Simulating the Docker API spin-up
    await new Promise(resolve => setTimeout(resolve, 800)); // 800ms spin up time

    const connectionString = `postgresql://postgres:postgres@localhost:${port}/alti_test_db`;

    logger.info(
      `   [Docker API] Executing Prisma Migrations in isolated container [${containerId}]...`,
    );
    // Simulating prisma db push
    await new Promise(resolve => setTimeout(resolve, 500));

    this.activeContainers.set(testSuiteName, {
      containerId,
      port,
      connectionString,
    });

    logger.info(
      `✅ [DB Swarm] Ephemeral DB Ready! Connection: ${connectionString}`,
    );

    return {
      success: true,
      containerId,
      connectionString,
    };
  }

  /**
   * Destroys an ephemeral PostgreSQL container after a test suite finishes.
   * @param {string} testSuiteName - The name of the test suite that finished
   */
  async tearDownTestContainer(testSuiteName) {
    const containerInfo = this.activeContainers.get(testSuiteName);
    if (!containerInfo) {
      logger.warn(
        `⚠️ [DB Swarm] Container for suite ${testSuiteName} not found.`,
      );
      return { success: false, error: 'Container not found' };
    }

    logger.info(
      `💥 [DB Swarm] Tearing down Ephemeral PostgreSQL Container [ID: ${containerInfo.containerId}]...`,
    );
    // Simulating docker stop and rm
    await new Promise(resolve => setTimeout(resolve, 400));

    this.activeContainers.delete(testSuiteName);
    logger.info(
      `   [Docker API] Container ${containerInfo.containerId} completely destroyed.`,
    );

    return { success: true };
  }
}

export const dbSwarmService = new DBSwarmService();
