import { describe, it, expect, vi, beforeEach } from 'vitest';
import { swarmService } from './swarm.service.js';
import { Worker } from 'worker_threads';

// Mock the node worker_threads native module
vi.mock('worker_threads', () => {
  return {
    // Must be a constructor
    Worker: vi.fn(function () {
      this.listeners = {};
      this.on = vi.fn((event, callback) => {
        this.listeners[event] = callback;
      });
      this.__simulateCompletion = data => {
        if (this.listeners['message']) {
          setTimeout(
            () => this.listeners['message']({ success: true, data }),
            5,
          );
        }
      };
      this.__simulateError = error => {
        if (this.listeners['message']) {
          setTimeout(
            () =>
              this.listeners['message']({
                success: false,
                error: error.message,
              }),
            5,
          );
        }
      };
    }),
    parentPort: { postMessage: vi.fn() },
    workerData: {},
  };
});

describe('The Hive Mind (Phase 19 - Distributed Swarm Topology)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should dispatch exactly 10 worker threads to run concurrently when given 10 tasks', async () => {
    // 1. Generate 10 independent refactoring tasks
    const tasks = Array.from({ length: 10 }).map((_, i) => ({
      id: `task_${i}`,
      prompt: `Refactor function_${i} to use TypeScript`,
    }));

    // 2. Unleash the swarm
    const swarmPromise = swarmService.unleash(tasks);

    // 3. Wait a tiny bit for the loop to execute and instantiate the mocks
    await new Promise(r => setTimeout(r, 10));

    // 4. Trigger completion from all simulated threads
    const workerInstances = Worker.mock.results.map(r => r.value);
    workerInstances.forEach((worker, index) => {
      worker.__simulateCompletion(`Refactored code for function_${index}`);
    });

    const results = await swarmPromise;

    // ASSERTIONS
    // We should have instantiated exactly 10 isolated Node.js threads
    expect(Worker).toHaveBeenCalledTimes(10);

    // The results array should contain all 10 completed ASTs
    expect(results).toHaveLength(10);

    // Ensure the data corresponds to the correctly scoped thread
    expect(results[0].result).toBe('Refactored code for function_0');
    expect(results[9].result).toBe('Refactored code for function_9');
  });

  it('should gracefully handle a worker thread crash without taking down the main process', async () => {
    const swarmPromise = swarmService.unleash([
      { id: 'crash_task', prompt: 'Trigger crash' },
    ]);

    await new Promise(r => setTimeout(r, 10));

    const workerContext = Worker.mock.results[0].value;
    workerContext.__simulateError(new Error('V8 Thread Segfault'));

    const results = await swarmPromise;

    expect(results).toHaveLength(1);
    expect(results[0].error).toBe('V8 Thread Segfault');
  });
});
