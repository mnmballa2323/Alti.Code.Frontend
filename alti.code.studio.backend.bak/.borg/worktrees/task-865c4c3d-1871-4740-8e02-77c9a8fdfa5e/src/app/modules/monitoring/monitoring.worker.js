/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { vectorStoreService } from '../memory/vector.store.js';

export const monitoringWorkerProcessor = async (job) => {
    const { checkType } = job.data;
    const jobId = job.id;

    logger.info(`🔭 MonitoringWorker [${jobId}]: Performing check '${checkType}'...`);

    try {
        if (checkType === 'health') {
            // Simulate Health Check (In real app, fetch /health)
            const healthStatus = { status: 'UP', uptime: process.uptime(), timestamp: new Date() };

            if (healthStatus.status !== 'UP') {
                throw new Error('System Down!');
            }

            logger.info(`✅ MonitoringWorker [${jobId}]: System Health OK.`);
            return healthStatus;
        }

        if (checkType === 'anomaly') {
            // Simulate accessing trace data (e.g. from Langfuse or stored logs)
            // For now, we query our own VectorStore for recent high-severity errors
            const recentRisks = await vectorStoreService.search('severity:high', 5);

            if (recentRisks && recentRisks.ids && recentRisks.ids.length > 0) {
                logger.warn(`⚠️ MonitoringWorker [${jobId}]: Detected ${recentRisks.ids.length} anomalies in memory.`);
                return { status: 'WARNING', anomalies: recentRisks.documents };
            }

            logger.info(`✅ MonitoringWorker [${jobId}]: No anomalies detected.`);
            return { status: 'OK' };
        }

    } catch (error) {
        logger.error(`❌ MonitoringWorker [${jobId}] Alert!`, error);
        // Here we would trigger a paging alert
        throw error;
    }
};
