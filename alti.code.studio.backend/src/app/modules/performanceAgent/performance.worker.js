/**
 * Copyright (c) 2024 Inso Code — TIER 2: DATA & INFRASTRUCTURE
 *
 * Performance Agent — "The Optimizer"
 * Profiling, bottleneck detection, and optimization recommendations.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const performanceWorkerProcessor = async job => {
  const { code, metrics, endpoint } = job.data;
  logger.info(
    `⚡ Performance [${job.id}]: Profiling ${endpoint || 'codebase'}...`,
  );

  const analysis = await aiProvider.reason(`
You are a performance engineering expert.

${endpoint ? `Endpoint: ${endpoint}` : ''}
${metrics ? `Current Metrics: ${JSON.stringify(metrics)}` : ''}
${code ? `Code:\n\`\`\`\n${code}\n\`\`\`` : ''}

Provide:
1. **Bottlenecks** — Identified performance issues
2. **Optimizations** — Specific code changes with expected improvement
3. **Caching Strategy** — What to cache and how
4. **Async Opportunities** — What can be parallelized
5. **Memory Analysis** — Memory leak risks

Respond in JSON: { "bottlenecks": [], "optimizations": [], "cachingStrategy": string, "asyncOpportunities": [], "memoryRisks": [] }
    `);

  return { analysis: JSON.parse(analysis.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
