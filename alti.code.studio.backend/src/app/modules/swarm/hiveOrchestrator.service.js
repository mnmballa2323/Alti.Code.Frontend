import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';

/**
 * Alti Hive Orchestrator
 * Recursively breaks down massive epics and delegates tasks to Tri-Cloud micro-agents.
 */
const executeSwarm = async (userId, sessionId, epicPrompt) => {
    logger.info(`🐝 [Alti Hive] Starting Swarm Orchestrator for Epic: ${epicPrompt.substring(0, 50)}...`);

    try {
        // Step 1: The Hive Queen (GPT-5.5) breaks down the epic into micro-tasks
        const breakdownPrompt = `You are the Hive Queen. Break down the following epic into exactly 3 highly specific micro-tasks. 
Format your output as a strict JSON array of objects with "taskName", "description", and "assignedModel" (choose strictly from: 'claude-3-5-sonnet', 'gemini-1.5-pro-002', 'gpt-5.5').
Assign architecture to claude, logic to gemini, and security/edge-cases to gpt-5.5.
Epic: ${epicPrompt}

Output ONLY valid JSON.`;

        const rawBreakdown = await LlmGatewayService.routeCompletion(
            userId,
            sessionId,
            breakdownPrompt,
            'gpt-5.5',
            'Swarm'
        );

        // Sanitize the JSON output natively
        const jsonMatch = rawBreakdown.reply.match(/\[\s*\{.*\}\s*\]/s);
        if (!jsonMatch) throw new Error('Failed to parse Hive Queen JSON breakdown.');
        const tasks = JSON.parse(jsonMatch[0]);
        
        logger.info(`🐝 [Alti Hive] Hive Queen (GPT-5.5) identified ${tasks.length} micro-tasks.`);

        // Step 2: Spawn sub-agents in parallel across the Tri-Cloud (Upgraded for Infinite Swarm Concurrency)
        logger.info(`🐝 [Alti Hive] Upgrading concurrency to handle ${tasks.length} sub-agents...`);
        const workerResults = [];
        const CHUNK_SIZE = 5; // To avoid cloud provider rate limits

        for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
            const chunk = tasks.slice(i, i + CHUNK_SIZE);
            logger.info(`🚀 [Alti Hive] Launching Swarm Cluster ${i / CHUNK_SIZE + 1} (${chunk.length} agents)...`);
            
            const chunkPromises = chunk.map(async (task) => {
                logger.info(`🤖 [Hive Worker] Executing task: ${task.taskName} on ${task.assignedModel}`);
                
                const workerPrompt = `You are an autonomous Alti Hive worker executing a sub-task.
Task Name: ${task.taskName}
Task Description: ${task.description}
Epic Context: ${epicPrompt}

Execute your task flawlessly and return the exact output/code/architecture.`;

                const result = await LlmGatewayService.routeCompletion(
                    userId, sessionId, workerPrompt, task.assignedModel, 'SwarmWorker'
                );

                return { task: task.taskName, model: task.assignedModel, result: result.reply };
            });

            const chunkResults = await Promise.all(chunkPromises);
            workerResults.push(...chunkResults);
        }

        logger.info(`🐝 [Alti Hive] All swarm clusters completed their tasks. Commencing final Hive consolidation.`);

        // Step 3: The Hive Queen consolidates the outputs
        const consolidationPrompt = `You are the Hive Queen. Consolidate the outputs of your workers into the final, cohesive product.
Workers:
${JSON.stringify(workerResults, null, 2)}

Provide the flawless, finalized epic solution based on their work.`;

        const finalProduct = await LlmGatewayService.routeCompletion(
            userId,
            sessionId,
            consolidationPrompt,
            'gpt-5.5',
            'Swarm'
        );

        logger.info(`✅ [Alti Hive] Swarm orchestration successful.`);
        return finalProduct.reply;

    } catch (error) {
        logger.error(`❌ [Alti Hive] Swarm orchestration critically failed:`, error);
        throw error;
    }
};

export const HiveOrchestratorService = {
    executeSwarm
};
