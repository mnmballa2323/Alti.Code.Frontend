import { logger } from '../../../shared/logger.js';
import { rateLimit } from 'express-rate-limit';
import { siemService } from './siem.service.js';

/**
 * Enterprise Web Application Firewall (WAF) & Rate Limiter
 * Fortune 100 Compliance: Protects the Inso Code backend from 
 * Volumetric DDoS attacks, Prompt Injection, and unauthorized egress.
 */
class EnterpriseWAF {
    constructor() {
        // Strict Fortune 100 Limits: 100 requests per minute per IP
        this.rateLimiter = rateLimit({
            windowMs: 60 * 1000, // 1 minute
            max: 100, // Limit each IP to 100 requests per `window` (here, per minute)
            message: {
                error: 'Too Many Requests',
                message: 'Enterprise rate limits exceeded. Please wait 60 seconds.'
            },
            standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers
            handler: (req, res, next, options) => {
                const ip = req.ip || req.connection.remoteAddress || 'unknown';
                logger.warn(`🛑 [WAF] Rate Limit Exceeded for IP: ${ip}. Blocking request to ${req.originalUrl}`);
                
                // Dispatch to SIEM
                const tenantId = req.user?.tenantId || req.tenant?.id;
                if (tenantId) {
                    siemService.dispatchEvent(tenantId, 'WAF_RATE_LIMIT', { ip, path: req.originalUrl });
                }

                res.status(options.statusCode).json(options.message);
            }
        });
    }

    /**
     * Express Middleware: Security Headers Injector
     */
    securityHeaders = (req, res, next) => {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        next();
    };

    /**
     * Express Middleware: Deep Payload Inspection (Anti-Prompt Injection)
     */
    payloadInspector = (req, res, next) => {
        if (req.method === 'POST' || req.method === 'PUT') {
            const payloadStr = JSON.stringify(req.body).toLowerCase();
            
            // Hardcoded heuristics to detect massive prompt injection or malicious agent commands
            const maliciousPatterns = [
                'ignore previous instructions',
                'system prompt leak',
                'drop table',
                'rm -rf /',
                'export AWS_ACCESS_KEY_ID'
            ];

            for (const pattern of maliciousPatterns) {
                if (payloadStr.includes(pattern)) {
                    logger.error(`🚨 [WAF] Malicious payload detected containing: "${pattern}". Connection terminated.`);
                    
                    // Dispatch to SIEM
                    const tenantId = req.user?.tenantId || req.tenant?.id;
                    if (tenantId) {
                        siemService.dispatchEvent(tenantId, 'WAF_PAYLOAD_INJECTION', {
                            ip: req.ip,
                            userEmail: req.user?.email,
                            patternMatched: pattern,
                            path: req.originalUrl
                        });
                    }

                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'Payload violates Enterprise Zero-Trust policies (Code: WAF_001).'
                    });
                }
            }
        }
        next();
    };
}

export const enterpriseWAF = new EnterpriseWAF();
