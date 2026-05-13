/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { exec } from 'child_process';
import util from 'util';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

const execAsync = util.promisify(exec);

const auditCodebase = async (repoPath, userId = 'system', sessionId = 'security-audit') => {
    logger.info(`Starting security audit for: ${repoPath}`);

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
            const { stdout } = await execAsync('npm audit --json', { cwd: repoPath, maxBuffer: 10 * 1024 * 1024 }); // 10MB buffer
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

        // 2. Static Code Analysis via Gemini
        // For this demo, we'll analyze a specific file or a summary.
        // Analyzing the entire codebase might be too large for a single context.
        // We'll generate a prompt asking for general security best practices based on file types found?
        // Or for now, let's keep it simple and analyze the package.json scripts for dangerous commands.

        // Let's assume we want to analyze a snippet or "Repo Overview"
        // Since we don't have a specific file passed, we'll skip deep code analysis for this step 
        // to avoid reading random files, but we'll ask Gemini to summarize the security posture based on the audit report.

        const summaryPrompt = `
        You are a Security Engineer.
        Analyze the following npm audit summary and provide a brief security posture report.
        
        Audit Summary:
        ${JSON.stringify(report.dependencyAudit?.metadata || {}, null, 2)}
        
        Provide:
        1. Security Rating (Low/Medium/High Risk)
        2. Top 3 actions to take.
        `;

        const aiAnalysis = await GeminiAiService.geminiService(sessionId, summaryPrompt, userId, 'text');
        report.codeAnalysis = aiAnalysis.reply;

    } catch (error) {
        logger.error('Security audit failed', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Security audit failed');
    }

    return report;
};

export const SecurityAgentService = {
    auditCodebase,
};
