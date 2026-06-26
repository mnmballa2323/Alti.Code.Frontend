/**
 * Copyright (c) 2024 Inso Code — TIER 1: CODE INTELLIGENCE
 *
 * Architecture Agent — "The Architect"
 * System design review, pattern detection, and architecture recommendations.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const architectureWorkerProcessor = async job => {
  const { codebase, fileTree, question } = job.data;
  logger.info(`🏗️ Architecture [${job.id}]: Analyzing system design...`);

  const analysis = await aiProvider.reason(`
You are a principal software architect reviewing system design.

File Structure:
${fileTree || 'Not provided'}

Codebase Context:
${codebase || 'Not provided'}

Question: ${question || 'Review overall architecture and suggest improvements'}

Provide:
1. **Architecture Style** (monolith, microservice, modular, etc.)
2. **Strengths** — What's well-designed
3. **Weaknesses** — Architectural debt or anti-patterns
4. **Recommendations** — Specific improvements with priority
5. **Diagram** — Mermaid diagram of current/proposed architecture

Respond in JSON: { "style": string, "strengths": [], "weaknesses": [], "recommendations": [], "mermaidDiagram": string }
    `);

  return { analysis: JSON.parse(analysis.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
