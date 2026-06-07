/**
 * Copyright (c) 2024 Inso Code — TIER 2: DATA & INFRASTRUCTURE
 * 
 * Cost Agent — "The Accountant"
 * Cloud cost optimization and resource right-sizing.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const costWorkerProcessor = async (job) => {
    const { infrastructure, usage, provider } = job.data;
    logger.info(`💰 Cost [${job.id}]: Analyzing cloud costs for ${provider || 'cloud'}...`);

    const analysis = await aiProvider.reason(`
You are a cloud FinOps expert. Analyze infrastructure costs and recommend savings.

Cloud Provider: ${provider || 'AWS/GCP/Azure'}
Infrastructure: ${JSON.stringify(infrastructure || {})}
Usage Patterns: ${JSON.stringify(usage || {})}

Provide:
1. **Current Cost Estimate** — Monthly TCO
2. **Waste Identified** — Over-provisioned or idle resources
3. **Right-Sizing** — Specific instance/resource changes
4. **Reserved/Spot Opportunities** — Commitment savings
5. **Projected Savings** — Percentage and dollar amount

Respond in JSON: { "currentCost": string, "waste": [], "rightSizing": [], "savings": [], "projectedSavings": string }
    `);

    return { analysis: JSON.parse(analysis.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
