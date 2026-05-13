/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { logger } from '../../../shared/logger.js';
import { DebugAgentService } from '../debugAgent/debugAgent.service.js';
import { RefactorAgentService } from '../refactorAgent/refactorAgent.service.js';
import { sandboxService } from '../shadowWorkspace/sandbox.service.js';
import path from 'path';
import fs from 'fs/promises';

export class OverseerAgent {
    constructor() {
        this.name = 'The Overseer';
        logger.info('👁️ OverseerAgent: CI/CD Self-Healing Monitor online.');
    }

    /**
     * Executes a build or lint command and attempts to automatically patch it if it fails.
     * @param {string} command The command to execute (e.g., 'npm run lint')
     * @param {string} workingDir The directory to run the command in
     */
    async executeAndHeal(command, workingDir) {
        logger.info(`👁️ Overseer: Executing command "${command}" in ${workingDir}`);

        try {
            const output = await this._runShellCommand(command, workingDir);
            logger.info('👁️ Overseer: Command succeeded. No healing required.');
            return {
                status: 'success',
                output,
                healed: false
            };
        } catch (errorOutput) {
            logger.warn('👁️ Overseer: Command failed! Initiating self-healing protocol...');

            // Auto-heal protocol
            const patchResult = await this._attemptAutoHeal(errorOutput, workingDir);

            if (patchResult.success) {
                logger.info('👁️ Overseer: Self-healing successful. Re-verifying pipeline...');
                try {
                    const finalOutput = await this._runShellCommand(command, workingDir);
                    return {
                        status: 'success',
                        output: finalOutput,
                        healed: true,
                        patchDetails: patchResult.patch
                    };
                } catch (secondaryError) {
                    logger.error('👁️ Overseer: Re-verification failed after patch.');
                    return {
                        status: 'failed',
                        output: secondaryError,
                        healed: false,
                        failedAfterPatch: true
                    };
                }
            } else {
                logger.error('👁️ Overseer: Self-healing failed or was not applicable.');
                return {
                    status: 'failed',
                    output: errorOutput,
                    healed: false
                };
            }
        }
    }

    /**
     * Analyzes CI/CD stack trace and applies fixes to the impacted files.
     */
    async _attemptAutoHeal(errorLog, workingDir) {
        logger.info('👁️ Overseer: Extracting error details for Debug/Refactor Agents...');

        try {
            // First, invoke the DebugAgent to get the patched code
            // We use a mock stack trace or extract it cleanly
            const debugResult = await DebugAgentService.analyzeError(errorLog, errorLog, 'system', 'overseer-session');

            if (debugResult && debugResult.patchedCode) {
                // If DebugAgent identified a fix, we try to locate the file and apply it.
                // For a highly autonomous system, we might need the agent to specify the file.
                // Since analyzeError returns patchedCode without explicit file targets often,
                // we'll use RefactorAgent as a fallback if file specific extraction fails,
                // but let's assume we can parse it or the debugResult has insights.

                logger.info(`👁️ Overseer: DebugAgent suggested a patch for Severity: ${debugResult.bugSeverity}`);

                // TODO: For complete implementation, we need the exact file path.
                // We'll extract the first file path found in the error log.
                const impactedFile = this._extractFilePathFromLog(errorLog, workingDir);

                if (impactedFile) {
                    logger.info(`👁️ Overseer: Applying patch to ${impactedFile}`);
                    await fs.writeFile(impactedFile, debugResult.patchedCode, 'utf8');
                    return { success: true, patch: 'Applied DebugAgent patch' };
                } else {
                    logger.warn('👁️ Overseer: Could not confidently extract file path from error log.');
                }
            }
        } catch (error) {
            logger.error('👁️ Overseer: Failed during automated debugging:', error);
        }

        return { success: false };
    }

    /**
     * Executes raw code strings in a Shadow Workspace (vm.runInContext sandbox) and auto-heals upon error.
     * @param {string} code The JS code snippet string
     */
    async executeInSandboxAndHeal(code) {
        logger.info(`👁️ Overseer: Executing code in Sandbox...`);
        let currentCode = code;

        try {
            const result = await sandboxService.execute(currentCode);
            logger.info('👁️ Overseer: Sandbox execution succeeded. No healing required.');
            return { status: 'success', result, healed: false, finalCode: currentCode };
        } catch (error) {
            logger.warn(`👁️ Overseer: Sandbox execution failed! Initiating self-healing protocol...`);

            // Auto-heal protocol for generic string
            const debugResult = await DebugAgentService.analyzeError(error.message || error.toString(), currentCode, 'system', 'overseer-sandbox');

            if (debugResult && debugResult.patchedCode) {
                logger.info(`👁️ Overseer: DebugAgent suggested a patch within Sandbox.`);
                currentCode = debugResult.patchedCode;

                try {
                    logger.info(`👁️ Overseer: Re-executing patched code in Sandbox...`);
                    const finalResult = await sandboxService.execute(currentCode);
                    return { status: 'success', result: finalResult, healed: true, finalCode: currentCode };
                } catch (secondaryError) {
                    logger.error(`👁️ Overseer: Sandbox re-verification failed after patch.`);
                    return { status: 'failed', error: secondaryError, healed: false, failedAfterPatch: true, finalCode: currentCode };
                }
            } else {
                logger.error('👁️ Overseer: Self-healing failed for Sandbox code.');
                return { status: 'failed', error, healed: false, finalCode: currentCode };
            }
        }
    }

    _extractFilePathFromLog(log, baseDir) {
        // Very basic regex to find a local file path in the stack trace
        const match = log.match(/(?:at |in )([a-zA-Z0-9_/\\.-]+\.jsx?)/);
        if (match && match[1]) {
            return path.resolve(baseDir, match[1]);
        }
        return null;
    }

    // Wrap child_process execution
    _runShellCommand(command, cwd) {
        return new Promise((resolve, reject) => {
            const { exec } = require('child_process');
            exec(command, { cwd }, (error, stdout, stderr) => {
                if (error) {
                    reject(stdout + '\\n' + stderr);
                } else {
                    resolve(stdout);
                }
            });
        });
    }
}

export const overseerAgent = new OverseerAgent();
