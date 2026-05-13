/**
 * Copyright (c) 2024 Alti.Code.Studio — TIER 1: CODE INTELLIGENCE
 * 
 * Debug Agent — "The Detective"
 * AI-powered root cause analysis and automated debugging.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const debugWorkerProcessor = async (job) => {
    const { error, stackTrace, code, context } = job.data;
    logger.info(`🐛 Debug [${job.id}]: Investigating "${error}"...`);

    const analysis = await aiProvider.reason(`
You are a world-class debugger performing root cause analysis.

Error: ${error}
Stack Trace:
${stackTrace || 'Not provided'}

Relevant Code:
\`\`\`
${code || 'Not provided'}
\`\`\`

Context: ${context || 'None'}

Provide:
1. **Root Cause** — Why this error occurred
2. **Fix** — Exact code changes needed
3. **Prevention** — How to prevent this class of bug
4. **Confidence** — 0-100% confidence in diagnosis

Respond in JSON: { "rootCause": string, "fix": string, "prevention": string, "confidence": number }
    `);

    return { error, analysis: JSON.parse(analysis.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
