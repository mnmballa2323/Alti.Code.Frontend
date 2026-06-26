import { logger } from '../../../shared/logger.js';
import { crabboxService } from './crabbox.service.js';

class CrabboxSandboxService {
  /**
   * Executes a build or test command securely inside a contained sandbox.
   * Handles lease management (warmup -> run -> stop) and execution timeouts.
   *
   * @param {string} command - Command to run (e.g. 'npm test')
   * @param {Object} [options] - Configurations (timeoutMs, provider, class, forceSync)
   * @returns {Promise<Object>} Execution outcome details
   */
  async executeInSandbox(command, options = {}) {
    const timeoutMs = options.timeoutMs || 30000; // default 30s timeout
    logger.info(
      `🛡️ Sandbox: Initializing secure execution for command: "${command}"`,
    );

    let lease = null;
    let timeout = null;

    try {
      // 1. Acquire lease (warmup)
      lease = await crabboxService.warmup({
        provider: options.provider,
        class: options.class,
        ttl: Math.ceil(timeoutMs / 1000) + 60, // lease TTL padded by 60s
      });

      if (!lease || !lease.success || !lease.id) {
        throw new Error(
          `Failed to provision sandbox lease: ${lease?.stderr || 'Unknown error'}`,
        );
      }

      logger.info(
        `🛡️ Sandbox: Lease [${lease.id}] active. Running execution...`,
      );

      // 2. Set up execution timeout guard
      const timeoutPromise = new Promise((_, reject) => {
        timeout = setTimeout(() => {
          reject(new Error(`Sandbox execution timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });

      // 3. Execute command inside the enleased sandbox
      const runPromise = crabboxService.run(command, {
        id: lease.id,
        provider: options.provider,
        class: options.class,
        forceSync: options.forceSync,
      });

      const result = await Promise.race([runPromise, timeoutPromise]);
      clearTimeout(timeout);

      // 4. Terminate and release sandbox lease
      await this._releaseLease(lease.id);

      return {
        success: result.success && result.exitCode === 0,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        leaseId: lease.id,
        timedOut: false,
      };
    } catch (error) {
      if (timeout) clearTimeout(timeout);

      logger.error(`🛡️ Sandbox: Execution failure: ${error.message}`);

      if (lease && lease.id) {
        // Attempt cleanup on failure
        await this._releaseLease(lease.id);
      }

      return {
        success: false,
        exitCode: 1,
        stdout: '',
        stderr: error.message,
        leaseId: lease?.id || 'failed',
        timedOut: error.message.includes('timed out'),
      };
    }
  }

  async _releaseLease(leaseId) {
    try {
      logger.info(`🛡️ Sandbox: Releasing lease [${leaseId}]`);
      await crabboxService.stop(leaseId);
    } catch (err) {
      logger.warn(
        `🛡️ Sandbox: Cleanup failed for lease [${leaseId}]: ${err.message}`,
      );
    }
  }
}

export const crabboxSandboxService = new CrabboxSandboxService();
