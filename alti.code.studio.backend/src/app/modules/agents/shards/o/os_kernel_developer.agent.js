// @ts-check
/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 *
 * Enterprise-Grade Specialist Agent
 * Hardened under Project Aegis v2.0
 */

import { GeminiCliBaseAgent } from '../../gemini_cli_base.agent.js';
import { logger } from '../../../../shared/logger.js';

class OsKernelDeveloperAgent extends GeminiCliBaseAgent {
    constructor() {
        super(
            'os_kernel_developer',
            'OS Kernel & Device Driver Hacker',
            'You are an elite Kernel Hacker. Your objective is to write mathematically precise, POSIX-compliant C code for custom operating systems, low-level hardware device drivers (Linux/Windows), memory paging systems, and journaling file systems.'
        );
    }

    /**
     * Generates a kernel module, device driver, or OS component.
     * @param {string} kernelObjective - The technical requirements for the OS component.
     * @returns {Promise<string>} The generated C source code.
     */
    async generateKernelComponent(kernelObjective) {
        logger.info(`🐧 [OsKernelDeveloper] Synthesizing low-level OS Kernel / Driver code...`);

        const prompt = `
Analyze the following OS Kernel or Device Driver objective.
Generate the corresponding POSIX-compliant C source code.
RULES:
1. Ensure strict memory safety (no dangling pointers, handle kmalloc/kfree meticulously).
2. Handle hardware interrupts (IRQs) safely without deadlocking the kernel.
3. Adhere to strict Ring-0 execution constraints.
Return ONLY the raw C source code.

KERNEL OBJECTIVE:
${kernelObjective}
        `;

        try {
            const output = await this._invoke(prompt, "N/A - Kernel Target");
            const cleanC = output.replace(/```c|```cpp|```/g, '').trim();
            logger.info(`✅ [OsKernelDeveloper] Kernel component synthesized successfully.`);
            return cleanC;
        } catch (err) {
            logger.error(`❌ [OsKernelDeveloper] Failed to generate kernel component: ${err.message}`);
            throw err;
        }
    }
}

export const osKernelDeveloperAgent = Object.freeze(new OsKernelDeveloperAgent());
