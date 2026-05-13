/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * "The Critic" - QA & Testing Agent
 * Responsible for generating tests, running them, and critiquing code quality.
 */
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { aiProvider } from '../ai/ai.provider.js';
import { logger } from '../../../shared/logger.js';

const execAsync = util.promisify(exec);

class CriticAgent {
    constructor() {
        this.projectRoot = process.cwd();
    }

    /**
     * Generate a test suite for a given file
     * @param {string} filePath - Relative path to the file
     * @param {string} codeContent - Content of the file (optional, can read from disk)
     */
    async generateTest(filePath, codeContent = null) {
        logger.info(`🧐 Critic: Generating tests for ${filePath}...`);

        if (!codeContent) {
            try {
                codeContent = await fs.readFile(path.resolve(this.projectRoot, filePath), 'utf-8');
            } catch (error) {
                logger.error(`Critic failed to read file: ${filePath}`, error);
                throw new Error(`File not found: ${filePath}`);
            }
        }

        const prompt = `
        You are "The Critic", a Senior QA Engineer.
        Target File: ${filePath}
        
        CODE:
        ${codeContent}

        TASK:
        Write a comprehensive Jest test suite for this code.
        - Cover happy paths and edge cases.
        - Use ES6 imports/exports.
        - Mock external dependencies if necessary.
        - Return ONLY the code for the test file.
        `;

        try {
            // Use 'generate' capability (creative/coding)
            const response = await aiProvider.generate(prompt);
            const testCode = response.replace(/^```(javascript|js|ts)?|```$/g, '').trim();

            // Determine test file path (e.g., file.js -> file.test.js)
            const dir = path.dirname(filePath);
            const ext = path.extname(filePath);
            const base = path.basename(filePath, ext);
            const testFilePath = path.join(dir, `${base}.test${ext}`);

            // Write test file
            await fs.writeFile(path.resolve(this.projectRoot, testFilePath), testCode);
            logger.info(`✅ Critic: Generated test file at ${testFilePath}`);

            return { testFilePath, testCode };
        } catch (error) {
            logger.error('Critic: Failed to generate test', error);
            throw error;
        }
    }

    /**
     * Run tests for a specific file or pattern
     * @param {string} testPattern - File path or regex pattern for Jest
     */
    async runTests(testPattern) {
        logger.info(`🧐 Critic: Running tests matching "${testPattern}"...`);

        // Ensure we are using project's jest
        // Attempting to run jest via npx or node_modules
        // Assuming 'npm test' runs jest, or we run direct
        const cmd = `npx jest "${testPattern}" --colors`;

        try {
            const { stdout, stderr } = await execAsync(cmd, { cwd: this.projectRoot });
            logger.info(`✅ Critic: Tests passed for ${testPattern}`);
            return { success: true, output: stdout + stderr };
        } catch (error) {
            logger.warn(`⚠️ Critic: Tests failed for ${testPattern}`);
            return { success: false, output: error.stdout + error.stderr };
        }
    }

    /**
     * Critique code for quality/security
     * @param {string} code 
     */
    async critique(code) {
        const prompt = `
        Analyze this code for:
        1. Potential Bugs
        2. Security Vulnerabilities
        3. Performance Bottlenecks
        4. Code Style/Best Practices

        Code:
        ${code.substring(0, 5000)}... (truncated if too long)

        Return a JSON report:
        {
            "score": number (0-100),
            "issues": [{ "severity": "High/Med/Low", "description": "..." }],
            "suggestions": ["..."]
        }
        `;

        const response = await aiProvider.reason(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };
    }
}

export const criticAgent = new CriticAgent();
