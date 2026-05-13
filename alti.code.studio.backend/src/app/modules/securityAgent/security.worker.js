/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { SecurityAgentService } from './securityAgent.service.js';
import { vectorStoreService } from '../memory/vector.store.js';
import { redTeamAgent } from '../agents/redteam.agent.js';

export const securityWorkerProcessor = async (job) => {
    const { repoPath, userId, sessionId } = job.data;
    const jobId = job.id;

    logger.info(`🛡️ SecurityWorker [${jobId}]: Starting audit scan for ${repoPath}...`);

    try {
        if (job.data.task === 'pentest') {
            logger.info(`🛡️ SecurityWorker [${jobId}]: Escalating to RedTeam Agent for dynamic code assault.`);
            return await redTeamAgent.attack(job.data.code, job.data.context);
        }

        // 1. Perform Audit
        const report = await SecurityAgentService.auditCodebase(repoPath, userId, sessionId);

        // 2. Memorize Vulnerabilities (Cognitive Layer)
        if (report.dependencyAudit?.metadata?.vulnerabilities) {
            const vulns = report.dependencyAudit.metadata.vulnerabilities;
            const summary = `Critical: ${vulns.critical}, High: ${vulns.high}`;

            if (vulns.critical > 0 || vulns.high > 0) {
                logger.info(`🛡️ SecurityWorker [${jobId}]: High risk detected. Memorizing signature...`);
                await vectorStoreService.add(
                    `Security Risk in ${repoPath}: ${summary}\nAnalysis: ${report.codeAnalysis}`,
                    { type: 'security-risk', severity: 'high', repo: repoPath }
                );
            }
        }

        logger.info(`✅ SecurityWorker [${jobId}]: Audit Complete. Score: ${report.score}`);
        return report;

    } catch (error) {
        logger.error(`❌ SecurityWorker [${jobId}] Failed`, error);
        throw error;
    }
};
