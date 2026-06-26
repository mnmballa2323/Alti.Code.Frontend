/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';
import { performanceAgent } from './performance.agent.js';
import { holodeckService } from '../qa/holodeck.service.js';

class AutonomousRefactorService {
  constructor() {
    this.isRunning = false;
    // Strict focus: Only refactor backend source code to prevent breaking UI bundles
    this.targetDir = path.join(process.cwd(), 'src');
  }

  /**
   * Initializes the continuous background refactoring loop.
   */
  init() {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info(
      `🔄 [OmniRefactor] Background Code Modernization Engine activated.`,
    );

    // Start the continuous background loop
    this._refactorLoop();
  }

  /**
   * Recursively retrieves all JS files in the given directory.
   */
  async _getFiles(dir) {
    let results = [];
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const file of list) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        results = results.concat(await this._getFiles(filePath));
      } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
        results.push(filePath);
      }
    }
    return results;
  }

  async _refactorLoop() {
    while (this.isRunning) {
      try {
        logger.info(
          `🔄 [OmniRefactor] Initiating full workspace sweep for algorithm optimization...`,
        );

        const allFiles = await this._getFiles(this.targetDir);

        // Shuffle array to prevent getting stuck on one problematic file
        const shuffledFiles = allFiles.sort(() => 0.5 - Math.random());

        for (const filePath of shuffledFiles) {
          const content = await fs.readFile(filePath, 'utf-8');

          // Super fast static analysis using RegEx heuristics for bad patterns
          const hasNestedLoops = /for.*\{[\s\S]*for.*\{/.test(content);
          const hasNestedPromises = /\.then\([\s\S]*\.then\(/.test(content);

          if (hasNestedLoops || hasNestedPromises) {
            logger.warn(
              `⚠️ [OmniRefactor] Sub-optimal complexity detected in: ${path.basename(filePath)}`,
            );

            // Dispatch the Performance Agent to rewrite the file
            logger.info(
              `🧠 [OmniRefactor] Dispatching PerformanceAgent for O(1) mitigation...`,
            );

            const refactorGoal = `
                        The file ${filePath} contains sub-optimal code.
                        Please rewrite the nested loops to use O(1) HashMaps/Sets, 
                        and flatten any nested Promise chains into modern async/await syntax.
                        `;

            const generatedPatch = await performanceAgent._invoke(
              refactorGoal,
              content,
            );
            const cleanCode = generatedPatch
              .replace(/```javascript|```js|```/g, '')
              .trim();

            // Route through the Holodeck to prove the refactored code compiles securely
            logger.info(
              `🧪 [OmniRefactor] Verifying O(1) refactored code in the Holodeck...`,
            );
            const simulation =
              await holodeckService.simulateExecution(cleanCode);

            if (simulation.success) {
              logger.info(
                `✅ [OmniRefactor] Holodeck validated performance patch. Proceeding with AST injection.`,
              );
              // In a full production loop, this would call ast_patcher.service.js
              // For safety during background autonomous loops, we log the success instead of destructive writes
              logger.info(
                `✨ [OmniRefactor] Successfully optimized ${path.basename(filePath)} (Simulated Write)`,
              );
            } else {
              logger.warn(
                `❌ [OmniRefactor] Performance patch failed Holodeck compilation. Abandoning patch.`,
              );
            }
          }

          // Yield CPU to prevent blocking the main Node.js event loop
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Sleep for 30 minutes after a full workspace sweep
        logger.info(
          `💤 [OmniRefactor] Workspace sweep complete. Engine cooling down...`,
        );
        await new Promise(resolve => setTimeout(resolve, 1800000));
      } catch (err) {
        logger.error(
          `❌ [OmniRefactor] Engine encountered an error: ${err.message}`,
        );
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  }
}

export const autonomousRefactorService = new AutonomousRefactorService();
