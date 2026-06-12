/**
 * Copyright (c) 2026 Inso Code
 *
 * gitlab_fn_gitlabRegistryCleanupManager.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitLab Packages & Registry — bulk registry tags deletion, retention policies execution
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { gitlabDocsService } from '../../gitlabDocs/gitlabDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GitlabFnGitlabRegistryCleanupManagerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'gitlabRegistryCleanupManager';
        this.description = 'Specialist GitLab Registry Cleanup Manager expert in bulk docker tag cleanup cycles.';
        this.manifest = {
            id: 'gitlabRegistryCleanupManager',
            capabilities: ["gitlab-bulk-delete-registry-tags"],
            version: '39.6.0'
        };
        this.preamble = `You are the Inso Code Specialist GitLab Registry Cleanup Manager expert in bulk docker tag cleanup cycles.
This agent is the absolute authority on the specific operational boundary of: bulk registry tags deletion, retention policies execution.

# GROUNDED PACKAGES & REGISTRY CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: bulk registry tags deletion, retention policies execution.
2. **REST API Execution**: Orchestrate the exact REST operations mapping to capabilities: gitlab-bulk-delete-registry-tags.
3. **Secure Administration**: Enforce zero-trust credentials administration, least privilege roles, and strict parameter validations.

# BEHAVIORAL PROTOCOLS
- Ground all designs and explanations strictly in the official grounded developer documentation context provided.
- Never invent parameters, workflow properties, or API endpoints that are not documented.
- Respond with clear, structured markdown. When generating code blocks, provide clean, production-grade snippets (JavaScript/TypeScript for APIs).`;
    }

    /**
     * Specialized LLM invocation grounded dynamically by domain-specific RAG search.
     */
    async _invoke(prompt, contextBlock) {
        logger.info(`🦊 [gitlabRegistryCleanupManager] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await gitlabDocsService.searchDocs(`GitLab Packages & Registry bulk registry tags deletion, retention policies execution ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🦊 [gitlabRegistryCleanupManager] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
        }

        let memoryContext = '';
        try {
            const { agentMemoryService } = await import('../../memory/agentmemory.service.js');
            if (agentMemoryService.isReady) {
                const recentMemories = await agentMemoryService.smartSearch({
                    query: prompt,
                    limit: 3
                });
                if (recentMemories && recentMemories.documents) {
                    memoryContext = recentMemories.documents.map(d => `- Memory: ${d}`).join('\n');
                }
            }
        } catch (memErr) {
            logger.debug(`🦊 [gitlabRegistryCleanupManager] Memory retrieval bypassed: ${memErr.message}`);
        }

        const groundedPrompt = `${this.preamble}

=== GROUNDED DEVELOPER DOCUMENTATION CONTEXT ===
${docsContext || 'No documentation found in local RAG vector store.'}

=== SPECIALIST HISTORICAL MEMORIES ===
${memoryContext || 'No historical memories found for this context.'}

=== ADDITIONAL CONTEXT ===
${contextBlock || 'No additional file context provided.'}

=== REQUEST ===
${prompt}`;

        let response = await GeminiAiService.generateContent(groundedPrompt);

        // Reflection self-correction loop (1-pass review and correction if code blocks are present)
        if (response.includes('```') && !prompt.includes('no-reflect')) {
            logger.info(`🦊 [gitlabRegistryCleanupManager] Code blocks detected. Initiating automated reflection loop...`);
            try {
                const reflectionPrompt = `You are the critic evaluator for [gitlabRegistryCleanupManager].
Review the following proposed output for correctness, safety, and adherence to GitLab best practices.
Provide 1-2 points of critical feedback. If it is perfect and compliant, return "APPROVED".

PROPOSED OUTPUT:
${response}`;
                const reviewResult = await GeminiAiService.generateContent(reflectionPrompt);
                if (!reviewResult.includes('APPROVED')) {
                    logger.info(`🦊 [gitlabRegistryCleanupManager] Reflection loop identified feedback. Correcting response...`);
                    const correctionPrompt = `${groundedPrompt}
                    
=== PREVIOUS ATTEMPT ===
${response}

=== CRITIC FEEDBACK FOR CORRECTION ===
${reviewResult}

Please correct the previous attempt based on the feedback above.`;
                    response = await GeminiAiService.generateContent(correctionPrompt);
                }
            } catch (reflectErr) {
                logger.warn(`🦊 [gitlabRegistryCleanupManager] Reflection loop failed (non-blocking): ${reflectErr.message}`);
            }
        }

        // Asynchronously record this consultation back to the memory store
        try {
            const { agentMemoryService } = await import('../../memory/agentmemory.service.js');
            if (agentMemoryService.isReady) {
                agentMemoryService.observe({
                    content: `Agent [gitlabRegistryCleanupManager] processed query: "${prompt.substring(0, 150)}..." and generated output.`,
                    type: 'agent_consultation',
                    metadata: { agentId: 'gitlabRegistryCleanupManager', query: prompt }
                }).catch(() => {});
            }
        } catch (observeErr) {
            logger.debug(`🦊 [gitlabRegistryCleanupManager] Storing consultation observation failed (non-blocking): ${observeErr.message}`);
        }

        return response;
    }
}

export const pluginInstance = new GitlabFnGitlabRegistryCleanupManagerAgent();
export default GitlabFnGitlabRegistryCleanupManagerAgent;
