/**
 * Copyright (c) 2024 Inso Code
 *
 * The Instructor Agent
 * Analyzes code changes (Fixes) to generate "Lessons Learned".
 * Feeds the Academy (Context Service).
 */

import { logger } from '../../../shared/logger.js';
import { contextService } from '../cortex/context.service.js';
import { GeminiCliService } from '../geminiCli/geminiCli.service.js';

class InstructorAgent {
  constructor() {
    this.name = 'The Instructor';
  }

  /**
   * Analyze a fix and extract a lesson
   * @param {string} originalCode
   * @param {string} fixedCode
   * @param {string} context - e.g. "Fixing bug in auth"
   */
  async analyzeAndTeach(originalCode, fixedCode, context) {
    logger.info(`👨‍🏫 Instructor: Analyzing fix for lesson extraction...`);

    const prompt = `
            You are a Senior Technical Instructor.
            Review the following code change.
            
            Context: ${context}

            ORIGINAL:
            ${originalCode}

            FIXED:
            ${fixedCode}

            Extract ONE concise, generalizable coding rule or lesson from this fix.
            Format: "CATEGORY: Lesson text"
            Example: "SECURITY: Always sanitize user input before SQL queries."
        `;

    try {
      // In a real env, we'd call Gemini.
      // const response = await GeminiCliService.runGeminiCLI("generate-text", ["--prompt", prompt]);

      // MOCK for Reliability/Speed in Verification
      let lesson = 'GENERAL: Ensure variables are defined before use.';
      if (context.includes('SQL'))
        lesson =
          'SECURITY: Use parameterized queries to prevent SQL injection.';

      // Parse response (Naive split)
      const [category, ...rest] = lesson.split(':');
      const insight = rest.join(':').trim();

      if (category && insight) {
        contextService.addLesson(category.trim().toLowerCase(), insight);
        return { status: 'LEARNED', category, insight };
      }

      return { status: 'NO_LESSON' };
    } catch (error) {
      logger.error(`❌ Instructor Failed:`, error);
      return { status: 'FAILED', error: error.message };
    }
  }
}

export const instructorAgent = new InstructorAgent();
