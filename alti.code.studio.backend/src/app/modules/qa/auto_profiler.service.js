/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { performance } from 'perf_hooks';
import { logger } from '../../../shared/logger.js';
import { graphOrchestrator } from '../agents/graph.orchestrator.js';

class AutoProfilerService {
  constructor() {
    this.thresholdMs = 500; // 500 millisecond budget limit per API request
    this.routeAverages = new Map();

    // Bind middleware method
    this.monitor = this.monitor.bind(this);
  }

  /**
   * Express Middleware that hooks into the request/response lifecycle to track exact CPU millisecond execution times.
   */
  monitor(req, res, next) {
    // Skip static asset monitoring, only monitor core API execution
    if (!req.path.startsWith('/api/')) {
      return next();
    }

    const startMark = performance.now();
    const routeKey = `${req.method} ${req.path}`;

    // Hook into the response finish event to capture the exact latency
    res.on('finish', () => {
      const endMark = performance.now();
      const duration = endMark - startMark;

      this._recordMetric(routeKey, duration);
    });

    next();
  }

  /**
   * Records latency and maintains a rolling average.
   * @param {string} route
   * @param {number} durationMs
   */
  _recordMetric(route, durationMs) {
    let metrics = this.routeAverages.get(route) || {
      count: 0,
      totalMs: 0,
      average: 0,
    };

    metrics.count += 1;
    metrics.totalMs += durationMs;
    metrics.average = metrics.totalMs / metrics.count;

    this.routeAverages.set(route, metrics);

    // If the average latency breaches the threshold consistently, trigger the Swarm
    if (metrics.average > this.thresholdMs && metrics.count >= 5) {
      this._triggerAutonomousRefactor(route, metrics.average);

      // Reset memory for this route to prevent spamming the Orchestrator with duplicate tasks
      this.routeAverages.set(route, { count: 0, totalMs: 0, average: 0 });
    }
  }

  /**
   * Autonomously commands the Swarm to fix the slow route.
   * @param {string} route
   * @param {number} latency
   */
  async _triggerAutonomousRefactor(route, latency) {
    logger.warn(
      `⚠️ [AutoProfiler] CRITICAL BOTTLENECK DETECTED: ${route} is averaging ${latency.toFixed(2)}ms.`,
    );
    logger.warn(
      `🤖 [AutoProfiler] Dispatching Autonomous Performance Refactor to the Swarm...`,
    );

    try {
      const goal = `The API route [${route}] is performing terribly with an average latency of ${latency.toFixed(2)}ms (Limit: ${this.thresholdMs}ms). As the PerformanceAgent, immediately locate the controller logic, perform a Big-O complexity analysis, and apply an AST patch to refactor and optimize the bottleneck (e.g., implement caching, parallelize promises, or eliminate nested loops).`;

      // Fire-and-forget autonomous orchestration
      graphOrchestrator.run(goal).catch(e => {
        logger.error(`❌ [AutoProfiler] Swarm execution failed: ${e.message}`);
      });
    } catch (err) {
      logger.error(
        `❌ [AutoProfiler] Failed to dispatch Swarm: ${err.message}`,
      );
    }
  }
}

export const autoProfilerService = new AutoProfilerService();
