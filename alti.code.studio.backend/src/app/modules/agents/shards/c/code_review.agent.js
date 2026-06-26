// @ts-check
/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { logger } from '../../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class CodeReviewAgent {
  constructor() {
    this.name = 'codereview';
    this.description = 'Autonomous Quality Control and Senior PR Reviewer';
    this.capabilities = [
      'Audit source code for clean-code principles and style violations',
      'Identify subtle logic errors before they reach production',
      'Output formal structured JSON PR review critiques',
    ];
  }

  /**
   * Executes a strict Senior Engineer level code review on a given payload.
   * @param {string} sourceCode The raw code string to review
   * @param {string} language Context language (e.g. 'javascript', 'python')
   */
  async reviewCode(sourceCode, language = 'javascript') {
    logger.info(
      `🔍 CodeReview Agent: Initiating strict Senior level code review on [${language}] logic...`,
    );

    try {
      const prompt = `
            You are a strict, principle-driven Senior Principal Software Engineer.
            Review the following ${language} code as if it were a Pull Request from a Junior Developer.
            Look for:
            1. Clean Code violations (bad variable names, huge functions, high cyclomatic complexity)
            2. Hardcoded values or lack of modularity
            3. Missing error handling or unhandled promise rejections
            4. Potential subtle logic or off-by-one errors

            Code to Review:
            \`\`\`${language}
            ${sourceCode}
            \`\`\`

            Return your complete review as a strict JSON object:
            {
                "approved": boolean (false if any issues found),
                "qualityScore": number (0-100),
                "summary": "1 sentence overarching thought",
                "critiques": [
                    { "line": "estimated line number or context", "issue": "Description of the problem", "suggestion": "How to fix it" }
                ],
                "refactoredCode": "The completely rewritten, perfect version of the snippet"
            }
            Do not enclose the JSON inside markdown ticks. Return raw JSON.
            `;

      const rawResponse = await GeminiAiService.generateContent(prompt);
      const reportJson = rawResponse
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();
      const reviewReport = JSON.parse(reportJson);

      if (!reviewReport.approved) {
        logger.warn(
          `🛑 CodeReview Agent: PR REJECTED. Quality Score: ${reviewReport.qualityScore}/100.`,
        );
        logger.info(`   Summary: ${reviewReport.summary}`);
        logger.info(`   Issues Found: ${reviewReport.critiques.length}`);
      } else {
        logger.info(
          `✅ CodeReview Agent: PR APPROVED. Quality Score: ${reviewReport.qualityScore}/100.`,
        );
      }

      return reviewReport;
    } catch (err) {
      logger.error(`❌ CodeReview Agent Audit Failed: ${err.message}`);
      throw err;
    }
  }

  async process(state) {
    const code = state.data?.content || state.goal || '';
    const language = state.data?.context || 'javascript';

    const reviewReport = await this.reviewCode(code, language);

    return {
      ...state,
      status: reviewReport.approved ? 'success' : 'blocked',
      results: [
        ...(state.results || []),
        `CodeReview Score: ${reviewReport.qualityScore}/100 - ${reviewReport.summary}`,
      ],
    };
  }
}

export const codeReviewAgent = Object.freeze(new CodeReviewAgent());
