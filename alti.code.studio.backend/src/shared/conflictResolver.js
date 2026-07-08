import { logger } from './logger.js';
import { metrics } from './metrics.js';

class ConflictResolver {
  constructor() {
    this.initialized = false;
  }

  async init() {
    this.initialized = true;
    logger.info('[ConflictResolver] Initialized multi-region state conflict resolution engine.');
    return { status: 'initialized' };
  }

  generateVectorClock(nodeId) {
    const clock = {};
    clock[nodeId] = 1;
    return clock;
  }

  _isStrictlyGreater(clockA, clockB) {
    let hasGreater = false;
    let allGreaterOrEqual = true;

    const allKeys = new Set([...Object.keys(clockA), ...Object.keys(clockB)]);

    for (const key of allKeys) {
      const valA = clockA[key] || 0;
      const valB = clockB[key] || 0;

      if (valA < valB) {
        allGreaterOrEqual = false;
      }
      if (valA > valB) {
        hasGreater = true;
      }
    }

    return allGreaterOrEqual && hasGreater;
  }

  resolve(state1, state2) {
    if (!this.initialized) throw new Error('ConflictResolver not initialized');
    
    const vc1 = state1.vectorClock || {};
    const vc2 = state2.vectorClock || {};

    const oneDominatesTwo = this._isStrictlyGreater(vc1, vc2);
    const twoDominatesOne = this._isStrictlyGreater(vc2, vc1);

    if (oneDominatesTwo) {
      if (metrics.incrementCounter) metrics.incrementCounter('conflict_resolved_total', 1, { outcome: 'state1_wins' });
      return state1;
    } else if (twoDominatesOne) {
      if (metrics.incrementCounter) metrics.incrementCounter('conflict_resolved_total', 1, { outcome: 'state2_wins' });
      return state2;
    } else {
      // Conflict: concurrent changes, use LWW fallback
      logger.warn('[ConflictResolver] Concurrent states detected, falling back to LWW (Last-Write-Wins)');
      if (metrics.incrementCounter) metrics.incrementCounter('conflict_resolved_total', 1, { outcome: 'lww_fallback' });

      const t1 = state1.timestamp || 0;
      const t2 = state2.timestamp || 0;
      
      const winner = t1 >= t2 ? state1 : state2;
      
      // Merge vector clocks
      const mergedClock = {};
      const allKeys = new Set([...Object.keys(vc1), ...Object.keys(vc2)]);
      for (const key of allKeys) {
        mergedClock[key] = Math.max(vc1[key] || 0, vc2[key] || 0);
      }
      
      const resolvedState = { ...winner, vectorClock: mergedClock };
      return resolvedState;
    }
  }
}

export const conflictResolver = new ConflictResolver();
