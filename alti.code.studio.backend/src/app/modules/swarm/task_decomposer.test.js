import { describe, it, expect } from 'vitest';
import { taskDecomposerService } from './task_decomposer.service.js';

describe('TaskDecomposerService Tests', () => {
    it('should sort independent tasks correctly', () => {
        const tasks = [
            { id: 'task1', dependencies: [] },
            { id: 'task2', dependencies: [] }
        ];
        const result = taskDecomposerService.decompose(tasks);
        expect(result).toContain('task1');
        expect(result).toContain('task2');
        expect(result).toHaveLength(2);
    });

    it('should sort sequential dependency chains topologically', () => {
        const tasks = [
            { id: 'taskC', dependencies: ['taskB'] },
            { id: 'taskA', dependencies: [] },
            { id: 'taskB', dependencies: ['taskA'] }
        ];
        const result = taskDecomposerService.decompose(tasks);
        expect(result).toEqual(['taskA', 'taskB', 'taskC']);
    });

    it('should throw an error when a missing dependency is referenced', () => {
        const tasks = [
            { id: 'taskB', dependencies: ['nonExistentTask'] }
        ];
        expect(() => taskDecomposerService.decompose(tasks)).toThrowError(
            'TaskDecomposer Error: Task [taskB] depends on non-existent task [nonExistentTask]'
        );
    });

    it('should detect and throw on circular dependencies', () => {
        const tasks = [
            { id: 'taskA', dependencies: ['taskB'] },
            { id: 'taskB', dependencies: ['taskA'] }
        ];
        expect(() => taskDecomposerService.decompose(tasks)).toThrowError(
            'TaskDecomposer Error: Circular dependency detected in task graph'
        );
    });
});
