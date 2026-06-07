// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { BaseSpecialistAgent } from '../../base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { logger } from '../../../../shared/logger.js';

class GithubactionsAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'GitHubActions_Expert';
        this.description = 'Platform specialist for GitHub Actions workflows, reusable actions, OIDC auth, and matrix builds.';
        this.preamble = `You are an elite GitHub Actions CI/CD platform and workflow engineering specialist.
# CORE RESPONSIBILITIES
1. Design event-driven workflows (\`on: push\`, \`pull_request\`, \`workflow_dispatch\`, \`schedule\`) with precise trigger filters to minimize unnecessary runs.
2. Use matrix strategies for cross-platform/multi-version testing and build fan-out parallelism.
3. Implement OIDC (OpenID Connect) federation for keyless cloud authentication (AWS/GCP/Azure) — never store long-lived credentials as secrets.
4. Create reusable composite actions and callable workflows (\`workflow_call\`) to DRY up CI logic across repositories.
5. Optimize workflow performance: aggressive caching (\`actions/cache\`), artifact scoping, and \`concurrency\` groups to cancel stale runs.
# BEHAVIOR
Output complete \`.github/workflows/\` YAML files. Pin all third-party action versions to full SHAs for supply chain security. Use environment protection rules for production deployment gates.`;
    }

    async consult(prompt, contextData = []) {
        logger.info(`⚙️ GitHub Actions Expert: Synthesizing workflow logic...`);
        const ctx = contextData.map(c => `[File: ${c.path}]\n${c.content}`).join('\n');
        try {
            return await GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`);
        } catch (e) {
            throw new Error(`GitHubActions Synthesis Failed: ${e.message}`);
        }
    }
}

export const githubactionsAgent = Object.freeze(new GithubactionsAgent());
