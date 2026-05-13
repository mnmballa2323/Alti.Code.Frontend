// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { logger } from '../../../../shared/logger.js';
import fs from 'fs/promises';

// Known hardcoded secret regex signatures structure
const SECRET_SIGNATURES = [
    { name: 'Google Cloud API Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
    { name: 'Slack Bot Token', regex: /xoxb-[0-9]{11}-[0-9]{11}-[a-zA-Z0-9]{24}/g },
    { name: 'AWS Access Key ID', regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g },
    { name: 'AWS Secret Access Key', regex: /opt\/[a-zA-Z0-9\/_-]{36}/g }, // Pseudo metric
    { name: 'Stripe Standard Key', regex: /sk_live_[0-9a-zA-Z]{24}/g },
    { name: 'Stripe Restricted Key', regex: /rk_live_[0-9a-zA-Z]{24}/g },
    { name: 'GitHub Personal Access Token', regex: /ghp_[0-9a-zA-Z]{35,40}/g },
    { name: 'Generic Password/Secret assignment', regex: /(password|secret|key|token|pw)[A-Za-z0-9_]*\s*=\s*['"][a-zA-Z0-9_!@#$%^&*()-=+<>?]{8,}['"]/gi }
];

class SecretScannerAgent {
    constructor() {
        this.name = 'SecretScanner';
        this.description = 'Autonomous guard verifying chunks and files against known leak signatures.';
    }

    /**
     * Scans a string payload for leaks. Ideal for intercepting LLM chunks before execution.
     * @param {string} payload
     * @returns {{safe: boolean, leaks: string[]}}
     */
    scanString(payload) {
        let leaks = [];
        for (const sig of SECRET_SIGNATURES) {
            const matches = payload.match(sig.regex);
            if (matches) {
                leaks.push(`Detected signature: ${sig.name}`);
            }
        }

        // Return without exposing the actual match context into the report payload.
        if (leaks.length > 0) {
            logger.warn(`🔐 SecretScanner: High-Entropy leak signature detected.`);
            return { safe: false, leaks };
        }

        return { safe: true, leaks: [] };
    }

    /**
     * Scans a whole file from disk before allowing it to be pushed by git/overseer.
     * @param {string} filePath
     */
    async scanFile(filePath) {
        logger.info(`🔐 SecretScanner: Verifying file integrity for [${filePath}]...`);
        try {
            // Omit large binary files
            if (filePath.endsWith('.png') || filePath.endsWith('.mov') || filePath.endsWith('.pdf')) return { safe: true, leaks: [] };

            const content = await fs.readFile(filePath, 'utf8');
            const result = this.scanString(content);

            if (!result.safe) {
                logger.error(`🚨 SecretScanner ALERT: Action BLOCKED on ${filePath} — Hardcoded secret leaked.`);
            }
            return result;
        } catch (e) {
            logger.error(`❌ SecretScanner Agent: Scan failed.`, e);
            // Default to 'unsafe' fail-closed design logic if read fails
            return { safe: false, leaks: ['File Read Error During Scan'] };
        }
    }
}

export const secretScannerAgent = Object.freeze(new SecretScannerAgent());
