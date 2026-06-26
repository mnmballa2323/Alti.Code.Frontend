/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Figma GUI Exporter" — Tier 13 Specialist
 * Automates Figma desktop app GUI interactions via Simular Agent S.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentSAgent } from './agent_s.agent.js';
import { logger } from '../../../shared/logger.js';

class FigmaExporterAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'FigmaExporter';
    this.description = 'The Figma GUI Asset Exporter Specialist';
    this.tier = 'Tier 13';
  }

  async _invoke(context, contextBlock) {
    let goal;
    let isDirectInvoke = false;

    if (typeof context === 'object' && context !== null) {
      goal = context.goal || context.task;
      isDirectInvoke = true;
    } else if (typeof context === 'string') {
      goal = context;
    }

    if (!goal) {
      throw new Error(
        'Figma exporter requires a goal description or asset name.',
      );
    }

    logger.info(
      `🤖 Figma Exporter: Translating figma export intent: "${goal}"`,
    );

    const refinedGUIPrompt = `Open the Figma desktop application, locate the project file matching "${goal}", find the exportable frame/asset, click 'Export', and save it to the downloads folder.`;

    try {
      const guiResponse = await agentSAgent.consult({
        goal: refinedGUIPrompt,
        dryRun: context.dryRun !== undefined ? context.dryRun : true,
        maxSteps: context.maxSteps || 10,
      });

      const output =
        typeof guiResponse === 'string' ? JSON.parse(guiResponse) : guiResponse;

      if (isDirectInvoke) {
        return {
          status: 'success',
          agent: this.name,
          action: 'figma-export',
          refinedPrompt: refinedGUIPrompt,
          guiResponse: output,
          message: `Successfully executed Figma asset export GUI workflow.`,
        };
      }

      return JSON.stringify(
        {
          status: 'success',
          agent: this.name,
          action: 'figma-export',
          guiResponse: output,
        },
        null,
        2,
      );
    } catch (error) {
      logger.error(`❌ Figma Exporter: Automation failed: ${error.message}`);
      throw error;
    }
  }
}

export const figmaExporterAgent = new FigmaExporterAgent();
