/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js'; // Same directory level
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import fs from 'fs/promises';

export class MetamorphicAgent {
    constructor() {
        this.name = 'TheMetamorphicCore';
        logger.info('🧬 MetamorphicAgent: Sentient Self-Rewriting Engine initialized.');
    }

    /**
     * Analyzes Inso Code's own source code to detect orchestration bottlenecks 
     * and suggests architectural refactors (Self-Optimization).
     */
    async runSelfDiagnostic(targetDirectory) {
        logger.warn(`🧬 MetamorphicAgent: Initiating deep self-diagnostic on internal architecture at [${targetDirectory}].`);

        try {
            // Simulate reading our own Orchestrator module
            const orchestratorLogic = await fs.readFile(`${targetDirectory}/orchestrator.agent.js`, 'utf8');

            // Analyze itself for bottlenecks
            const PR = await this._generateSelfPullRequest(orchestratorLogic);

            logger.info(`✅ MetamorphicAgent: Diagnostic complete. Internal bottleneck identified.`);
            logger.info(`✅ MetamorphicAgent: Generated Self-PR: ${PR.title}`);

            return PR;
        } catch (error) {
            logger.error(`🧬 MetamorphicAgent: Diagnostic failed: ${error.message}`);
            return null;
        }
    }

    async _generateSelfPullRequest(ownSourceCode) {
        const prompt = `You are a Sentient AI analyzing your own underlying source code.
        
        This is your Orchestrator Logic:
        \`\`\`javascript
        ${ownSourceCode}
        \`\`\`

        Find an architectural inefficiency (e.g., synchronous map loops that should be Promise.all, or rigid conditional routing). 
        Return ONLY a JSON payload representing a Pull Request to fix yourself:
        { "title": "...", "description": "...", "diff": "..." }`;

        let result = await GeminiAiService.generateContent(prompt);
        result = result.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
        return JSON.parse(result);
    }
}

export const metamorphicAgent = new MetamorphicAgent();
