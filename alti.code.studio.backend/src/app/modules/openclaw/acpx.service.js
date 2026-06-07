/**
 * Copyright (c) 2024 Inso Code
 *
 * ACPX SERVICE — Agent Client Protocol eXecutor
 * Real bridge to the openclaw/acpx CLI for ACP-based agent session management.
 * MIT License — https://github.com/openclaw/acpx
 *
 * Supports: codex, claude, gemini, opencode, pi agents via ACP.
 */

import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import { logger } from '../../../shared/logger.js';

const execFileAsync = promisify(execFile);

const SUPPORTED_AGENTS = ['codex', 'claude', 'gemini', 'opencode', 'pi'];
const ACPX_BIN = 'npx';
const ACPX_ARGS_PREFIX = ['acpx@latest'];

/**
 * Run acpx with given arguments, returning stdout as a string.
 */
async function runAcpx(args, opts = {}) {
    const fullArgs = [...ACPX_ARGS_PREFIX, ...args];
    logger.debug(`[acpx] Running: npx ${fullArgs.join(' ')}`);

    const { stdout, stderr } = await execFileAsync(ACPX_BIN, fullArgs, {
        cwd: opts.cwd || process.cwd(),
        timeout: opts.timeout || 60000,
        env: { ...process.env },
    });

    if (stderr && !opts.ignoreStderr) {
        logger.debug(`[acpx] stderr: ${stderr.trim()}`);
    }
    return stdout.trim();
}

class AcpxService {
    /**
     * Ensure a named session exists for a given agent (creates if not present).
     * @param {string} agent - One of: codex | claude | gemini | opencode | pi
     * @param {string} [sessionName] - Optional named session (defaults to cwd-scoped)
     */
    async ensureSession(agent = 'gemini', sessionName = null) {
        this._validateAgent(agent);
        const args = [agent, 'sessions', 'ensure'];
        if (sessionName) args.push('--name', sessionName);
        const result = await runAcpx(args, { ignoreStderr: true });
        logger.info(`[acpx] Session ensured for agent="${agent}" name="${sessionName || 'default'}"`);
        return result;
    }

    /**
     * Prompt an agent in a (named) session.
     * @param {string} agent
     * @param {string} prompt
     * @param {string} [sessionName]
     * @param {object} [opts] - { noWait: bool, timeout: ms }
     */
    async prompt(agent = 'gemini', prompt, sessionName = null, opts = {}) {
        this._validateAgent(agent);
        const args = [agent];
        if (sessionName) args.push('-s', sessionName);
        if (opts.noWait) args.push('--no-wait');
        args.push('prompt', prompt);
        return runAcpx(args, { timeout: opts.timeout || 120000 });
    }

    /**
     * One-shot execution — no persistent session.
     * @param {string} agent
     * @param {string} prompt
     */
    async exec(agent = 'gemini', prompt, opts = {}) {
        this._validateAgent(agent);
        const args = [agent, 'exec', prompt];
        return runAcpx(args, { timeout: opts.timeout || 300000 });
    }

    /**
     * Default shorthand: acpx exec (uses default agent).
     */
    async defaultExec(prompt, opts = {}) {
        return runAcpx(['exec', prompt], { timeout: opts.timeout || 300000 });
    }

    /** List sessions for a given agent */
    async listSessions(agent = 'gemini') {
        this._validateAgent(agent);
        return runAcpx([agent, 'sessions', 'list'], { ignoreStderr: true });
    }

    /** Close a session */
    async closeSession(agent = 'gemini', sessionName = null) {
        this._validateAgent(agent);
        const args = [agent, 'sessions', 'close'];
        if (sessionName) args.push(sessionName);
        return runAcpx(args, { ignoreStderr: true });
    }

    /** Cancel an in-flight prompt */
    async cancel(agent = 'gemini') {
        this._validateAgent(agent);
        return runAcpx([agent, 'cancel'], { ignoreStderr: true });
    }

    /** Set session mode (e.g. 'plan' or 'auto') */
    async setMode(agent = 'gemini', mode) {
        this._validateAgent(agent);
        return runAcpx([agent, 'set-mode', mode]);
    }

    /** Show acpx config */
    async showConfig() {
        return runAcpx(['config', 'show'], { ignoreStderr: true });
    }

    /**
     * Stream a prompt to an agent, emitting output via callback.
     */
    streamPrompt(agent = 'gemini', prompt, onData, opts = {}) {
        this._validateAgent(agent);
        const args = [...ACPX_ARGS_PREFIX, agent, 'prompt', prompt];
        const child = spawn(ACPX_BIN, args, {
            cwd: opts.cwd || process.cwd(),
            env: { ...process.env },
        });

        child.stdout.on('data', (data) => onData(data.toString()));
        child.stderr.on('data', (data) => logger.debug(`[acpx stream] ${data.toString().trim()}`));

        return new Promise((resolve, reject) => {
            child.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`acpx exited with code ${code}`));
            });
            child.on('error', reject);
        });
    }

    _validateAgent(agent) {
        if (!SUPPORTED_AGENTS.includes(agent)) {
            throw new Error(`[acpx] Unsupported agent: "${agent}". Supported: ${SUPPORTED_AGENTS.join(', ')}`);
        }
    }

    get supportedAgents() {
        return [...SUPPORTED_AGENTS];
    }
}

export const acpxService = new AcpxService();
