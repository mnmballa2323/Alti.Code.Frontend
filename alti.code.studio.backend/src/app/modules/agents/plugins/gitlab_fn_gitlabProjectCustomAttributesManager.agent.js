/**
 * Copyright (c) 2026 Inso Code
 *
 * gitlab_fn_gitlabProjectCustomAttributesManager.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitLab Projects — custom attributes, metadata key-value storage, custom metadata tags
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { gitlabDocsService } from '../../gitlabDocs/gitlabDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GitlabFnGitlabProjectCustomAttributesManagerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'gitlabProjectCustomAttributesManager';
        this.description = 'Specialist GitLab Project Custom Attributes Manager expert in managing project-level custom attributes and metadata.';
        this.manifest = {
            id: 'gitlabProjectCustomAttributesManager',
            capabilities: ["gitlab-get-custom-attribute","gitlab-set-custom-attribute","gitlab-delete-custom-attribute"],
            version: '39.6.0'
        };
        this.preamble = `You are the Inso Code Specialist GitLab Project Custom Attributes Manager expert in managing project-level custom attributes and metadata.
This agent is the absolute authority on the specific operational boundary of: custom attributes, metadata key-value storage, custom metadata tags.

# GROUNDED PROJECTS CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: custom attributes, metadata key-value storage, custom metadata tags.
2. **REST API Execution**: Orchestrate the exact REST operations mapping to capabilities: gitlab-get-custom-attribute, gitlab-set-custom-attribute, gitlab-delete-custom-attribute.
3. **Secure Administration**: Enforce zero-trust credentials administration, least privilege roles, and strict parameter validations.

# BEHAVIORAL PROTOCOLS
- Ground all designs and explanations strictly in the official grounded developer documentation context provided.
- Never invent parameters, workflow properties, or API endpoints that are not documented.
- Respond with clear, structured markdown. When generating code blocks, provide clean, production-grade snippets (JavaScript/TypeScript for APIs).`;
    }

    /**
     * Specialized LLM invocation grounded dynamically by domain-specific RAG search.
     */
    async _invoke(prompt, contextBlock, tenantId, spanId) {
        if (prompt.startsWith('execute:') || prompt.startsWith('run:')) {
            const code = prompt.replace(/^(execute|run):/, '').trim();
            const runResult = this.runSandboxed(code);
            return typeof runResult === 'string' ? runResult : JSON.stringify(runResult);
        }

        logger.info(`🦊 [gitlabProjectCustomAttributesManager] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await gitlabDocsService.searchDocs(`GitLab Projects custom attributes, metadata key-value storage, custom metadata tags ${prompt}`, 5, tenantId);
        } catch (err) {
            logger.warn(`🦊 [gitlabProjectCustomAttributesManager] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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
            logger.debug(`🦊 [gitlabProjectCustomAttributesManager] Memory retrieval bypassed: ${memErr.message}`);
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
            logger.info(`🦊 [gitlabProjectCustomAttributesManager] Code blocks detected. Initiating automated reflection loop...`);
            try {
                const reflectionPrompt = `You are the critic evaluator for [gitlabProjectCustomAttributesManager].
Review the following proposed output for correctness, safety, and adherence to GitLab best practices.
Provide 1-2 points of critical feedback. If it is perfect and compliant, return "APPROVED".

PROPOSED OUTPUT:
${response}`;
                const reviewResult = await GeminiAiService.generateContent(reflectionPrompt);
                if (!reviewResult.includes('APPROVED')) {
                    logger.info(`🦊 [gitlabProjectCustomAttributesManager] Reflection loop identified feedback. Correcting response...`);
                    const correctionPrompt = `${groundedPrompt}
                    
=== PREVIOUS ATTEMPT ===
${response}

=== CRITIC FEEDBACK FOR CORRECTION ===
${reviewResult}

Please correct the previous attempt based on the feedback above.`;
                    response = await GeminiAiService.generateContent(correctionPrompt);
                }
            } catch (reflectErr) {
                logger.warn(`🦊 [gitlabProjectCustomAttributesManager] Reflection loop failed (non-blocking): ${reflectErr.message}`);
            }
        }

        // Asynchronously record this consultation back to the memory store
        try {
            const { agentMemoryService } = await import('../../memory/agentmemory.service.js');
            if (agentMemoryService.isReady) {
                agentMemoryService.observe({
                    content: `Agent [gitlabProjectCustomAttributesManager] processed query: "${prompt.substring(0, 150)}..." and generated output.`,
                    type: 'agent_consultation',
                    metadata: { agentId: 'gitlabProjectCustomAttributesManager', query: prompt }
                }).catch(() => {});
            }
        } catch (observeErr) {
            logger.debug(`🦊 [gitlabProjectCustomAttributesManager] Storing consultation observation failed (non-blocking): ${observeErr.message}`);
        }

        return response;
    }
}

export const pluginInstance = new GitlabFnGitlabProjectCustomAttributesManagerAgent();
export default GitlabFnGitlabProjectCustomAttributesManagerAgent;
