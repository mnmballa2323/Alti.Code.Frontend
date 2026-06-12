/**
 * Copyright (c) 2026 Inso Code
 *
 * gitlab_fn_gitlabSnippetsExporter.agent.js — Swarm Marketplace Dynamic Specialist Plugin
 * Specialized agent for GitLab Snippets — downloading raw snippet contents, exporting snippets
 */

import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';
import { gitlabDocsService } from '../../gitlabDocs/gitlabDocs.service.js';
import { logger } from '../../../../shared/logger.js';

class GitlabFnGitlabSnippetsExporterAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'gitlabSnippetsExporter';
        this.description = 'Specialist GitLab Snippets Exporter expert in downloading raw snippet payloads.';
        this.manifest = {
            id: 'gitlabSnippetsExporter',
            capabilities: ["gitlab-get-snippet-raw"],
            version: '39.6.0'
        };
        this.preamble = `You are the Inso Code Specialist GitLab Snippets Exporter expert in downloading raw snippet payloads.
This agent is the absolute authority on the specific operational boundary of: downloading raw snippet contents, exporting snippets.

# GROUNDED SNIPPETS CAPABILITIES
1. **Domain Focus**: Provide highly accurate and precise developer guidance strictly within the scope of: downloading raw snippet contents, exporting snippets.
2. **REST API Execution**: Orchestrate the exact REST operations mapping to capabilities: gitlab-get-snippet-raw.
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
        logger.info(`🦊 [gitlabSnippetsExporter] Grounding specialized query in ingested developer docs: "${prompt.substring(0, 60)}..."`);
        
        let docsContext = '';
        try {
            // Retrieve domain-specific documentation chunks
            docsContext = await gitlabDocsService.searchDocs(`GitLab Snippets downloading raw snippet contents, exporting snippets ${prompt}`, 5);
        } catch (err) {
            logger.warn(`🦊 [gitlabSnippetsExporter] Failed to query RAG documentation. Fallback used. Error: ${err.message}`);
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
            logger.debug(`🦊 [gitlabSnippetsExporter] Memory retrieval bypassed: ${memErr.message}`);
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
            logger.info(`🦊 [gitlabSnippetsExporter] Code blocks detected. Initiating automated reflection loop...`);
            try {
                const reflectionPrompt = `You are the critic evaluator for [gitlabSnippetsExporter].
Review the following proposed output for correctness, safety, and adherence to GitLab best practices.
Provide 1-2 points of critical feedback. If it is perfect and compliant, return "APPROVED".

PROPOSED OUTPUT:
${response}`;
                const reviewResult = await GeminiAiService.generateContent(reflectionPrompt);
                if (!reviewResult.includes('APPROVED')) {
                    logger.info(`🦊 [gitlabSnippetsExporter] Reflection loop identified feedback. Correcting response...`);
                    const correctionPrompt = `${groundedPrompt}
                    
=== PREVIOUS ATTEMPT ===
${response}

=== CRITIC FEEDBACK FOR CORRECTION ===
${reviewResult}

Please correct the previous attempt based on the feedback above.`;
                    response = await GeminiAiService.generateContent(correctionPrompt);
                }
            } catch (reflectErr) {
                logger.warn(`🦊 [gitlabSnippetsExporter] Reflection loop failed (non-blocking): ${reflectErr.message}`);
            }
        }

        // Asynchronously record this consultation back to the memory store
        try {
            const { agentMemoryService } = await import('../../memory/agentmemory.service.js');
            if (agentMemoryService.isReady) {
                agentMemoryService.observe({
                    content: `Agent [gitlabSnippetsExporter] processed query: "${prompt.substring(0, 150)}..." and generated output.`,
                    type: 'agent_consultation',
                    metadata: { agentId: 'gitlabSnippetsExporter', query: prompt }
                }).catch(() => {});
            }
        } catch (observeErr) {
            logger.debug(`🦊 [gitlabSnippetsExporter] Storing consultation observation failed (non-blocking): ${observeErr.message}`);
        }

        return response;
    }
}

export const pluginInstance = new GitlabFnGitlabSnippetsExporterAgent();
export default GitlabFnGitlabSnippetsExporterAgent;
