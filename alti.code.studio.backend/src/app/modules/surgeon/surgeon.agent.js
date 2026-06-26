/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Surgeon" - Deep Code Refactoring & Transformation Agent
 * Responsible for applying patterns, simplifying complex code, and transplanting logic.
 */
import fs from 'fs/promises';
import path from 'path';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

class SurgeonAgent {
  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Apply a specific design pattern or refactoring to a file
   * @param {string} filePath
   * @param {string} pattern e.g. "Singleton", "Factory", "Extract Method"
   * @param {string} context Additional instructions
   */
  async applyPattern(filePath, pattern, context = '') {
    logger.info(`⚕️ Surgeon: Applying ${pattern} to ${filePath}...`);

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
        You are "The Surgeon", a Refactoring Specialist.
        TASK: Refactor this code to apply the "${pattern}" pattern.
        Context/Instructions: ${context}
        
        CODE:
        ${content}

        Requirements:
        1. Maintain existing logic (functional equivalence).
        2. Improve readability and structure.
        3. Return ONLY the full refactored code.
        `;

    const response = await aiProvider.generate(prompt);
    const refactoredCode = response
      .replace(/^```(javascript|js|ts)?|```$/g, '')
      .trim();

    // In a real scenario, we might want to write to a temp file or backup.
    // For this implementation, we overwrite (Agentic Mode usually implies direct action, but we'll log it).
    await fs.writeFile(
      path.resolve(this.projectRoot, filePath),
      refactoredCode,
    );

    return { status: 'success', file: filePath, pattern };
  }

  /**
   * Analyze code complexity and suggest simplifications
   * @param {string} filePath
   */
  async analyzeComplexity(filePath) {
    logger.info(`⚕️ Surgeon: Analyzing complexity of ${filePath}...`);

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
        You are "The Surgeon".
        TASK: Analyze this code for Cyclomatic Complexity and Cognitive Load.
        
        CODE:
        ${content}

        OUTPUT JSON:
        {
            "complexity_score": number (1-100),
            "verdict": "Healthy" | "Complex" | "Critical",
            "hotspots": ["functionName..."],
            "simplification_plan": "Extract method X, use early returns in Y..."
        }
        `;

    const response = await aiProvider.reason(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    return jsonMatch
      ? JSON.parse(jsonMatch[0])
      : { complexity_score: 0, verdict: 'Unknown' };
  }
}

export const surgeonAgent = new SurgeonAgent();
