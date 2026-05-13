import { GoogleGenAiService } from '../googleGenAi/googleGenAi.service.js';
import { GoogleSearchService } from '../googleSearch/googleSearch.service.js';
import { ragService } from '../memory/rag.service.js';
import { logger } from '../../../shared/logger.js';
import crypto from 'crypto';

class ResearchService {
    /**
     * Executes an autonomous "Deep Research" workflow.
     * 1. Analyzes the objective.
     * 2. Formulates highly specific search queries based on the requested depth.
     * 3. Executes parallel Google Search Grounding to surf the live internet.
     * 4. Integrates internal RAG context (for 'exhaustive' depth).
     * 5. Synthesizes a comprehensive, citation-rich markdown report.
     * 
     * @param {string} objective - The research goal
     * @param {string} depth - 'quick' (1 query), 'deep' (3 queries), 'exhaustive' (5 queries + RAG)
     */
    async executeDeepResearch(objective, depth = 'deep') {
        logger.info(`🔬 [Deep Research] Commencing ${depth.toUpperCase()} research on: "${objective.substring(0, 50)}..."`);
        
        const startTime = Date.now();
        const jobId = `RES-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
        
        // Determine search bounds based on depth
        let numQueries = 3;
        if (depth === 'quick') numQueries = 1;
        if (depth === 'exhaustive') numQueries = 5;

        // 1. Generate Search Queries
        logger.info(`🔬 [Deep Research] Phase 1: Formulating search strategies...`);
        const queryPrompt = `You are an expert technical researcher. Formulate exactly ${numQueries} highly specific Google search queries to investigate the following objective: "${objective}".
        
        Rules:
        - Return ONLY a JSON array of strings. No markdown formatting.
        - Ensure queries cover different angles (e.g., technical implementation, security implications, industry best practices).`;

        let searchQueries = [objective];
        try {
            if (numQueries > 1) {
                const queryResponse = await GoogleGenAiService.generateContent(queryPrompt, 'gemini-2.5-flash', 0.2);
                const cleaned = queryResponse.content.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim();
                searchQueries = JSON.parse(cleaned);
                if (!Array.isArray(searchQueries)) throw new Error('Not an array');
                // Ensure we don't exceed the requested count
                searchQueries = searchQueries.slice(0, numQueries);
            }
        } catch (e) {
            logger.warn(`⚠️ [Deep Research] Search formulation failed, falling back to original objective. ${e.message}`);
            searchQueries = [objective];
        }

        logger.info(`🔬 [Deep Research] Phase 2: Surfing the live web for ${searchQueries.length} queries in parallel...`);
        
        // 2. Execute Google Search Grounding in Parallel
        const searchPromises = searchQueries.map(async (query) => {
            const context = await GoogleSearchService.getSearchContext(query);
            return { query, context };
        });

        // 2b. If 'exhaustive', inject Enterprise Codebase Memory
        if (depth === 'exhaustive') {
            searchPromises.push(
                ragService.query(objective, 5).then(context => ({
                    query: 'Internal Codebase Memory & Architectural RAG',
                    context: context || 'No internal memory found.'
                })).catch(e => ({ query: 'Internal Memory', context: `Failed: ${e.message}` }))
            );
        }

        const rawResults = await Promise.all(searchPromises);
        
        // 3. Assemble the massive context payload
        let aggregatedContext = '';
        rawResults.forEach((res, i) => {
            aggregatedContext += `\n\n=== SOURCE ${i + 1}: [QUERY: ${res.query}] ===\n${res.context}\n`;
        });

        logger.info(`🔬 [Deep Research] Phase 3: Synthesizing ${aggregatedContext.length} chars of gathered intelligence...`);

        // 4. Synthesize the Final Markdown Report using Gemini 3.1 Pro
        const synthesisPrompt = `You are an elite, autonomous Principal Engineer and Security Auditor conducting a deep research investigation.
        
        OBJECTIVE: "${objective}"
        
        Below is the massive intelligence gathered from live web surfing (Google Search Grounding) and internal enterprise memory:
        ${aggregatedContext}
        
        YOUR TASK:
        Write a comprehensive, professional-grade Research Report in Markdown.
        
        Structure your report EXACTLY as follows:
        # Research Report: [Title based on objective]
        
        ## Executive Summary
        (A high-level summary of the findings and bottom-line recommendations.)
        
        ## Technical Analysis & Findings
        (Deep dive into the specific data. Use subsections, bullet points, and code blocks if applicable. Compare trade-offs if relevant.)
        
        ## Security & Architectural Implications
        (What does this mean for the system? Identify risks, zero-trust implications, and architectural constraints.)
        
        ## Action Plan
        (A numbered list of concrete, executable steps the engineering swarm should take next based on these findings.)
        
        ## Sources & Citations
        (List the sources of information you relied on from the provided intelligence context.)
        
        RULES:
        - Write in an authoritative, deeply technical, and professional tone.
        - NEVER hallucinate. Ground your findings STRICTLY in the provided intelligence context.
        - Ensure flawless Markdown formatting.`;

        const reportResponse = await GoogleGenAiService.generateContent(synthesisPrompt, 'gemini-3.1-pro', 0.2);
        
        const durationMs = Date.now() - startTime;
        logger.info(`✅ [Deep Research] Completed successfully in ${durationMs}ms`);

        return {
            id: jobId,
            title: objective,
            status: "completed",
            date: new Date().toISOString(),
            depth,
            content: reportResponse.content,
            metadata: {
                durationMs,
                queriesExecuted: searchQueries.length,
                contextSize: aggregatedContext.length
            }
        };
    }
}

export const researchService = new ResearchService();
