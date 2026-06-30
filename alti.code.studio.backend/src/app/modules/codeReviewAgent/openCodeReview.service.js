/**
 * Copyright (c) 2026 Inso Code — TIER 1: CODE INTELLIGENCE
 *
 * openCodeReview.service.js — Wrapper Service for Alibaba's open-code-review
 */

import { spawn } from 'child_process';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

class OpenCodeReviewService {
  constructor() {
    this.litellmUrl = config.litellm_url || 'http://localhost:4000';
  }

  /**
   * Executes the open-code-review (ocr) CLI command.
   * Maps all LLM queries securely to our local LiteLLM / Vertex gateway to respect Tri-Cloud strategy.
   */
  _executeOcr(args = []) {
    logger.info(
      `🔍 [OpenCodeReviewService] Running: npx ocr ${args.join(' ')}`,
    );

    // Set environment variables for the CLI to use our LiteLLM gateway
    const env = {
      ...process.env,
      OCR_LLM_URL: `${this.litellmUrl}/v1`,
      OCR_LLM_TOKEN: process.env.GEMINI_API_KEY || 'dummy-token',
      OCR_LLM_MODEL: config.azure.model_name || 'gpt-5.4',
    };

    return new Promise((resolve, reject) => {
      const child = spawn('npx', ['ocr', ...args], { env });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        stdout += data;
      });

      child.stderr.on('data', data => {
        stderr += data;
      });

      child.on('close', code => {
        if (code !== 0) {
          logger.error(
            `❌ [OpenCodeReviewService] Command failed with code ${code}: ${stderr}`,
          );
          reject(new Error(stderr || `Command failed with code ${code}`));
        } else {
          logger.info(
            `✅ [OpenCodeReviewService] Command completed successfully.`,
          );
          resolve(stdout);
        }
      });

      child.on('error', err => {
        logger.error(
          `❌ [OpenCodeReviewService] Command error: ${err.message}`,
        );
        reject(err);
      });
    });
  }

  /**
   * Reviews the current staged/unstaged changes in the repository.
   */
  async reviewChanges() {
    return this._executeOcr(['review']);
  }

  /**
   * Reviews the changes between two specific git references (commits/branches).
   */
  async reviewRange(from, to) {
    return this._executeOcr(['review', '--from', from, '--to', to]);
  }

  /**
   * Reviews a specific git commit.
   */
  async reviewCommit(commitHash) {
    return this._executeOcr(['review', '--commit', commitHash]);
  }
}

export const openCodeReviewService = new OpenCodeReviewService();
