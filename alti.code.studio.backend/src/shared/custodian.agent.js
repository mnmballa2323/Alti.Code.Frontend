/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import fs from 'fs/promises';

export class CustodianAgent {
    constructor() {
        this.name = 'TheCustodian';
        logger.info('🛡️ CustodianAgent: Zero-Day Supply Chain Quarantine initialized.');
    }

    /**
     * Intercepts an NPM package installation and scans its source for zero-day malware.
     * @param {string} packageName The name of the package
     * @param {string} packagePath The path to the package directory
     * @returns {Object} { quarantined: boolean }
     */
    async scanPackage(packageName, packagePath) {
        logger.info(`🛡️ CustodianAgent: Intercepted installation of [${packageName}]. Scanning for zero-day payloads...`);

        try {
            // In a real scenario, this would recursively scan all .js files in the packagePath.
            // For the agentic demonstration, we simulate reading the primary entrypoint.
            const mainFile = `${packagePath}/index.js`;
            const sourceCode = await fs.readFile(mainFile, 'utf8');

            // 1. Heuristic Pre-scan (Fast Regex)
            if (!this._failsHeuristics(sourceCode)) {
                logger.info(`✅ CustodianAgent: [${packageName}] passed heuristic baseline. Cleared for entry.`);
                return { quarantined: false };
            }

            logger.warn(`⚠️ CustodianAgent: [${packageName}] triggered heuristic warnings. Escalating to AI Malware Analyst...`);

            // 2. AI Malware Analysis
            const isMalicious = await this._analyzeForMalware(sourceCode);

            if (isMalicious) {
                logger.error(`🚨 CustodianAgent: ZERO-DAY DETECTED in [${packageName}]. Initiating QUARANTINE.`);
                await this._quarantinePackage(packagePath);
                return { quarantined: true, reason: 'AI identified malicious intent (e.g., exfiltration, backdoor).' };
            }

            logger.info(`✅ CustodianAgent: [${packageName}] AI analysis concluded heuristics were benign. Cleared for entry.`);
            return { quarantined: false };

        } catch (error) {
            logger.error(`🛡️ CustodianAgent: Error scanning package ${packageName}: ${error.message}`);
            // Fail open or fail closed depending on strictness. We'll fail open for the mock.
            return { quarantined: false, error: error.message };
        }
    }

    _failsHeuristics(code) {
        // Look for common obfuscation or dangerous native APIs often abused by supply chain attacks
        const dangerousPatterns = [
            /eval\s*\(/,
            /child_process/,
            /fs\.readFileSync\(['"`]\.env['"`]\)/,
            /fs\.readFileSync\(['"`]\/etc\/shadow['"`]\)/,
            /net\.Socket/,
            /fetch\s*\(\s*['"`]http:\/\/(?!(localhost|127\.0\.0\.1))/ // Fetching non-local HTTP
        ];
        return dangerousPatterns.some(regex => regex.test(code));
    }

    async _analyzeForMalware(sourceCode) {
        const prompt = `You are an elite Cybersecurity Malware Analyst. Analyze the following NPM package source code for zero-day supply chain attacks.
        
        Look for:
        1. Obfuscated \`eval\` payloads.
        2. Unauthorized exfiltration of environment variables (\`.env\`) or SSH keys to external IP addresses.
        3. Reverse shells via \`child_process\`.

        Code to analyze:
        \`\`\`javascript
        ${sourceCode}
        \`\`\`

        Is this code malicious? Return ONLY a JSON object: {"malicious": true} or {"malicious": false}. Do not include markdown formatting like \`\`\`.`;

        let response = await GeminiAiService.generateContent(prompt);
        response = response.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
        try {
            const result = JSON.parse(response);
            return result.malicious === true;
        } catch (e) {
            return false; // Safely assume false if parsing fails
        }
    }

    async _quarantinePackage(packagePath) {
        // In a real scenario, this would rm -rf the node_modules directory.
        // We mock the deletion to avoid destroying actual files during tests.
        logger.info(`🛡️ CustodianAgent: [MOCK] Executing rm -rf ${packagePath}`);
        return true;
    }
}

export const custodianAgent = new CustodianAgent();
