/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { sprintSchedulerService } from '../sprintScheduler/sprintScheduler.service.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * Phase 32: The Metamorphic Core (Self-Rewriting Engine)
 * The ultimate capability: Granting the Swarm permission to profile, refactor,
 * and submit PRs targeting its own Source Code (e.g., the Sprint Orchestrator).
 */
export class MetamorphicCoreService {
    constructor() {
        this.name = 'MetamorphicCoreService';

        // Define the bounds of what the engine is allowed to touch
        this.CORE_TARGETS = [
            'src/app/modules/autonomousSprint/autonomousSprint.service.js',
            'src/app/modules/agents/capability.router.js',
            'src/app/modules/agents/neural.router.js',
            'src/app/modules/sprintScheduler/sprintScheduler.service.js'
        ];
    }

    /**
     * Conducts a self-analysis of core files to determine if refactoring or
     * logic optimization is required based on recent telemetry.
     */
    async commenceSelfReflection() {
        logger.info(`🌀 MetamorphicCore: Initiating self-reflection sequence on CORE_TARGETS...`);

        const repoPath = process.cwd();
        let reflectionFindings = [];

        for (const targetPath of this.CORE_TARGETS) {
            const absolutePath = path.join(repoPath, targetPath);
            try {
                const sourceCode = await fs.readFile(absolutePath, 'utf-8');

                // Truncate to avoid context window explosion on massive files,
                // focusing on the structural logic.
                const prompt = `You are the Inso Code Metamorphic Core.
                Your task is to review your own Source Code for algorithmic bottlenecks, poor error handling,
                or logical flaws that hinder autonomous Swarm orchestration.
                
                Target File: ${targetPath}
                
                Source Code Snippet:
                \`\`\`javascript
                ${sourceCode.substring(0, 5000)}...
                \`\`\`
                
                If you locate a definitive, actionable flaw or bottleneck, output a rigid, one-sentence
                Sprint Goal describing the refactor (e.g., "Refactor autonomousSprint.service.js to parallelize execution steps for 20% latency reduction.").
                If the code is optimal, return exactly "OPTIMAL".
                
                Return ONLY the result string. No markdown fences.`;

                const aiResponse = await GeminiAiService.generateContent(prompt);
                const result = aiResponse.trim();

                if (result !== 'OPTIMAL' && result.length > 20) {
                    reflectionFindings.push({ target: targetPath, goal: result });
                }

            } catch (e) {
                logger.warn(`MetamorphicCore failed to read ${targetPath}: ${e.message}`);
            }
        }

        if (reflectionFindings.length === 0) {
            logger.info(`🌀 MetamorphicCore: Self-reflection complete. Swarm architecture is currently OPTIMAL.`);
            return null;
        }

        logger.warn(`🌀 MetamorphicCore: Self-Reflection discovered ${reflectionFindings.length} architectural mutation(s).`);

        // Inject the highest priority mutation into the Scheduler
        const primaryMutation = reflectionFindings[0];

        // Priority 1 ensures the Swarm immediately attempts to evolve its core
        await sprintSchedulerService.addGoalToBacklog(
            `[METAMORPHIC EVOLUTION]: ${primaryMutation.goal}`,
            1,
            'MetamorphicCore'
        );

        logger.info(`🌀 MetamorphicCore: Mutation injected into Priority 1 Backlog targeting ${primaryMutation.target}.`);

        return primaryMutation;
    }
}

export const metamorphicCoreService = new MetamorphicCoreService();
