/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

export class ArchitectureAgent {
  constructor() {
    this.name = 'architecture';
    this.description = 'Autonomous System Architect and Pattern Analyzer';
    this.capabilities = [
      'Parse directory structures and module import maps',
      'Identify anti-patterns, tight-coupling, and SOLID violations',
      'Synthesize raw data into formal Mermaid.js architecture diagrams',
    ];
  }

  /**
   * Analyzes a repository's structure and generates an architectural assessment and visual graph.
   * @param {string} structureData JSON representation of the directory structure or dependency graph
   * @param {string} componentName The specific subsystem to graph (e.g. 'Billing API')
   */
  async mapArchitecture(structureData, componentName = 'System') {
    logger.info(
      `🏗️ Architecture Agent: Initiating macro-analysis of [${componentName}] topological data...`,
    );

    try {
      const prompt = `
            You are a Principal Software Architect.
            Analyze the following filesystem/dependency graph for a subsystem named "${componentName}".
            Identify architectural anti-patterns (like circular dependencies or severe domain-coupling).
            
            Structure Data:
            \`\`\`json
            ${structureData}
            \`\`\`
            
            Return a pure JSON architectural audit:
            {
                "assessment": "Brief sentence assessing the overall health of this topology",
                "antiPatterns": ["Array of identified architecture flaws, or 'None'"],
                "mermaidGraph": "A valid Mermaid.js graph chart (e.g. graph TD) visually representing the component relationships.",
                "complexityScore": number (1-10, 10 being impossibly tangled)
            }
            Do not enclose the top-level output in markdown code ticks. Ensure the inner "mermaidGraph" string uses correct Mermaid syntax but no ticks.
            `;

      const rawResponse = await GeminiAiService.generateContent(prompt);
      const reportJson = rawResponse
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();
      const architectureReport = JSON.parse(reportJson);

      logger.info(
        `🏗️ Architecture Agent: Mapping complete. Complexity: ${architectureReport.complexityScore}/10.`,
      );
      if (
        architectureReport.antiPatterns.length > 0 &&
        architectureReport.antiPatterns[0] !== 'None'
      ) {
        logger.warn(
          `   Anti-Patterns Detected: ${architectureReport.antiPatterns.join(', ')}`,
        );
      }

      return architectureReport;
    } catch (err) {
      logger.error(`❌ Architecture Agent Mapping Failed: ${err.message}`);
      throw err;
    }
  }

  async process(state) {
    const data = state.data?.content || state.goal || '';
    const component = state.data?.context || 'Agent Pipeline';

    const report = await this.mapArchitecture(data, component);

    return {
      ...state,
      status: 'success',
      results: [
        ...(state.results || []),
        `Architecture Complexity: ${report.complexityScore}/10`,
      ],
    };
  }
}

export const architectureAgent = new ArchitectureAgent();
