import { describe, it, expect, beforeEach } from 'vitest';
import { rlRouterService } from './rl_router.service.js';

describe('RlRouterService Tests', () => {
    beforeEach(() => {
        rlRouterService.rewardsMap.clear();
    });

    it('should record rewards and update averages correctly', () => {
        rlRouterService.recordReward('agentA', 0.8);
        rlRouterService.recordReward('agentA', 1.0);

        const record = rlRouterService.rewardsMap.get('agentA');
        expect(record).toBeDefined();
        expect(record.count).toBe(2);
        expect(record.sumRewards).toBe(1.8);
        expect(record.avgReward).toBeCloseTo(0.9);
    });

    it('should select the best agent with high reward average in exploitation mode', () => {
        rlRouterService.recordReward('agentA', 0.9);
        rlRouterService.recordReward('agentB', 0.3);

        const selected = rlRouterService.selectBestAgent(['agentA', 'agentB'], 0); // Epsilon = 0 (exploitation only)
        expect(selected).toBe('agentA');
    });

    it('should fallback to random selection in exploration mode', () => {
        const candidates = ['agentA', 'agentB', 'agentC'];
        const selections = new Set();

        // Run multiple selections with Epsilon = 1 (exploration only)
        for (let i = 0; i < 50; i++) {
            const selected = rlRouterService.selectBestAgent(candidates, 1);
            selections.add(selected);
        }

        // Verify we explored multiple candidates
        expect(selections.size).toBeGreaterThan(1);
    });
});
