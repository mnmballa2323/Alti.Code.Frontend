/**
 * Copyright (c) 2024 Inso Code
 *
 * DEER-FLOW SERVICE — ByteDance SuperAgent Research Harness Bridge
 * Integrates the bytedance/deer-flow deep research pipeline into Alti.
 * MIT License — https://github.com/bytedance/deer-flow
 *
 * deer-flow is a SuperAgent harness that researches, codes, and creates.
 * Handles tasks that could take minutes to hours via sandboxes, memory, and subagents.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { logger } from '../../../shared/logger.js';

const DEERFLOW_BASE = path.resolve('submodules', 'deer-flow');

class DeerFlowService {
    constructor() {
        this.basePath = DEERFLOW_BASE;
        this._available = null;
    }

    isAvailable() {
        if (this._available === null) {
            // Check for the deer-flow entry point
            const hasPkg = fs.existsSync(path.join(this.basePath, 'package.json')) ||
                fs.existsSync(path.join(this.basePath, 'frontend', 'package.json'));
            const hasPy = fs.existsSync(path.join(this.basePath, 'pyproject.toml')) ||
                fs.existsSync(path.join(this.basePath, 'requirements.txt')) ||
                fs.existsSync(path.join(this.basePath, 'backend', 'pyproject.toml')) ||
                fs.existsSync(path.join(this.basePath, 'backend', 'requirements.txt'));
            this._available = hasPkg || hasPy;
            if (!this._available) {
                logger.warn('[deer-flow] Submodule not initialized or entry point not found.');
            }
        }
        return this._available;
    }

    /**
     * Run a deep research task using deer-flow.
     * @param {string} task - The research/coding task description
     * @param {object} opts - { timeout, maxSteps, model }
     * @returns {Promise<{ status: string, output: string }>}
     */
    async runTask(task, opts = {}) {
        if (!this.isAvailable()) {
            return {
                status: 'unavailable',
                message: 'deer-flow submodule not initialized. Run: git submodule update --init submodules/deer-flow',
                task,
            };
        }

        const timeout = opts.timeout || 600000; // 10 min default for deep research
        logger.info(`[deer-flow] Starting deep research task: "${task.slice(0, 100)}..."`);

        return new Promise((resolve, reject) => {
            let output = '';
            let errOutput = '';

            // Try Python runner first, fallback to node CLI
            const useNode = fs.existsSync(path.join(this.basePath, 'package.json'));
            const cmd = useNode ? 'node' : 'python';
            const args = useNode
                ? [path.join(this.basePath, 'src', 'server', 'run_agent_task.js'), '--task', task]
                : ['-m', 'deer_flow.cli', 'run', '--task', task];

            if (opts.maxSteps) args.push('--max-steps', String(opts.maxSteps));
            if (opts.model) args.push('--model', opts.model);
            if (opts.concurrency) args.push('--concurrency', String(opts.concurrency));
            if (opts.telemetryLevel) args.push('--log-level', String(opts.telemetryLevel));

            const child = spawn(cmd, args, {
                cwd: this.basePath,
                env: { ...process.env, PYTHONPATH: this.basePath },
                timeout,
            });

            child.stdout.on('data', d => { output += d.toString(); });
            child.stderr.on('data', d => { errOutput += d.toString(); });

            const timer = setTimeout(() => {
                child.kill('SIGTERM');
                resolve({ status: 'timeout', output, message: 'Task exceeded maximum allowed time' });
            }, timeout);

            child.on('close', code => {
                clearTimeout(timer);
                if (code === 0) {
                    logger.info('[deer-flow] Task completed successfully');
                    resolve({ status: 'success', output: output.trim() });
                } else {
                    logger.error(`[deer-flow] Task failed with code ${code}: ${errOutput.slice(0, 500)}`);
                    resolve({ status: 'error', output: output.trim(), error: errOutput.trim() });
                }
            });

            child.on('error', err => {
                clearTimeout(timer);
                reject(err);
            });
        });
    }

    /**
     * Stream a research task, calling onData for each output chunk.
     */
    streamTask(task, onData, opts = {}) {
        if (!this.isAvailable()) {
            onData('[deer-flow] Submodule not available\n');
            return Promise.resolve();
        }

        const useNode = fs.existsSync(path.join(this.basePath, 'package.json'));
        const cmd = useNode ? 'node' : 'python';
        const args = useNode
            ? [path.join(this.basePath, 'src', 'server', 'run_agent_task.js'), '--task', task, '--stream']
            : ['-m', 'deer_flow.cli', 'run', '--task', task, '--stream'];

        const child = spawn(cmd, args, {
            cwd: this.basePath,
            env: { ...process.env, PYTHONPATH: this.basePath },
        });

        child.stdout.on('data', d => onData(d.toString()));
        child.stderr.on('data', d => logger.debug(`[deer-flow stream] ${d.toString().trim()}`));

        return new Promise((resolve, reject) => {
            child.on('close', resolve);
            child.on('error', reject);
        });
    }

    /**
     * Get information about deer-flow's capabilities.
     */
    getCapabilities() {
        return {
            name: 'deer-flow',
            description: 'ByteDance open-source SuperAgent harness — researches, codes, and creates',
            features: [
                'Deep research with multi-step planning',
                'Code generation with sandbox execution',
                'Memory and subagent coordination',
                'Task duration: minutes to hours',
                'LangGraph-based multi-agent pipeline',
            ],
            submodulePath: this.basePath,
            available: this.isAvailable(),
        };
    }
}

export const deerFlowService = new DeerFlowService();
