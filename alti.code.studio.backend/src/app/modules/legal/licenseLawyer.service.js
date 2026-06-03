import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * Open Source License Lawyer
 * Scans package.json and GitHub dependencies for viral GPL licenses.
 */
const auditLicenses = async (userId, sessionId, packageJsonContent) => {
    logger.info(`⚖️ [License Lawyer] Scanning dependencies for viral Open Source licenses...`);

    try {
        const lawyerPrompt = `You are a strict Open Source Legal Compliance Officer.
Analyze the following package.json dependencies.
Your goal is to identify ANY dependencies that are licensed under "viral" copyleft licenses (e.g., GPL, AGPL) that would infect an otherwise proprietary or MIT/Apache 2.0 codebase.

Dependencies:
${packageJsonContent}

List any dangerous dependencies and suggest MIT/Apache 2.0 compliant alternatives.
Return the report as a clean JSON array of violating packages and alternatives.`;

        const result = await LlmGatewayService.routeCompletion(
            userId, sessionId, lawyerPrompt, 'claude-3-5-sonnet', 'License-Lawyer'
        );

        logger.info(`✅ [License Lawyer] License compliance scan complete.`);

        return { status: 'legal_scan_complete', report: result.reply };

    } catch (error) {
        logger.error(`❌ [License Lawyer] Legal audit critically failed:`, error);
        throw error;
    }
};

export const LicenseLawyerService = { auditLicenses };
