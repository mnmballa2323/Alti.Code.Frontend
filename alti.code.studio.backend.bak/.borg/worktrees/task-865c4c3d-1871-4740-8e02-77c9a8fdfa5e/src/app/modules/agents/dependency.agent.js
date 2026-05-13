/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import { exec } from 'child_process';
import util from 'util';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

const execAsync = util.promisify(exec);

class DependencyAgent {
    async audit() {
        logger.info('📡 Dependency Radar: Scanning...');
        let outdated = {};

        try {
            const { stdout } = await execAsync('npm outdated --json');
            outdated = JSON.parse(stdout);
        } catch (error) {
            // npm outdated returns exit code 1 if items are found, so we check stdout
            if (error.stdout) {
                try {
                    outdated = JSON.parse(error.stdout);
                } catch (e) {
                    logger.warn('Failed to parse npm outdated', e);
                }
            } else {
                logger.warn('npm outdated failed or no network', error.message);
                return "Could not run npm audit/outdated. Ensure network access.";
            }
        }

        if (Object.keys(outdated).length === 0) {
            return "✅ All dependencies are up to date.";
        }

        // Sematic Analysis via Vertex
        const prompt = `
        Analyze these outdated dependencies and recommend which ones are safe to update immediately vs which ones involve breaking changes.
        
        Data: ${JSON.stringify(outdated, null, 2)}
        
        Format:
        ## Critical Updates (Security/Bugfix)
        - [ ] package @ old -> new (Reason)
        
        ## Major Updates (Cautious)
        - [ ] package @ old -> new (Breaking Changes likely)
        `;

        try {
            const analysis = await GeminiAiService.generateContent(prompt);
            return analysis.replace(/^```markdown|```$/g, '').trim();
        } catch (e) {
            return `Found ${Object.keys(outdated).length} outdated packages. (AI Analysis Failed)`;
        }
    }
}

export const dependencyAgent = new DependencyAgent();
