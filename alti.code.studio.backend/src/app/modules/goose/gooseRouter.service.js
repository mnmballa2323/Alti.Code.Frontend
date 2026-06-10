import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { logger } from '../../../shared/logger.js';
import config from '../../../../config/index.js';

const runCommand = (cmd, cwd) => {
    return new Promise((resolve) => {
        exec(cmd, { cwd }, (error, stdout, stderr) => {
            resolve({
                success: !error,
                stdout: stdout.trim(),
                stderr: stderr.trim()
            });
        });
    });
};

class GooseRouterService {
    constructor() {
        this.goosePath = '/Users/michaelmeram/.local/bin/goose';
    }

    /**
     * Determines if a prompt is a code modification or development task.
     * @param {string} prompt 
     * @returns {boolean}
     */
    shouldRouteToGoose(prompt) {
        const codeKeywords = [
            'write', 'create', 'edit', 'modify', 'change', 'update', 'delete', 'remove',
            'add', 'implement', 'fix', 'bug', 'error', 'refactor', 'optimize', 'patch',
            'build', 'run', 'test', 'compile', 'deploy', 'code', 'file', 'script'
        ];
        const lower = prompt.toLowerCase();
        return codeKeywords.some(keyword => lower.includes(keyword));
    }

    /**
     * Scans the repository for modified files and runs ESLint and TypeScript compiler checks on them.
     * @returns {Promise<{ success: boolean, errors: Array<string> }>}
     */
    async verifyChanges() {
        const workspaceRoot = path.resolve(process.cwd(), '../');
        const gitStatus = await runCommand('git status --porcelain', workspaceRoot);
        
        if (!gitStatus.success || !gitStatus.stdout) {
            return { success: true, errors: [] };
        }

        const modifiedFiles = gitStatus.stdout.split('\n')
            .map(line => line.substring(3).trim())
            .filter(Boolean);

        const errors = [];

        for (const file of modifiedFiles) {
            const isBackend = file.startsWith('alti.code.studio.backend/');
            const isFrontend = file.startsWith('alti.code.studio.frontend/');

            if (!isBackend && !isFrontend) continue;

            const relativePath = isBackend 
                ? file.replace('alti.code.studio.backend/', '') 
                : file.replace('alti.code.studio.frontend/', '');

            const cwd = isBackend 
                ? path.resolve(process.cwd()) 
                : path.resolve(process.cwd(), '../alti.code.studio.frontend');

            // 1. ESLint Static Analysis check
            if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                const eslintPath = path.join(cwd, 'node_modules/.bin/eslint');
                if (fs.existsSync(eslintPath)) {
                    logger.info(`🔍 GooseRouter: Running ESLint check on ${relativePath}...`);
                    const lintResult = await runCommand(`npx eslint ${relativePath}`, cwd);
                    if (!lintResult.success) {
                        errors.push(`[ESLint Error in ${relativePath}]:\n${lintResult.stdout || lintResult.stderr}`);
                    }
                }
            }

            // 2. TypeScript Type Safety check (Frontend only)
            if (isFrontend && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
                const tscPath = path.join(cwd, 'node_modules/.bin/tsc');
                if (fs.existsSync(tscPath)) {
                    logger.info(`🔍 GooseRouter: Running TypeScript compiler checks on frontend...`);
                    const tscResult = await runCommand('npx tsc --noEmit', cwd);
                    if (!tscResult.success) {
                        const tscOutput = tscResult.stdout || tscResult.stderr;
                        const baseName = path.basename(file);
                        if (tscOutput.includes(baseName)) {
                            const fileErrors = tscOutput.split('\n')
                                .filter(line => line.includes(baseName))
                                .join('\n');
                            errors.push(`[TypeScript Compiler Error in ${baseName}]:\n${fileErrors}`);
                        }
                    }
                }
            }
        }

