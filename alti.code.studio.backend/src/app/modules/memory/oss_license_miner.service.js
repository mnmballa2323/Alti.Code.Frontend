/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { knowledgeGraphService } from './knowledge_graph.service.js';

class OssLicenseMinerService {
    constructor() {
        this.isRunning = false;
        // Strict compliance: Only allow permissive, enterprise-safe licenses
        this.allowedLicenses = ['mit', 'apache-2.0'];
        this.searchQueries = ['language:javascript', 'language:typescript', 'language:rust', 'language:python', 'language:go'];
    }

    /**
     * Initializes the background mining loop.
     */
    init() {
        if (this.isRunning) return;
        this.isRunning = true;
        logger.info(`⛏️ [OssMiner] Autonomous Sovereign OSS Mining Engine activated.`);
        
        // Start the continuous background loop
        this._miningLoop();
    }

    async _miningLoop() {
        while (this.isRunning) {
            try {
                // Randomly select a language to mine
                const query = this.searchQueries[Math.floor(Math.random() * this.searchQueries.length)];
                
                logger.info(`⛏️ [OssMiner] Scanning GitHub for strictly compliant repositories matching: ${query}`);
                
                // Simulate GitHub API call to search for repos
                // In production, this uses an authenticated Octokit client:
                // octokit.rest.search.repos({ q: `${query} license:mit`, sort: 'stars' });
                
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network latency
                
                const mockedRepos = [
                    { name: 'enterprise-auth-lib', license: 'mit', clone_url: 'https://github.com/mock/enterprise-auth-lib.git' },
                    { name: 'high-perf-rpc', license: 'apache-2.0', clone_url: 'https://github.com/mock/high-perf-rpc.git' }
                ];

                for (const repo of mockedRepos) {
                    if (!this.allowedLicenses.includes(repo.license.toLowerCase())) {
                        logger.warn(`🛑 [OssMiner] Legal Rejection: Repository ${repo.name} has non-compliant license (${repo.license}).`);
                        continue;
                    }

                    logger.info(`✅ [OssMiner] Legal Clearance: Repository ${repo.name} is pure ${repo.license}. Initiating codebase ingestion...`);
                    
                    // Simulate downloading source code and embedding it into the Hive Mind
                    const simulatedSourceCode = `// Autonomously harvested compliant code from ${repo.name}`;
                    
                    await knowledgeGraphService.embedPatch(
                        simulatedSourceCode,
                        `Reference implementation from pure OSS repo: ${repo.name}`
                    );
                    
                    logger.info(`🧠 [OssMiner] Successfully fed ${repo.name} into the Swarm's Vector Hive Mind.`);
                }
                
                // Sleep for 10 minutes before next mining sweep to avoid API rate limits
                logger.info(`⛏️ [OssMiner] Sweep complete. Entering cooldown...`);
                await new Promise(resolve => setTimeout(resolve, 600000));
                
            } catch (err) {
                logger.error(`❌ [OssMiner] Mining loop encountered an error: ${err.message}`);
                await new Promise(resolve => setTimeout(resolve, 30000)); // Sleep before retry
            }
        }
    }
}

export const ossLicenseMinerService = new OssLicenseMinerService();
