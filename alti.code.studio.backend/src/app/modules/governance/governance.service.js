import { governorAgent } from './governor.agent.js';
import { logger } from '../../../shared/logger.js';

const enforcePolicy = async (code, context) => {
    return await governorAgent.enforcePolicy(code, context);
};

const auditLicenses = async () => {
    return await governorAgent.auditLicenses();
};

const generateTransparencyReport = async () => {
    return await governorAgent.generateTransparencyReport();
};

export const GovernorService = {
    enforcePolicy,
    auditLicenses,
    generateTransparencyReport
};
