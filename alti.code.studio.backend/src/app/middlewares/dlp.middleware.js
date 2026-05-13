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

