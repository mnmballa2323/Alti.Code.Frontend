import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/logger.js';

class SandboxVolumeService {
    constructor() {
        // Map of filePath -> lastModifiedTimestamp
        this.syncStateCache = new Map();
    }

    /**
     * Recursively scans a workspace directory and identifies files changed or created since the last sync.
     * @param {string} directoryPath - Workspace directory to scan
     * @returns {string[]} List of file paths that need sync updates
     */
    scanWorkspaceChanges(directoryPath) {
        logger.info(`🔄 SandboxVolume: Scanning for file changes under: ${directoryPath}`);
        const changedFiles = [];

        const scanDir = (currentPath) => {
            const items = fs.readdirSync(currentPath, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(currentPath, item.name);

                // Ignore node_modules and .git folders
                if (item.name === 'node_modules' || item.name === '.git' || item.name === 'temp_volume_test') {
                    continue;
                }

                if (item.isDirectory()) {
                    scanDir(fullPath);
                } else if (item.isFile() && (item.name.endsWith('.js') || item.name.endsWith('.ts') || item.name.endsWith('.json'))) {
                    const stats = fs.statSync(fullPath);
                    const lastModified = stats.mtimeMs;
                    const cachedModified = this.syncStateCache.get(fullPath);

                    if (!cachedModified || lastModified > cachedModified) {
                        changedFiles.push(fullPath);
                    }
                }
            }
        };

        if (fs.existsSync(directoryPath)) {
            scanDir(directoryPath);
        }

        logger.info(`🔄 SandboxVolume: Scan complete. Found ${changedFiles.length} files requiring synchronization.`);
        return changedFiles;
    }

    /**
     * Synchronizes changed files to the active sandbox container and updates cache.
     * @param {string} directoryPath - Workspace root
     * @param {Object} sandboxExecutor - Sandbox executor container proxy
     * @returns {Promise<number>} Number of synced files
     */
    async syncChanges(directoryPath, sandboxExecutor = null) {
        const changes = this.scanWorkspaceChanges(directoryPath);

        for (const filePath of changes) {
            try {
                if (sandboxExecutor && typeof sandboxExecutor.copyFile === 'function') {
                    await sandboxExecutor.copyFile(filePath);
                } else {
                    logger.info(`Mocking sync of file to sandbox: ${filePath}`);
                }

                // Update cache with the latest modified time
                const stats = fs.statSync(filePath);
                this.syncStateCache.set(filePath, stats.mtimeMs);
            } catch (e) {
                logger.error(`Failed to sync file [${filePath}] to sandbox.`, e);
            }
        }

        return changes.length;
    }

    /**
     * Resets the cached sync states, forcing a full sync on the next cycle.
     */
    resetSyncState() {
        this.syncStateCache.clear();
        logger.info('🔄 SandboxVolume: Sync state cache cleared.');
    }
}

export const sandboxVolumeService = new SandboxVolumeService();
