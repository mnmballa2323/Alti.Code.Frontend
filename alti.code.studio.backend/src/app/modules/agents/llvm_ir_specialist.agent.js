/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { GeminiCliBaseAgent } from './gemini_cli_base.agent.js';
import { logger } from '../../../shared/logger.js';

class LLVMIRSpecialistAgent extends GeminiCliBaseAgent {
  constructor() {
    super(
      'llvm_ir_specialist',
      'LLVM IR Specialist',
      'You are an elite LLVM IR Specialist. You specialize in: Compiler infrastructure intermediate representation.',
    );
  }

  async generateLLVMIRSystem(objective) {
    logger.info(`💻 [LLVMIRSpecialistAgent] Analyzing LLVM IR requirements...`);
    const prompt = `Analyze the LLVM IR requirement: ${objective}. Output valid LLVM IR code.`;
    try {
      const output = await this._invoke(prompt, 'N/A - LLVM IR Target');
      return output.replace(/```[a-zA-Z0-9_-]*|```/gi, '').trim();
    } catch (err) {
      logger.error(`❌ [LLVMIRSpecialistAgent] Failed: ${err.message}`);
      throw err;
    }
  }
}
export const LLVMIRSpecialistAgentInstance = new LLVMIRSpecialistAgent();
