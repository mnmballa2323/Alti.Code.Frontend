/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';

const SERVICE_NAME = 'DLP Engine';

/**
 * Data Loss Prevention (DLP) Service
 * Intercepts text strings (like prompts or source code) and redacts 
 * highly sensitive PII, PCI, and Secrets before they leave the environment.
 */
class DlpService {
    constructor() {
        this.enabled = process.env.DLP_ENABLED !== 'false';
    }

    /**
     * Redacts sensitive information from a string.
     * @param {string} text The text to sanitize.
     * @returns {string} The sanitized text.
     */
    redact(text) {
        if (!this.enabled || !text || typeof text !== 'string') {
            return text;
        }

        let sanitized = text;
        let redactionCount = 0;

        // 1. Credit Cards (PCI) - Basic pattern, typically 13-19 digits, optionally separated by dash/space
        const creditCardRegex = /\b(?:\d[ -]*?){13,16}\b/g;
        sanitized = sanitized.replace(creditCardRegex, (match) => {
            redactionCount++;
            return '[REDACTED_PCI]';
        });

        // 2. Social Security Numbers (PII) - XXX-XX-XXXX
        const ssnRegex = /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g;
        sanitized = sanitized.replace(ssnRegex, (match) => {
            redactionCount++;
            return '[REDACTED_PII_SSN]';
        });

        // 3. Secrets / API Keys (e.g., AWS AKIA)
        const awsKeyRegex = /\bAKIA[0-9A-Z]{16}\b/g;
        sanitized = sanitized.replace(awsKeyRegex, (match) => {
            redactionCount++;
            return '[REDACTED_SECRET_AWS]';
        });

        const genericSecretRegex = /(?:password|secret|api_key|apikey|token)["'\s:=]+(["'][a-zA-Z0-9\-_]{8,}["'])/gi;
        sanitized = sanitized.replace(genericSecretRegex, (match, secretGroup) => {
            redactionCount++;
            return match.replace(secretGroup, '"[REDACTED_SECRET]"');
        });

        // 4. IPv4 Addresses (Internal Infrastructure Protection)
        // Ignores loopback 127.0.0.1
        const ipv4Regex = /\b(?!127\.0\.0\.1\b)(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
        sanitized = sanitized.replace(ipv4Regex, (match) => {
            redactionCount++;
            return '[REDACTED_IP]';
        });

        // 5. Protected Health Information (PHI - HIPAA)
        // ICD-10 Codes (e.g., A00.0, Z99.8)
        const icd10Regex = /\b[A-TV-Z][0-9][0-9AB]\.?[0-9A-TV-Z]{0,4}\b/g;
        sanitized = sanitized.replace(icd10Regex, (match) => {
            redactionCount++;
            return '[REDACTED_PHI_ICD10]';
        });

        // DEA Numbers (2 letters, 7 digits)
        const deaRegex = /\b[A-Z]{2}[0-9]{7}\b/g;
        sanitized = sanitized.replace(deaRegex, (match) => {
            redactionCount++;
            return '[REDACTED_PHI_DEA]';
        });

        if (redactionCount > 0) {
            logger.info(`[${SERVICE_NAME}] Intercepted and redacted ${redactionCount} sensitive patterns.`);
        }

        return sanitized;
    }

    /**
     * Checks for strict compliance tags that must block execution (e.g. ITAR / CUI).
     * @param {string} text 
     * @param {boolean} isAirGapped 
     */
    checkComplianceTags(text, isAirGapped = false) {
        if (!this.enabled || !text || typeof text !== 'string') return;
        
        const cuiRegex = /\b(?:CUI|CONTROLLED UNCLASSIFIED INFORMATION|ITAR|EAR)\b/i;
        if (cuiRegex.test(text) && !isAirGapped) {
            throw new Error('DLP BLOCKED: Controlled Unclassified Information (CUI/ITAR) detected. This payload cannot be sent to public cloud LLMs. Enable AIR_GAPPED_MODE.');
        }
    }
}

export const dlpService = new DlpService();
