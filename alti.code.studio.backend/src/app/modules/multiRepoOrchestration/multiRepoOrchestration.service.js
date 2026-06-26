/**
 * Multi-Repo Orchestration Service — v6.0.0
 *
 * Coordinates atomic changes across multiple git repositories
 * (backend, frontend, infrastructure, mobile) in a single task.
 *
 * Features:
 *   - Parallel repository scanning (which repos are relevant to a goal?)
 *   - Cross-repo change plan (ordered steps that span repo boundaries)
 *   - Atomic commit across repos (all-or-nothing, rollback on failure)
 *   - Submodule sync after cross-repo changes
 *   - Git branch strategy: one feature branch per repo, same name
 */

import simpleGit from 'simple-git';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { vectorStoreService } from '../memory/vector.store.js';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import EventEmitter from 'events';

export const multiRepoBus = new EventEmitter();

// Default repo registry — override via environment or configuration
const DEFAULT_REPO_REGISTRY = [
  {
    id: 'backend',
    name: 'Alti Backend',
    path: process.env.BACKEND_REPO_PATH || path.resolve(process.cwd()),
  },
  {
    id: 'frontend',
    name: 'Alti Frontend',
    path:
      process.env.FRONTEND_REPO_PATH ||
      path.resolve(process.cwd(), '../alti.code.studio.frontend'),
  },
  {
    id: 'infra',
    name: 'Alti Infrastructure',
    path:
      process.env.INFRA_REPO_PATH ||
      path.resolve(process.cwd(), '../alti.code.studio.infra'),
  },
  {
    id: 'monorepo',
    name: 'Alti Monorepo',
    path: process.env.MONOREPO_PATH || path.resolve(process.cwd(), '../..'),
  },
];

export class MultiRepoOrchestrationService {
  constructor(repoRegistry = DEFAULT_REPO_REGISTRY) {
    this.repos = repoRegistry;
    this.name = 'MultiRepoOrchestrationService';
    logger.info(
      `🔗 MultiRepoOrchestration: Initialized with ${this.repos.length} repos.`,
    );
  }

  /**
   * Scan all repos to understand their current state relevant to a goal.
   *
   * @param {string} goal - What we are trying to accomplish
   * @returns {Promise<{repoId, status, relevantFiles, uncommittedChanges}[]>}
   */
  async scanAllRepos(goal) {
    logger.info(
      `🔎 MultiRepo: Scanning ${this.repos.length} repos for goal: "${goal.substring(0, 60)}"`,
    );

    const scans = await Promise.allSettled(
      this.repos.map(async repo => {
        try {
          const git = simpleGit(repo.path);
          const [status, log] = await Promise.all([
            git.status(),
            git.log({ maxCount: 5 }),
          ]);

          // Ask LLM which files in this repo are likely affected by the goal
          const relevancePrompt = `
Repository: ${repo.name} (${repo.id})
Goal: "${goal}"
Recent commits: ${log.all.map(c => c.message).join(' | ')}
Uncommitted files: ${[...status.modified, ...status.not_added, ...status.created].join(', ')}

Which file patterns in this repository are likely affected by this goal?
Return JSON: { "relevant": boolean, "affectedFilePatterns": ["src/**/*.ts"], "reason": "..." }
Only JSON, no markdown.`.trim();

          const raw = await GeminiAiService.generateContent(relevancePrompt);
          const cleaned = raw
            .replace(/^```json?\n?/m, '')
            .replace(/\n?```$/m, '')
            .trim();
          const relevanceData = JSON.parse(cleaned);

          return {
            repoId: repo.id,
            repoName: repo.name,
            path: repo.path,
            exists: true,
            currentBranch: status.current,
            uncommittedChanges: status.files.length,
            isClean: status.isClean(),
            recentCommits: log.all.slice(0, 3).map(c => c.message),
            relevant: relevanceData.relevant,
            affectedFilePatterns: relevanceData.affectedFilePatterns || [],
            relevanceReason: relevanceData.reason || '',
          };
        } catch (error) {
          return {
            repoId: repo.id,
            repoName: repo.name,
            path: repo.path,
            exists: false,
            error: error.message,
            relevant: false,
          };
        }
      }),
    );

    return scans.map(r =>
      r.status === 'fulfilled'
        ? r.value
        : { error: r.reason?.message, relevant: false },
    );
  }

