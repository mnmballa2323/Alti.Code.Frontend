/**
 * Copyright (c) 2026 Inso Code
 * 
 * Sandboxed Code Execution Engine
 * 
 * High-performance, isolated code execution sandbox.
 * Spawns a dedicated, resource-constrained subprocess with strict timeouts
 * and pruned environment variables to execute untrusted JavaScript code,
 * protecting the host process from memory crashes, infinite loops, and security leakage.
 * 
 * Standard compliant, pure MIT/Apache-2.0 licensed, fast, and secure.
 */

import { fork } from 'child_process';
import { createWriteStream, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join, resolve } from 'path';

export class CodeExecutionSandbox {
    /**
     * Executes JavaScript code within a safe, isolated Node Docker container or Crabbox.
     * @param {string} code - The raw JavaScript code snippet to run
     * @param {object} options - Execution constraints (timeout, allowedEnv, provider)
     * @returns {Promise<object>} Execution results including exit code, logs, and timing
     */
    static async execute(code, options = {}) {
        const provider = options.provider || process.env.SANDBOX_PROVIDER || 'local';
        const agentId = options.agentId || 'generic';
        const cleanAgentId = agentId.replace(/[^a-zA-Z0-9_]/g, '_');
        const workspacePath = options.workspacePath ? resolve(options.workspacePath) : resolve(`./logs/workspaces/agent_${cleanAgentId}`);
        const startTime = Date.now();

        if (provider === 'flue') {
            try {
                const { register } = await import('node:module');
                const loaderUrl = new URL('./sqlite-loader.js', import.meta.url).href;
                register(loaderUrl);
            } catch (regErr) {
                // Fail silent in case dynamic import hooks are not supported in execution env
            }

            const { local } = await import('@flue/runtime/node');
            const tempFileName = `temp_exec_flue_${Math.random().toString(36).substring(2, 9)}.js`;
            const tempFilePath = join(workspacePath, tempFileName);

            mkdirSync(workspacePath, { recursive: true });
            writeFileSync(tempFilePath, code, 'utf8');

            try {
                const sandbox = local({ cwd: workspacePath });
                const sessionEnv = await sandbox.createSessionEnv();

                const runnerPath = resolve(new URL('./isolated_vm_runner.js', import.meta.url).pathname);
                let result;
                let usedFallback = false;

                try {
                    result = await sessionEnv.exec(`node "${runnerPath}" "${tempFileName}"`);
                } catch (e) {
                    result = null;
                }

                let parsedResult = null;
                if (result && result.stdout) {
                    try {
                        parsedResult = JSON.parse(result.stdout.trim());
                    } catch (e) {
                        // stdout was not valid JSON
                    }
                }

                if (!parsedResult || result.exitCode === null || result.exitCode === 139 || result.exitCode === 255) {
                    // Segfault, abort, or load failure. Fallback to vm_fallback_runner.js
                    const fallbackRunnerPath = resolve(new URL('./vm_fallback_runner.js', import.meta.url).pathname);
                    usedFallback = true;
                    try {
                        result = await sessionEnv.exec(`node "${fallbackRunnerPath}" "${tempFileName}"`);
                        if (result && result.stdout) {
                            parsedResult = JSON.parse(result.stdout.trim());
                        }
                    } catch (fallbackErr) {
                        parsedResult = {
                            success: false,
                            exitCode: 1,
                            logs: [],
                            errors: [fallbackErr.message || String(fallbackErr)]
                        };
                    }
                }

                return {
                    success: parsedResult ? parsedResult.success : false,
                    exitCode: parsedResult ? parsedResult.exitCode : 1,
                    logs: parsedResult ? parsedResult.logs : [],
                    errors: parsedResult ? parsedResult.errors : (result && result.stderr ? [result.stderr] : []),
                    durationMs: Date.now() - startTime,
                    isMock: false,
                    usedFallback
                };
            } finally {
                try {
                    rmSync(tempFilePath, { force: true });
                } catch (e) {}
            }
        }

        if (provider === 'crabbox') {
            const { crabboxService } = await import('../crabbox/crabbox.service.js');
            const tempFileName = `temp_exec_crabbox_${Math.random().toString(36).substring(2, 9)}.js`;
            const tempFilePath = join(workspacePath, tempFileName);

            mkdirSync(workspacePath, { recursive: true });
            writeFileSync(tempFilePath, code, 'utf8');

            try {
                const result = await crabboxService.run(`node ${tempFileName}`, {
                    id: options.leaseId,
                    provider: options.crabboxProvider,
                    class: options.crabboxClass,
                    cwd: workspacePath
                });

                return {
                    success: result.success,
                    exitCode: result.exitCode,
                    logs: result.stdout ? result.stdout.split('\n') : [],
                    errors: result.stderr ? result.stderr.split('\n') : [],
                    durationMs: Date.now() - startTime,
                    isMock: false
                };
            } finally {
                try {
                    rmSync(tempFilePath, { force: true });
                } catch (e) {}
            }
        }

        if (provider === 'e2b') {
            const { sandboxService } = await import('../agents/sandbox.service.js');
            const language = options.language || 'javascript';
            const result = await sandboxService.runCode(code, language);
            return {
                success: result.success,
                exitCode: result.success ? 0 : -1,
                logs: result.stdout ? result.stdout.split('\n') : [],
                errors: result.stderr ? result.stderr.split('\n') : [],
                durationMs: Date.now() - startTime,
                isMock: false
            };
        }

        const { DockerWorkspaceManager } = await import('./docker_workspace_manager.js');
        const manager = new DockerWorkspaceManager(workspacePath);
        
        // Execute inside a dedicated agent container
        return await manager.executeOssCode(`agent_${cleanAgentId}`, code, workspacePath, options);
    }
}
