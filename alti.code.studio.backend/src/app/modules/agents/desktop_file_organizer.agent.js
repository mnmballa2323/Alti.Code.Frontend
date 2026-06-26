/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Desktop File Organizer" — Tier 13 Specialist
 * Automates system file explorer GUI file management tasks via Simular Agent S.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { agentSAgent } from './agent_s.agent.js';
import { logger } from '../../../shared/logger.js';

class DesktopFileOrganizerAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'DesktopFileOrganizer';
    this.description = 'The Desktop File & Folder Organizer Specialist';
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
        'Desktop file organizer requires a goal or organization strategy.',
      );
    }

    logger.info(
      `🤖 Desktop File Organizer: Translating file organization intent: "${goal}"`,
    );

    const refinedGUIPrompt = `Open the desktop system file manager (Finder or File Explorer), locate the target folder matching "${goal}", sort files by extensions or category dates, create sub-directories as appropriate, and move files to organize the directory structure.`;

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
          action: 'file-organize',
          refinedPrompt: refinedGUIPrompt,
          guiResponse: output,
          message: `Successfully executed desktop file organization GUI workflow.`,
        };
      }

      return JSON.stringify(
        {
          status: 'success',
          agent: this.name,
          action: 'file-organize',
          guiResponse: output,
        },
        null,
        2,
      );
    } catch (error) {
      logger.error(
        `❌ Desktop File Organizer: Automation failed: ${error.message}`,
      );
      throw error;
    }
  }
}

export const desktopFileOrganizerAgent = new DesktopFileOrganizerAgent();
