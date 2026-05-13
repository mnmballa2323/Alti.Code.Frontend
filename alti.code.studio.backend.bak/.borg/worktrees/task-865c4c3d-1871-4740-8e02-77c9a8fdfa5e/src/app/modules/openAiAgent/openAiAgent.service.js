/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// ==================================================
// services/agentService.js
// ==================================================

import { openAiAgent } from './openAiAgent.agent.js';

const RunProgrammerAgent = async ({ prompt, contextSources = [] }) => {
  // Directly call the run method on our custom agent model
  const result = await openAiAgent.ProgrammerAgentModel.run(prompt);

  console.log(result, 'result in service');
  return { output: result };
};

export const openAiService = { RunProgrammerAgent };
