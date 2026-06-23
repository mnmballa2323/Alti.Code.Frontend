import { logger } from '../../../shared/logger.js';

/**
 * Write an audit entry to Azure Monitor / App Service console
 * @param {string} logName - Name of the log (e.g. 'audit-trail')
 * @param {object} entry - The audit data
 * @param {string} severity - NOTICE, INFO, WARNING, ERROR, CRITICAL
 */
const writeAuditLog = async (logName, entry, severity = 'NOTICE') => {
    try {
        const timestamp = new Date().toISOString();
        const payload = {
            ...entry,
            platform: 'Alti.Code.Studio',
            cloudProvider: 'Azure',
            deploymentType: process.env.AZURE_DEPLOYMENT_TYPE || 'commercial', // commercial, government, classified
            timestamp
        };
        logger.info(`[Azure Audit Log] [${severity}] ${logName}: ${JSON.stringify(payload)}`);
    } catch (error) {
        logger.error('Azure Logging Error:', error);
    }
};

export const AzureLoggingService = {
    writeAuditLog
};

export const CloudLoggingService = AzureLoggingService;
