import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import { LlmGatewayService } from '../llmGateway/llmGateway.service.js';
import { logger } from '../../../shared/logger.js';

const execAsync = util.promisify(exec);

/**
 * Docker Sandbox Execution wrapper for the Self-Healing TDD loop
 */
const executeInSandbox = async (codeStr, testStr) => {
    const sandboxDir = path.join(process.cwd(), '.sandbox', Date.now().toString());
    await fs.mkdir(sandboxDir, { recursive: true });

    try {
        await fs.writeFile(path.join(sandboxDir, 'index.js'), codeStr);
        await fs.writeFile(path.join(sandboxDir, 'index.test.js'), testStr);

        // Simple package.json for jest
        const pkgJson = {
            name: "sandbox",
            version: "1.0.0",
            scripts: { "test": "jest index.test.js" },
            dependencies: { "jest": "^29.0.0" }
        };
        await fs.writeFile(path.join(sandboxDir, 'package.json'), JSON.stringify(pkgJson));

        // Use node:18-alpine docker image to run tests securely
        const cmd = `docker run --rm -v ${sandboxDir}:/app -w /app node:18-alpine sh -c "npm install && npm test"`;
        const { stdout, stderr } = await execAsync(cmd);
        return { success: true, log: stdout };
    } catch (error) {
        return { success: false, log: error.stdout || error.stderr || error.message };
    } finally {
        // Cleanup sandbox
        await fs.rm(sandboxDir, { recursive: true, force: true });
    }
};

/**
 * The Self-Healing TDD Loop
 */
const runTddLoop = async (userId, sessionId, featurePrompt, maxIterations = 5) => {
    logger.info(`🧪 [TDD Loop] Starting Self-Healing TDD Execution for: ${featurePrompt}`);

    // Step 1: Claude writes the Implementation
    const codeResult = await LlmGatewayService.routeCompletion(
        userId, sessionId,
        `Write the implementation code for this feature. Return ONLY raw javascript code, no markdown.\nFeature: ${featurePrompt}`,
        'claude-3-5-sonnet', 'TDD-Impl'
    );
    let currentCode = codeResult.reply.replace(/```javascript/g, '').replace(/```/g, '');

    // Step 2: Gemini writes the Tests
    const testResult = await LlmGatewayService.routeCompletion(
        userId, sessionId,
        `Write comprehensive Jest unit tests for this feature. Return ONLY raw javascript code, no markdown.\nFeature: ${featurePrompt}\nCode:\n${currentCode}`,
        'gemini-3.1-pro-002', 'TDD-Test'
    );
    let currentTest = testResult.reply.replace(/```javascript/g, '').replace(/```/g, '');

    // Step 3: Self-Healing Execution Loop
    for (let i = 1; i <= maxIterations; i++) {
        logger.info(`🔄 [TDD Loop] Iteration ${i}/${maxIterations}: Running tests in Docker sandbox...`);
        const sandboxResult = await executeInSandbox(currentCode, currentTest);

        if (sandboxResult.success) {
            logger.info(`✅ [TDD Loop] Tests passed 100% on iteration ${i}!`);
            return { success: true, iterations: i, code: currentCode, tests: currentTest, logs: sandboxResult.log };
        }

        logger.warn(`⚠️ [TDD Loop] Tests failed on iteration ${i}. Triggering GPT-5.5 Debugger...`);

        // Step 4: GPT-5.5 (Azure) Debugs and Patches
        const debugPrompt = `You are a Senior Debugger. The tests failed.
Current Code:
${currentCode}

Current Tests:
${currentTest}

Test Output:
${sandboxResult.log}

Analyze the stack trace and fix the logic. Return ONLY the fully updated raw javascript implementation code, no markdown or explanations.`;

        const patchedCodeResult = await LlmGatewayService.routeCompletion(
            userId, sessionId, debugPrompt, 'gpt-5.5', 'TDD-Debug'
        );
        currentCode = patchedCodeResult.reply.replace(/```javascript/g, '').replace(/```/g, '');
    }

    logger.error(`❌ [TDD Loop] Failed to self-heal within ${maxIterations} iterations.`);
    return { success: false, iterations: maxIterations, code: currentCode, error: 'Exceeded max iterations without passing tests.' };
};

export const SelfHealingTddService = {
    runTddLoop
};
