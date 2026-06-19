import { logger } from '../../../shared/logger.js';

class RlRouterService {
    constructor() {
        // Map of agentId -> { sumRewards: number, count: number, avgReward: number }
        this.rewardsMap = new Map();
    }

    /**
     * Records a reward metric for a specific agent after task completion.
     * @param {string} agentId - The ID of the agent
     * @param {number} reward - A value between 0 and 1 representing task success quality
     */
    recordReward(agentId, reward) {
        if (!agentId) return;

        const record = this.rewardsMap.get(agentId) || { sumRewards: 0, count: 0, avgReward: 0 };
        record.sumRewards += reward;
        record.count += 1;
        record.avgReward = record.sumRewards / record.count;
        this.rewardsMap.set(agentId, record);

        logger.info(`📈 RL Router: Recorded reward of ${reward} for agent [${agentId}]. New Avg: ${record.avgReward.toFixed(4)}`);
    }

    /**
     * Dynamically selects the best agent from a list of candidates using an Epsilon-Greedy strategy.
     * @param {string[]} agentIds - Candidates list
     * @param {number} epsilon - Exploration budget probability
     * @returns {string} Selected agent ID
     */
    selectBestAgent(agentIds, epsilon = 0.1) {
        if (!agentIds || agentIds.length === 0) {
            throw new Error('RL Router: agentIds list cannot be empty.');
        }

        // 1. Exploration phase (random select with probability epsilon)
        if (Math.random() < epsilon) {
            const randomIndex = Math.floor(Math.random() * agentIds.length);
            const selected = agentIds[randomIndex];
            logger.info(`🎲 RL Router: Exploration mode selected agent [${selected}]`);
            return selected;
        }

        // 2. Exploitation phase (select agent with highest average reward)
        let bestAgentId = agentIds[0];
        let maxAvgReward = -1;

        for (const id of agentIds) {
            const record = this.rewardsMap.get(id);
            const avgReward = record ? record.avgReward : 0.5; // fallback weight for unrated agents

            if (avgReward > maxAvgReward) {
                maxAvgReward = avgReward;
                bestAgentId = id;
            }
        }

        logger.info(`🎯 RL Router: Exploitation mode selected best agent [${bestAgentId}] (Avg Reward: ${maxAvgReward.toFixed(4)})`);
        return bestAgentId;
    }
}

export const rlRouterService = new RlRouterService();