        return {
            success: errors.length === 0,
            errors
        };
    }

    /**
     * Executes the Goose agent task with Socratic Self-Healing loops.
     * @param {string} prompt 
     * @param {Array} context 
     * @param {Function} onProgress 
     * @returns {Promise<string>}
     */
    async executeTask(prompt, context = [], onProgress = null) {
        let attempt = 1;
        const maxAttempts = 3;
        let currentPrompt = prompt;

        while (attempt <= maxAttempts) {
            try {
                logger.info(`🤖 GooseRouter: Executing Goose Task - Attempt ${attempt}/${maxAttempts}...`);
                if (onProgress) onProgress({ status: 'executing', message: `Goose executing task (Attempt ${attempt}/${maxAttempts})` });

                const output = await this._runGooseCli(currentPrompt, context, onProgress);
                
                // Perform compiler and lint validation checks
                logger.info(`🔍 GooseRouter: Running Self-Healing Quality Verification Gates...`);
                if (onProgress) onProgress({ status: 'verifying', message: 'Verifying code changes...' });

                const verification = await this.verifyChanges();
                if (verification.success) {
                    logger.info(`✅ GooseRouter: All Self-Healing checks passed successfully.`);
                    return output;
                }

                logger.warn(`🛑 GooseRouter: Verification gates failed on Attempt ${attempt}/${maxAttempts}.`);
                logger.warn(`Failure details:\n${verification.errors.join('\n')}`);

                if (attempt === maxAttempts) {
                    throw new Error(`Self-Healing checks failed after ${maxAttempts} attempts:\n${verification.errors.join('\n')}`);
                }

                // Socratic repair feedback: Feed the exact compiler/linter errors back to Goose
                currentPrompt = `${prompt}
                
=== 🚨 SELF-HEALING REPAIR FEEDBACK ===
The changes you previously made introduced the following compiler or linter errors.
Please read the errors below, inspect the affected files, and modify them to fix the issues:

${verification.errors.join('\n\n')}
=======================================`;

                attempt++;
            } catch (error) {
                logger.error(`❌ GooseRouter: Task execution failed on Attempt ${attempt}/${maxAttempts}: ${error.message}`);
                if (attempt === maxAttempts) {
                    throw error;
                }
                attempt++;
            }
        }
    }

    /**
     * Spawn raw Goose process.
     */
    async _runGooseCli(prompt, context = [], onProgress = null) {
        return new Promise((resolve, reject) => {
            const contextBlock = context.join('\n');
            const fullPrompt = contextBlock ? `${contextBlock}\n\nTask: ${prompt}` : prompt;

            const env = {
                ...process.env,
                GOOSE_PROVIDER: 'google',
                GOOGLE_API_KEY: config.gemini_secret_key || process.env.GEMINI_API_KEY,
                GOOSE_MODEL: config.gcp.model_name || 'gemini-1.5-pro',
            };

            if (process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.GOOGLE_APPLICATION_CREDENTIALS !== 'dummy-gcp-creds.json') {
                env.GOOSE_PROVIDER = 'gcp_vertex_ai';
                env.GCP_PROJECT_ID = config.gcp.project_id;
                env.GCP_LOCATION = config.gcp.location;
            }

            const gooseProcess = spawn(this.goosePath, [
                'run',
                '--no-profile',
                '-q',
                '--no-session',
                '-t',
                fullPrompt
            ], {
                cwd: path.resolve(process.cwd(), '../'),
                env
            });

            let stdout = '';
            let stderr = '';

            gooseProcess.stdout.on('data', (data) => {
                const chunk = data.toString();
                stdout += chunk;
                logger.debug(`[Goose STDOUT] ${chunk.trim()}`);
            });

            gooseProcess.stderr.on('data', (data) => {
                const chunk = data.toString();
                stderr += chunk;
                logger.warn(`[Goose STDERR] ${chunk.trim()}`);
            });

            gooseProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout.trim() || 'Task completed by Goose.');
                } else {
                    reject(new Error(`Goose execution failed (code ${code}):\n${stderr || stdout}`));
                }
            });

            gooseProcess.on('error', (err) => {
                reject(err);
            });
        });
    }
}

export const gooseRouterService = new GooseRouterService();
