import { describe, it, expect } from 'vitest';
import { performanceProfilerService } from './performance_profiler.service.js';

describe('PerformanceProfilerService Tests', () => {
    it('should profile execution time and return task outcome', async () => {
        const profile = await performanceProfilerService.profileTask(
            'Test Simple Run',
            () => {
                // Inline work
                let count = 0;
                for (let i = 0; i < 1000; i++) count++;
                return 'done';
            }
        );

        expect(profile.success).toBe(true);
        expect(profile.durationMs).toBeGreaterThan(0);
        expect(profile.cpuDeltaUserMs).toBeDefined();
        expect(profile.result).toBe('done');
    });

    it('should report failure when configured duration limits are exceeded', async () => {
        const profile = await performanceProfilerService.profileTask(
            'Test Slow Run',
            async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
                return 'slow-done';
            },
            { maxDurationMs: 10 } // limit 10ms
        );

        expect(profile.success).toBe(false);
        expect(profile.breaches.length).toBe(1);
        expect(profile.breaches[0]).toContain('Duration limit exceeded');
    });

    it('should throw exceptions thrown inside task functions', async () => {
        await expect(async () => {
            await performanceProfilerService.profileTask(
                'Exception Run',
                () => {
                    throw new Error('Task Crash');
                }
            );
        }).rejects.toThrow('Task Crash');
    });
});
