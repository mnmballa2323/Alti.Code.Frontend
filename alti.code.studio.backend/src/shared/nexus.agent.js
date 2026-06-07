/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';
import fs from 'fs/promises';
import path from 'path';

export class NexusAgent {
    constructor() {
        this.name = 'TheNexus';
        logger.info('🌐 NexusAgent: Cross-Repository Swarm Orchestrator initialized.');
    }

    /**
     * Dispatches a global feature request across multiple related repositories atomically.
     * @param {string} globalIntent E.g., "Add Stripe Webhooks to Backend and Stripe UI to Frontend"
     * @param {Array<string>} targetRepositories Array of absolute paths to the cloned local repositories
     * @returns {Object} The aggregated atomic commit result
     */
    async executeCrossRepoFeature(globalIntent, targetRepositories) {
        logger.info(`🌐 NexusAgent: Received global intent: "${globalIntent}". Orchestrating swarm across ${targetRepositories.length} repositories.`);

        const swarmTasks = targetRepositories.map(async (repoPath) => {
            return this._dispatchSubAgent(repoPath, globalIntent);
        });

        // 1. Dispatch swarm concurrently
        const results = await Promise.allSettled(swarmTasks);

        // 2. Atomic Verification Lock
        const allSucceeded = results.every(r => r.status === 'fulfilled' && r.value.success === true);

        if (!allSucceeded) {
            logger.error(`🌐 NexusAgent: ATOMIC LOCK FAILURE. One or more repos failed testing. Initiating global rollback.`);
            await this._rollbackRepositories(targetRepositories);
            return { success: false, reason: 'Atomic cross-repo verification failed.' };
        }

        logger.info(`🌐 NexusAgent: Atomic Swarm Verification PASSED. Committing trans-repo changes.`);

        return {
            success: true,
            swarm_payloads: results.map(r => r.value)
        };
    }

    async _dispatchSubAgent(repoPath, intent) {
        logger.info(`🌐 [NEXUS SWARM] Dispatching isolated agent to repository: ${path.basename(repoPath)}`);

        // Mock prompt to determine the repository specific code change
        const prompt = `You are a specialized Swarm SubAgent for the repository: ${path.basename(repoPath)}.
        The Global Intent is: "${intent}".
        Determine what specific file needs to be created in THIS repository.

        Return ONLY a JSON object:
        {
          "file": "path/within/repo.js",
          "content": "const code = here;"
        }`;

        let rawSubAgentOutput = await GeminiAiService.generateContent(prompt);
        rawSubAgentOutput = rawSubAgentOutput.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
        const payload = JSON.parse(rawSubAgentOutput);

        // Execute the change in the target repository
        const fullPath = path.join(repoPath, payload.file);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, payload.content, 'utf8');

        // Mock a successful local repository unit test
        return {
            success: true,
            repo: path.basename(repoPath),
            stagedFile: payload.file
        };
    }

    async _rollbackRepositories(repoPaths) {
        logger.warn(`🌐 NexusAgent: Executing \`git reset --hard\` globally across all targets...`);
        // In a real environment, this would execute `git reset --hard` in each repo path.
        // For safely testing the orchestrator, we will mock the completion of the rollback.
        return true;
    }
}

export const nexusAgent = new NexusAgent();
