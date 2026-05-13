import { Logging } from '@google-cloud/logging';
import config from '../../../../config/index.js';
import { logger } from '../../../shared/logger.js';

const logging = new Logging({
    projectId: config.gcp.project_id
});

/**
 * Write an audit entry to Google Cloud Logging
 * @param {string} logName - Name of the log (e.g. 'audit-trail')
 * @param {object} entry - The audit data
 * @param {string} severity - NOTICE, INFO, WARNING, ERROR, CRITICAL
 */
const writeAuditLog = async (logName, entry, severity = 'NOTICE') => {
    try {
        const log = logging.log(logName);
        const metadata = {
            resource: { type: 'global' },
            severity: severity,
        };
        
        const logEntry = log.entry(metadata, {
            ...entry,
            platform: 'Alti Code Studio',
            timestamp: new Date().toISOString()
        });

        await log.write(logEntry);
        // logger.debug(`✅ Cloud Logging: Entry written to ${logName}`);
    } catch (error) {
        logger.error('Cloud Logging Error:', error);
    }
};

export const CloudLoggingService = {
    writeAuditLog
};
