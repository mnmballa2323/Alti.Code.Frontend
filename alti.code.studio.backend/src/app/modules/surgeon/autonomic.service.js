/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { astService } from '../../../shared/ast.service.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';
import simpleGit from 'simple-git';
import crypto from 'crypto';
import { redisClient } from '../../../shared/redis.client.js';


const git = simpleGit();

export class AutonomicService {
    constructor() {
        this.name = 'ProactiveSurgeon';
        /**
         * Minimum cyclomatic complexity score that triggers a surgical rewrite.
         * Set to 15 for production safety — only genuinely complex files are touched.
         * Use 5 in unit tests only.
         */
        this.COMPLEXITY_THRESHOLD = 15;
        /**
         * Minimum fraction of lines that must change (0.0–1.0) for a patch to be
         * applied. Prevents no-op or trivially equivalent rewrites.
         */
        this.MIN_CHANGE_RATIO = 0.20;
        logger.info('🔬 AutonomicService: Proactive Surgeon initialized. Ready to hunt technical debt.');
    }

    /**
     * Repository-wide AST sweep for structurally complex technical debt.
     * @param {string[]} targetFiles Absolute paths to files to scan
     * @returns {Promise<{ eliminated: number, patches: object[] }>}
     */
    async commenceProactiveSweep(targetFiles) {
        if (!Array.isArray(targetFiles) || targetFiles.length === 0) {
            throw new Error('AutonomicService: targetFiles must be a non-empty array of file paths.');
        }
        logger.info(`🔬 AutonomicService: Commencing deep AST structural sweep of ${targetFiles.length} files...`);


        let debtEliminated = 0;
        const patches = [];

        for (const filePath of targetFiles) {
            // Distributed Lock ensures horizontal horizontal sweeps don't dual-write
            const lockKey = `autonomic:lock:${Buffer.from(filePath).toString('base64')}`;
            const acquired = await redisClient.setnx(lockKey, 'locked', 300); // 5 min TTL

            if (!acquired) {
                logger.warn(`🔬 AutonomicService: File ${path.basename(filePath)} is already locked by another AST sweep. Skipping.`);
                patches.push({ filePath, skipped: true, reason: 'locked' });
                continue;
            }

            try {
                const sourceCode = await fs.readFile(filePath, 'utf8');

                // 1. AST Analysis
                const complexity = astService.calculateComplexity(sourceCode);

                if (complexity > this.COMPLEXITY_THRESHOLD) {
                    logger.warn(`🔬 AutonomicService: [TECH DEBT] ${path.basename(filePath)} scored Cyclomatic Complexity=${complexity}. Initiating Surgical Rewrite.`);

                    // 2. Synthesize the optimized patch via LLM
                    const repairPrompt = `You are the Proactive Surgeon. I have a file with an unacceptable Cyclomatic Complexity of ${complexity}, indicating deep O(N^2) loops or spaghetti logic.
                    
                    Source Code:
                    ${sourceCode}

                    Rewrite the entire file utilizing HashMaps, Sets, or early returns (\`O(1)\` or \`O(N)\`) to flatten the complexity.
                    Return ONLY the completely refactored JavaScript file. Do NOT include markdown \`\`\`.`;

                    const rawPatch = await GeminiAiService.generateContent(repairPrompt);
                    const engineeredPatch = rawPatch
                        .replace(/^```[a-z]*\n?/im, '')
                        .replace(/\n?```$/m, '')
                        .trim();


                    // 3. Compute diff; only apply if meaningfully different
                    const diff = this._generateDiff(sourceCode, engineeredPatch);
                    const changeRatio = this._computeChangeRatio(sourceCode, engineeredPatch);

                    if (changeRatio < this.MIN_CHANGE_RATIO) {
                        logger.info(`🔬 AutonomicService: Patch for ${path.basename(filePath)} rejected — only ${(changeRatio * 100).toFixed(1)}% changed (threshold: ${(this.MIN_CHANGE_RATIO * 100)}%). Skipping destructive write.`);
                        patches.push({ filePath, skipped: true, reason: 'insufficient_improvement', changeRatio });
                        continue;
                    }

                    // 4. Write patch to disk with backup, then commit
                    const patchResult = await this._applyAndStageRepair(filePath, engineeredPatch, complexity);
                    patches.push({ ...patchResult, diff, changeRatio: +(changeRatio * 100).toFixed(1) });
                    debtEliminated++;
                }

            } catch (error) {
                logger.error(`❌ AutonomicService: Failed to analyze ${filePath}`, error);
            } finally {
                // Free the lock so future sweeps can evaluate the new state
                await redisClient.del(lockKey);
            }
        }

        logger.info(`🔬 AutonomicService: Sweep Complete. Eliminated ${debtEliminated} instances of technical debt.`);
        return { eliminated: debtEliminated, patches };
    }

