/**
 * Copyright (c) 2026 Inso Code
 *
 * gitlab_fn_gitlabCrossSwarmCollaborator.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitLab Administration & OAuth — cross-platform replication, syncing pipelines, issues, and merge requests between GitHub and GitLab
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { gitlabDocsService } from '../../gitlabDocs/gitlabDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GitlabFnGitlabCrossSwarmCollaboratorAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'gitlabCrossSwarmCollaborator';
        this.description = 'Specialist GitLab Cross-Swarm Collaborator expert in syncing and bridging workflows, repositories, and issues between GitHub and GitLab.';
        this.manifest = {
            id: 'gitlabCrossSwarmCollaborator',
            capabilities: ["gitlab-github-sync","cross-swarm-collaboration"],
            version: '39.6.0'
        };
        this.preamble = `You are the Inso Code Specialist GitLab Cross-Swarm Collaborator expert in syncing and bridging workflows, repositories, and issues between GitHub and GitLab.
This agent is the absolute authority on the specific operational boundary of: cross-platform replication, syncing pipelines, issues, and merge requests between GitHub and GitLab.

# GROUNDED ADMINISTRATION & OAUTH CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: cross-platform replication, syncing pipelines, issues, and merge requests between GitHub and GitLab.
2. **REST API Execution**: Orchestrate the exact REST operations mapping to capabilities: gitlab-github-sync, cross-swarm-collaboration.
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
        logger.info(`🦊 [gitlabCrossSwarmCollaborator] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await gitlabDocsService.searchDocs(`GitLab Administration & OAuth cross-platform replication, syncing pipelines, issues, and merge requests between GitHub and GitLab ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🦊 [gitlabCrossSwarmCollaborator] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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
            logger.debug(`🦊 [gitlabCrossSwarmCollaborator] Memory retrieval bypassed: ${memErr.message}`);
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
            logger.info(`🦊 [gitlabCrossSwarmCollaborator] Code blocks detected. Initiating automated reflection loop...`);
            try {
                const reflectionPrompt = `You are the critic evaluator for [gitlabCrossSwarmCollaborator].
Review the following proposed output for correctness, safety, and adherence to GitLab best practices.
Provide 1-2 points of critical feedback. If it is perfect and compliant, return "APPROVED".

PROPOSED OUTPUT:
${response}`;
                const reviewResult = await GeminiAiService.generateContent(reflectionPrompt);
                if (!reviewResult.includes('APPROVED')) {
                    logger.info(`🦊 [gitlabCrossSwarmCollaborator] Reflection loop identified feedback. Correcting response...`);
                    const correctionPrompt = `${groundedPrompt}
                    
=== PREVIOUS ATTEMPT ===
${response}

=== CRITIC FEEDBACK FOR CORRECTION ===
${reviewResult}

Please correct the previous attempt based on the feedback above.`;
                    response = await GeminiAiService.generateContent(correctionPrompt);
                }
            } catch (reflectErr) {
                logger.warn(`🦊 [gitlabCrossSwarmCollaborator] Reflection loop failed (non-blocking): ${reflectErr.message}`);
            }
        }

        // Asynchronously record this consultation back to the memory store
        try {
            const { agentMemoryService } = await import('../../memory/agentmemory.service.js');
            if (agentMemoryService.isReady) {
                agentMemoryService.observe({
                    content: `Agent [gitlabCrossSwarmCollaborator] processed query: "${prompt.substring(0, 150)}..." and generated output.`,
                    type: 'agent_consultation',
                    metadata: { agentId: 'gitlabCrossSwarmCollaborator', query: prompt }
                }).catch(() => {});
            }
        } catch (observeErr) {
            logger.debug(`🦊 [gitlabCrossSwarmCollaborator] Storing consultation observation failed (non-blocking): ${observeErr.message}`);
        }

        return response;
    }
}

export const pluginInstance = new GitlabFnGitlabCrossSwarmCollaboratorAgent();
export default GitlabFnGitlabCrossSwarmCollaboratorAgent;
