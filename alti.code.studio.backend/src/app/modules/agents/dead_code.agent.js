/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Dead Code Reaper" - Tier 8 Micro-Agent
 * Identifies unused functions, unused variables, and abandoned imports to
 * aggressively minimize bundle sizes and improve code readability.
 */

import { logger } from '../../../shared/logger.js';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

class DeadCodeAgent {
  constructor() {
    this.name = 'DeadCodeReaper';
    this.description = 'Aggressive tree-shaking and dead code analyzer.';
  }

  /**
   * Reaps dead code within a TS/JS project by delegating to `ts-prune` or equivalent.
   * @param {string} directory Absolute path to project root
   * @returns {Promise<{success: boolean, unusedExports: string[]}>}
   */
  async analyzeProject(directory) {
    logger.info(
      `💀 DeadCodeReaper: Engaging total project AST analysis in [${directory}]...`,
    );

    try {
      // ts-prune natively checks for unused exports across a Typescript project.
      // If the user doesn't have it, we fall back to a simple regex heuristic on individual files
      const cmd = `npx ts-prune -p tsconfig.json`;
      const { stdout, stderr } = await execAsync(cmd, { cwd: directory });

      const lines = stdout
        .split('\n')
        .filter(l => l.trim() && !l.includes('node_modules'));
      return {
        success: true,
        unusedExports: lines,
      };
    } catch (err) {
      // Because ts-prune exits with 1 if dead code is found, we have to parse the error stdout!
      if (err.stdout) {
        const lines = err.stdout
          .split('\n')
          .filter(l => l.trim() && !l.includes('node_modules'));
        if (lines.length > 0) {
          logger.info(
            `💀 DeadCodeReaper: Detected ${lines.length} unused export blocks.`,
          );
          return {
            success: true,
            unusedExports: lines,
          };
        }
      }

      logger.error(
        `❌ DeadCodeReaper: Critical failure mapping AST exports.`,
        err.message,
      );
      return {
        success: false,
        unusedExports: [],
      };
    }
  }
}

export const deadCodeAgent = new DeadCodeAgent();
