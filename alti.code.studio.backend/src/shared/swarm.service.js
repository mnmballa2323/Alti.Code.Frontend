/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SwarmService {
  constructor() {
    this.name = 'HiveMind';
    this.maxPoolSize = parseInt(process.env.SWARM_MAX_THREADS || '50', 10);
    logger.info(
      `🐝 SwarmService: Hive Mind initialized with capacity for [${this.maxPoolSize}] parallel sub-agents.`,
    );
  }

  /**
   * Executes an array of tasks simultaneously across isolated Node.js Worker Threads.
   * Completes in total O(1) duration equivalent to the slowest single thread, rather than O(N).
   * @param {Array<{id: string, prompt: string}>} tasks The payloads for the sub-agents
   * @returns {Promise<Array<{id: string, result: string, error: string}>>}
   */
  async unleash(tasks) {
    if (!Array.isArray(tasks) || tasks.length === 0) return [];

    if (tasks.length > this.maxPoolSize) {
      logger.warn(
        `🐝 SwarmService: Requested ${tasks.length} threads. Truncating to SWARM_MAX_THREADS (${this.maxPoolSize}).`,
      );
      tasks = tasks.slice(0, this.maxPoolSize);
    }

    logger.info(
      `🐝 SwarmService: Dispatching swarm... Deploying [${tasks.length}] autonomous worker threads.`,
    );

    const workerPromises = tasks.map(task => this._spawnWorker(task));

    // Unleash the swarm. All execute concurrently in the OS.
    const results = await Promise.allSettled(workerPromises);

    logger.info('🐝 SwarmService: Swarm has returned. Aggregating results...');

    return results.map((res, index) => {
      if (res.status === 'fulfilled') {
        return res.value;
      } else {
        logger.error(
          `🐝 SwarmService: Thread ${tasks[index].id} crashed.`,
          res.reason,
        );
        return { id: tasks[index].id, error: res.reason.message };
      }
    });
  }

  /**
   * Internal: Bootstraps an isolated Worker thread pointing to swarm.worker.js
   */
  _spawnWorker(task) {
    return new Promise((resolve, reject) => {
      const workerPath = path.join(__dirname, 'swarm.worker.js');
      const worker = new Worker(workerPath, {
        workerData: task,
      });

      worker.on('message', message => {
        if (message.success) {
          resolve({ id: task.id, result: message.data });
        } else {
          reject(new Error(message.error));
        }
      });

      worker.on('error', reject);
      worker.on('exit', code => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  }
}

export const swarmService = new SwarmService();
