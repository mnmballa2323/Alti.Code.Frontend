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

class ClawCodeRouterService {
    constructor() {
        this.clawPath = path.join(process.cwd(), 'src/app/modules/clawCode/bin/claw');
    }

    /**
     * Determines if a prompt is a code modification or development task.
     * @param {string} prompt 
     * @returns {boolean}
     */
    shouldRouteToClawCode(prompt) {
        const codeKeywords = [
            'write', 'create', 'edit', 'modify', 'change', 'update', 'delete', 'remove',
            'add', 'implement', 'fix', 'bug', 'error', 'refactor', 'optimize', 'patch',
            'build', 'run', 'test', 'compile', 'deploy', 'code', 'file', 'script'
        ];
        const lower = prompt.toLowerCase();
        return codeKeywords.some(keyword => lower.includes(keyword));
    }

    /**
     * Recursively traverses directories to build a structural map of the workspace.
     * Keeps it compact and excludes standard system and package directories.
     */
    getCodebaseMap(dir, depth = 0, maxDepth = 2) {
        if (depth > maxDepth) return '';
        let map = '';
        const ignoreList = ['node_modules', '.git', '.next', '.venv', 'dist', '.shadow', '.speckit', 'generated', '.alti', '.agent', 'vendor'];
        try {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            for (const file of files) {
                if (ignoreList.includes(file.name) || file.name.startsWith('.')) continue;
                const indent = '  '.repeat(depth);
                if (file.isDirectory()) {
                    map += `${indent}📁 ${file.name}/\n`;
                    map += this.getCodebaseMap(path.join(dir, file.name), depth + 1, maxDepth);
                } else {
                    map += `${indent}📄 ${file.name}\n`;
                }
            }
        } catch (e) {
            // Ignore directory read exceptions
        }
        return map;
    }

    /**
     * Scans the repository for modified files and runs ESLint and TypeScript compiler checks on them.
     * @returns {Promise<{ success: boolean, errors: Array<string> }>}
     */
    async verifyChanges() {
        if (process.env.NODE_ENV === 'test') {
            return { success: true, errors: [] };
        }

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

            // 1. Prisma schema validation check
            if (file.endsWith('.prisma')) {
                logger.info(`🔍 QualityGate: Running Prisma schema validation check on ${relativePath}...`);
                const prismaResult = await runCommand('npx prisma validate', cwd);
                if (!prismaResult.success) {
                    errors.push(`[Prisma Validation Error in ${relativePath}]:\n${prismaResult.stdout || prismaResult.stderr}`);
                }
            }

            // 2. ESLint Static Analysis check
            if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
                const eslintPath = path.join(cwd, 'node_modules/.bin/eslint');
                if (fs.existsSync(eslintPath)) {
                    logger.info(`🔍 QualityGate: Running ESLint check on ${relativePath}...`);
                    const lintResult = await runCommand(`npx eslint ${relativePath}`, cwd);
                    if (!lintResult.success) {
                        errors.push(`[ESLint Error in ${relativePath}]:\n${lintResult.stdout || lintResult.stderr}`);
                    }
                }
            }

