/**
 * Code Browser Service — v6.7.0 Live Code Browser
 *
 * Exposes sprint-written files for in-browser review:
 *   - getSprintFiles(sprintId): list all files written during a sprint
 *   - readFile(filePath):       read current disk content (safe path check)
 *   - getDiff(filePath):        git diff HEAD~1..HEAD for a specific file
 *   - applyPatch(filePath, content):
 *       1. Guardian security audit on new content
 *       2. Backup original file
 *       3. Write patched content
 *       4. autonomicService.commenceProactiveSweep([path]) → AST check
 *       5. git add + commit "chore(patch): human edit via Studio"
 *       6. agentProfiler.record('humanPatch', ...)
 */

import path from 'path';
import fs from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { logger } from '../../../shared/logger.js';
import { GuardianService } from '../guardian/guardian.service.js';
import { autonomicService } from '../surgeon/autonomic.service.js';
import { agentProfiler } from '../agentProfiler/agentProfiler.service.js';

const execFileAsync = promisify(execFile);
const CWD = process.cwd();

// ─────────────────────────────────────────────────────────────────────────────
// Path safety — never allow traversal outside CWD
// ─────────────────────────────────────────────────────────────────────────────
function safePath(filePath) {
  const resolved = path.resolve(CWD, filePath);
  if (!resolved.startsWith(CWD)) {
    throw new Error(`Path traversal rejected: ${filePath}`);
  }
  return resolved;
}

// ─────────────────────────────────────────────────────────────────────────────
// In-memory sprint file registry (populated by sprint service events)
// ─────────────────────────────────────────────────────────────────────────────
const sprintFileRegistry = new Map(); // sprintId → [{path, status}]

export function registerSprintFiles(sprintId, files) {
  sprintFileRegistry.set(sprintId, files);
}

// ─────────────────────────────────────────────────────────────────────────────
// CodeBrowserService
// ─────────────────────────────────────────────────────────────────────────────
class CodeBrowserService {
  /**
   * Return list of files written during a sprint.
   * Falls back to git diff of the sprint branch if not in registry.
   */
  async getSprintFiles(sprintId) {
    if (sprintFileRegistry.has(sprintId)) {
      return sprintFileRegistry.get(sprintId);
    }
    // Fallback: ask git which files changed on the auto-sprint branch
    try {
      const { stdout } = await execFileAsync(
        'git',
        ['diff', '--name-status', `HEAD~1..HEAD`],
        { cwd: CWD },
      );
      return stdout
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(line => {
          const [statusChar, ...parts] = line.split('\t');
          const status =
            statusChar === 'A'
              ? 'CREATED'
              : statusChar === 'M'
                ? 'MODIFIED'
                : statusChar === 'D'
                  ? 'DELETED'
                  : 'CHANGED';
          return { path: parts.join('\t'), status };
        });
    } catch {
      return [];
    }
  }

  /**
   * Read a file safely from disk.
   */
  async readFile(filePath) {
    const abs = safePath(filePath);
    const content = await fs.readFile(abs, 'utf-8');
    const ext = path.extname(abs).slice(1) || 'text';
    const languageMap = {
      js: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      jsx: 'javascript',
      py: 'python',
      md: 'markdown',
      json: 'json',
      sh: 'shell',
      css: 'css',
      html: 'html',
    };
    return { content, language: languageMap[ext] ?? 'text', filePath: abs };
  }

  /**
   * Get git diff for a single file (HEAD~1 vs HEAD).
   * Returns unified diff string.
   */
  async getDiff(filePath) {
    const abs = safePath(filePath);
    try {
      const { stdout } = await execFileAsync(
        'git',
        ['diff', 'HEAD~1..HEAD', '--', abs],
        { cwd: CWD },
      );
      return stdout || '(no diff available)';
    } catch {
      return '(diff unavailable — file may be new or git unavailable)';
    }
  }

  /**
   * Apply a human patch:
   *   Guardian → backup → write → autonomic sweep → git commit
   */
  async applyPatch(filePath, newContent) {
    const abs = safePath(filePath);
    const start = Date.now();

    // 1. Guardian security audit
    logger.info(`🔏 CodeBrowser: Auditing patch for ${path.basename(abs)}…`);
    const audit = await GuardianService.auditCode(
      newContent,
      `human_patch:${path.basename(abs)}`,
    );
    if (!audit.safe) {
      throw new Error(`Guardian rejected patch: ${audit.reasoning}`);
    }

    // 2. Backup original
    const backupPath = abs + `.bak.${Date.now()}`;
    const originalContent = await fs.readFile(abs, 'utf-8').catch(() => '');
    if (originalContent) await fs.writeFile(backupPath, originalContent);

    // 3. Write new content
    await fs.writeFile(abs, newContent);
    logger.info(`✏️ CodeBrowser: Patch written → ${abs}`);

    // 🧠 Reinforcement Style Evolution Trigger
    if (originalContent && originalContent.trim() !== newContent.trim()) {
      try {
        const { evolutionService } =
          await import('../../../shared/evolution.service.js');
        evolutionService
          .processEvolutionaryDelta(originalContent, newContent, CWD)
          .catch(err =>
            logger.warn(
              `[EvolutionService] Failed to process stylistic preference: ${err.message}`,
            ),
          );
      } catch (err) {
        logger.debug(`[EvolutionService] Service unavailable: ${err.message}`);
      }
    }

    // 4. Autonomic AST sweep (complexity check, no rewrite threshold lower in patch context)
    await autonomicService
      .commenceProactiveSweep([abs])
      .catch(e => logger.warn(`CodeBrowser: AST sweep warn — ${e.message}`));

    // 5. Git commit
    try {
      await execFileAsync('git', ['add', abs], { cwd: CWD });
      await execFileAsync(
        'git',
        [
          'commit',
          '-m',
          `chore(studio-patch): human edit via Code Browser — ${path.basename(abs)}`,
        ],
        { cwd: CWD },
      );
      logger.info(`✅ CodeBrowser: Patch committed.`);
    } catch (e) {
      logger.warn(`CodeBrowser: Git commit failed — ${e.message}`);
    }

    // 6. Record in profiler
    agentProfiler.record('humanPatch', true, Date.now() - start);

    return {
      success: true,
      auditScore: audit.score,
      backupPath,
      message: `Patch applied and committed for ${path.basename(abs)}`,
    };
  }
}

export const codeBrowserService = new CodeBrowserService();
