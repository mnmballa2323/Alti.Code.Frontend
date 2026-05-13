import { surgeonAgent } from './surgeon.agent.js';
import { logger } from '../../../shared/logger.js';

const applyPattern = async (filePath, pattern, context) => {
    if (!filePath || typeof filePath !== 'string') throw new Error('SurgeonService: filePath must be a non-empty string.');
    if (!pattern || typeof pattern !== 'string') throw new Error('SurgeonService: pattern must be a non-empty string.');
    logger.info(`🔮 SurgeonService: Applying pattern "${pattern}" to ${filePath}`);
    return await surgeonAgent.applyPattern(filePath, pattern, context);
};

const analyzeComplexity = async (filePath) => {
    if (!filePath || typeof filePath !== 'string') throw new Error('SurgeonService: filePath must be a non-empty string.');
    logger.info(`🔮 SurgeonService: Analyzing complexity of ${filePath}`);
    return await surgeonAgent.analyzeComplexity(filePath);
};

export const surgeonService = {
    applyPattern,
    analyzeComplexity
};