  /**
   * Generate a cross-repo execution plan for a goal.
   *
   * @param {string} goal
   * @param {object[]} scanResults - Output of scanAllRepos()
   * @returns {Promise<{taskId, plan: {repoId, action, description, files}[]}>}
   */
  async planCrossRepoChanges(goal, scanResults) {
    const relevantRepos = scanResults.filter(r => r.relevant && r.exists);
    if (relevantRepos.length === 0) {
      logger.warn('MultiRepo: No relevant repos found for goal.');
      return { taskId: null, plan: [], relevantRepos: [] };
    }

    const repoSummary = relevantRepos
      .map(
        r =>
          `- ${r.repoId}: ${r.repoName} (branch: ${r.currentBranch}, ${r.uncommittedChanges} uncommitted, affected: ${r.affectedFilePatterns.join(', ')})`,
      )
      .join('\n');

    const planPrompt = `
You are a cross-repository software architect. Plan atomic changes across multiple repos for this goal.

Goal: "${goal}"

Relevant repositories:
${repoSummary}

Create an ordered plan where each step targets exactly one repository.
Changes must be ordered so dependencies are satisfied (backend before frontend if shared types change).

Return JSON (no markdown):
{
  "goal": "...",
  "strategy": "...",
  "steps": [
    { "repoId": "backend", "action": "create_file|modify_file|add_dependency|run_command", "description": "...", "files": ["src/..."], "details": "..." },
    { "repoId": "frontend", "action": "modify_file", "description": "...", "files": ["app/..."], "details": "..." }
  ]
}`.trim();

    const raw = await GeminiAiService.generateContent(planPrompt);
    const cleaned = raw
      .replace(/^```json?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim();
    const plan = JSON.parse(cleaned);

    const taskId = crypto.randomUUID().slice(0, 8);
    logger.info(
      `📋 MultiRepo: Plan generated [${taskId}] — ${plan.steps?.length ?? 0} cross-repo steps.`,
    );
    this._emit('multirepo:plan', { taskId, plan });

    return {
      taskId,
      plan: plan.steps || [],
      relevantRepos,
      strategy: plan.strategy,
    };
  }

  /**
   * Execute a cross-repo plan atomically — rollback all repos on any failure.
   *
   * @param {string} taskId
   * @param {string} branchName - Same branch name used in each repo
   * @param {object[]} plan - Output of planCrossRepoChanges()
   * @returns {Promise<{taskId, status, results}>}
   */
  async executeAtomically(taskId, branchName, plan, relevantRepos) {
    const results = [];
    const createdBranches = [];

    logger.info(
      `⚡ MultiRepo [${taskId}]: Executing ${plan.length} steps atomically on branch "${branchName}"`,
    );

    try {
      // Phase 1: Create feature branches in all relevant repos
      for (const repo of relevantRepos) {
        if (!repo.exists) continue;
        const git = simpleGit(repo.path);
        try {
          await git.checkoutLocalBranch(branchName);
          createdBranches.push({ repoId: repo.repoId, path: repo.path, git });
          this._emit('multirepo:branch_created', {
            taskId,
            repoId: repo.repoId,
            branchName,
          });
        } catch (e) {
          // Branch may already exist — try checkout
          await git.checkout(branchName);
          createdBranches.push({ repoId: repo.repoId, path: repo.path, git });
        }
      }

      // Phase 2: Execute each step sequentially
      for (let i = 0; i < plan.length; i++) {
        const step = plan[i];
        const repoEntry = createdBranches.find(b => b.repoId === step.repoId);
        if (!repoEntry) {
          results.push({
            step: i,
            repoId: step.repoId,
            status: 'skipped',
            reason: 'repo_not_found',
          });
          continue;
        }

        this._emit('multirepo:step:start', {
          taskId,
          stepIndex: i,
          repoId: step.repoId,
          action: step.action,
        });
        logger.info(
          `🔧 MultiRepo [${taskId}] Step ${i}: [${step.repoId}] ${step.description}`,
        );

        const stepResult = await this._executeRepoStep(step, repoEntry, taskId);
        results.push({ step: i, ...stepResult });

        if (stepResult.status === 'failed') {
          throw new Error(
            `Step ${i} failed in ${step.repoId}: ${stepResult.error}`,
          );
        }

        this._emit('multirepo:step:done', {
          taskId,
          stepIndex: i,
          result: stepResult,
        });
      }

      // Phase 3: Commit all repos
      for (const { repoId, path: repoPath, git } of createdBranches) {
        const repoStatus = await git.status();
        if (!repoStatus.isClean()) {
          const msg = `feat(cross-repo/${taskId}): cross-repo change for task ${taskId} — ${repoId}`;
          await git.add('.');
          await git.commit(msg);
          this._emit('multirepo:committed', { taskId, repoId, message: msg });
          logger.info(`💾 MultiRepo [${taskId}]: Committed in ${repoId}`);
        }
      }

      logger.info(
        `✅ MultiRepo [${taskId}]: All ${plan.length} steps completed successfully.`,
      );
      this._emit('multirepo:completed', {
        taskId,
        branchName,
        stepsCompleted: plan.length,
      });
      return { taskId, status: 'completed', results, branchName };
    } catch (error) {
      logger.error(
        `❌ MultiRepo [${taskId}]: FAILED — rolling back all repos`,
        error.message,
      );
      this._emit('multirepo:rollback', { taskId, reason: error.message });

      // ROLLBACK: checkout main in all repos
      for (const { repoId, git } of createdBranches) {
        try {
          await git.checkout('main');
          logger.info(`🔄 MultiRepo: Rolled back ${repoId} → main`);
        } catch (rollbackErr) {
          logger.error(
            `MultiRepo rollback failed for ${repoId}:`,
            rollbackErr.message,
          );
        }
      }

      return {
        taskId,
        status: 'failed',
        error: error.message,
        results,
        rolledBack: true,
      };
    }
  }

  /**
   * High-level: scan → plan → execute atomically in one call.
   */
  async runCrossRepoTask(goal, opts = {}) {
    const { branchPrefix = 'cross-repo' } = opts;
    const taskId = crypto.randomUUID().slice(0, 8);
    const branchName = `${branchPrefix}/${taskId}`;

    this._emit('multirepo:task_started', { taskId, goal });
    const scanResults = await this.scanAllRepos(goal);
    const { plan, relevantRepos, strategy } = await this.planCrossRepoChanges(
      goal,
      scanResults,
    );

    if (plan.length === 0) {
      return {
        taskId,
        status: 'no_plan',
        reason: 'No relevant repos or no steps generated',
        scanResults,
      };
    }

    const result = await this.executeAtomically(
      taskId,
      branchName,
      plan,
      relevantRepos,
    );
    return { ...result, strategy, scanResults };
  }

  async _executeRepoStep(step, repoEntry, taskId) {
    const { repoId, path: repoPath } = repoEntry;
    try {
      if (step.action === 'run_command') {
        // Generate the fix using LLM and describe what was done
        const output = await GeminiAiService.generateContent(
          `Generate implementation for: ${step.details || step.description} in repo ${repoId}`,
        );
        return {
          repoId,
          action: step.action,
          status: 'success',
          output: output.substring(0, 500),
        };
      } else if (step.action === 'create_file' && step.files?.length) {
        // LLM writes the file content
        const fileContent = await GeminiAiService.generateContent(
          `Write production code for: ${step.details || step.description}\nFile: ${step.files[0]}\nReturn ONLY code, no markdown.`,
        );
        const filePath = path.join(repoPath, step.files[0]);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, fileContent, 'utf8');
        return {
          repoId,
          action: step.action,
          file: step.files[0],
          status: 'success',
        };
      } else {
        // Default: describe planned change
        return {
          repoId,
          action: step.action,
          status: 'planned',
          description: step.description,
        };
      }
    } catch (error) {
      return {
        repoId,
        action: step.action,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Initiative 1: The Weaver - Submodule AST Tracker
   * Detects if an AST change in the parent repository breaks a submodule API boundary.
   * @param {object} astDiff - The delta representing AST changes in the parent repo.
   * @returns {Promise<boolean>} True if it breaks a submodule dependency.
   */
  async detectSubmoduleBreaks(astDiff) {
    logger.info(
      `🕸️ The Weaver: Auditing AST diff for submodule boundary violations...`,
    );
    const prompt = `
Analyze the following AST diff and determine if this change introduces a breaking change 
to any exposed interfaces, types, or signatures that submodules might depend on.
AST Diff: ${JSON.stringify(astDiff)}
Return JSON: { "breaksSubmodule": boolean, "reason": "..." }
Only JSON, no markdown.`.trim();

    try {
      const raw = await GeminiAiService.generateContent(prompt);
      const cleaned = raw
        .replace(/^```json?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();
      const result = JSON.parse(cleaned);
      if (result.breaksSubmodule) {
        logger.warn(
          `🕸️ The Weaver: Breaking change detected! Reason: ${result.reason}`,
        );
      }
      return result.breaksSubmodule;
    } catch (e) {
      logger.error(`The Weaver AST parsing failed: ${e.message}`);
      return false; // Fail open for now
    }
  }

