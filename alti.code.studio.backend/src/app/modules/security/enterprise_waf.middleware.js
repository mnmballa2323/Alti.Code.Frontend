import { logger } from '../../../shared/logger.js';

/**
 * Enterprise Web Application Firewall (WAF) & Rate Limiter
 * Fortune 100 Compliance: Protects the Alti Code Studio backend from 
 * Volumetric DDoS attacks, Prompt Injection, and unauthorized egress.
 */
class EnterpriseWAF {
    constructor() {
        this.rateLimits = new Map();
        // Strict Fortune 100 Limits: 100 requests per minute per IP
        this.MAX_REQUESTS_PER_MINUTE = 100; 
    }

    /**
     * Express Middleware: In-Memory Token Bucket Rate Limiter
     */
    rateLimiter = (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        const windowStart = now - 60000; // 1 minute window

        if (!this.rateLimits.has(ip)) {
            this.rateLimits.set(ip, []);
        }

        const timestamps = this.rateLimits.get(ip);
        // Filter out old timestamps
        const activeRequests = timestamps.filter(t => t > windowStart);

        if (activeRequests.length >= this.MAX_REQUESTS_PER_MINUTE) {
            logger.warn(`🛑 [WAF] Rate Limit Exceeded for IP: ${ip}. Blocking request to ${req.originalUrl}`);
            return res.status(429).json({
                error: 'Too Many Requests',
                message: 'Enterprise rate limits exceeded. Please wait 60 seconds.'
            });
        }

        activeRequests.push(now);
        this.rateLimits.set(ip, activeRequests);
        
        // Add security headers to the response
        res.setHeader('X-RateLimit-Limit', this.MAX_REQUESTS_PER_MINUTE);
        res.setHeader('X-RateLimit-Remaining', this.MAX_REQUESTS_PER_MINUTE - activeRequests.length);
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
