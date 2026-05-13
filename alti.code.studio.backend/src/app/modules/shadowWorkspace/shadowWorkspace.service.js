/**
 * Copyright (c) 2024 Alti.Code.Studio
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { logger } from '../../../shared/logger.js';
import { dockerService } from '../../../shared/docker.service.js';

const execAsync = util.promisify(exec);

// Absolute path anchored to process.cwd() at startup — not re-evaluated on every call
const SHADOW_ROOT = path.resolve(process.cwd(), '.shadow');

/** Allowed shell commands (allowlist for security — prevents arbitrary injection). */
const ALLOWED_COMMANDS = new Set([
    'npm install', 'npm test', 'npm run build', 'npm run lint',
    'node --version', 'npm --version',
    'npx vitest run', 'npx eslint .',
]);

const ensureShadowRoot = async () => {
    await fs.mkdir(SHADOW_ROOT, { recursive: true });
};

const initShadow = async (sessionId) => {
    if (!sessionId || typeof sessionId !== 'string' || !/^[\w-]{1,64}$/.test(sessionId)) {
        throw new Error(`ShadowWorkspace: invalid sessionId "${sessionId}"`);
    }

    await ensureShadowRoot();
    const shadowPath = path.join(SHADOW_ROOT, sessionId);
    const sourcePath = process.cwd();

    logger.info(`🌑 ShadowWorkspace: Initializing session "${sessionId}" at ${shadowPath}`);

    await fs.mkdir(shadowPath, { recursive: true });

    try {
        await fs.cp(path.join(sourcePath, 'src'), path.join(shadowPath, 'src'), { recursive: true });
        await fs.copyFile(path.join(sourcePath, 'package.json'), path.join(shadowPath, 'package.json'));
        return { status: 'initialized', path: shadowPath };
    } catch (error) {
        logger.error('ShadowWorkspace: init failed', error);
        throw error;
    }
};

/**
 * Apply a file change inside the shadow workspace.
 * Guards against path traversal attacks.
 */
const applyDiff = async (sessionId, filePath, content) => {
    const shadowPath = path.join(SHADOW_ROOT, sessionId);

    // Path traversal guard — resolved path must stay inside the session's shadow dir
    const targetFile = path.resolve(shadowPath, filePath);
    if (!targetFile.startsWith(shadowPath + path.sep)) {
        throw new Error(`ShadowWorkspace: path traversal attempt blocked — "${filePath}"`);
    }

    logger.info(`🌑 ShadowWorkspace: Applying change to ${path.relative(shadowPath, targetFile)}`);

    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    await fs.writeFile(targetFile, content);

    return { status: 'applied', file: filePath };
};

/**
 * Run an allowlisted command inside the shadow workspace.
 * Rejects arbitrary shell commands to prevent injection.
 */
const runCommand = async (sessionId, command) => {
    const shadowPath = path.join(SHADOW_ROOT, sessionId);

    // Security: only allow pre-approved commands
    const baseCommand = command.split(' ').slice(0, 3).join(' ');
    const isAllowed = [...ALLOWED_COMMANDS].some(allowed => command.trim().startsWith(allowed));
    if (!isAllowed) {
        logger.warn(`🌑 ShadowWorkspace: Rejected disallowed command: "${command}"`);
        return { stdout: '', stderr: `Command not in allowlist: "${command}"`, exitCode: 1 };
    }

    logger.info(`🌑 ShadowWorkspace: Running "${command}" in shadow session "${sessionId}"`);

    try {
        const { stdout, stderr } = await execAsync(command, {
            cwd: shadowPath,
            timeout: 60_000, // 60-second timeout
        });
        return { stdout, stderr, exitCode: 0 };
    } catch (error) {
        return { stdout: error.stdout ?? '', stderr: error.stderr ?? error.message, exitCode: error.code || 1 };
    }
};

/**
 * Promote shadow session changes back to the main workspace.
 * Requires explicit confirmation to guard against accidental overwrites.
 */
const commitShadow = async (sessionId, confirm = false) => {
    if (!confirm) {
        throw new Error('ShadowWorkspace: commitShadow requires confirm=true to prevent accidental overwrites.');
    }

    const shadowPath = path.join(SHADOW_ROOT, sessionId);
    const sourcePath = process.cwd();

    logger.info(`🌑 ShadowWorkspace: Committing session "${sessionId}" → main workspace`);

    await fs.cp(path.join(shadowPath, 'src'), path.join(sourcePath, 'src'), { recursive: true, force: true });

    return { status: 'committed', session: sessionId };
};

/**
 * Delete a shadow workspace session to free disk space.
 */
const cleanShadow = async (sessionId) => {
    const shadowPath = path.join(SHADOW_ROOT, sessionId);
    await fs.rm(shadowPath, { recursive: true, force: true });
    logger.info(`🌑 ShadowWorkspace: Cleaned session "${sessionId}"`);
    return { status: 'cleaned', session: sessionId };
};

export const ShadowWorkspaceService = {
    initShadow,
    applyDiff,
    runCommand,
    commitShadow,
    cleanShadow,
};
