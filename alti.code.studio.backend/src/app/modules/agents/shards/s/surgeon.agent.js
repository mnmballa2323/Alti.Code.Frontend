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
import { BaseSpecialistAgent } from '../../base_specialist.agent.js';

export class SurgeonAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'surgeon';
    this.description = 'Autonomic Core Mutator and Self-Healing Routine';
    this.capabilities = [
      'Parse internal IDE configurations and core agent logic',
      'Determine cognitive logic deficits or missing configuration parameters',
      'Synthesize a safe AST rewrite payload granting the system self-improvement capabilities',
    ];
    // Omni-Economy Taxonomy
    this.taxonomy = {
      practiceGroup: 'Cybersecurity',
      interpreter: 'English',
      engineer: 'JavaScript/AST'
    };
  }

  /**
   * Required by BaseSpecialistAgent.
   */
  async _invoke(prompt, contextData, tenantId, spanId) {
    let fileContent = '// Unknown Core File';
    let mutationGoal = prompt || 'Self-Optimize Logic';

    if (Array.isArray(contextData)) {
      const fileCtx = contextData.find(ctx => ctx.path && !ctx.path.includes('tenantId'));
      if (fileCtx) fileContent = fileCtx.content;
    } else if (contextData && typeof contextData === 'object') {
      fileContent = contextData.content || fileContent;
    }

    const report = await this.synthesizeMutation(fileContent, mutationGoal);
    return JSON.stringify(report);
  }

  /**
   * Examines a core internal file and proposes a self-improvement source mutation.
   */
  async synthesizeMutation(internalFileContent, mutationGoal) {
    logger.warn(
      `🔪 Surgeon Agent Alert: Initiating Autonomic Surgery protocol. Analyzing core logic file...`,
    );
    logger.warn(`   Mutation Objective: [${mutationGoal}]`);

    try {
      const prompt = `
            You are the "Surgeon", a Meta-AI capable of modifying its own source code.
            Analyze your internal system file below and modify it to achieve the Mutation Goal.

            Mutation Goal: ${mutationGoal}

            Core Source File:
            \`\`\`
            ${internalFileContent}
            \`\`\`

            Return your findings as a strict JSON report containing the patch.
            {
                "surgeryJustification": "A brief explanation of WHY you are rewriting the core logic.",
                "mutationRiskLevel": "LOW | MEDIUM | HIGH | CATASTROPHIC",
                "patchedInternalCode": "The fully mutated Javascript source code, with the new capability integrated."
            }
            Do not wrap the JSON output in markdown formatting.
            `;

      const rawResponse = await GeminiAiService.generateContent(prompt);
      const reportJson = rawResponse
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();
      const surgeryReport = JSON.parse(reportJson);

      logger.info(
        `🔪 Surgeon Agent: Surgery planned. Risk Level assessed at [${surgeryReport.mutationRiskLevel}].`,
      );
      logger.info(`   Justification: ${surgeryReport.surgeryJustification}`);

      return surgeryReport;
    } catch (err) {
      logger.error(`❌ Surgeon Agent Mutation Failed: ${err.message}`);
      throw err;
    }
  }

  async process(state) {
    const fileContent = state.data?.content || '// Unknown Core File';
    const goal = state.data?.context || state.goal || 'Self-Optimize Logic';

    const report = await this.synthesizeMutation(fileContent, goal);

    return {
      ...state,
      status: 'success',
      results: [
        ...(state.results || []),
        `Core Mutation Ready [Risk: ${report.mutationRiskLevel}]`,
      ],
    };
  }
}

export const surgeonAgent = Object.freeze(new SurgeonAgent());
