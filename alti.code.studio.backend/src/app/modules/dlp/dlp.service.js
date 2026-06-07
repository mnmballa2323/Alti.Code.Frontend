/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

/**
 * Data Loss Prevention Service
 * Scans text for PII and secrets using targeted regex patterns.
 * In a real enterprise setup this would call the Google Cloud DLP API.
 */
import { DlpServiceClient } from '@google-cloud/dlp';
import { logger } from '../../../shared/logger.js';

const PROJECT_ID = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
let dlpClient = null;

if (PROJECT_ID && PROJECT_ID !== 'none' && PROJECT_ID !== 'your-gcp-project-id') {
    try {
        dlpClient = new DlpServiceClient();
    } catch (err) {
        logger.warn('Failed to initialize DlpServiceClient', err);
    }
}

class DlpService {
    constructor() {
        this.patterns = [
            {
                name: 'CREDIT_CARD',
                // Luhn-friendly 13-16 digit number with optional separators
                regex: /\b(?:\d[ -]*?){13,16}\b/g,
                replacement: '[REDACTED_CREDIT_CARD]',
            },
            {
                name: 'SSN',
                regex: /\b\d{3}-\d{2}-\d{4}\b/g,
                replacement: '[REDACTED_SSN]',
            },
            {
                name: 'AWS_ACCESS_KEY',
                // AWS access keys always start with AKIA and are exactly 20 chars
                regex: /\bAKIA[0-9A-Z]{16}\b/g,
                replacement: '[REDACTED_AWS_KEY]',
            },
            {
                name: 'AWS_SECRET_KEY',
                // AWS secret access keys are 40 chars of base62 + /+=, preceded by whitespace or =
                regex: /(?<=[=\s"'])[A-Za-z0-9/+=]{40}(?=[\s"']|$)/g,
                replacement: '[REDACTED_AWS_SECRET]',
            },
            {
                name: 'GITHUB_TOKEN',
                regex: /\bghp_[A-Za-z0-9]{36}\b/g,
                replacement: '[REDACTED_GITHUB_TOKEN]',
            },
            {
                name: 'GOOGLE_API_KEY',
                regex: /\bAIza[0-9A-Za-z-_]{35}\b/g,
                replacement: '[REDACTED_GOOGLE_KEY]',
            },
            {
                name: 'PRIVATE_KEY_BLOCK',
                regex: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
                replacement: '[REDACTED_PRIVATE_KEY]',
            },
            {
                name: 'EMAIL',
                regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
                replacement: '[REDACTED_EMAIL]',
            },
        ];
    }

    /**
     * Scan text for sensitive data patterns and redact any matches via Cloud DLP.
     * Falls back to local regex if GCP_PROJECT_ID is omitted.
     *
     * @param {string} text
     * @returns {Promise<{ hasSensitiveData: boolean, redactedText: string, findings: Array<{type: string, count: number}> }>}
     */
    async scan(text) {
        if (!text || typeof text !== 'string') {
            return { hasSensitiveData: false, redactedText: text, findings: [] };
        }

        if (PROJECT_ID) {
            try {
                return await this._cloudDlpScan(text);
            } catch (error) {
                logger.warn(`⚠️ Cloud DLP failed (${error.message}). Falling back to local Regex...`);
            }
        }

        return this._localScan(text);
    }

    async _cloudDlpScan(text) {
        if (!dlpClient) {
            throw new Error("DLP Client not initialized (Missing credentials)");
        }
        
        const request = {
            parent: `projects/${PROJECT_ID}/locations/global`,
            item: { value: text },
            inspectConfig: {
                infoTypes: [
                    { name: 'CREDIT_CARD_NUMBER' },
                    { name: 'EMAIL_ADDRESS' },
                    { name: 'US_SOCIAL_SECURITY_NUMBER' },
                    { name: 'GCP_CREDENTIALS' },
                    { name: 'AUTH_TOKEN' },
                    { name: 'ENCRYPTION_KEY' }
                ],
                includeQuote: false,
            },
            deidentifyConfig: {
                infoTypeTransformations: {
                    transformations: [
                        {
                            primitiveTransformation: {
                                replaceConfig: {
                                    newValue: { stringValue: '[REDACTED_BY_GCP_DLP]' }
                                }
                            }
                        }
                    ]
                }
            }
        };

        const [response] = await dlpClient.deidentifyContent(request);
        const redactedText = response.item.value;
        const findings = [];
        let hasSensitiveData = false;

        // Extract detailed ML findings if GCP returned transformation summaries
        if (response.overview && response.overview.transformationSummaries) {
            for (const summary of response.overview.transformationSummaries) {
                if (summary.infoType && summary.results) {
                    let totalCount = 0;
                    summary.results.forEach(r => totalCount += (parseInt(r.count, 10) || 0));
                    if (totalCount > 0) {
                        findings.push({ type: summary.infoType.name, count: totalCount });
                        hasSensitiveData = true;
                    }
                }
            }
        }

        // Fallback detection logic if overview parsing fails but string mutated
        if (!hasSensitiveData && text !== redactedText) {
            hasSensitiveData = true;
            findings.push({ type: 'GCP_DLP_REDACTED', count: 1 });
        }

        return { hasSensitiveData, redactedText, findings };
    }

    _localScan(text) {
        if (!text || typeof text !== 'string') {
            return { hasSensitiveData: false, redactedText: text, findings: [] };
        }

        let redactedText = text;
        const findings = [];

        for (const pattern of this.patterns) {
            // Clone the regex to reset lastIndex for each call — avoids global regex state bugs
            const re = new RegExp(pattern.regex.source, pattern.regex.flags);

            const matches = redactedText.match(re);
            if (matches) {
                findings.push({ type: pattern.name, count: matches.length });
                redactedText = redactedText.replace(re, pattern.replacement);
            }
        }

        return {
            hasSensitiveData: findings.length > 0,
            redactedText,
            findings,
        };
    }

    /**
     * Quick check — returns true if text contains sensitive data, without redacting.
     * @param {string} text
     * @returns {Promise<boolean>}
     */
    async hasSensitiveData(text) {
        const result = await this.scan(text);
        return result.hasSensitiveData;
    }
}

export const dlpService = new DlpService();
