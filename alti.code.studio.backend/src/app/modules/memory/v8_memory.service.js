import v8 from 'v8';
import { logger } from '../../../shared/logger.js';

/**
 * Google V8 Memory Management Service.
 * Grants the Swarm literal physical control over its own Node.js memory heap.
 * Unlike Cursor or Copilot which crash during massive monorepo AST ingestion,
 * the Swarm can dynamically analyze its heap and forcefully trigger
 * Google's Garbage Collector to prevent Out of Memory (OOM) errors.
 */
class V8MemoryService {
    constructor() {
        logger.info('⚙️ [V8 Memory] Google V8 Native Physical Control initialized.');
    }

    /**
     * Checks the physical heap usage and forces garbage collection if near limits.
     * @param {number} thresholdMB - The maximum allowed heap size before forcing GC
     */
    enforceMemoryLimits(thresholdMB = 1000) {
        const stats = v8.getHeapStatistics();
        const usedMB = Math.round(stats.used_heap_size / 1024 / 1024);
        const limitMB = Math.round(stats.heap_size_limit / 1024 / 1024);

        logger.info(`⚙️ [V8 Memory] Current Heap: ${usedMB} MB / ${limitMB} MB`);

        if (usedMB > thresholdMB) {
            logger.warn(`⚠️ [V8 Memory] Critical memory pressure detected (${usedMB}MB). Triggering physical V8 Garbage Collection...`);
            
            // Requires node to be run with --expose-gc
            if (global.gc) {
                global.gc();
                const postStats = v8.getHeapStatistics();
                const postUsedMB = Math.round(postStats.used_heap_size / 1024 / 1024);
                logger.info(`✅ [V8 Memory] GC Successful. Memory recovered: ${usedMB - postUsedMB} MB. Crisis averted.`);
            } else {
                logger.warn(`⚠️ [V8 Memory] global.gc() is not exposed. Please restart the backend with node --expose-gc.`);
            }
        }
    }
}

export const v8MemoryService = new V8MemoryService();
