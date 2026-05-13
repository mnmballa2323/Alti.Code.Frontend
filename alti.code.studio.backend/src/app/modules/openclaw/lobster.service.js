/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * LOBSTER SERVICE — OpenClaw Workflow Shell Bridge
 * Integrates the openclaw/lobster typed macro engine into the Alti platform.
 * MIT License — https://github.com/openclaw/lobster
 *
 * Lobster is a local-first, typed pipeline shell that turns skills/tools
 * into composable pipelines which agents invoke in a single step.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { logger } from '../../../shared/logger.js';

const execFileAsync = promisify(execFile);

class LobsterService {
    constructor() {
        this.lobsterPath = path.resolve('submodules', 'openclaw', 'lobster');
        this.lobsterBin = path.join(this.lobsterPath, 'bin', 'lobster.js');
        this._available = null;
    }

    /**
     * Check whether the lobster binary is available in the submodule.
     */
    isAvailable() {
        if (this._available === null) {
            this._available = fs.existsSync(this.lobsterBin);
            if (!this._available) {
                logger.warn('[lobster] Lobster binary not found at submodule path. Lobster features degraded.');
            }
        }
        return this._available;
    }

    /**
     * Run a lobster command.
     * @param {string[]} args - CLI arguments
     * @param {object} opts
     */
    async run(args, opts = {}) {
        if (!this.isAvailable()) {
            return { status: 'unavailable', message: 'Lobster submodule not initialized.' };
        }

        logger.debug(`[lobster] Running: node lobster.js ${args.join(' ')}`);
        const { stdout, stderr } = await execFileAsync('node', [this.lobsterBin, ...args], {
            cwd: opts.cwd || this.lobsterPath,
            timeout: opts.timeout || 60000,
            env: { ...process.env },
        });

        if (stderr) logger.debug(`[lobster] stderr: ${stderr.trim()}`);
        return { status: 'ok', output: stdout.trim() };
    }

    /**
     * Run the doctor check to verify lobster's environment.
     */
    async doctor() {
        return this.run(['doctor']);
    }

    /**
     * Execute a lobster pipeline expression.
     * @param {string} expression - Lobster pipeline DSL expression
     * @param {object} opts
     */
    async exec(expression, opts = {}) {
        return this.run(['exec', '--json', '--shell', expression], opts);
    }

    /**
     * Execute a workflow .lobster file.
     * @param {string} workflowFile - Absolute path to a .lobster workflow file
     * @param {object} [inputData] - Optional JSON input data
     */
    async runWorkflow(workflowFile, inputData = null, opts = {}) {
        if (!fs.existsSync(workflowFile)) {
            throw new Error(`[lobster] Workflow file not found: ${workflowFile}`);
        }

        const args = ['run', workflowFile];
        if (inputData) {
            args.push('--input', JSON.stringify(inputData));
        }
        return this.run(args, opts);
    }

    /**
     * List available workflow files in the lobster submodule examples.
     */
    listExampleWorkflows() {
        const examplesPath = path.join(this.lobsterPath, 'examples');
        if (!fs.existsSync(examplesPath)) return [];
        return fs.readdirSync(examplesPath)
            .filter(f => f.endsWith('.lobster') || f.endsWith('.json'))
            .map(f => ({ name: f, path: path.join(examplesPath, f) }));
    }

    /**
     * Get help text from lobster.
     */
    async help() {
        return this.run(['--help']);
    }
}

export const lobsterService = new LobsterService();
