<<<<<<< HEAD
/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { logger } from '../../shared/logger.js';
import { auditService } from '../modules/compliance/audit.service.js';

// Regex patterns for sensitive data
const PATTERNS = {
    SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
    CREDIT_CARD: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
    API_KEY: /(sk-[a-zA-Z0-9]{20,})|(ghp_[a-zA-Z0-9]{20,})/g,
    EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
};

export const dlpMiddleware = async (req, res, next) => {
    // 1. Scan Request Body
    if (req.body) {
        const bodyStr = JSON.stringify(req.body);
        let riskFound = false;
        let piiType = '';

        for (const [key, regex] of Object.entries(PATTERNS)) {
            if (regex.test(bodyStr)) {
                riskFound = true;
                piiType = key;
                break;
            }
        }

        if (riskFound) {
            logger.warn(`🔒 [DLP] Blocked request containing ${piiType}`);

            await auditService.log(
                req.user?.id || 'anonymous',
                'DLP_SCAN',
                req.originalUrl,
                'DENIED',
                { reason: `Contains ${piiType}`, piiType }
            );

            return res.status(400).json({
                success: false,
                error: 'Data Loss Prevention (DLP) Violation: Request contains sensitive data.'
            });
        }
    }

    // 2. Intercept Response (Advanced - Simplified for this phase)
    // In a full implementation, we would override res.send to scan outgoing data too.

    next();
};
=======
import { logger } from '../../shared/logger.js';
import { auditService } from '../modules/compliance/audit.service.js';
import { GoogleDlpService } from '../modules/googleCloud/dlp.service.js';

export const dlpMiddleware = async (req, res, next) => {
    // Skip if no body or public route
    if (!req.body || req.originalUrl.includes('/auth') || req.originalUrl.includes('/health')) {
        return next();
    }

    try {
        const bodyStr = JSON.stringify(req.body);
        
        // 1. Perform Deep ML Inspection via Google Cloud DLP
        const findings = await GoogleDlpService.inspectText(bodyStr);

        if (findings && findings.length > 0) {
            const riskTypes = findings.map(f => f.infoType.name);
            const uniqueRisks = [...new Set(riskTypes)];

            logger.warn(`🔒 [DLP] Blocked request containing sensitive info types: ${uniqueRisks.join(', ')}`);

            await auditService.log(
                req.user?.id || 'anonymous',
                'DLP_VIOLATION',
                req.originalUrl,
                'DENIED',
                { findings: uniqueRisks }
            );

            // Report to the Sentinel Security Feed (Real-time Backend Stream)
            const { sentinelService } = await import('../modules/security/sentinel.service.js');
            await sentinelService.reportEvent('DLP_REDACTION', 'CRITICAL', {
                risks: uniqueRisks,
                endpoint: req.originalUrl,
                userId: req.user?.id || 'anonymous'
            });
            
            // 🌐 Deep Google Integration: Security Command Center
            try {
                const { sccService } = await import('../modules/googleCloud/scc.service.js');
                await sccService.reportFinding(
                    `DLP_VIOLATION_${uniqueRisks[0].toUpperCase()}`,
                    `//alti.code.studio${req.originalUrl}`,
                    'CRITICAL'
                );
            } catch (sccError) {
                logger.warn('⚠️ [DLP] Failed to push to SCC:', sccError.message);
            }

            return res.status(400).json({
                success: false,
                error: `Data Loss Prevention (DLP) Violation: Sensitive data detected (${uniqueRisks[0]})`
            });
        }

        next();
    } catch (error) {
        // Fallback to allow request if GCP service is down, ensuring availability while logging error
        logger.error('[DLP Middleware] Service Error:', error);
        next();
    }
};

>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
