import crypto from 'crypto';
import { logger } from './logger.js';
import { metrics } from './metrics.js';
import { redisClient } from './redis.client.js';

class LockManager {
  constructor() {
    this.initialized = false;
    this.heldLocks = new Map();
  }

  init() {
    logger.info('[LockManager] Initializing Distributed Lock Manager');
    this.initialized = true;
    return { status: 'initialized' };
  }

  /**
   * Acquires a distributed lock.
   * @param {string} lockKey - The unique key for the lock.
   * @param {number} ttl - Time to live in milliseconds.
   * @returns {Promise<boolean>} True if lock acquired, false otherwise.
   */
  async acquireLock(lockKey, ttl) {
    if (!this.initialized) {
      logger.warn(`[LockManager] Cannot acquire lock ${lockKey}, manager not initialized`);
      return false;
    }

    const lockValue = crypto.randomUUID();
    const redisKey = `lock:${lockKey}`;
    const ttlSeconds = Math.ceil(ttl / 1000);

    try {
      const acquired = await redisClient.setnx(redisKey, lockValue, ttlSeconds);

      if (acquired) {
        this.heldLocks.set(lockKey, lockValue);
        logger.debug(`[LockManager] Acquired lock: ${lockKey}`);
        if (metrics && metrics.incrementCounter) {
          metrics.incrementCounter('lock_acquired_success');
        }
        return true;
      } else {
        logger.debug(`[LockManager] Failed to acquire lock: ${lockKey}`);
        if (metrics && metrics.incrementCounter) {
          metrics.incrementCounter('lock_acquired_failure');
        }
        return false;
      }
    } catch (error) {
      logger.error(`[LockManager] Error acquiring lock ${lockKey}:`, error);
      return false;
    }
  }

  /**
   * Releases a distributed lock.
   * @param {string} lockKey - The unique key for the lock.
   */
  async releaseLock(lockKey) {
    if (!this.heldLocks.has(lockKey)) {
      return;
    }

    const lockValue = this.heldLocks.get(lockKey);
    const redisKey = `lock:${lockKey}`;

    try {
      const currentValue = await redisClient.get(redisKey);
      if (currentValue === lockValue) {
        await redisClient.del(redisKey);
        logger.debug(`[LockManager] Released lock: ${lockKey}`);
      } else {
        logger.warn(`[LockManager] Lock ${lockKey} was overwritten or expired before release`);
      }
      this.heldLocks.delete(lockKey);
      if (metrics && metrics.incrementCounter) {
        metrics.incrementCounter('lock_released');
      }
    } catch (error) {
      logger.error(`[LockManager] Error releasing lock ${lockKey}:`, error);
    }
  }
}

export const lockManager = new LockManager();
