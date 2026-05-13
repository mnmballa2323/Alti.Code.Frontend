import { analystAgent } from './analyst.agent.js';
import { logger } from '../../../shared/logger.js';

const recordMetric = (metric) => {
    analystAgent.recordMetric(metric);
};

const analyzeTraffic = async () => {
    return await analystAgent.analyzeTraffic();
};

const predictLoad = async () => {
    return await analystAgent.predictLoad();
};

export const AnalystService = {
    recordMetric,
    analyzeTraffic,
    predictLoad
};
