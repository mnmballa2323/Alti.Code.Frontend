/**
 * Copyright (c) 2024 Inso Code
 *
 * "The Voice Email Dictator" — Tier 13 Specialist
 * Transcribes and formats spoken email drafts via Fazm.
 */

import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { fazmAgent } from './fazm.agent.js';
import { logger } from '../../../shared/logger.js';

class VoiceEmailDictatorAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'VoiceEmailDictator';
    this.description = 'Voice-Driven Email Dictation & Formatting Specialist';
    this.tier = 'Tier 13';
  }

  async _invoke(context, contextBlock) {
    let text;
    let isDirectInvoke = false;
    let userId = 'default-user';

    if (typeof context === 'object' && context !== null) {
      text = context.text || context.goal || context.query;
      userId = context.userId || context.uid || userId;
      isDirectInvoke = true;
    } else if (typeof context === 'string') {
      text = context;
    }

    if (!text) {
      throw new Error('Voice email dictator requires email dictation text.');
    }

    logger.info(
      `🤖 Voice Email Dictator: Formatting email draft from: "${text.substring(0, 50)}..."`,
    );

    const refinedPrompt = `Listen to or process the vocal email dictation: "${text}". Format this into a highly professional email draft containing a clean Subject Line, Salutation, Body, and Sign-off, and return the completed draft.`;

    try {
      const fazmResponse = await fazmAgent.consult({
        goal: refinedPrompt,
        userId: userId,
      });

      const output =
        typeof fazmResponse === 'string'
          ? JSON.parse(fazmResponse)
          : fazmResponse;

      if (isDirectInvoke) {
        return {
          status: 'success',
          agent: this.name,
          action: 'email-dictation',
          refinedPrompt: refinedPrompt,
          response: output,
          message: `Successfully structured vocal email dictation into a professional draft.`,
        };
      }

      return JSON.stringify(
        {
          status: 'success',
          agent: this.name,
          action: 'email-dictation',
          response: output,
        },
        null,
        2,
      );
    } catch (error) {
      logger.error(
        `❌ Voice Email Dictator: Voice formatting failed: ${error.message}`,
      );
      throw error;
    }
  }
}

export const voiceEmailDictatorAgent = new VoiceEmailDictatorAgent();
