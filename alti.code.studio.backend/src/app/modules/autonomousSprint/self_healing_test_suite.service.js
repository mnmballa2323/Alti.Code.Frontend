import { logger } from '../../../shared/logger.js';
import { aiProvider } from '../ai/ai.provider.js';

class SelfHealingTestSuiteService {
    /**
     * Attempts to heal a failing test suite.
     *
     * @param {string} testFilePath - Path to the test file
     * @param {string} implementationFilePath - Path to the implementation file
     * @param {string} testCommand - The shell command to run the tests
     * @param {Object} options - Injected helpers for tests (execFn, readFn, writeFn)
     * @returns {Promise<Object>} The outcome of the healing process
     */
    async healTestSuite(testFilePath, implementationFilePath, testCommand, options = {}) {
        logger.info(`🩹 TestSuiteHealer: Initiating self-healing loop for test suite [${testFilePath}]`);

        const execFn = options.execFn || this._defaultExec;
        const readFn = options.readFn || this._defaultRead;
        const writeFn = options.writeFn || this._defaultWrite;

        // 1. Run test command to collect initial failure details
        let { success, stdout, stderr } = await execFn(testCommand);
        if (success) {
            logger.info(`🩹 TestSuiteHealer: Test suite [${testFilePath}] is already passing cleanly.`);
            return { healed: false, message: 'Test suite already passing' };
        }

        const errorLog = stdout + '\n' + stderr;
        logger.warn(`🩹 TestSuiteHealer: Initial test run failed. Capturing error context...`);

        // Create backup of both files
        let testBackup = null;
        let implBackup = null;
        try {
            testBackup = await readFn(testFilePath);
            implBackup = await readFn(implementationFilePath);
        } catch (e) {
            logger.error(`🩹 TestSuiteHealer: Failed to read backup files: ${e.message}`);
            return { healed: false, error: 'Backup read failure' };
        }

        // 2. Query AI to diagnose and patch the files
        const prompt = `You are a self-healing test agent. A test suite run has failed.
Test File: ${testFilePath}
Implementation File: ${implementationFilePath}

Test Failure Output:
${errorLog}

Test File Content:
${testBackup}

Implementation File Content:
${implBackup}

Propose a precise fix. You may modify the test file, the implementation file, or both.
Return a JSON block containing the new content for both files:
{
  "diagnosis": "Detailed reason why it failed",
  "fixedTestContent": "The entire modified test file content",
  "fixedImplementationContent": "The entire modified implementation file content"
}`;

        let patchResult;
        try {
            const response = await aiProvider.reason(prompt);
            const cleanResponse = response.trim().replace(/^```(json)?/, '').replace(/```$/, '').trim();
            patchResult = JSON.parse(cleanResponse);
        } catch (e) {
            logger.error(`🩹 TestSuiteHealer: AI reasoning/parse failed. Rolling back changes. Error: ${e.message}`);
            return { healed: false, error: 'AI parsing failed' };
        }

        // 3. Apply the proposed fixes
        try {
            if (patchResult.fixedTestContent) {
                await writeFn(testFilePath, patchResult.fixedTestContent);
            }
            if (patchResult.fixedImplementationContent) {
                await writeFn(implementationFilePath, patchResult.fixedImplementationContent);
            }
        } catch (e) {
            logger.error(`🩹 TestSuiteHealer: Failed to apply fixes: ${e.message}`);
            await this._rollback(testFilePath, implementationFilePath, testBackup, implBackup, writeFn);
            return { healed: false, error: 'Write failure during patch application' };
        }

        // 4. Verify if the fix resolved the test failures
        logger.info(`🩹 TestSuiteHealer: Patch applied. Re-running verification test command...`);
        const verifyResult = await execFn(testCommand);

        if (verifyResult.success) {
            logger.info(`🩹 TestSuiteHealer: Test suite healed successfully!`);
            return {
                healed: true,
                diagnosis: patchResult.diagnosis,
                fixedFiles: [testFilePath, implementationFilePath]
            };
        } else {
            logger.warn(`🩹 TestSuiteHealer: Verification failed. Rolling back changes to original state.`);
            await this._rollback(testFilePath, implementationFilePath, testBackup, implBackup, writeFn);
            return {
                healed: false,
                error: 'Verification run failed after applying patches',
                verifyLog: verifyResult.stdout + '\n' + verifyResult.stderr
            };
        }
    }

    async _rollback(testPath, implPath, testBackup, implBackup, writeFn) {
        logger.info(`🩹 TestSuiteHealer: Restoring original snapshots...`);
        if (testBackup) await writeFn(testPath, testBackup);
        if (implBackup) await writeFn(implPath, implBackup);
    }

    async _defaultExec(command) {
        const { exec } = await import('child_process');
        return new Promise((resolve) => {
            exec(command, (error, stdout, stderr) => {
                resolve({
                    success: !error,
                    stdout,
                    stderr
                });
            });
        });
    }

    async _defaultRead(path) {
        const fs = await import('fs/promises');
        return fs.readFile(path, 'utf8');
    }

    async _defaultWrite(path, content) {
        const fs = await import('fs/promises');
        return fs.writeFile(path, content, 'utf8');
    }
}

export const selfHealingTestSuiteService = new SelfHealingTestSuiteService();
