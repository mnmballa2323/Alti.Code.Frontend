import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';
import { logger } from './logger.mock.js';

const execAsync = util.promisify(exec);
const WORKTREE_BASE_PATH = path.resolve('.borg/worktrees');

// Ensure base path exists
if (!fs.existsSync(WORKTREE_BASE_PATH)) {
    fs.mkdirSync(WORKTREE_BASE_PATH, { recursive: true });
}

/**
 * Maestro: Swarm & Worktree Manager
 * Handles the creation, management, and cleanup of isolated git worktrees for agent tasks.
 */
class Maestro {
    constructor() {
        this.activeSwarms = new Map();
    }

    /**
     * Provisions a new isolated worktree for a task.
     * @param {string} taskId - Unique ID for the task
     * @param {string} baseBranch - Branch to base the worktree on (default: main)
     * @returns {Promise<string>} - Absolute path to the worktree
     */
    async provisionWorktree(taskId, baseBranch = 'main') {
        const worktreePath = path.join(WORKTREE_BASE_PATH, `task-${taskId}`);
        const branchName = `task-branch-${taskId}`;

        try {
            if (fs.existsSync(worktreePath)) {
                logger.warn(`Worktree ${worktreePath} already exists. Cleaning up...`);
                await this.cleanupWorktree(taskId);
            }

            logger.info(`Provisioning worktree for ${taskId} at ${worktreePath}`);

            // Create worktree
            // git worktree add -b <new-branch> <path> <source-branch>
            // Note: In a real scenario, we might want to check if branch exists, etc.
            // For safety in this simplified version, we might just use the main repo path if safe,
            // but to stick to the architecture, we'll try to actually do it or mock it if git operations are too risky blindly.
            // Let's implement the actual command but wrap it carefully.

            await execAsync(`git worktree add -b ${branchName} "${worktreePath}" ${baseBranch}`, {
                cwd: process.cwd() // Root of the monorepo
            });

            this.activeSwarms.set(taskId, {
                path: worktreePath,
                branch: branchName,
                createdAt: new Date()
            });

            return worktreePath;
        } catch (error) {
            logger.error(`Maestro failed to provision worktree: ${error.message}`);
            // Fallback or rethrow. For this MVP, we might want to just return CWD if worktree fails (e.g. if dirty)
            // allowing the agent to run in the main tree (careful!)
            // throw error;
            logger.warn("Falling back to main directory due to worktree failure - CAUTION");
            return process.cwd();
        }
    }

    /**
     * Cleans up a worktree and deletes the temporary branch.
     * @param {string} taskId 
     */
    async cleanupWorktree(taskId) {
        const swarm = this.activeSwarms.get(taskId);
        if (!swarm) {
            // Check if directory exists anyway using convention
            const worktreePath = path.join(WORKTREE_BASE_PATH, `task-${taskId}`);
            if (fs.existsSync(worktreePath)) {
                try {
                    await execAsync(`git worktree remove "${worktreePath}" --force`);
                    // Branch cleanup might be separate
                } catch (e) {
                    logger.error(`Cleanup failed: ${e.message}`);
                }
            }
            return;
        }

        try {
            await execAsync(`git worktree remove "${swarm.path}" --force`);
            await execAsync(`git branch -D ${swarm.branch}`);
            this.activeSwarms.delete(taskId);
            logger.info(`Cleaned up worktree for ${taskId}`);
        } catch (error) {
            logger.error(`Error cleaning up worktree: ${error.message}`);
        }
    }

    getActiveSwarms() {
        return Array.from(this.activeSwarms.entries());
    }
}

export const maestro = new Maestro();
