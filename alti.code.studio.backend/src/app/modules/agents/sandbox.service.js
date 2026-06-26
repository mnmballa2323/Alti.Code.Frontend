/**
 * Copyright (c) 2026 Inso Code
 *
 * sandbox.service.js — E2B Sandbox Execution Service
 * Runs arbitrary scripts and commands inside an isolated microVM.
 */

import pkg from '@e2b/code-interpreter';
const { CodeInterpreter } = pkg;
import { logger } from '../../../shared/logger.js';

export class SandboxService {
  constructor() {
    this.apiKey = process.env.E2B_API_KEY;
  }

  isActive() {
    return !!this.apiKey;
  }

  /**
   * Run a bash command in a secure E2B sandbox microVM.
   * @param {string} command
   * @returns {Promise<{success: boolean, stdout: string, stderr: string, exitCode?: number}>}
   */
  async executeCommand(command) {
    if (!this.isActive()) {
      throw new Error(
        'E2B_API_KEY is not configured. Sandbox execution unavailable.',
      );
    }

    logger.info(`🔒 [Sandbox] Spinning up E2B microVM to run: "${command}"`);
    let sandbox;
    try {
      sandbox = await CodeInterpreter.create({ apiKey: this.apiKey });

      logger.info(
        `🔒 [Sandbox] Sandbox created (ID: ${sandbox.id}). Running command...`,
      );
      const run = await sandbox.commands.run(command);

      logger.info(
        `🔒 [Sandbox] Command finished with exit code ${run.exitCode}`,
      );
      return {
        success: run.exitCode === 0,
        stdout: run.stdout,
        stderr: run.stderr,
        exitCode: run.exitCode,
      };
    } catch (error) {
      logger.error(`❌ [Sandbox] Command execution failed: ${error.message}`);
      return {
        success: false,
        stdout: '',
        stderr: error.message,
        exitCode: -1,
      };
    } finally {
      if (sandbox) {
        try {
          await sandbox.close();
          logger.info(`🔒 [Sandbox] Sandbox closed.`);
        } catch (e) {
          logger.warn(`⚠️ [Sandbox] Error closing sandbox: ${e.message}`);
        }
      }
    }
  }

  /**
   * Run interactive code (e.g. Python code block) inside the E2B code interpreter cell.
   * @param {string} code
   * @param {string} language - currently only 'python' is supported out-of-the-box by CodeInterpreter execCell
   * @returns {Promise<{success: boolean, stdout: string, stderr: string}>}
   */
  async runCode(code, language = 'python') {
    if (!this.isActive()) {
      throw new Error(
        'E2B_API_KEY is not configured. Sandbox execution unavailable.',
      );
    }

    if (language.toLowerCase() !== 'python') {
      // For JS/TS or other languages in E2B, running them as a command/script file via runCommand is better
      const tempFileName = `code_run_${Date.now()}.js`;
      const command = `echo ${JSON.stringify(code)} > ${tempFileName} && node ${tempFileName}`;
      return this.executeCommand(command);
    }

    logger.info(`🔒 [Sandbox] Spinning up E2B Python code interpreter cell...`);
    let sandbox;
    try {
      sandbox = await CodeInterpreter.create({ apiKey: this.apiKey });
      const execution = await sandbox.notebook.execCell(code);

      const stdout = execution.logs.stdout.join('\n');
      const stderr =
        execution.logs.stderr.join('\n') +
        (execution.error
          ? `\n${execution.error.name}: ${execution.error.value}\n${execution.error.traceback.join('\n')}`
          : '');

      return {
        success: !execution.error,
        stdout,
        stderr,
      };
    } catch (error) {
      logger.error(`❌ [Sandbox] Code interpreter failed: ${error.message}`);
      return {
        success: false,
        stdout: '',
        stderr: error.message,
      };
    } finally {
      if (sandbox) {
        try {
          await sandbox.close();
        } catch (e) {}
      }
    }
  }
}

export const sandboxService = new SandboxService();
