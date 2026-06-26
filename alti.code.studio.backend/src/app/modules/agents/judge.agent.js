/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { breakerAgent } from './breaker.agent.js';
import { prophetAgent } from './prophet.agent.js';
import fs from 'fs/promises';
import path from 'path';

class JudgeAgent {
  constructor() {
    this.name = 'The Judge';
  }

  /**
   * Review a directory or specific file for release readiness
   * @param {string} targetPath
   */
  async review(targetPath) {
    logger.info(`⚖️ Judge: Court is in session. Reviewing ${targetPath}...`);

    const verdict = {
      status: 'PASS',
      score: 100,
      issues: [],
      warnings: [],
    };

    try {
      // 1. SECURITY CHECK (The Breaker)
      logger.info('⚖️ Judge: Calling The Breaker for security scan...');
      // Breaker expects a directory, if file, get dirname
      const stat = await fs.stat(targetPath);
      const scanDir = stat.isDirectory()
        ? targetPath
        : path.dirname(targetPath);

      const vulnerabilities = await breakerAgent.attack(scanDir);

      // Filter vulnerabilities to only those in the files we are reviewing
      const targetFiles = await this._getFiles(targetPath);
      const normalizedTargets = targetFiles.map(f => path.resolve(f));

      const relevantVulns = vulnerabilities.filter(v =>
        normalizedTargets.includes(path.resolve(v.file)),
      );

      if (relevantVulns.length > 0) {
        verdict.status = 'FAIL';
        verdict.score -= relevantVulns.length * 20; // Penalty
        verdict.issues.push(
          ...relevantVulns.map(
            v => `[SECURITY] ${v.type} in ${path.basename(v.file)}`,
          ),
        );
      }

      // 2. QUALITY CHECK (The Prophet)
      // Prophet analyzes single files. We need to walk if it's a dir.
      logger.info('⚖️ Judge: Calling The Prophet for quality insight...');
      const filesToScan = await this._getFiles(targetPath);

      for (const file of filesToScan) {
        const insight = await prophetAgent.predict(file);
        if (insight && insight.prediction === 'High Risk') {
          verdict.score -= 10;
          verdict.warnings.push(
            `[COMPLEXITY] ${path.basename(file)} is High Risk: ${insight.reason}`,
          );
        }
      }

      // 3. FINAL RULING
      if (verdict.score < 80) verdict.status = 'FAIL';

      logger.info(
        `⚖️ Judge: Ruling delivered. Verdict: ${verdict.status} (Score: ${verdict.score})`,
      );
      return verdict;
    } catch (error) {
      logger.error(`❌ Judge Failed:`, error);
      throw error;
    }
  }

  async _getFiles(target) {
    const stat = await fs.stat(target);
    if (stat.isFile()) return [target];

    // Simple recursive mock for brevity, in real world use a glob
    const files = [];
    const entries = await fs.readdir(target, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isFile() &&
        (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))
      ) {
        files.push(path.join(target, entry.name));
      }
    }
    return files;
  }
}

export const judgeAgent = new JudgeAgent();
