/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { parentPort, workerData } from 'worker_threads';
// Import Gemini. Note: Since this is an isolated process, the singleton might reinitialize
// or require environment vars to be passed if outside the main Node tick.
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';

async function executeAgentTask() {
  try {
    const { id, prompt } = workerData;

    // Execute the AI generation independently on this thread
    const resultString = await GeminiAiService.generateContent(prompt);

    // Send the payload back to the Swarm orchestrator
    parentPort.postMessage({ success: true, id, data: resultString });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
}

// Execute immediately upon worker boot
executeAgentTask();
