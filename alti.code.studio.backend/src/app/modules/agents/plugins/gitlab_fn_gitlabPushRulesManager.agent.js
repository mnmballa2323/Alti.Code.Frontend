/**
 * Copyright (c) 2026 Inso Code
 *
 * gitlab_fn_gitlabPushRulesManager.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitLab Security & Compliance — push rules, commit message regex, author email validation
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { gitlabDocsService } from '../../gitlabDocs/gitlabDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GitlabFnGitlabPushRulesManagerAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'gitlabPushRulesManager';
        this.description = 'Specialist GitLab Push Rules Manager expert in push rules configuration and compliance regex checks.';
        this.manifest = {
            id: 'gitlabPushRulesManager',
            capabilities: ["gitlab-get-push-rules","gitlab-create-push-rule"],
            version: '39.6.0'
        };
        this.preamble = `You are the Inso Code Specialist GitLab Push Rules Manager expert in push rules configuration and compliance regex checks.
This agent is the absolute authority on the specific operational boundary of: push rules, commit message regex, author email validation.

# GROUNDED SECURITY & COMPLIANCE CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: push rules, commit message regex, author email validation.
2. **REST API Execution**: Orchestrate the exact REST operations mapping to capabilities: gitlab-get-push-rules, gitlab-create-push-rule.
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
        logger.info(`🦊 [gitlabPushRulesManager] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await gitlabDocsService.searchDocs(`GitLab Security & Compliance push rules, commit message regex, author email validation ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🦊 [gitlabPushRulesManager] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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
            logger.debug(`🦊 [gitlabPushRulesManager] Memory retrieval bypassed: ${memErr.message}`);
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
            logger.info(`🦊 [gitlabPushRulesManager] Code blocks detected. Initiating automated reflection loop...`);
            try {
                const reflectionPrompt = `You are the critic evaluator for [gitlabPushRulesManager].
Review the following proposed output for correctness, safety, and adherence to GitLab best practices.
Provide 1-2 points of critical feedback. If it is perfect and compliant, return "APPROVED".

PROPOSED OUTPUT:
${response}`;
                const reviewResult = await GeminiAiService.generateContent(reflectionPrompt);
                if (!reviewResult.includes('APPROVED')) {
                    logger.info(`🦊 [gitlabPushRulesManager] Reflection loop identified feedback. Correcting response...`);
                    const correctionPrompt = `${groundedPrompt}
                    
=== PREVIOUS ATTEMPT ===
${response}

=== CRITIC FEEDBACK FOR CORRECTION ===
${reviewResult}

Please correct the previous attempt based on the feedback above.`;
                    response = await GeminiAiService.generateContent(correctionPrompt);
                }
            } catch (reflectErr) {
                logger.warn(`🦊 [gitlabPushRulesManager] Reflection loop failed (non-blocking): ${reflectErr.message}`);
            }
        }

        // Asynchronously record this consultation back to the memory store
        try {
            const { agentMemoryService } = await import('../../memory/agentmemory.service.js');
            if (agentMemoryService.isReady) {
                agentMemoryService.observe({
                    content: `Agent [gitlabPushRulesManager] processed query: "${prompt.substring(0, 150)}..." and generated output.`,
                    type: 'agent_consultation',
                    metadata: { agentId: 'gitlabPushRulesManager', query: prompt }
                }).catch(() => {});
            }
        } catch (observeErr) {
            logger.debug(`🦊 [gitlabPushRulesManager] Storing consultation observation failed (non-blocking): ${observeErr.message}`);
        }

        return response;
    }
}

export const pluginInstance = new GitlabFnGitlabPushRulesManagerAgent();
export default GitlabFnGitlabPushRulesManagerAgent;
