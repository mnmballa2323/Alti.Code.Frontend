import { performance } from 'perf_hooks';
import { logger } from '../../../shared/logger.js';

class PerformanceProfilerService {
  /**
   * Executes a function while profiling CPU time, execution latency, and heap memory usage.
   * @param {string} taskName - Name of the task for logging
   * @param {Function} taskFunction - Asynchronous or synchronous task function
   * @param {Object} limits - Resource limits ({ maxDurationMs?: number, maxMemoryBytes?: number })
   * @returns {Promise<Object>} Profiling outcome record
   */
  async profileTask(taskName, taskFunction, limits = {}) {
    logger.info(`⏱️ Profiler: Starting profile run for task: ${taskName}`);

    const startMemory = process.memoryUsage().heapUsed;
    const startCpu = process.cpuUsage();
    const startTime = performance.now();

    let taskError = null;
    let result = null;

    try {
      result = await taskFunction();
    } catch (e) {
      taskError = e;
    }

    const endTime = performance.now();
    const endCpu = process.cpuUsage(startCpu);
    const endMemory = process.memoryUsage().heapUsed;

    const durationMs = endTime - startTime;
    const memoryDeltaBytes = endMemory - startMemory;
    const cpuDeltaUserMs = endCpu.user / 1000; // microseconds to milliseconds

    let limitsExceeded = false;
    const breaches = [];

    if (limits.maxDurationMs && durationMs > limits.maxDurationMs) {
      limitsExceeded = true;
      breaches.push(
        `Duration limit exceeded: ${durationMs.toFixed(2)}ms > ${limits.maxDurationMs}ms`,
      );
    }

    if (limits.maxMemoryBytes && memoryDeltaBytes > limits.maxMemoryBytes) {
      limitsExceeded = true;
      breaches.push(
        `Memory limit exceeded: ${memoryDeltaBytes} bytes > ${limits.maxMemoryBytes} bytes`,
      );
    }

    if (limitsExceeded) {
      logger.warn(
        `⏱️ Profiler Alert: Task [${taskName}] breached resource limits! ${breaches.join(', ')}`,
      );
    } else {
      logger.info(
        `⏱️ Profiler: Task [${taskName}] completed. Latency: ${durationMs.toFixed(2)}ms, Memory Delta: ${memoryDeltaBytes} bytes, CPU User: ${cpuDeltaUserMs.toFixed(2)}ms`,
      );
    }

    if (taskError) {
      throw taskError;
    }

    return {
      success: !limitsExceeded,
      durationMs,
      memoryDeltaBytes,
      cpuDeltaUserMs,
      breaches,
      result,
    };
  }
}

export const performanceProfilerService = new PerformanceProfilerService();
