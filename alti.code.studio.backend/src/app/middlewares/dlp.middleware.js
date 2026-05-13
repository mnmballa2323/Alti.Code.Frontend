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
