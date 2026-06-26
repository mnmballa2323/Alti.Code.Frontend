/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Janitor" - Technical Debt & Maintenance Agent
 * Responsible for cleaning up unused code, aggregating TODOs, and general hygiene.
 */
import fs from 'fs/promises';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

class JanitorAgent {
  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Sweep code for unused imports/variables and suggestions
   * @param {string} filePath
   */
  async sweepCode(filePath) {
    logger.info(`🧹 Janitor: Sweeping ${filePath}...`);

    let content;
    try {
      content = await fs.readFile(
        path.resolve(this.projectRoot, filePath),
        'utf-8',
      );
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }

    const prompt = `
        You are "The Janitor", a Code Hygiene Expert.
        TASK: Analyze this code for unused imports, unused variables, and unreachable code.
        
        CODE:
        ${content}

        OUTPUT JSON:
        {
            "unused_imports": ["..."],
            "unused_vars": ["..."],
            "cleaned_code": "..." (The full code with unused items removed - BE CAREFUL not to break logic)
        }
        `;

    const response = await aiProvider.reason(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { cleaned_code: content };

    const result = JSON.parse(jsonMatch[0]);

    // In a real agent, we might auto-save 'cleaned_code' if confidence is high.
    // For now, we return it for review.
    return result;
  }

  /**
   * Aggregate TODOs and FIXMEs from a file
   * @param {string} filePath
   */
  async aggregateTodos(filePath) {
    logger.info(`🧹 Janitor: Looking for TODOs in ${filePath}...`);

    let content;
    try {
      content = await fs.readFile(
        path.resolve(this.projectRoot, filePath),
        'utf-8',
      );
    } catch (error) {
      throw new Error(`File not found: ${filePath}`);
    }

    const todos = [];
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('TODO') || line.includes('FIXME')) {
        todos.push({
          line: index + 1,
          type: line.includes('FIXME') ? 'FIXME' : 'TODO',
          text: line.trim(),
        });
      }
    });

    return { filePath, todos };
  }
}

export const janitorAgent = new JanitorAgent();
