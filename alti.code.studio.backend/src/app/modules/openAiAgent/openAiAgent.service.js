/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { openAiAgent } from './openAiAgent.agent.js';
import { logger } from '../../../shared/logger.js';

/**
 * Run the ProgrammerAgent with the given prompt.
 * @param {{ prompt: string, contextSources?: string[] }} params
 * @returns {Promise<{ output: any }>}
 */
const RunProgrammerAgent = async ({ prompt, contextSources = [] }) => {
  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('OpenAiService: prompt must be a non-empty string.');
  }
  // Use logger instead of console.log to avoid leaking full AI output to stdout in production
  const result = await openAiAgent.ProgrammerAgentModel.run(prompt);
  logger.debug('OpenAiService: ProgrammerAgentModel result received.');
  return { output: result };
};

export const openAiService = { RunProgrammerAgent };
