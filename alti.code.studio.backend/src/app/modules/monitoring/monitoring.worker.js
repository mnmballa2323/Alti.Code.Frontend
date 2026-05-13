/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { vectorStoreService } from '../memory/vector.store.js';
import { sentinelAgent } from '../agents/sentinel.agent.js';
import { observabilityService } from './observability.service.js';

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
            const recentLogs = observabilityService.getRecentTraces();
            const evaluation = await sentinelAgent.evaluateHealth(recentLogs);

            if (evaluation.status === 'CRITICAL' || evaluation.status === 'WARNING') {
                logger.warn(`🚨 MonitoringWorker [${jobId}] Sentinel Alert: ${evaluation.summary}`);
                return { status: evaluation.status, report: evaluation };
            }

            logger.info(`✅ MonitoringWorker [${jobId}]: System Health OK. No AI anomalies.`);
            return { status: 'OK' };
        }

    } catch (error) {
        logger.error(`❌ MonitoringWorker [${jobId}] Alert!`, error);
        // Here we would trigger a paging alert
        throw error;
    }
};
