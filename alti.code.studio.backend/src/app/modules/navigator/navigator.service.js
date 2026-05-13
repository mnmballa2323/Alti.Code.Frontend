import { navigatorAgent } from './navigator.agent.js';

const scale = async (load) => {
    return await navigatorAgent.scaleServices(load);
};

const optimize = async () => {
    return await navigatorAgent.optimizeCost();
};

export const NavigatorService = {
    scale,
    optimize
};
