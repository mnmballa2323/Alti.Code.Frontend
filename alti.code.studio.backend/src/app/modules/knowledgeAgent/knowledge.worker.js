/**
 * Copyright (c) 2024 Inso Code — TIER 4: OPERATIONS
 *
 * Knowledge Agent — "The Librarian"
 * Knowledge base management, RAG retrieval, context building.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const knowledgeWorkerProcessor = async job => {
  const { query, documents, operation } = job.data;
  logger.info(
    `📚 Knowledge [${job.id}]: ${operation || 'Retrieving'} "${query}"...`,
  );

  const result = await aiProvider.reason(`
You are a knowledge management expert. Process the following request.

Operation: ${operation || 'retrieve'}
Query: ${query}
Available Documents:
${JSON.stringify(documents || [], null, 2)}

If operation is "retrieve": Find the most relevant information and synthesize an answer.
If operation is "index": Summarize and categorize the documents for future retrieval.
If operation is "explain": Explain the concept in simple terms with examples.

Respond in JSON: { "answer": string, "sources": [], "confidence": number, "relatedTopics": [] }
    `);

  return { knowledge: JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
