import { logger } from './logger.js';
import { metrics } from './metrics.js';

class MvccStorageEngine {
  async init() {
    logger.info('[MvccStorageEngine] Initializing Multi-Version Concurrency Control engine...');
    this.store = new Map(); // key -> array of version objects
    return { status: 'initialized' };
  }

  write(key, data) {
    if (!this.store.has(key)) {
      this.store.set(key, []);
    }
    
    const versions = this.store.get(key);
    const newVersionId = versions.length + 1;
    
    const entry = {
      version: newVersionId,
      timestamp: Date.now(),
      data: Object.freeze({ ...data }) // Immutable
    };
    
    versions.push(entry);
    
    logger.info(`[MvccStorageEngine] Wrote new version (v${newVersionId}) for key ${key}`);
    if (metrics && metrics.increment) metrics.increment('mvcc_write');
    
    return entry;
  }

  read(key, versionId = null) {
    const versions = this.store.get(key);
    if (!versions || versions.length === 0) return null;
    
    if (versionId === null) {
      // Return latest
      if (metrics && metrics.increment) metrics.increment('mvcc_read_latest');
      return versions[versions.length - 1];
    }
    
    // Return specific version
    const version = versions.find(v => v.version === versionId);
    if (metrics && metrics.increment) metrics.increment('mvcc_read_snapshot');
    return version || null;
  }
}

export const mvccStorageEngine = new MvccStorageEngine();
