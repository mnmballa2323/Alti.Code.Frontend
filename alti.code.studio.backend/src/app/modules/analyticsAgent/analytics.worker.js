/**
 * Copyright (c) 2024 Inso Code — TIER 4: OPERATIONS
 * 
 * Analytics Agent — "The Oracle"
 * Data analytics, trend detection, and insight generation.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const analyticsWorkerProcessor = async (job) => {
    const { data, question, timeRange } = job.data;
    logger.info(`📊 Analytics [${job.id}]: Analyzing "${question || 'data trends'}"...`);

    const insights = await aiProvider.reason(`
You are a data analyst. Analyze the provided data and generate insights.

Question: ${question || 'What are the key trends and anomalies?'}
Time Range: ${timeRange || 'Last 30 days'}
Data:
${JSON.stringify(data || {}, null, 2)}

Provide:
1. **Key Metrics** — Important numbers and their meaning
2. **Trends** — What's going up, down, or staying flat
3. **Anomalies** — Unusual patterns that need attention
4. **Predictions** — What to expect next
5. **Recommendations** — Actions to take based on data

Respond in JSON: { "metrics": [], "trends": [], "anomalies": [], "predictions": [], "recommendations": [] }
    `);

    return { insights: JSON.parse(insights.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
