/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import vm from 'vm';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { logger } from '../../../shared/logger.js';
import { simulatorAgent } from '../simulator/simulator.agent.js';

/**
 * Execute untrusted code in a secure sandbox
 * @param {string} code - The code to execute
 * @param {object} context - Global variables to expose
 * @returns {Promise<any>}
 */
const execute = async (code, context = {}) => {
    logger.info('📦 Sandbox: Executing code in isolation...');

    try {
        // 1. Create a safe context with basic test capabilities
        const sandbox = {
            console: {
                log: (...args) => logger.info('[Sandbox Log]', ...args),
                error: (...args) => logger.error('[Sandbox Error]', ...args)
            },
            setTimeout, // Allow basic timing
            clearTimeout,
            URL, // Safe global often needed by scripts
            URLSearchParams, // Safe global often needed by scripts
            require: (moduleName) => {
                if (moduleName === 'assert') {
                    return require('assert');
                }
                throw new Error(`Module '${moduleName}' is not allowed in this sandbox.`);
            },
            ...context
        };

        vm.createContext(sandbox);

        // 2. Execute with limits
        const result = vm.runInContext(code, sandbox, {
            timeout: 5000, // 5 second timeout
            displayErrors: true,
            microtaskMode: 'afterEvaluate' // Prevent infinite promise loops
        });

        logger.info('✅ Sandbox: Execution successful');
        return result;

    } catch (error) {
        logger.error('❌ Sandbox: Execution failed / timed out', error);
        throw new Error(`Sandbox Error: ${error.message}`);
    }
};

// Keep existing methods delegating to Simulator for backward compatibility / other features
const injectChaos = async (targetService, chaosType) => {
    return await simulatorAgent.injectChaos(targetService, chaosType);
};

const loadTest = async (endpoint, rps) => {
    return await simulatorAgent.loadTest(endpoint, rps);
};

export const sandboxService = {
    execute,
    injectChaos,
    loadTest
};

export { execute, injectChaos, loadTest };
export const SimulatorService = sandboxService;
