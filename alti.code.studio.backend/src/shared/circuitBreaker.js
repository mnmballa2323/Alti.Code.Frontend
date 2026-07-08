/**
 * Circuit Breaker
 * 
 * Prevents cascading failures:
 * - CLOSED: normal operation
 * - OPEN: all calls fail fast (no upstream call)
 * - HALF_OPEN: allow one test call to check recovery
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';

class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 30000; // 30s
    this.halfOpenMax = options.halfOpenMax || 1;
    this.halfOpenCount = 0;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        this.halfOpenCount = 0;
        logger.info(`[CircuitBreaker:${this.name}] Transitioning to HALF_OPEN`);
      } else {
        metrics.incrementCounter('circuit_breaker_rejected', 1, { name: this.name });
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    if (this.state === 'HALF_OPEN' && this.halfOpenCount >= this.halfOpenMax) {
      throw new Error(`Circuit breaker ${this.name} is HALF_OPEN (max test calls reached)`);
    }

    try {
      if (this.state === 'HALF_OPEN') this.halfOpenCount++;
      const result = await fn();
      this._onSuccess();
      return result;
    } catch (err) {
      this._onFailure();
      throw err;
    }
  }

  _onSuccess() {
    if (this.state === 'HALF_OPEN') {
      logger.info(`[CircuitBreaker:${this.name}] Recovery successful, closing circuit`);
      this.state = 'CLOSED';
      metrics.incrementCounter('circuit_breaker_recovered', 1, { name: this.name });
    }
    this.failureCount = 0;
    this.successCount++;
  }

  _onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      logger.warn(`[CircuitBreaker:${this.name}] Circuit OPENED after ${this.failureCount} failures`);
      metrics.incrementCounter('circuit_breaker_opened', 1, { name: this.name });
    }
  }

  getState() {
    return { name: this.name, state: this.state, failures: this.failureCount, successes: this.successCount };
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenCount = 0;
  }
}

// Pre-configured breakers for critical services
export const breakers = {
  vertexAi: new CircuitBreaker('vertex-ai', { failureThreshold: 3, recoveryTimeout: 60000 }),
  database: new CircuitBreaker('database', { failureThreshold: 5, recoveryTimeout: 30000 }),
  redis: new CircuitBreaker('redis', { failureThreshold: 10, recoveryTimeout: 15000 }),
  pubsub: new CircuitBreaker('pubsub', { failureThreshold: 5, recoveryTimeout: 30000 }),
};

export { CircuitBreaker };
