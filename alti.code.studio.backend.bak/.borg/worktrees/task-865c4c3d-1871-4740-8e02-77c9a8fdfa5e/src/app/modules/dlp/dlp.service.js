/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


/**
 * Data Loss Prevention Service
 * Scans text for PII and Secrets using Regex patterns.
 * In a real Enterprise setup, this would call Google Cloud DLP API.
 */
class DlpService {
    constructor() {
        this.patterns = [
            {
                name: 'CREDIT_CARD',
                regex: /\b(?:\d[ -]*?){13,16}\b/g,
                replacement: '[REDACTED_CREDIT_CARD]'
            },
            {
                name: 'SSN',
                regex: /\b\d{3}-\d{2}-\d{4}\b/g,
                replacement: '[REDACTED_SSN]'
            },
            {
                name: 'AWS_ACCESS_KEY',
                regex: /\bAKIA[0-9A-Z]{16}\b/g,
                replacement: '[REDACTED_AWS_KEY]'
            },
            {
                name: 'GENERIC_API_KEY',
                regex: /\b[a-zA-Z0-9]{32,}\b/g, // Simple high-entropy check
                replacement: '[REDACTED_API_KEY]' // Use with caution, might alert on hashes
            }
        ];
    }

    /**
     * Scans text for matched patterns and redacts them.
     * @param {string} text 
     * @returns {object} { hasSensitiveData, redactedText, findings }
     */
    scan(text) {
        if (!text || typeof text !== 'string') return { hasSensitiveData: false, redactedText: text, findings: [] };

        let redactedText = text;
        const findings = [];

        this.patterns.forEach(pattern => {
            if (pattern.regex.test(text)) {
                // Reset lastIndex for global regex
                pattern.regex.lastIndex = 0;
                const matches = text.match(pattern.regex);
                if (matches) {
                    findings.push({ type: pattern.name, count: matches.length });
                    redactedText = redactedText.replace(pattern.regex, pattern.replacement);
                }
            }
        });

        return {
            hasSensitiveData: findings.length > 0,
            redactedText,
            findings
        };
    }
}

export const dlpService = new DlpService();
