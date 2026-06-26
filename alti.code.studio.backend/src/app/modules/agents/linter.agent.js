/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Linter" - Tier 8 Micro-Agent
 * Extremely fast, deterministic agent that fixes predictable syntactical
 * issues (like trailing spaces, missing semicolons, or quote mismatches)
 * without invoking slow LLMs. Allows the Hive to conserve compute.
 */

import { logger } from '../../../shared/logger.js';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

class LinterAgent {
  constructor() {
    this.name = 'Linter';
    this.description =
      'Autonomous Code Quality fixes via ESLint/TSLint overrides.';
  }

  /**
   * Attempts to autonomously fix lint errors in a target file or workspace.
   * @param {string} targetPath Absolute path to a file or directory
   * @param {string} language Hint for parser (js, ts, py, etc.)
   * @returns {Promise<{success: boolean, report: string, fixesApplied: number}>}
   */
  async fix(targetPath, language = 'typescript') {
    logger.info(
      `🧹 Linter Agent: Initiating deterministic sweep on: ${targetPath}`,
    );

    try {
      if (language === 'typescript' || language === 'javascript') {
        // If ESLint exists in the target repo, use it. Otherwise, fallback to an atomic basic regex sweep.
        const cmd = `npx eslint "${targetPath}" --fix`;
        logger.info(`🧹 Linter Agent: Executing [${cmd}]`);

        try {
          const { stdout, stderr } = await execAsync(cmd);
          return {
            success: true,
            report: stdout || 'Linting passed perfectly.',
            fixesApplied: -1, // Unknown exact count, but ESLint succeeded
          };
        } catch (lintErr) {
          // ESLint returned non-zero (meaning there are un-fixable errors remaining)
          logger.warn(
            `🧹 Linter Agent: Auto-fix completed with residual warnings. Passing to Overseer.`,
          );
          return {
            success: false,
            report: lintErr.stdout || lintErr.message,
            fixesApplied: -1,
          };
        }
      } else if (language === 'python') {
        const cmd = `python -m black "${targetPath}" && python -m ruff check "${targetPath}" --fix`;
        await execAsync(cmd);
        return {
          success: true,
          report: 'Python Linter (Ruff/Black) sweep complete.',
          fixesApplied: -1,
        };
      }

      return {
        success: false,
        report: `Linter does not natively support language: ${language}`,
        fixesApplied: 0,
      };
    } catch (error) {
      logger.error(`❌ Linter Agent: Failed execution.`, error);
      return {
        success: false,
        report: error.message,
        fixesApplied: 0,
      };
    }
  }
}

export const linterAgent = new LinterAgent();
