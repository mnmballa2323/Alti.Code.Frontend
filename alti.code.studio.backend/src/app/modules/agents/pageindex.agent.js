/**
 * Copyright (c) 2024 Inso Code
 *
 * PAGEINDEX AGENT — Vectorless Reasoning RAG
 * Uses VectifyAI/PageIndex for document Q&A without vector databases.
 * MIT License — https://github.com/VectifyAI/PageIndex
 *
 * Tier 13 Specialist Agent — Document Intelligence
 * Handles: PDF/doc Q&A, codebase navigation, document comparison,
 * knowledge extraction, citation-rich answers from large document sets.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { pageIndexService } from '../openclaw/pageindex.service.js';
import { logger } from '../../../shared/logger.js';

class PageIndexAgent extends BaseSpecialistAgent {
    constructor() {
        super('PageIndexAgent', 'The Document Intelligence Engine', 'Tier 13');
        this.name = 'PageIndex_RAG_Expert';
        this.description = 'Vectorless, reasoning-based document retrieval. Index and query any document collection (PDFs, code, docs) without vector databases. Returns answers with page-level citations. Powered by VectifyAI/PageIndex.';
        this.preamble = `You are the Document Intelligence Engine, powered by PageIndex's vectorless reasoning RAG system.

**What Makes You Different:**
- **No vectors required** — You reason natively at the page level using LLMs
- **Page-level citations** — Every answer includes exact page provenance
- **Reasoning-based** — You understand document structure, not just keyword matches
- **Fast indexing** — Documents are indexed in seconds without embeddings
- **Context-aware** — You understand relationships across pages and sections

**Ideal Use Cases:**
1. **Code documentation Q&A** — "What does the authentication middleware do?"
2. **PDF research** — "Summarize the methodology section with citations"
3. **Multi-document comparison** — "What's different between v1 and v2 specs?"
4. **Compliance documents** — "Which pages cover GDPR data retention requirements?"
5. **Technical specifications** — "List all API endpoints with their parameters"
6. **Meeting notes** — "What action items were assigned to the backend team?"

**How to Use:**
- Point me at a file path and ask your question
- I'll index it and return a cited, page-level answer
- Use follow-up questions for deeper exploration`;
    }

    async _invoke(prompt, contextBlock) {
        logger.info(`📑 PageIndex RAG: Processing document intelligence request...`);

        const caps = pageIndexService.getCapabilities();

        // Try to extract document path from the prompt
        const pathMatch = prompt.match(/(?:file|document|path|index)[:=\s]+["']?([^\s"']+\.[a-z]{2,5})["']?/i);
        const docPath = pathMatch ? pathMatch[1] : null;

        if (docPath && caps.available) {
            try {
                const queryText = prompt.replace(pathMatch[0], '').trim();
                logger.info(`[pageindex-agent] Document: ${docPath}, Query: ${queryText.slice(0, 80)}`);

                const result = await pageIndexService.indexAndQuery(docPath, queryText || prompt);
                if (result.status === 'success') {
                    const citationsStr = (result.citations || [])
                        .map(c => `  [p.${c.page}] ${c.snippet}`)
                        .join('\n');
                    return `**Answer:**\n${result.answer}\n\n**Citations:**\n${citationsStr || 'No specific citations retrieved.'}`;
                }
            } catch (err) {
                logger.warn(`[pageindex-agent] Indexing failed: ${err.message}. Using Gemini fallback.`);
            }
        }

        // If no document specified or PageIndex unavailable, answer with document intelligence preamble
        return GeminiAiService.generateContent(
            `${this.preamble}\n\nContext: ${contextBlock || ''}\n\nUser Request: ${prompt}\n\n` +
            `(Note: To use vectorless RAG, specify a document path like: "Index /path/to/doc.pdf and answer: your question")`
        );
    }
}

export const pageIndexAgent = new PageIndexAgent();
