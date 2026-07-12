import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { logger } from '../../../shared/logger.js';

export const loopEngineeringService = {
  getLoopEngineeringDir: function() {
    return path.resolve(process.cwd(), '../submodules/loop-engineering');
  },

  audit: function(projectPath) {
    return new Promise((resolve, reject) => {
      const loopEngDir = this.getLoopEngineeringDir();
      const cliPath = path.join(loopEngDir, 'tools/loop-audit/dist/cli.js');

      if (!fs.existsSync(cliPath)) {
        return reject(new Error(`loop-audit CLI not found at ${cliPath}. Please build the tool first.`));
      }

      // Default projectPath to the workspace root if not specified
      const targetPath = projectPath ? path.resolve(projectPath) : path.resolve(process.cwd(), '..');

      const cmd = `node "${cliPath}" "${targetPath}" --json`;
      logger.info(`[LoopEngineering] Running audit command: ${cmd}`);

      exec(cmd, (error, stdout, stderr) => {
        // loop-audit exits with 2 when score < 40, which is not a failure of execution
        const exitCode = error ? error.code : 0;
        if (error && exitCode !== 2) {
          logger.error(`[LoopEngineering] Audit command failed: ${error.message}`);
          return reject(new Error(stderr || error.message));
        }

        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch (parseError) {
          logger.error(`[LoopEngineering] Failed to parse JSON output: ${stdout}`);
          reject(new Error(`Failed to parse audit JSON output: ${parseError.message}`));
        }
      });
    });
  },

  init: function(projectPath, pattern, tool, dryRun = false) {
    return new Promise((resolve, reject) => {
      const loopEngDir = this.getLoopEngineeringDir();
      const cliPath = path.join(loopEngDir, 'tools/loop-init/dist/cli.js');

      if (!fs.existsSync(cliPath)) {
        return reject(new Error(`loop-init CLI not found at ${cliPath}. Please build the tool first.`));
      }

      const targetPath = projectPath ? path.resolve(projectPath) : path.resolve(process.cwd(), '..');

      let cmd = `node "${cliPath}" "${targetPath}" --pattern "${pattern}" --tool "${tool}"`;
      if (dryRun) {
        cmd += ' --dry-run';
      }

      logger.info(`[LoopEngineering] Running init command: ${cmd}`);

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          logger.error(`[LoopEngineering] Init command failed: ${error.message}`);
          return reject(new Error(stderr || error.message));
        }

        resolve({
          success: true,
          output: stdout,
          pattern,
          tool,
          dryRun
        });
      });
    });
  },

  getCostEstimates: function(pattern, level, cadence) {
    return new Promise((resolve, reject) => {
      const loopEngDir = this.getLoopEngineeringDir();
      const cliPath = path.join(loopEngDir, 'tools/loop-cost/dist/cli.js');

      if (!fs.existsSync(cliPath)) {
        return reject(new Error(`loop-cost CLI not found at ${cliPath}. Please build the tool first.`));
      }

      let cmd = `node "${cliPath}" --pattern "${pattern}" --level "${level}" --json`;
      if (cadence) {
        cmd += ` --cadence "${cadence}"`;
      }

      logger.info(`[LoopEngineering] Running cost command: ${cmd}`);

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          logger.error(`[LoopEngineering] Cost command failed: ${error.message}`);
          return reject(new Error(stderr || error.message));
        }

        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch (parseError) {
          logger.error(`[LoopEngineering] Failed to parse JSON cost output: ${stdout}`);
          reject(new Error(`Failed to parse cost JSON output: ${parseError.message}`));
        }
      });
    });
  },

  listPatterns: function() {
    return new Promise((resolve, reject) => {
      const loopEngDir = this.getLoopEngineeringDir();
      const cliPath = path.join(loopEngDir, 'tools/loop-cost/dist/cli.js');

      if (!fs.existsSync(cliPath)) {
        return reject(new Error(`loop-cost CLI not found at ${cliPath}. Please build the tool first.`));
      }

      const cmd = `node "${cliPath}" --list`;
      logger.info(`[LoopEngineering] Running cost list command: ${cmd}`);

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          logger.error(`[LoopEngineering] Cost list command failed: ${error.message}`);
          return reject(new Error(stderr || error.message));
        }

        const lines = stdout.trim().split('\n');
        const patterns = lines.map(line => {
          const parts = line.split('\t');
          return {
            id: parts[0] || '',
            costTier: parts[1] || 'low',
            cadenceRange: parts[2] || ''
          };
        }).filter(p => p.id);

        resolve(patterns);
      });
    });
  },

  sync: function(projectPath, autoFix = false, dryRun = false) {
    return new Promise((resolve, reject) => {
      const loopEngDir = this.getLoopEngineeringDir();
      const cliPath = path.join(loopEngDir, 'tools/loop-sync/dist/cli.js');

      if (!fs.existsSync(cliPath)) {
        return reject(new Error(`loop-sync CLI not found at ${cliPath}. Please build the tool first.`));
      }

      const targetPath = projectPath ? path.resolve(projectPath) : path.resolve(process.cwd(), '..');

      let cmd = `node "${cliPath}" "${targetPath}" --json`;
      if (autoFix) {
        cmd += ' --auto-fix';
      }
      if (dryRun) {
        cmd += ' --dry-run';
      }

      logger.info(`[LoopEngineering] Running sync command: ${cmd}`);

      exec(cmd, (error, stdout, stderr) => {
        // loop-sync exits with 1 (error), 2 (warning), or 0 (healthy). We only reject on severe command execution errors.
        const exitCode = error ? error.code : 0;
        if (error && exitCode !== 1 && exitCode !== 2) {
          logger.error(`[LoopEngineering] Sync command failed: ${error.message}`);
          return reject(new Error(stderr || error.message));
        }

        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch (parseError) {
          logger.error(`[LoopEngineering] Failed to parse JSON sync output: ${stdout}`);
          reject(new Error(`Failed to parse sync JSON output: ${parseError.message}`));
        }
      });
    });
  },

  context: function(ledger, operation = '--status', options = {}) {
    return new Promise((resolve, reject) => {
      const loopEngDir = this.getLoopEngineeringDir();
      const cliPath = path.join(loopEngDir, 'tools/loop-context/dist/cli.js');

      if (!fs.existsSync(cliPath)) {
        return reject(new Error(`loop-context CLI not found at ${cliPath}. Please build the tool first.`));
      }

      let cmd = `node "${cliPath}" ${operation}`;
      if (options.maxIterations !== undefined) cmd += ` --max-iterations ${options.maxIterations}`;
      if (options.stagnation !== undefined) cmd += ` --stagnation ${options.stagnation}`;
      if (options.noProgress !== undefined) cmd += ` --no-progress ${options.noProgress}`;
      if (options.tokenBudget !== undefined) cmd += ` --token-budget ${options.tokenBudget}`;
      if (options.window !== undefined) cmd += ` --window ${options.window}`;
      
      // Request JSON if supported by the operation
      if (operation === '--check' || operation === '--status') {
        cmd += ' --json';
      }

      logger.info(`[LoopEngineering] Running context command: ${cmd}`);

      const child = exec(cmd, (error, stdout, stderr) => {
        const exitCode = error ? error.code : 0;
        // loop-context check exits with 2 when escalating, which is normal flow
        if (error && exitCode !== 2) {
          logger.error(`[LoopEngineering] Context command failed: ${error.message}`);
          return reject(new Error(stderr || error.message));
        }

        if (operation === '--check' || operation === '--status') {
          try {
            const parsed = JSON.parse(stdout);
            resolve({ exitCode, ...parsed });
          } catch (parseError) {
            resolve({ exitCode, output: stdout });
          }
        } else {
          resolve({ exitCode, output: stdout });
        }
      });

      if (ledger) {
        child.stdin.write(JSON.stringify(ledger));
      }
      child.stdin.end();
    });
  },

  worktree: function(action, runId, pattern, extraArgs = {}) {
    return new Promise((resolve, reject) => {
      const loopEngDir = this.getLoopEngineeringDir();
      const cliPath = path.join(loopEngDir, 'tools/loop-worktree/dist/cli.js');

      if (!fs.existsSync(cliPath)) {
        return reject(new Error(`loop-worktree CLI not found at ${cliPath}. Please build the tool first.`));
      }

      const targetPath = path.resolve(process.cwd(), '..');

      let cmd = `node "${cliPath}" ${action} --root "${targetPath}"`;
      if (runId) cmd += ` --run-id "${runId}"`;
      if (pattern) cmd += ` --pattern "${pattern}"`;
      if (extraArgs.status) cmd += ` --status "${extraArgs.status}"`;
      if (extraArgs.olderThan) cmd += ` --older-than "${extraArgs.olderThan}"`;
      if (extraArgs.force) cmd += ' --force';
      if (action === 'list' || action === 'gc') cmd += ' --json';

      logger.info(`[LoopEngineering] Running worktree command: ${cmd}`);

      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          logger.error(`[LoopEngineering] Worktree command failed: ${error.message}`);
          return reject(new Error(stderr || error.message));
        }

        if (action === 'list' || action === 'gc') {
          try {
            const parsed = JSON.parse(stdout);
            resolve(parsed);
          } catch (parseError) {
            resolve({ output: stdout });
          }
        } else {
          resolve({ output: stdout });
        }
      });
    });
  }
};

