/**
 * Copyright (c) 2024 Inso Code
 *
 * Git Worker — "The Courier"
 * Autonomous version control agent.
 * Stages, commits, pushes, and auto-documents every milestone.
 */

import simpleGit from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../../shared/logger.js';

const REPO_ROOT = process.cwd();

/**
 * GitWorker Processor
 * Job data: { message: string, tag?: string, changelog?: string }
 */
export const gitWorkerProcessor = async job => {
  const jobId = job.id;
  const { message, tag, changelog } = job.data;

  logger.info(`📦 GitWorker [${jobId}]: Starting auto-commit...`);

  const git = simpleGit(REPO_ROOT);

  try {
    // 1. SCRIBE — Append changelog entry
    if (changelog) {
      const changelogPath = path.join(REPO_ROOT, 'CHANGELOG.md');
      const date = new Date().toISOString().split('T')[0];
      const entry = `\n## [${date}] ${tag || 'AUTO'}\n${changelog}\n`;

      let existing = '';
      try {
        existing = await fs.readFile(changelogPath, 'utf-8');
      } catch {
        /* file doesn't exist yet */
      }
      await fs.writeFile(changelogPath, existing + entry);
      logger.info(`📝 GitWorker [${jobId}]: CHANGELOG.md updated.`);
    }

    // 2. STAGE
    await git.add('.');
    logger.info(`📂 GitWorker [${jobId}]: Staged all changes.`);

    // 3. COMMIT
    const commitMsg = `[ALTI-AUTO] ${message}`;
    const commitResult = await git.commit(commitMsg);
    logger.info(
      `✅ GitWorker [${jobId}]: Committed: "${commitMsg}" (${commitResult.commit || 'no changes'})`,
    );

    // 4. TAG (optional)
    if (tag) {
      try {
        await git.tag([tag, '-m', message]);
        logger.info(`🏷️ GitWorker [${jobId}]: Tagged ${tag}`);
      } catch (tagErr) {
        logger.warn(
          `⚠️ GitWorker [${jobId}]: Tag failed (may already exist): ${tagErr.message}`,
        );
      }
    }

    // 5. PUSH
    try {
      await git.push('origin', 'main');
      logger.info(`🚀 GitWorker [${jobId}]: Pushed to origin/main.`);
    } catch (pushErr) {
      // Try current branch if 'main' fails
      const branchSummary = await git.branchLocal();
      const currentBranch = branchSummary.current;
      await git.push('origin', currentBranch);
      logger.info(
        `🚀 GitWorker [${jobId}]: Pushed to origin/${currentBranch}.`,
      );
    }

    return { status: 'pushed', commit: commitResult.commit || 'clean' };
  } catch (error) {
    logger.error(`❌ GitWorker [${jobId}] Failed: ${error.message}`);
    throw error;
  }
};
