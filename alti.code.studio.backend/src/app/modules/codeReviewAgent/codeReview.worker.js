/**
 * Copyright (c) 2024 Inso Code — TIER 1: CODE INTELLIGENCE
 *
 * CodeReview Agent — "The Critic"
 * Performs AI-powered code reviews on diffs/files.
 */
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';
import { openCodeReviewService } from './openCodeReview.service.js';

export const codeReviewWorkerProcessor = async job => {
  const {
    code,
    filePath,
    context,
    commitHash,
    from,
    to,
    useOcr = true,
  } = job.data;
  logger.info(`🔍 CodeReview [${job.id}]: Reviewing ${filePath || 'diff'}...`);

  let ocrFeedbackContext = '';
  if (useOcr || commitHash || (from && to)) {
    try {
      logger.info(
        `🔍 CodeReview [${job.id}]: Running Alibaba open-code-review engine...`,
      );
      let ocrResult = '';
      if (commitHash) {
        ocrResult = await openCodeReviewService.reviewCommit(commitHash);
      } else if (from && to) {
        ocrResult = await openCodeReviewService.reviewRange(from, to);
      } else {
        ocrResult = await openCodeReviewService.reviewChanges();
      }

      if (ocrResult) {
        ocrFeedbackContext = `
Additionally, Alibaba's Open-Code-Review engine analyzed these changes and found the following:
=== ALIBABA OPEN-CODE-REVIEW FINDINGS ===
${ocrResult}
=========================================
Please integrate these findings into your review.
`;
      }
    } catch (err) {
      logger.warn(
        `⚠️ [CodeReviewWorker] Open-code-review execution failed: ${err.message}`,
      );
    }
  }

  const review = await aiProvider.reason(`
You are a senior staff engineer performing a code review.

File: ${filePath || 'Unknown'}
Context: ${context || 'General review'}
${ocrFeedbackContext}

Code:
\`\`\`
${code || ''}
\`\`\`

Provide a structured review with:
1. **Critical Issues** (bugs, security flaws, data loss risks)
2. **Improvements** (performance, readability, maintainability)
3. **Style** (naming, formatting, consistency)
4. **Score** (0-100)

Respond in JSON: { "score": number, "critical": [], "improvements": [], "style": [], "summary": string }
    `);

  return {
    filePath,
    review: JSON.parse(review.match(/\{[\s\S]*\}/)?.[0] || '{}'),
  };
};
