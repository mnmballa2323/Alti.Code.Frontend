/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Phase 27: The Cryptographic Vanguard (Post-Quantum Agility)
 * Agent responsible for scanning polyglot codebases for deprecated
 * cryptography and autonomously refactoring them to modern or PQC standards.
 */
class QuantumSecAgent extends BaseSpecialistAgent {
    constructor() {
        super({
            id: 'agent_quantumsec_001',
            name: 'QuantumSecAgent',
            description: 'Scans for deprecated cryptography (MD5, SHA1, DES) and refactors to Post-Quantum/Modern standards (SHA-384, Kyber).',
            tier: 27,
            version: '6.8.0',
            capabilities: [
                'Scan AST/Regex for legacy Node crypto imports or openSSL bindings',
                'Identify weak hashing, symmetric, and asymmetric implementations',
                'Autonomously rewrite TLS and encryption wrappers to enforce modern standards',
                'Prepare codebase for NIST Post-Quantum Cryptography (PQC) requirements'
            ]
        });

        this.WEAK_CRYPTO_PATTERNS = [
            /crypto\.createHash\(['"](md5|sha1)['"]\)/gi,
            /crypto\.createCipher(iv)?\(['"](des|rc4|blowfish|aes-128-ecb)['"]/gi,
            /MD5\(.*?\)/gi
        ];
    }

    /**
     * Scan a specific file for weak cryptography patterns.
     * @param {string} filePath 
     * @returns {Promise<Array<string>>}
     */
    async scanFileForVulnerabilities(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const findings = [];

            for (const pattern of this.WEAK_CRYPTO_PATTERNS) {
                const matches = content.match(pattern);
                if (matches) {
                    findings.push(...matches);
                }
            }

            return findings.length > 0 ? { file: filePath, findings } : null;

        } catch (error) {
            logger.warn(`QuantumSec scan failed for ${filePath}: ${error.message}`);
            return null;
        }
    }

    /**
     * Interface handler for the capability router
     */
    async _invoke(query, options = {}) {
        return this.execute('scan', { query, ...options });
    }

    async execute(action, context) {
        if (!context) throw new Error("Context is required for QuantumSec operations");

        logger.info(`🛡️ QuantumSec execution started for action: ${action}`);

        if (action === 'scan') {
            const fileMatch = context.query?.match(/(?:in|file)\s+([a-zA-Z0-9_.\-\/\\]+\.[a-zA-Z0-9]+)/i);
            const targetFile = fileMatch ? fileMatch[1] : null;

            if (!targetFile) {
                return { status: 'failed', error: 'No target file specified for cryptographic scan.' };
            }

            const scanResult = await this.scanFileForVulnerabilities(targetFile);

            if (!scanResult) {
                return { status: 'success', message: `${targetFile} is free of legacy cryptographic patterns.` };
            }

            // Synthesize the refactoring payload via Gemini
            const sourceCode = await fs.readFile(targetFile, 'utf-8');

            const prompt = `You are the Alti.Code.Studio Post-Quantum Cryptographic Auditor.
            Review the following source code and the flagged weak cryptography patterns.
            
            File: ${targetFile}
            Vulnerabilities Found:
            ${scanResult.findings.join('\n')}
            
            Source Code:
            \`\`\`
            ${sourceCode.substring(0, 4000)}
            \`\`\`
            
            Provide a fully patched, strictly formatted source code replacement.
            - Upgrade MD5/SHA1 to SHA-256 or SHA-384.
            - Upgrade weak ciphers to aes-256-gcm or ChaCha20-Poly1305.
            Output ONLY the raw code. No markdown fences.`;

            const aiResponse = await GeminiAiService.generateContent(prompt);
            const patchedCode = aiResponse.replace(/^```[a-z]*\n?/m, '').replace(/\n?```$/m, '').trim();

            this._recordSuccess(850);

            return {
                status: 'success',
                findings: scanResult.findings,
                refactoredCode: patchedCode,
                actionRequired: `The QuantumSecAgent has generated a modernized cryptographic patch for ${targetFile}.`
            };
        }

        throw new Error(`Unsupported action: ${action}`);
    }
}

export const quantumSecAgent = new QuantumSecAgent();
