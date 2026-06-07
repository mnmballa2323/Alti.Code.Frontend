/**
 * Copyright (c) 2026 Inso Code — TIER 1: CODE INTELLIGENCE
 * 
 * openCodeReview.service.js — Wrapper Service for Alibaba's open-code-review
 */

import { exec } from 'child_process';
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
        const cmd = `npx ocr ${args.join(' ')}`;
        logger.info(`🔍 [OpenCodeReviewService] Running command: ${cmd}`);

        // Set environment variables for the CLI to use our LiteLLM gateway
        const env = {
            ...process.env,
            OCR_LLM_URL: `${this.litellmUrl}/v1`,
            OCR_LLM_TOKEN: process.env.GEMINI_API_KEY || 'dummy-token',
            OCR_LLM_MODEL: config.gcp.model_name || 'gemini-3.1-pro',
        };

        return new Promise((resolve, reject) => {
            exec(cmd, { env }, (error, stdout, stderr) => {
                if (error) {
                    logger.error(`❌ [OpenCodeReviewService] Command failed: ${stderr || error.message}`);
                    reject(new Error(stderr || error.message));
                } else {
                    logger.info(`✅ [OpenCodeReviewService] Command completed successfully.`);
                    resolve(stdout);
                }
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
