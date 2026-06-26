import { logger } from '../../../shared/logger.js';

class TaskDecomposerService {
  /**
   * Decomposes a set of raw tasks with dependency definitions into an ordered execution plan.
   *
   * @param {Array<Object>} tasks - List of tasks, e.g. [{ id: 'A', dependencies: [] }, { id: 'B', dependencies: ['A'] }]
   * @returns {Array<string>} An ordered list of task IDs representing the topological sort.
   * @throws {Error} If circular dependencies or missing dependencies are detected.
   */
  decompose(tasks) {
    logger.info(
      `🕸️ TaskDecomposer: Sorting execution graph for ${tasks.length} tasks`,
    );

    const adjList = new Map();
    const inDegree = new Map();
    const taskMap = new Map();

    // Initialize maps
    for (const task of tasks) {
      if (!task.id) {
        throw new Error(
          'TaskDecomposer Error: Task is missing required field: id',
        );
      }
      adjList.set(task.id, []);
      inDegree.set(task.id, 0);
      taskMap.set(task.id, task);
    }

    // Build adjacency lists and in-degrees
    for (const task of tasks) {
      const deps = task.dependencies || [];
      for (const depId of deps) {
        if (!inDegree.has(depId)) {
          throw new Error(
            `TaskDecomposer Error: Task [${task.id}] depends on non-existent task [${depId}]`,
          );
        }
        adjList.get(depId).push(task.id);
        inDegree.set(task.id, inDegree.get(task.id) + 1);
      }
    }

    // Queue tasks with 0 in-degree (no prerequisites)
    const queue = [];
    for (const [id, count] of inDegree.entries()) {
      if (count === 0) {
        queue.push(id);
      }
    }

    const executionOrder = [];

    while (queue.length > 0) {
      const currentId = queue.shift();
      executionOrder.push(currentId);

      const neighbors = adjList.get(currentId) || [];
      for (const neighborId of neighbors) {
        inDegree.set(neighborId, inDegree.get(neighborId) - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      }
    }

    // If executionOrder doesn't contain all task IDs, a cycle exists
    if (executionOrder.length !== tasks.length) {
      throw new Error(
        'TaskDecomposer Error: Circular dependency detected in task graph',
      );
    }

    logger.info(
      '🕸️ TaskDecomposer: Graph topological sort completed successfully',
    );
    return executionOrder;
  }
}

export const taskDecomposerService = new TaskDecomposerService();
