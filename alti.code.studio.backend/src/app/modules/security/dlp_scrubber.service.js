import { logger } from '../../../shared/logger.js';

/**
 * Enterprise Data Loss Prevention (DLP) Service
 * Fortune 100 Compliance Layer for intercepting and redacting PII,
 * Secrets, and proprietary tokens before they reach the Swarm Brain or UI.
 */
class DlpScrubberService {
    constructor() {
        // Standard Fortune 100 Secret & PII regex patterns
        this.patterns = [
            { name: 'AWS Access Key', regex: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g },
            { name: 'AWS Secret Key', regex: /(?i)aws_secret_access_key\s*=\s*['"][a-zA-Z0-9/+=]{40}['"]/g },
            { name: 'GCP Service Account', regex: /"type":\s*"service_account"/g },
            { name: 'Stripe API Key', regex: /sk_(test|live)_[0-9a-zA-Z]{24}/g },
            { name: 'Slack Token', regex: /xox[baprs]-[0-9]{12}-[0-9]{12}-[a-zA-Z0-9]{24}/g },
            { name: 'RSA Private Key', regex: /-----BEGIN RSA PRIVATE KEY-----[\s\S]*?-----END RSA PRIVATE KEY-----/g },
            { name: 'Generic Password', regex: /(?i)(password|passwd|pwd|secret)\s*[:=]\s*['"][^'"]+['"]/g },
            { name: 'SSN (US)', regex: /\b\d{3}-\d{2}-\d{4}\b/g },
            { name: 'Credit Card (PCI)', regex: /\b(?:\d{4}[ -]?){3}\d{4}\b/g, validator: this.isLuhnValid }
        ];
    }

    /**
     * Implements Luhn Algorithm for validating Credit Card numbers to prevent false positive matchings.
     */
    isLuhnValid(cardNumber) {
        const sanitized = cardNumber.replace(/[\s-]/g, '');
        if (!/^\d+$/.test(sanitized)) return false;
        
        let sum = 0;
        let shouldDouble = false;
        for (let i = sanitized.length - 1; i >= 0; i--) {
            let digit = parseInt(sanitized.charAt(i), 10);
            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10) === 0;
    }

    /**
     * Recursively scrubs sensitive data from an object or string.
     */
    scrub(data) {
        if (typeof data === 'string') {
            let scrubbed = data;
            for (const { name, regex, validator } of this.patterns) {
                if (validator) {
                    scrubbed = scrubbed.replace(regex, (match) => {
                        return validator.call(this, match) ? `[REDACTED: ${name}]` : match;
                    });
                } else {
                    scrubbed = scrubbed.replace(regex, `[REDACTED: ${name}]`);
                }
            }
            return scrubbed;
        }

        if (Array.isArray(data)) {
            return data.map(item => this.scrub(item));
        }

        if (data !== null && typeof data === 'object') {
            const scrubbedObj = {};
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    scrubbedObj[key] = this.scrub(data[key]);
                }
            }
            return scrubbedObj;
        }

        return data; // Numbers, booleans, etc.
    }
    
    /**
     * Deep-scrubs AST JSON outputs prior to graph ingestion or frontend delivery.
     */
    scrubGraphifyOutput(jsonOutput) {
        logger.info('🛡️ [DLP] Executing Zero-Trust DLP Scrubbing on Knowledge Graph context...');
        const beforeLen = JSON.stringify(jsonOutput).length;
        const scrubbed = this.scrub(jsonOutput);
        const afterLen = JSON.stringify(scrubbed).length;
        
        if (beforeLen !== afterLen) {
            logger.warn('⚠️ [DLP] SEC-01: Sensitive data intercepted and redacted from Graphify AST.');
        } else {
            logger.info('✅ [DLP] Graphify AST passed enterprise security scrubbing.');
        }
        
        return scrubbed;
    }
}

export const dlpScrubberService = new DlpScrubberService();
