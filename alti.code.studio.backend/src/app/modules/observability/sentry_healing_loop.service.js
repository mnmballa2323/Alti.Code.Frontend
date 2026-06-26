import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../../shared/logger.js';
import { CodeExecutionSandbox } from '../sandbox/code_execution_sandbox.js';
import { SocraticDebateChamber } from '../agents/socratic_debate_chamber.js';
import { PolicyComplianceGate } from '../../middlewares/policyComplianceGate.js';

export class SentryHealingLoopService {
  /**
   * Consumes production crash events, replicates them in a sandbox,
   * debates the fix, validates against compliance gates, and verifies the patch.
   * @param {object} event - The Sentry crash payload
   * @returns {Promise<object>} Results of the healing execution
   */
  static async handleSentryEvent(event) {
    const {
      errorName,
      errorMessage,
      stackTrace,
      culpritFile,
      culpritLine,
      codeSnippet,
    } = event;
    logger.info(
      `🚨 [Sentry Healing] Processing crash event: ${errorName} - "${errorMessage}" in ${culpritFile}`,
    );

    const workspacePath = path.resolve(
      `./logs/workspaces/sentry_heal_${Date.now()}`,
    );
    fs.mkdirSync(workspacePath, { recursive: true });

    // 1. Build a reproduction test script that replicates the crash
    const testCode = `
            import { describe, it, expect } from 'vitest';
            import fs from 'node:fs';
            import path from 'node:path';

            describe('Production Crash Replication', () => {
                it('should replicate the crash', async () => {
                    const triggerCrash = () => {
                        ${codeSnippet || `throw new ${errorName}("${errorMessage}");`}
                    };
                    expect(triggerCrash).not.toThrow();
                });
            });
        `;

    const testFilePath = path.join(workspacePath, 'reproduce.test.js');
    fs.writeFileSync(testFilePath, testCode, 'utf8');

    // Copy original culprit file to workspace if it exists
    const absoluteCulpritPath = path.resolve(culpritFile);
    let originalContent = '';
    if (fs.existsSync(absoluteCulpritPath)) {
      originalContent = fs.readFileSync(absoluteCulpritPath, 'utf8');
      fs.writeFileSync(
        path.join(workspacePath, path.basename(culpritFile)),
        originalContent,
        'utf8',
      );
    }

    // 1.5 Pre-reproduction compliance check on external snippet
    if (codeSnippet) {
      const preReproCheck = PolicyComplianceGate.verify(
        absoluteCulpritPath,
        codeSnippet,
      );
      if (!preReproCheck.isValid) {
        logger.warn(
          `🚨 [Sentry Healing] Pre-reproduction compliance check failed: ${preReproCheck.errors.join('; ')}`,
        );
        return {
          success: false,
          reason: 'Pre-reproduction compliance gate veto',
          errors: preReproCheck.errors,
        };
      }
    }

    // Run replication test via sandbox
    logger.info(`🚨 [Sentry Healing] Running reproduction test in sandbox...`);
    const initialRun = await CodeExecutionSandbox.execute(
      `
            console.log("REPRODUCING_CRASH");
            try {
                ${codeSnippet || `throw new ${errorName}("${errorMessage}");`}
            } catch (e) {
                console.error("REPLICATED_SUCCESSFULLY:", e.message);
                process.exit(1);
            }
        `,
      { provider: 'flue', workspacePath },
    );

    if (initialRun.success) {
      logger.warn(
        `🚨 [Sentry Healing] Reproduction test did not fail. Unable to replicate bug.`,
      );
      return { success: false, reason: 'Failed to replicate bug in sandbox' };
    }

    logger.info(
      `🚨 [Sentry Healing] Production bug replicated successfully. Initiating Socratic Debate Chamber...`,
    );

    // 2. Socratic debate to resolve the issue
    const topic = `Fix the production crash: ${errorName} - ${errorMessage} inside file ${culpritFile} line ${culpritLine}`;
    const initialProposal = originalContent || codeSnippet || '';

    const debate = await SocraticDebateChamber.runDebate(
      topic,
      initialProposal,
      2,
      {
        filePath: absoluteCulpritPath,
        symbolName: event.symbolName || null,
      },
    );

    if (!debate.consensus) {
      logger.warn(
        `🚨 [Sentry Healing] Socratic Debate Chamber failed to reach consensus.`,
      );
      return { success: false, reason: 'No consensus reached in debate' };
    }

    const healedCode = debate.approvedProposal;

    // 3. Compliance check
    const complianceCheck = PolicyComplianceGate.verify(
      absoluteCulpritPath,
      healedCode,
    );
    if (!complianceCheck.isValid) {
      logger.warn(
        `🚨 [Sentry Healing] Propose patch failed compliance gate: ${complianceCheck.errors.join('; ')}`,
      );
      return {
        success: false,
        reason: 'Compliance gate veto',
        errors: complianceCheck.errors,
      };
    }

    // 4. Verify patch in sandbox
    logger.info(`🚨 [Sentry Healing] Verifying patch inside sandbox...`);
    const testHealedCode = `
            const runHealed = () => {
                ${healedCode}
            };
            try {
                runHealed();
                console.log("PATCH_VERIFIED_SUCCESSFULLY");
            } catch(e) {
                console.error("PATCH_FAILED_VERIFICATION:", e.message);
                process.exit(1);
            }
        `;

    const verificationRun = await CodeExecutionSandbox.execute(testHealedCode, {
      provider: 'flue',
      workspacePath,
    });

    if (!verificationRun.success) {
      logger.warn(
        `🚨 [Sentry Healing] Verification failed: ${verificationRun.errors.join('; ')}`,
      );
      return {
        success: false,
        reason: 'Patch verification failed',
        errors: verificationRun.errors,
      };
    }

    logger.info(
      `✅ [Sentry Healing] Patch verified successfully! Staging patch.`,
    );

    // Write patch file
    const patchesDir = path.resolve('./logs/workspaces/patches');
    fs.mkdirSync(patchesDir, { recursive: true });
    const patchFilePath = path.join(
      patchesDir,
      `sentry_heal_${Date.now()}.patch`,
    );

    const diffContent = `
--- a/${culpritFile}
+++ b/${culpritFile}
@@ -1,1 +1,1 @@
-${originalContent.split('\n')[culpritLine - 1] || ''}
+${healedCode.split('\n')[0] || ''}
        `;
    fs.writeFileSync(patchFilePath, diffContent.trim(), 'utf8');

    return {
      success: true,
      patchPath: patchFilePath,
      healedCode,
    };
  }
}
