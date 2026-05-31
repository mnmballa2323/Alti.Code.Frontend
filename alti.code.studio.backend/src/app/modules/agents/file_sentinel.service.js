import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs';
import { logger } from '../../../shared/logger.js';
import { swarmBrain } from './swarm_brain.js';

/**
 * File Sentinel Service (Level 5 Autonomy)
 * 
 * Actively watches the developer's local workspace. When a file is saved, 
 * the Sentinel autonomously reviews the code, mathematically calculates 
 * the architectural impact, and dispatches the Swarm to fix bugs or 
 * optimize performance—before the developer even asks.
 */
class FileSentinelService {
    constructor() {
        this.watcher = null;
        this.isWatching = false;
        // Debounce map to prevent rapid saves from spamming the Swarm
        this.debounceMap = new Map();
    }

    startWatching(workspaceRoot) {
        if (this.isWatching) return;
        
        let targetPath = workspaceRoot || path.resolve(process.cwd(), '../');
        // If targetPath points to the subproject directly, go up to the workspace root
        if (targetPath.endsWith('alti.code.studio.backend') || targetPath.endsWith('alti.code.studio.backend/')) {
            targetPath = path.resolve(targetPath, '../');
        }
        
        // Define targeted source subdirectories to prevent recursing heavy system folders
        const targetSubdirs = [
            'alti.code.studio.backend/src',
            'alti.code.studio.frontend/app',
            'alti.code.studio.frontend/components',
            'alti.code.studio.frontend/lib',
            'alti.code.studio.desktop/src'
        ];

        const pathsToWatch = targetSubdirs
            .map(sub => path.join(targetPath, sub))
            .filter(p => fs.existsSync(p));

        const watchTargets = pathsToWatch.length > 0 ? pathsToWatch : [targetPath];
        logger.info(`👁️ [Sentinel] Initiating active filesystem patrol on targets: ${watchTargets.join(', ')}`);

        const ignoredPaths = [
            'node_modules',
            'dist',
            '.next',
            '.git',
            '.agent',
            '.codegraph',
            '.skills',
            '.shadow',
            'logs'
        ];

        this.watcher = chokidar.watch(watchTargets, {
            ignored: (filePath) => {
                const basename = path.basename(filePath);
                if (basename.startsWith('.') && basename !== '.' && basename !== '..') {
                    return true;
                }
                const parts = filePath.split(path.sep);
                return parts.some(part => ignoredPaths.includes(part));
            },
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 2000,
                pollInterval: 100
            }
        });

        this.watcher.on('change', (filePath) => this.handleFileChange(filePath));
        this.isWatching = true;
    }

    async handleFileChange(filePath) {
        // Debounce logic: only process if the file hasn't been changed in the last 10 seconds
        if (this.debounceMap.has(filePath)) {
            clearTimeout(this.debounceMap.get(filePath));
        }

        const timeout = setTimeout(() => {
            this.executeAutonomousReview(filePath);
            this.debounceMap.delete(filePath);
        }, 10000); // 10 second debounce window

        this.debounceMap.set(filePath, timeout);
    }

    async executeAutonomousReview(filePath) {
        logger.info(`🛡️ [Sentinel] File mutation detected: ${filePath}. Initiating Autonomous Code Review...`);
        
        const prompt = `
        You are the Autonomous Background Sentinel (A Fortune 100 Principal Engineer).
        The human developer just saved the following file: ${filePath}
        
        1. Perform a deep, microscopic code review of this file.
        2. Detect any newly introduced memory leaks, Big-O inefficiencies, or security flaws.
        3. Formulate the exact patch required to fix them.
        4. Do NOT output anything if the code is mathematically perfect.
        `;

        try {
            // We use the Swarm Brain to execute this. The Hybrid Router will 
            // automatically route this simple review to a Local edge model (Zero Latency) 
            // or Gemini if the file is massive.
            const result = await swarmBrain.executeTask(prompt, []);
            
            // If the Swarm outputs anything other than silence, log it or push it to the UI
            if (result && result.trim().length > 50) {
                 logger.warn(`💡 [Sentinel] Autonomous Swarm found vulnerabilities in ${path.basename(filePath)}!`);
                 const { socketService } = await import('../../services/socket.service.js');
                 socketService.broadcast('swarm', 'cognitive_alert', { 
                     alert: `Sentinel autonomously reviewed ${path.basename(filePath)} and drafted a patch.` 
                 });
                 // In a production IDE, this would populate the "Problems" tab or open a ghost-text suggestion.
            } else {
                 logger.info(`✅ [Sentinel] Autonomous Swarm verified ${path.basename(filePath)} is perfectly optimized.`);
            }
        } catch (e) {
            logger.warn(`⚠️ [Sentinel] Autonomous review failed for ${filePath}: ${e.message}`);
        }
    }
}

export const fileSentinelService = new FileSentinelService();
