import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

/**
 * Performance Auditor Service (The Auditor)
 * Phase 33 Initiative 2: Predictive AST-Level Performance Auditing
 */
export class PerformanceAuditorService {
  constructor() {
    this.name = 'PerformanceAuditorService';
    logger.info('🔍 PerformanceAuditorService initialized.');
  }

  /**
   * Audits the architectural plan during the GUARDIAN phase to detect
   * high-level performance risks and inefficiencies.
   * @param {object} plan The generated sprint plan
   */
  async auditPlan(plan) {
    const prompt = `
Analyze the following implementation plan for severe performance risks.
Are there any obvious O(N^2) patterns, excessive API calls, or architectural memory leaks?

Plan: ${JSON.stringify(plan)}

Return JSON:
{
  "isOptimized": boolean,
  "reason": "If not optimized, explain why here. Otherwise empty."
}
Only JSON, no markdown.`.trim();

    try {
      const raw = await GeminiAiService.generateContent(prompt);
      const cleaned = raw
        .replace(/^```json?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();
      return JSON.parse(cleaned);
    } catch (e) {
      logger.error(`PerformanceAuditor (Plan) failed: ${e.message}`);
      return { isOptimized: true, reason: '' }; // Fail open
    }
  }

  /**
   * Parses the AST of generated code (React cascades, Big-O loops)
   * right before it is executed in the Sandbox.
   * @param {string} codeSnippet The generated code
   */
  async auditAST(codeSnippet) {
    if (!codeSnippet || codeSnippet.length < 10) {
      return { isOptimized: true, reason: '' };
    }

    const prompt = `
You are The Auditor, an expert AST and Big-O complexity analyzer.
Examine the following code snippet for unoptimized algorithms (e.g., O(N^2) nested loops where O(N) is possible), React re-render cascades, or inherent memory leaks.

Code:
\`\`\`
${codeSnippet.substring(0, 3000)}
\`\`\`

Return JSON:
{
  "isOptimized": boolean,
  "reason": "Explain the O(N^2) loop, React cascade, or leak found. Suggest the O(N) fix or memoization fix. Otherwise empty string."
}
Only JSON, no markdown.`.trim();

    try {
      const raw = await GeminiAiService.generateContent(prompt);
      const cleaned = raw
        .replace(/^```json?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();
      const result = JSON.parse(cleaned);
      if (!result.isOptimized) {
        logger.warn(
          `🔍 The Auditor detected unoptimized AST: ${result.reason}`,
        );
      }
      return result;
    } catch (e) {
      logger.error(`PerformanceAuditor (AST) failed: ${e.message}`);
      return { isOptimized: true, reason: '' }; // Fail open
    }
  }
}

export const performanceAuditorService = new PerformanceAuditorService();
