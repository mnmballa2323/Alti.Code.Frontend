/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { queueService } from '../queue/queue.service.js';

/** Minimum characters required for a code snippet to be refactorable. */
const MIN_CODE_LENGTH = 10;
/** Maximum characters accepted to avoid massive queue payloads. */
const MAX_CODE_LENGTH = 50_000;

const refactorCode = async (
  codeSnippet,
  instruction,
  userId = 'system',
  sessionId = 'refactor-session',
) => {
  // ---- Input Validation ----
  if (!codeSnippet || typeof codeSnippet !== 'string') {
    throw new Error(
      'RefactorAgent: codeSnippet is required and must be a string.',
    );
  }
  if (codeSnippet.length < MIN_CODE_LENGTH) {
    throw new Error(
      `RefactorAgent: codeSnippet is too short (min ${MIN_CODE_LENGTH} chars).`,
    );
  }
  if (codeSnippet.length > MAX_CODE_LENGTH) {
    throw new Error(
      `RefactorAgent: codeSnippet exceeds max length (${MAX_CODE_LENGTH} chars). Split into smaller chunks.`,
    );
  }
  if (
    !instruction ||
    typeof instruction !== 'string' ||
    instruction.trim().length === 0
  ) {
    throw new Error(
      'RefactorAgent: instruction is required and must be a non-empty string.',
    );
  }

  logger.info(
    `🚀 RefactorAgent: Queueing job — "${instruction.substring(0, 60)}" (${codeSnippet.length} chars)`,
  );

  try {
    const job = await queueService.addJob('refactor-queue', {
      codeSnippet,
      instruction,
      userId,
      sessionId,
    });

    if (!job) {
      throw new Error(
        'Failed to enqueue refactor job — queueService returned null.',
      );
    }

    logger.info(`✅ RefactorAgent: Job Queued [${job.id}]`);

    return {
      jobId: job.id,
      status: 'queued',
      message: `Refactoring job queued successfully. Poll GET /api/v1/queue/status/${job.id} for results.`,
      estimatedWaitMs: null, // Can be populated by queue depth logic in the future
    };
  } catch (error) {
    logger.error('RefactorAgent: Failed to queue job', error);
    throw error;
  }
};

export const RefactorAgentService = {
  refactorCode,
};
