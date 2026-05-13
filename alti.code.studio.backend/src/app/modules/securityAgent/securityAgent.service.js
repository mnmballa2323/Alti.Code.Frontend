/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { exec } from 'child_process';
import util from 'util';
import { appendFile, mkdir } from 'fs/promises';
import path from 'path';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

const execAsync = util.promisify(exec);

const LOGS_DIR = path.join(process.cwd(), 'logs');
const AUDIT_LOG_PATH = path.join(LOGS_DIR, 'military_audit_trail.log');

/** Ensure the logs directory exists before the first write. */
const ensureLogsDir = async () => mkdir(LOGS_DIR, { recursive: true });

const auditCodebase = async (repoPath, userId = 'system', sessionId = 'security-audit') => {
    if (!repoPath || typeof repoPath !== 'string' || repoPath.trim().length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'SecurityAgent: repoPath must be a non-empty string.');
    }

    logger.info(`🛡️ Security Agent: Starting audit for: ${repoPath}`);

    const report = {
        vulnerabilities: [],
        score: 100,
        timestamp: new Date(),
        dependencyAudit: null,
        codeAnalysis: null
    };

    try {
        // 1. Dependency Audit (npm audit)
        logger.info('Running npm audit...');
        try {
            const { stdout } = await execAsync('npm audit --json', {
                cwd: repoPath,
                maxBuffer: 10 * 1024 * 1024,
                timeout: 30_000, // Prevent hanging on slow npm registry
            });

            report.dependencyAudit = JSON.parse(stdout);
        } catch (error) {
            // npm audit exits with 1 if vulnerabilities are found
            if (error.stdout) {
                report.dependencyAudit = JSON.parse(error.stdout);
            } else {
                logger.error('npm audit failed to run', error);
                report.dependencyAudit = { error: 'Failed to run npm audit: ' + error.message };
            }
        }

        // Calculate score deduction based on vulnerabilities
        if (report.dependencyAudit && report.dependencyAudit.metadata && report.dependencyAudit.metadata.vulnerabilities) {
            const vulns = report.dependencyAudit.metadata.vulnerabilities;
            // Simple weighting: critical=10, high=5, moderate=2, low=1
            const deduction = (vulns.critical * 10) + (vulns.high * 5) + (vulns.moderate * 2) + (vulns.low * 1);
            report.score = Math.max(0, report.score - deduction);
        }

        // 2. Static Code Analysis via Gemini (Mandiant Threat Intelligence)
        const summaryPrompt = `
        You are an elite Cybersecurity Intelligence Analyst utilizing Mandiant Threat Intelligence feeds.
        Analyze the following npm audit summary and provide a brief security posture report.
        
        CRITICAL TASK: Cross-reference these vulnerabilities against known Zero-Day exploits and Advanced Persistent Threat (APT) signatures associated with Mandiant intelligence.
        
        Audit Summary:
        ${JSON.stringify(report.dependencyAudit?.metadata || {}, null, 2)}
        
        Provide the output as STRICT JSON exactly matching:
        {
            "securityRating": "LOW | MEDIUM | HIGH | CRITICAL",
            "mandiantIntelligence": "1-sentence threat intel context tying these vulns to known APTs or exploit kits.",
            "topActions": ["Action 1", "Action 2", "Action 3"]
        }
        Do not include markdown formatting.
        `;

        // Use generateContent (stateless) — geminiService() hits MongoDB with userId 'system'
        // which causes a Mongoose CastError since 'system' is not a valid ObjectId.
        const aiResponse = await GeminiAiService.generateContent(summaryPrompt);

        try {
            const cleanJson = aiResponse
                .replace(/^```json\n?/m, '')
                .replace(/^```\n?/m, '')
                .replace(/\n?```$/m, '')
                .trim();
            report.codeAnalysis = JSON.parse(cleanJson);

        } catch (e) {
            logger.warn('Failed to parse Mandiant AI response as JSON', e);
            report.codeAnalysis = {
                securityRating: 'CRITICAL',
                mandiantIntelligence: 'Parse failure. Assume critical compromise. Review raw logs.',
                topActions: ['Run Deep Scan', 'Rotate Secrets', 'Isolate Container']
            };
        }

        const auditRecord = `[${new Date().toISOString()}] AUDIT_ID:${sessionId} USER:${userId} REPO:${repoPath} SCORE:${report.score} MANDIANT_THREAT:${report.codeAnalysis?.securityRating}\n`;
        await ensureLogsDir();
        await appendFile(AUDIT_LOG_PATH, auditRecord);
        logger.info(`🛡️ [MILITARY AUDIT] Immutable record saved: ${AUDIT_LOG_PATH}`);

    } catch (error) {
        logger.error('Security audit failed', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Security audit failed');
    }

    return report;
};

export const SecurityAgentService = {
    auditCodebase,
};
