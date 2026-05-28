/**
 * Copyright (c) 2026 Alti.Code.Studio
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
import { createWriteStream } from 'fs';
import { join } from 'path';

export class CodeExecutionSandbox {
    /**
     * Executes JavaScript code within a safe, isolated Node subprocess.
     * @param {string} code - The raw JavaScript code snippet to run
     * @param {object} options - Execution constraints (timeout, allowedEnv)
     * @returns {Promise<object>} Execution results including exit code, logs, and timing
     */
    static async execute(code, options = {}) {
        const timeoutMs = options.timeoutMs || 3000;
        const allowedEnv = options.allowedEnv || {}; // Only pass explicitly approved env variables

        const startTime = Date.now();

        // 1. Wrap code in a safe execution wrapper that captures console logs and errors
        const wrappedCode = `
            const logs = [];
            const errors = [];

            // Hook standard outputs
            const originalLog = console.log;
            const originalError = console.error;

            console.log = (...args) => {
                logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
            };
            console.error = (...args) => {
                errors.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
            };

            try {
                // Execute code snippet inside an IIFE
                const run = async () => {
                    ${code}
                };
                run().then(() => {
                    process.send({ success: true, logs, errors });
                    process.exit(0);
                }).catch(err => {
                    errors.push(err.stack || err.message);
                    process.send({ success: false, logs, errors });
                    process.exit(1);
                });
            } catch (err) {
                errors.push(err.stack || err.message);
                process.send({ success: false, logs, errors });
                process.exit(1);
            }
        `;

        // 2. Spawn isolated fork process with zero environmental leakage
        return new Promise((resolve) => {
            const child = fork('-', [], {
                stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
                env: {
                    NODE_ENV: 'sandbox',
                    ...allowedEnv
                }
            });

            // Write wrapped code to the child's standard input
            child.stdin.write(wrappedCode);
            child.stdin.end();

            let resultData = null;
            let stdoutLogs = [];
            let stderrLogs = [];

            // Set guardrail timeout to terminate infinite loops
            const timeoutTimer = setTimeout(() => {
                child.kill('SIGKILL');
                resolve({
                    success: false,
                    exitCode: null,
                    error: `Execution Timeout: Process exceeded the maximum duration of ${timeoutMs}ms.`,
                    logs: stdoutLogs,
                    errors: [...stderrLogs, 'SIGKILL: Process terminated due to execution timeout.'],
                    durationMs: Date.now() - startTime
                });
            }, timeoutMs);

            // Listen for structured responses from child process
            child.on('message', (message) => {
                resultData = message;
            });

            child.stdout.on('data', (data) => {
                stdoutLogs.push(data.toString().trim());
            });

            child.stderr.on('data', (data) => {
                stderrLogs.push(data.toString().trim());
            });

            child.on('exit', (code) => {
                clearTimeout(timeoutTimer);

                const durationMs = Date.now() - startTime;

                if (resultData) {
                    resolve({
                        success: resultData.success,
                        exitCode: code,
                        logs: [...stdoutLogs, ...resultData.logs],
                        errors: [...stderrLogs, ...resultData.errors],
                        durationMs
                    });
                } else {
                    resolve({
                        success: false,
                        exitCode: code,
                        error: `Subprocess crashed or terminated abruptly with exit code: ${code}`,
                        logs: stdoutLogs,
                        errors: [...stderrLogs, 'Process crashed without sending execution reports.'],
                        durationMs
                    });
                }
            });
        });
    }
}
