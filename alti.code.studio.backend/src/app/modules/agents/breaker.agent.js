/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

class BreakerAgent {
    constructor() {
        this.name = "The Breaker";
        this.agentName = "breaker";
        this.capabilities = ['attack'];
        this.vulnerabilityPatterns = [
            { name: "Hardcoded Secret", regex: /(password|secret|key|token)\s*=\s*['"][a-zA-Z0-9]{10,}['"]/i },
            { name: "SQL Injection", regex: /SELECT\s+.*?\s+FROM\s+.*?\$\{/i }, // Broad Template Literal Check
            { name: "Unsafe Eval", regex: /eval\s*\(/ }
        ];
    }

    async execute(action, args) {
        logger.info(`⚔️ Breaker: Executing ${action}`);
        if (action === 'attack') {
            return this.attack(args.targetDir);
        }
        throw new Error(`Unknown action: ${action}`);
    }

    /**
     * Attack the codebase to find vulnerabilities
     * @param {string} targetDir 
     * @returns {Promise<Array>} List of found vulnerabilities
     */
    async attack(targetDir) {
        logger.info(`⚔️ Breaker: Launching Red Team attack on ${targetDir}...`);
        const vulnerabilities = [];

        try {
            await this._scanRecursively(targetDir, vulnerabilities);

            logger.info(`⚔️ Breaker: Attack complete. Found ${vulnerabilities.length} vulnerabilities.`);
            return vulnerabilities;
        } catch (error) {
            logger.error(`❌ Breaker Failed:`, error);
            throw error;
        }
    }

    async _scanRecursively(dir, vulnerabilities) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (entry.name !== 'node_modules' && entry.name !== '.git') {
                    await this._scanRecursively(fullPath, vulnerabilities);
                }
            } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
                await this._scanFile(fullPath, vulnerabilities);
            }
        }
    }

    async _scanFile(filePath, vulnerabilities) {
        const content = await fs.readFile(filePath, 'utf-8');

        // 1. Static Analysis (Pattern Matching)
        for (const pattern of this.vulnerabilityPatterns) {
            if (pattern.regex.test(content)) {
                vulnerabilities.push({
                    type: pattern.name,
                    file: filePath,
                    severity: 'HIGH',
                    method: 'Static Analysis'
                });
                logger.warn(`🚩 Breaker: Found ${pattern.name} in ${filePath}`);
            }
        }

        // 2. AI Analysis (Simulated for high-value files)
        // In full production, we would send file content to Gemini to find logic bugs.
        // For now, we rely on patterns to be fast.
    }
}

export const breakerAgent = new BreakerAgent();