    /**
     * Generates a simplified unified-style diff between two code strings.
     * Lines removed are prefixed with `-`, lines added with `+`.
     *
     * @param {string} original
     * @param {string} patched
     * @returns {string} Human-readable diff
     */
    _generateDiff(original, patched) {
        const origLines = original.split('\n');
        const patchLines = patched.split('\n');
        const origSet = new Set(origLines);
        const patchSet = new Set(patchLines);

        const removed = origLines.filter(l => !patchSet.has(l)).map(l => `- ${l}`);
        const added = patchLines.filter(l => !origSet.has(l)).map(l => `+ ${l}`);

        return [...removed.slice(0, 30), ...added.slice(0, 30)].join('\n') || '(no textual diff)';
    }

    /**
     * Computes what fraction of lines differ between original and patched code.
     * Returns a value between 0.0 (identical) and 1.0 (completely different).
     *
     * @param {string} original
     * @param {string} patched
     * @returns {number}
     */
    _computeChangeRatio(original, patched) {
        const origLines = original.split('\n');
        const patchLines = patched.split('\n');
        const origSet = new Set(origLines);
        const changedLines = patchLines.filter(l => !origSet.has(l)).length;
        const totalLines = Math.max(origLines.length, patchLines.length);
        return totalLines === 0 ? 0 : changedLines / totalLines;
    }

    /**
     * Write the repaired code to disk (with a .bak backup), then stage and
     * commit the change on a new branch via simple-git.
     *
     * @param {string} filePath       Absolute path of the file being repaired
     * @param {string} newCode        The refactored source code
     * @param {number} complexityScore Original cyclomatic complexity score
     * @returns {Promise<object>}
     */
    async _applyAndStageRepair(filePath, newCode, complexityScore) {
        // UUID suffix prevents branch name collision when multiple files are patched concurrently
        const branchName = `autonomic/flatten-complexity-${crypto.randomUUID().slice(0, 8)}`;

        const backupPath = `${filePath}.bak`;
        const commitMsg = `refactor(autonomic): Flatten cyclomatic complexity ${complexityScore} in ${path.basename(filePath)}`;

        try {
            // 1. Back up original before any writes
            const original = await fs.readFile(filePath, 'utf8');
            await fs.writeFile(backupPath, original);
            logger.info(`🔬 AutonomicService: Backup saved → ${backupPath}`);

            // 2. Write the patch
            await fs.writeFile(filePath, newCode, 'utf8');
            logger.info(`🔬 AutonomicService: Patch written → ${filePath}`);

            // 3. Commit on a new branch
            await git.checkoutLocalBranch(branchName);
            await git.add(filePath);
            await git.commit(commitMsg);
            logger.info(`💾 AutonomicService: Committed on branch "${branchName}" — "${commitMsg}"`);

            return { filePath, branchName, complexityScore, backedUp: true, backupPath };

        } catch (gitError) {
            logger.error(`❌ AutonomicService: Git operation failed for ${filePath}`, gitError);
            // File write already happened — still report patch was applied, but commit failed
            return { filePath, branchName: null, complexityScore, backedUp: true, backupPath, commitError: gitError.message };
        }
    }
}

export const autonomicService = new AutonomicService();
