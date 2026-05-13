/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import simpleGit from 'simple-git';
import chokidar from 'chokidar';
import path from 'path';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../shared/logger.js';

const git = simpleGit();
let watcher = null;
let isSyncing = false;

// Debounce helper
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const generateCommitMessage = async (diff) => {
    try {
        const prompt = `
        Generate a concise, semantic commit message for the following code changes.
        Format: <type>(<scope>): <subject>
        
        Diff:
        ${diff.substring(0, 1000)} // Truncate to avoid token limits
        `;

        // Using GeminiAiService (assuming 'system' user for background tasks)
        // We need a sessionId for context, let's use a rolling one
        const sessionId = `git-agent-sync-${new Date().toISOString().split('T')[0]}`;
        const response = await GeminiAiService.geminiService(sessionId, prompt, 'system', 'text');

        return response.reply.trim().replace(/^```|```$/g, '');
    } catch (error) {
        logger.warn('Failed to generate AI commit message, using default', error);
        return 'chore: Auto-sync updates';
    }
};

const generatePRDescription = async () => {
    try {
        const diff = await git.diff(['--staged']);
        if (!diff) return "No changes staged for PR generation.";

        const prompt = `
        You are an expert technical writer.
        Generate a Pull Request description for the following staged changes.
        
        Diff:
        ${diff.substring(0, 3000)}
        
        Format:
        # Title (Semantic)
        
        ## Summary
        (Brief explanation of changes)
        
        ## Type of Change
        - [ ] Bug fix
        - [ ] New feature
        - [ ] Refactoring
        
        ## Checklist
        - [ ] Tests passed
        `;

        const sessionId = `git-agent-pr-${Date.now()}`;
        const response = await GeminiAiService.geminiService(sessionId, prompt, 'system', 'markdown');
        return response.reply;
    } catch (error) {
        logger.error('Failed to generate PR description', error);
        return "Failed to generate PR description.";
    }
};

const commitChanges = async (message) => {
    try {
        await git.add('.');
        await git.commit(message);
        logger.info(`💾 Git Agent: Committed with message: "${message}"`);
        return { success: true, message };
    } catch (error) {
        logger.error('Git Commit Failed:', error);
        throw error;
    }
};

const pushChanges = async () => {
    try {
        await git.push();
        logger.info('🚀 Git Agent: Pushed to remote.');
        return { success: true };
    } catch (error) {
        logger.error('Git Push Failed:', error);
        throw error;
    }
};

const syncChanges = async () => {
    if (isSyncing) return;
    isSyncing = true;
    logger.info('🔄 Auto-Git Sync: Starting sync cycle...');

    try {
        const status = await git.status();

        if (status.isClean()) {
            logger.info('✨ Auto-Git Sync: No changes to sync.');
            isSyncing = false;
            return;
        }

        logger.info('📝 Auto-Git Sync: Staging changes...');
        await git.add('.');

        // Get diff for AI
        const diff = await git.diff(['--staged']);
        const message = await generateCommitMessage(diff);

        await commitChanges(message);
        await pushChanges();

        logger.info('✅ Auto-Git Sync: Sync complete.');

    } catch (error) {
        logger.error('❌ Auto-Git Sync Failed:', error);
    } finally {
        isSyncing = false;
    }
};

// Debounced sync to handle bursts of file changes
const debouncedSync = debounce(syncChanges, 5000); // 5 seconds debounce

const startWatcher = async (dir = process.cwd()) => {
    if (watcher) {
        logger.warn('Watcher already running');
        return { status: 'already_running' };
    }

    logger.info(`Starting Auto-Git Watcher on ${dir}`);

    // Watch src directory primarily to avoid noise
    const watchPath = path.join(dir, 'src');

    watcher = chokidar.watch(watchPath, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true
    });

    watcher
        .on('add', path => { logger.info(`File added: ${path}`); debouncedSync(); })
        .on('change', path => { logger.info(`File changed: ${path}`); debouncedSync(); })
        .on('unlink', path => { logger.info(`File removed: ${path}`); debouncedSync(); });

    return { status: 'started', path: watchPath };
};

const stopWatcher = async () => {
    if (watcher) {
        await watcher.close();
        watcher = null;
        logger.info('Auto-Git Watcher stopped');
        return { status: 'stopped' };
    }
    return { status: 'not_running' };
};

const getStatus = async () => {
    return {
        isWatching: !!watcher,
        isSyncing
    };
};

export const GitAgentService = {
    startWatcher,
    stopWatcher,
    getStatus,
    syncChanges,
    generatePRDescription,
    commitChanges,
    pushChanges
};
