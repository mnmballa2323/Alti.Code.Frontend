/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */


import Sandbox from '@nyariv/sandboxjs';
import { logger } from '../../../shared/logger.js';

class SandboxService {
    /**
     * Ececute untrusted code in a secure sandbox
     * @param {string} code - The code to execute
     * @param {object} context - Context variables to expose to the sandbox
     * @returns {Promise<any>}
     */
    async execute(code, context = {}) {
        logger.info('📦 Sandbox: Preparing execution...');

        try {
            // Create a new sandbox instance
            const sandbox = new Sandbox();

            // Execute the code
            // We wrap it in an async function to allow await usage in snippets if needed
            // But SandboxJS executes synchronously by default unless we use specialized methods.
            // Let's assume simple JS execution for now.

            const result = sandbox.compile(code)(context);

            logger.info('✅ Sandbox: Execution successful');
            return result;
        } catch (error) {
            logger.error('❌ Sandbox: Execution failed', error);
            throw new Error(`Sandbox Execution Failed: ${error.message}`);
        }
    }
}

export const sandboxService = new SandboxService();