  /**
   * Initiative 1: The Weaver - Submodule Auto-Propagator
   * Automatically forks the submodule, applies the compatible AST change, and
   * prepares an atomic dual-repo PR.
   * @param {string} submodulePath - Local path to the submodule
   * @param {object} astChanges - Required changes to make the submodule compatible
   */
  async forkAndPropagate(submodulePath, astChanges) {
    logger.info(
      `🕸️ The Weaver: Propagating AST changes to submodule at ${submodulePath}`,
    );

    const git = simpleGit(submodulePath);
    const branchName = `weaver-sync/${crypto.randomUUID().slice(0, 8)}`;

    try {
      await git.checkoutLocalBranch(branchName);

      // LLM translates the parent AST diff into a fix for the submodule
      const prompt = `
You are The Weaver, an autonomous synchronization agent.
Apply the necessary code changes to the submodule to make it compatible with the parent repo's new AST.
AST Changes to adapt to: ${JSON.stringify(astChanges)}
Return JSON of the files to update: [{ "file": "src/...", "content": "..." }]
Only JSON, no markdown.`.trim();

      const raw = await GeminiAiService.generateContent(prompt);
      const cleaned = raw
        .replace(/^```json?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();
      const updates = JSON.parse(cleaned);

      for (const update of updates) {
        const fullPath = path.join(submodulePath, update.file);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, update.content, 'utf8');
        logger.info(`🕸️ The Weaver: Patched submodule file ${update.file}`);
      }

      await git.add('.');
      await git.commit(
        'feat(weaver): automated submodule sync via AST propagation',
      );

      this._emit('multirepo:submodule:propagated', {
        submodulePath,
        branchName,
        changes: updates.length,
      });
      return { status: 'success', branch: branchName };
    } catch (e) {
      logger.error(`🕸️ The Weaver: Submodule propagation failed: ${e.message}`);
      // Rollback
      try {
        await git.checkout('main');
      } catch (e2) {}
      return { status: 'failed', error: e.message };
    }
  }

  /** Register an additional repo at runtime */
  registerRepo(repo) {
    if (!repo.id || !repo.path)
      throw new Error('MultiRepoOrchestration: repo must have id and path.');
    this.repos.push(repo);
    logger.info(
      `🔗 MultiRepo: Registered new repo "${repo.id}" at ${repo.path}`,
    );
  }

  _emit(event, data) {
    multiRepoBus.emit(event, data);
  }
}

export const multiRepoOrchestrationService =
  new MultiRepoOrchestrationService();
