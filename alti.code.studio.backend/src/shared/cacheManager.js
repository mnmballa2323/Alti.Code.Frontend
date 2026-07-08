import { logger } from './logger.js';
import { metrics } from './metrics.js';

class CacheManager {
  constructor() {
    this.store = new Map();
    this.dependencies = new Map();
  }

  init() {
    logger.info('[CacheManager] Initialized advanced cache invalidation engine');
  }

  get(key) {
    metrics.incrementCounter('cache_get_requests', 1);
    return this.store.get(key) || null;
  }

  set(key, value, dependencies = []) {
    this.store.set(key, value);
    
    for (const dep of dependencies) {
      if (!this.dependencies.has(dep)) {
        this.dependencies.set(dep, new Set());
      }
      this.dependencies.get(dep).add(key);
    }
    
    metrics.incrementCounter('cache_set_requests', 1);
  }

  invalidate(dependency) {
    if (!this.dependencies.has(dependency)) {
      return;
    }

    const keys = this.dependencies.get(dependency);
    for (const key of keys) {
      this.store.delete(key);
      logger.info(`[CacheManager] Invalidated key: ${key} (due to dependency: ${dependency})`);
    }
    
    this.dependencies.delete(dependency);
    metrics.incrementCounter('cache_invalidations_total', 1);
  }
}

export const cacheManager = new CacheManager();
