/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from './logger.js';
import { GeminiAiService } from '../app/modules/gemini/gemini.service.js';

export class ReverserAgent {
    constructor() {
        this.name = 'TheReverser';
        logger.info('⚙️ ReverserAgent: Native Machine-Code Decompiler initialized.');
    }

    /**
     * Simulates intercepting a native segmentation fault (`SIGSEGV`) and reverse-engineering the crash.
     * @param {string} processName Name of the crashed binary or module
     * @param {string} rawAssemblyDump The raw x86 assembly pulled from the core dump surrounding the crash.
     */
    async decompileNativeCrash(processName, rawAssemblyDump) {
        logger.error(`⚙️ ReverserAgent: Intercepted fatal SIGSEGV (Segmentation Fault) in native module [${processName}].`);
        logger.info(`⚙️ ReverserAgent: Extracting core dump assembly and initializing Gemini Decompiler...`);

        try {
            const explanation = await this._translateMachineCode(processName, rawAssemblyDump);
            logger.info(`✅ ReverserAgent: Binary successfully translated to logical intent.`);

            return {
                status: 'success',
                module: processName,
                plainTextExplanation: explanation
            };
        } catch (error) {
            logger.error(`⚙️ ReverserAgent: Failed to decompile binary: ${error.message}`);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    /**
     * Queries Gemini to act as a Cybersecurity Reverse Engineer.
     */
    async _translateMachineCode(processName, rawAssembly) {
        const prompt = `You are an elite C++/Rust Reverse Engineer and Security Analyst. 
        A Node.js native addon (${processName}) just crashed with a Segmentation Fault.
        
        This is the raw x86_64 assembly extracted from the core dump right at the faulting instruction pointer (RIP):
        \`\`\`assembly
        ${rawAssembly}
        \`\`\`
        
        Analyze the registers and instructions. Explain exactly what caused the crash in 1-2 concise, plain-English sentences suitable for a JavaScript developer who does not know assembly. Focus on the logical flaw (e.g., buffer overflow, null pointer dereference).`;

        const response = await GeminiAiService.generateContent(prompt);
        return response.trim();
    }
}

export const reverserAgent = new ReverserAgent();
