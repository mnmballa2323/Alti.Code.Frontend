/**
 * Copyright (c) 2024 Alti.Code.Studio — TIER 1: CODE INTELLIGENCE
 * 
 * CodeReview Agent — "The Critic"
 * Performs AI-powered code reviews on diffs/files.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

export const codeReviewWorkerProcessor = async (job) => {
    const { code, filePath, context } = job.data;
    logger.info(`🔍 CodeReview [${job.id}]: Reviewing ${filePath || 'diff'}...`);

    const review = await aiProvider.reason(`
You are a senior staff engineer performing a code review.

File: ${filePath || 'Unknown'}
Context: ${context || 'General review'}

Code:
\`\`\`
${code}
\`\`\`

Provide a structured review with:
1. **Critical Issues** (bugs, security flaws, data loss risks)
2. **Improvements** (performance, readability, maintainability)
3. **Style** (naming, formatting, consistency)
4. **Score** (0-100)

Respond in JSON: { "score": number, "critical": [], "improvements": [], "style": [], "summary": string }
    `);

    return { filePath, review: JSON.parse(review.match(/\{[\s\S]*\}/)?.[0] || '{}') };
};
