import { detectiveAgent } from './detective.agent.js';
import { logger } from '../../../shared/logger.js';

const auditCodebase = async (filePath) => {
    return await detectiveAgent.auditCodebase(filePath);
};

const analyzeLogs = async (logContent) => {
    return await detectiveAgent.analyzeLogs(logContent);
};

const checkDependencies = async () => {
    return await detectiveAgent.checkDependencies();
};

export const detectiveService = {
    auditCodebase,
    analyzeLogs,
    checkDependencies
};
