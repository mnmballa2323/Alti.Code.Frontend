import { criticAgent } from './critic.agent.js';
import { logger } from '../../../shared/logger.js';

const generateTest = async (filePath) => {
    return await criticAgent.generateTest(filePath);
};

const runTests = async (testPattern) => {
    return await criticAgent.runTests(testPattern);
};

const reviewCode = async (code) => {
    return await criticAgent.critique(code);
};

export const criticService = {
    generateTest,
    runTests,
    reviewCode
};