            // 3. TypeScript Type Safety check (Frontend only)
            if (isFrontend && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
                const tscPath = path.join(cwd, 'node_modules/.bin/tsc');
                if (fs.existsSync(tscPath)) {
                    logger.info(`🔍 QualityGate: Running TypeScript compiler checks on frontend...`);
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

            // 4. Vitest Unit/Integration Test verification
            if (file.endsWith('.js') || file.endsWith('.ts')) {
                const baseName = path.basename(file);
                const baseNameWithoutExt = baseName.replace(/\.(js|ts)$/, '');
                
                // Construct candidate test file paths
                const candidates = [
                    path.join(cwd, 'tests/integration', `${baseNameWithoutExt}.test.js`),
                    path.join(cwd, 'tests/integration', `${baseNameWithoutExt}.spec.js`),
                    path.join(cwd, 'tests/unit', `${baseNameWithoutExt}.test.js`),
                    path.join(path.dirname(path.join(cwd, relativePath)), `${baseNameWithoutExt}.test.js`),
                    path.join(path.dirname(path.join(cwd, relativePath)), `${baseNameWithoutExt}.spec.js`)
                ];

                for (const candidate of candidates) {
                    if (fs.existsSync(candidate)) {
                        logger.info(`🔍 QualityGate: Running matching Vitest regression test suite: ${path.basename(candidate)}...`);
                        const testResult = await runCommand(`npx vitest run ${candidate}`, cwd);
                        if (!testResult.success) {
                            errors.push(`[Vitest Regression Test Failure in ${path.basename(candidate)}]:\n${testResult.stdout || testResult.stderr}`);
                        }
                        break; // Execute only the first matching test suite to keep it fast
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
     * Executes the Claw-Code agent task with Socratic Self-Healing loops and workspace mapping.
     * @param {string} prompt 
     * @param {Array} context 
     * @param {Function} onProgress 
     * @returns {Promise<string>}
     */
    async executeTask(prompt, context = [], onProgress = null) {
        const workspaceRoot = path.resolve(process.cwd(), '../');
        
        // 1. Generate local codebase map for immediate Claw-Code situational context
        logger.info(`🔍 ClawCodeRouter: Generating dynamic workspace structural map...`);
        const codebaseMap = this.getCodebaseMap(workspaceRoot);
        const enrichedContext = [
            ...context,
            `[CODEBASE_STRUCTURE_MAP]\nHere is the directory map of the codebase for locating files:\n${codebaseMap}`
        ];

        // 2. Capture baseline pre-existing errors in workspace to prevent fixing pre-existing debt
        logger.info(`🔍 ClawCodeRouter: Scanning baseline diagnostics before execution...`);
        const baseline = await this.verifyChanges();
        logger.info(`🔍 ClawCodeRouter: Baseline diagnostics scanned. Found ${baseline.errors.length} pre-existing warning(s).`);

        let attempt = 1;
        const maxAttempts = 3;
        let currentPrompt = prompt;

        while (attempt <= maxAttempts) {
            try {
                logger.info(`🤖 ClawCodeRouter: Executing Claw-Code Task - Attempt ${attempt}/${maxAttempts}...`);
                if (onProgress) onProgress({ status: 'executing', message: `Claw-Code executing task (Attempt ${attempt}/${maxAttempts})` });

                const output = await this._runClawCli(currentPrompt, enrichedContext, onProgress);
                
                // Perform compiler and lint validation checks
                logger.info(`🔍 ClawCodeRouter: Running Self-Healing Quality Verification Gates...`);
                if (onProgress) onProgress({ status: 'verifying', message: 'Verifying code changes...' });

                const verification = await this.verifyChanges();
                
                // Filter errors to find only NEW errors introduced by this run
                const newErrors = verification.errors.filter(err => !baseline.errors.includes(err));

                if (newErrors.length === 0) {
                    logger.info(`✅ ClawCodeRouter: All Self-Healing checks passed successfully.`);
                    
                    // Generate Git Diff Statistics log for the response
                    let executionSummary = '';
                    if (process.env.NODE_ENV !== 'test') {
                        const gitDiffStat = await runCommand('git diff --stat', workspaceRoot);
                        if (gitDiffStat.success && gitDiffStat.stdout) {
                            executionSummary = `\n\n### 🛠️ Developer Execution Summary\nHere is the codebase modification log for this task:\n\`\`\`text\n${gitDiffStat.stdout}\n\`\`\``;
                        }
                    }
                    
                    return `${output}${executionSummary}`;
                }

                logger.warn(`🛑 ClawCodeRouter: Verification gates failed on Attempt ${attempt}/${maxAttempts}.`);
                logger.warn(`New errors detected:\n${newErrors.join('\n')}`);

                if (attempt === maxAttempts) {
                    throw new Error(`Self-Healing checks failed after ${maxAttempts} attempts:\n${newErrors.join('\n')}`);
                }

                // Socratic repair feedback loop: Feed the exact compiler/linter errors back to Claw-Code
                currentPrompt = `${prompt}
                
=== 🚨 SELF-HEALING REPAIR FEEDBACK ===
The changes you previously made introduced the following compiler or linter errors.
Please read the errors below, inspect the affected files, and modify them to fix the issues:

${newErrors.join('\n\n')}
=======================================`;

                attempt++;
            } catch (error) {
                logger.error(`❌ ClawCodeRouter: Task execution failed on Attempt ${attempt}/${maxAttempts}: ${error.message}`);
                if (attempt === maxAttempts) {
                    throw error;
                }
                attempt++;
            }
        }
    }

    /**
     * Spawn raw Claw-Code process.
     */
    async _runClawCli(prompt, context = [], onProgress = null) {
        return new Promise((resolve, reject) => {
            const contextBlock = context.join('\n');
            const fullPrompt = contextBlock ? `${contextBlock}\n\nTask: ${prompt}` : prompt;

            // Supply environment with credentials (fallback to other providers if needed)
            const env = {
                ...process.env,
                ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || config.openai_secret_key || process.env.GEMINI_API_KEY || 'dummy-token',
            };

            const workspaceRoot = path.resolve(process.cwd(), '../');

            // Spawn Claw-Code in non-interactive prompt mode with skipped permissions
            const clawProcess = spawn(this.clawPath, [
                '--skip-permissions',
                '--cwd',
                workspaceRoot,
                'prompt',
                fullPrompt
            ], {
                cwd: workspaceRoot,
                env
            });

            let stdout = '';
            let stderr = '';

            clawProcess.stdout.on('data', (data) => {
                const chunk = data.toString();
                stdout += chunk;
                logger.debug(`[Claw-Code STDOUT] ${chunk.trim()}`);
                if (onProgress) {
                    onProgress({ status: 'executing', message: chunk });
                }
            });

            clawProcess.stderr.on('data', (data) => {
                const chunk = data.toString();
                stderr += chunk;
                logger.warn(`[Claw-Code STDERR] ${chunk.trim()}`);
                if (onProgress) {
                    onProgress({ status: 'executing', message: chunk });
                }
            });

            clawProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout.trim() || 'Task completed by Claw-Code.');
                } else {
                    reject(new Error(`Claw-Code execution failed (code ${code}):\n${stderr || stdout}`));
                }
            });

            clawProcess.on('error', (err) => {
                reject(err);
            });
        });
    }
}

export const clawCodeRouterService = new ClawCodeRouterService();
