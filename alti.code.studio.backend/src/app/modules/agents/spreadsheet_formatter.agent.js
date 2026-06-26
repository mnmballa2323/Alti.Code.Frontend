/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Spreadsheet GUI Formatter" — Tier 13 Specialist
 * Automates local desktop spreadsheet application layouts via Simular Agent S.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentSAgent } from './agent_s.agent.js';
import { logger } from '../../../shared/logger.js';

class SpreadsheetFormatterAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'SpreadsheetFormatter';
    this.description = 'The Spreadsheet GUI Formatting Specialist';
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
      throw new Error('Spreadsheet formatter requires a goal or instructions.');
    }

    logger.info(
      `🤖 Spreadsheet Formatter: Translating formatting intent: "${goal}"`,
    );

    const refinedGUIPrompt = `Open the spreadsheet application, locate the active spreadsheet file, find the target cells and apply the formatting rules matching "${goal}" (adjusting alignments, header fonts, or cell borders), and save the file.`;

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
          action: 'spreadsheet-format',
          refinedPrompt: refinedGUIPrompt,
          guiResponse: output,
          message: `Successfully executed spreadsheet formatting GUI workflow.`,
        };
      }

      return JSON.stringify(
        {
          status: 'success',
          agent: this.name,
          action: 'spreadsheet-format',
          guiResponse: output,
        },
        null,
        2,
      );
    } catch (error) {
      logger.error(
        `❌ Spreadsheet Formatter: Automation failed: ${error.message}`,
      );
      throw error;
    }
  }
}

export const spreadsheetFormatterAgent = new SpreadsheetFormatterAgent();
