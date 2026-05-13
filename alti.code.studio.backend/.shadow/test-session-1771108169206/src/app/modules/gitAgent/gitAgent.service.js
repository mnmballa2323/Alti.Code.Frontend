import simpleGit from 'simple-git';
import chokidar from 'chokidar';
import path from 'path';
import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
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

        const result = await GoogleGenAiService.generateContent(prompt);
        return result.content.trim().replace(/^```|```$/g, ''); // Clean markdown if present
    } catch (error) {
        logger.warn('Failed to generate AI commit message, using default', error);
        return 'chore: Auto-sync updates';
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

        logger.info(`💾 Auto-Git Sync: Committing with message: "${message}"`);
        await git.commit(message);

        logger.info('🚀 Auto-Git Sync: Pushing to remote...');
        await git.push();

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
    syncChanges // Exposed for manual trigger
};
