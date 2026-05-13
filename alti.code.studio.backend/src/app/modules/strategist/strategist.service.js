import { strategistAgent } from './strategist.agent.js';

const optimize = async (missionPlan) => {
    return await strategistAgent.optimizeWorkflow(missionPlan);
};

const analyze = async () => {
    return await strategistAgent.analyzeSuccessRates();
};

export const StrategistService = {
    optimize,
    analyze
};
