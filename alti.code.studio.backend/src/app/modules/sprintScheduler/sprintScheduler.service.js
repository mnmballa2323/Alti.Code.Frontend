/**
 * Sprint Scheduler Service — v6.3.0 Autonomous Goal Synthesis
 *
 * Closes the final autonomy gap: the system now generates its own sprint goals
 * by scanning the codebase for signals, synthesizes a prioritized backlog,
 * and launches sprints on a schedule or in response to events.
 *
 * Architecture:
 *   CodebaseObserver  → scans repo for signals (TODOs, failing tests, coverage gaps, stale deps)
 *   GoalSynthesizer   → converts signals → ranked sprint goals via Gemini
 *   SprintScheduler   → runs goals in priority order, cron-scheduled or event-triggered
 *   SchedulerReporter → writes daily/weekly digest using reportService
 *
 * Integration points:
 *   - ragService.query()            : fetch past sprint outcomes from vector memory
 *   - vectorStoreService.search()   : search for prior failure patterns
 *   - autonomousSprintService       : launch validated, self-healing sprints
 *   - reportService                 : publish governance digest
 *   - sprintBus                     : broadcast scheduler events via SSE
 */

import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import EventEmitter from 'events';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { vectorStoreService } from '../memory/vector.store.js';
import { ragService } from '../memory/rag.service.js';
import {
  autonomousSprintService,
  sprintBus,
} from '../autonomousSprint/autonomousSprint.service.js';
import { boardOfDirectorsService } from '../autonomousSprint/board.service.js';
import { metamorphicCoreService } from '../autonomousSprint/metamorphicCore.service.js';
import { reportService } from '../governance/report.service.js';

export const schedulerBus = new EventEmitter();

/** Maximum signals to gather per observer scan */
const MAX_SIGNALS = 50;
/** Goal backlog size limit (keep top N by priority) */
const BACKLOG_LIMIT = 10;
/** Default cron interval in ms (1 hour) */
const DEFAULT_INTERVAL_MS = 60 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// Signal types recognized by the observer
// ─────────────────────────────────────────────────────────────────────────────
const SIGNAL_PATTERNS = {
  TODO: /\/\/\s*(TODO|FIXME|HACK|XXX|BUG|OPTIMIZE)[:\s]+(.+)/gi,
  DEPRECATED: /\/\/.*@deprecated(.+)?/gi,
  UNSAFE: /eval\(|exec\(|__dirname.{0,20}req\.|dangerouslySetInnerHTML/g,
};
const SOURCE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.mjs'];

// ─────────────────────────────────────────────────────────────────────────────
// CodebaseObserver — scans the repo for actionable signals
// ─────────────────────────────────────────────────────────────────────────────
class CodebaseObserver {
  /**
   * Scan a directory tree for signals.
   * @param {string} rootDir - Absolute path to scan
   * @returns {Promise<Signal[]>}  Signal = { type, file, line, text, severity }
   */
  async scan(rootDir) {
    logger.info(`🔭 Observer: Scanning ${rootDir}…`);
    const signals = [];

    await this._walkDir(rootDir, async filePath => {
      if (signals.length >= MAX_SIGNALS) return;
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');

        for (const [type, pattern] of Object.entries(SIGNAL_PATTERNS)) {
          pattern.lastIndex = 0;
          for (let i = 0; i < lines.length; i++) {
            const match = pattern.exec(lines[i]);
            if (match) {
              signals.push({
                id: crypto.randomUUID().slice(0, 8),
                type,
                file: filePath,
                line: i + 1,
                text: match[2]?.trim() || match[0].trim(),
                severity:
                  type === 'UNSAFE'
                    ? 'critical'
                    : type === 'TODO'
                      ? 'medium'
                      : 'low',
                detectedAt: new Date().toISOString(),
              });
              if (signals.length >= MAX_SIGNALS) break;
            }
            pattern.lastIndex = 0; // reset for each line
          }
        }
      } catch {
        /* unreadable file — skip */
      }
    });

    // Also pull failing-test and low-coverage signals from vector memory
    const memorySignals = await this._queryMemorySignals();
    signals.push(...memorySignals);

    logger.info(`🔭 Observer: Found ${signals.length} signals.`);
    return signals;
  }

  async _queryMemorySignals() {
    const results = [];
    try {
      const failSearch = await vectorStoreService
        .search('sprint_outcome tests failed self-heal', 5)
        .catch(() => []);
      const docs = Array.isArray(failSearch?.documents?.[0])
        ? failSearch.documents[0]
        : Array.isArray(failSearch)
          ? failSearch.map(r => (typeof r === 'string' ? r : (r?.text ?? '')))
          : [];

      for (const doc of docs) {
        const text = typeof doc === 'string' ? doc : JSON.stringify(doc);
        if (text.includes('failed') || text.includes('FAIL')) {
          results.push({
            id: crypto.randomUUID().slice(0, 8),
            type: 'FAILED_SPRINT',
            file: 'vector_memory',
            line: 0,
            text: text.substring(0, 200),
            severity: 'high',
            detectedAt: new Date().toISOString(),
          });
        }
      }
    } catch {
      /* memory unavailable — skip */
    }
    return results.slice(0, 5);
  }

  async _walkDir(dir, handler) {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (
        ['node_modules', '.git', 'dist', 'build', 'coverage', '.next'].includes(
          entry.name,
        )
      )
        continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await this._walkDir(full, handler);
      } else if (SOURCE_EXTENSIONS.includes(path.extname(entry.name))) {
        await handler(full);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GoalSynthesizer — converts raw signals into ranked sprint goals
// ─────────────────────────────────────────────────────────────────────────────
class GoalSynthesizer {
  /**
   * Given an array of signals, produce a ranked list of sprint goals.
   * Deduplicates against known historical goals via RAG memory.
   *
   * @param {Signal[]} signals
   * @returns {Promise<Goal[]>}  Goal = { id, goal, priority, rationale, sourceSignals }
   */
  async synthesize(signals) {
    if (!signals.length) return [];

    // Fetch recent sprint outcomes to avoid re-doing completed work
    let pastGoals = '';
    try {
      pastGoals = await ragService.query(
        'recent sprint goals and outcomes completed',
        5,
      );
    } catch {
      /* memory unavailable */
    }

    const signalList = signals
      .sort(
        (a, b) =>
          ({ critical: 0, high: 1, medium: 2, low: 3 })[a.severity] -
          { critical: 0, high: 1, medium: 2, low: 3 }[b.severity],
      )
      .slice(0, 20)
      .map(
        s =>
          `[${s.severity.toUpperCase()}] ${s.type} @ ${path.basename(s.file)}:${s.line} — "${s.text}"`,
      )
      .join('\n');

    const prompt =
      `You are the Goal Synthesizer for an autonomous AI engineering system.

You have detected the following actionable signals in the codebase:
${signalList}

Recent completed sprint work (do NOT repeat these):
${pastGoals.substring(0, 800)}

Your job: Convert these signals into a prioritized list of concrete, executable sprint goals.

Rules:
- Each goal must be specific, actionable, and achievable in one sprint (≤10 steps)
- Do NOT suggest goals that duplicate recently completed work
- Merge related signals into a single goal where sensible
- Assign priority: 1=critical (security/crash), 2=high (bug/test failure), 3=medium (tech debt), 4=low (optimization)
- Max ${BACKLOG_LIMIT} goals
- Return ONLY valid JSON, no markdown

Return:
{
  "goals": [
    {
      "id": "g1",
      "goal": "...",
      "priority": 1,
      "rationale": "...",
      "sourceSignals": ["signal id or description"]
    }
  ]
}`.trim();

    try {
      const raw = await GeminiAiService.generateContent(prompt);
      const cleaned = raw
        .replace(/^```json?\n?/m, '')
        .replace(/\n?```$/m, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      return (parsed.goals || []).map(g => ({
        ...g,
        synthesizedAt: new Date().toISOString(),
      }));
    } catch (e) {
      logger.warn(
        `GoalSynthesizer: LLM parse failed — ${e.message}. Using heuristic fallback.`,
      );
      // Fallback: convert top 3 signals directly into goals
      return signals.slice(0, 3).map((s, i) => ({
        id: `g${i + 1}`,
        goal: `Address ${s.type} in ${path.basename(s.file)}:${s.line}: ${s.text.substring(0, 80)}`,
        priority: { critical: 1, high: 2, medium: 3, low: 4 }[s.severity] ?? 3,
        rationale: `Detected ${s.type} signal with ${s.severity} severity`,
        sourceSignals: [s.id],
        synthesizedAt: new Date().toISOString(),
      }));
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SprintScheduler — cron + event-driven sprint runner
// ─────────────────────────────────────────────────────────────────────────────
export class SprintSchedulerService {
  constructor() {
    this.name = 'SprintSchedulerService';
    this.observer = new CodebaseObserver();
    this.synthesizer = new GoalSynthesizer();

    /** Pending goal backlog — sorted by priority */
    this.backlog = [];
    /** History of completed scheduler runs */
    this.runHistory = [];
    /** Currently running sprint launched by the scheduler */
    this.activeScheduledSprint = null;
    /** Cron timer handle */
    this._cronTimer = null;
    /** Whether the scheduler is running */
    this.running = false;
    /** Scan target directory */
    this.scanDir = process.cwd();

    logger.info(
      '🗓️ SprintSchedulerService v6.3.0: Autonomous Goal Synthesis initialized.',
    );
  }

  // ─────────────────────────────────────────
  // Start / Stop
  // ─────────────────────────────────────────

  /**
   * Start the cron scheduler.
   * @param {object} [opts]
   * @param {number}  [opts.intervalMs]  Scan interval (default 1h)
   * @param {string}  [opts.scanDir]     Directory to observe
   * @param {boolean} [opts.runNow]      Trigger an immediate scan on start
   */
  start(opts = {}) {
    if (this.running) {
      logger.warn('🗓️ Scheduler: Already running.');
      return { started: false, reason: 'already_running' };
    }

    const {
      intervalMs = DEFAULT_INTERVAL_MS,
      scanDir = process.cwd(),
      runNow = true,
    } = opts;
    this.scanDir = scanDir;
    this.running = true;

    logger.info(
      `🗓️ Scheduler: Starting — interval ${intervalMs / 60000}min, dir: ${scanDir}`,
    );
    this._emit('scheduler:started', { intervalMs, scanDir });

    if (runNow) {
      setImmediate(() =>
        this.runCycle().catch(e =>
          logger.error('Scheduler cycle error:', e.message),
        ),
      );
    }

    this._cronTimer = setInterval(
      () =>
        this.runCycle().catch(e =>
          logger.error('Scheduler cycle error:', e.message),
        ),
      intervalMs,
    );

    return { started: true, intervalMs, scanDir };
  }

  stop() {
    if (!this.running) return { stopped: false, reason: 'not_running' };
    clearInterval(this._cronTimer);
    this._cronTimer = null;
    this.running = false;
    this._emit('scheduler:stopped', {});
    logger.info('🗓️ Scheduler: Stopped.');
    return { stopped: true };
  }

  // ─────────────────────────────────────────
  // Core Cycle
  // ─────────────────────────────────────────

  /**
   * Single scheduler cycle:
   *   1. Observe codebase for signals
   *   2. Synthesize signals into goals
   *   3. Merge new goals into backlog (dedup)
   *   4. Pop the highest-priority goal and launch a sprint
   *   5. Write governance digest to reports/
   */
  async runCycle() {
    const cycleId = crypto.randomUUID().slice(0, 6);
    const startTime = Date.now();
    logger.info(`🗓️ Scheduler [${cycleId}]: Cycle started.`);
    this._emit('scheduler:cycle:start', {
      cycleId,
      backlogSize: this.backlog.length,
    });

    // Guard: don't start a new sprint if one is already executing
    if (this.activeScheduledSprint) {
      logger.warn(
        `🗓️ Scheduler [${cycleId}]: Sprint still active — skipping this cycle.`,
      );
      this._emit('scheduler:cycle:skipped', {
        cycleId,
        reason: 'sprint_in_progress',
      });
      return;
    }

    // 1. OBSERVE
    this._emit('scheduler:phase', { cycleId, phase: 'OBSERVE' });
    const signals = await this.observer.scan(this.scanDir);
    this._emit('scheduler:signals', {
      cycleId,
      count: signals.length,
      signals: signals.slice(0, 5),
    });

    // 2. SYNTHESIZE
    this._emit('scheduler:phase', { cycleId, phase: 'SYNTHESIZE' });
    const newGoals = await this.synthesizer.synthesize(signals);
    logger.info(
      `🗓️ Scheduler [${cycleId}]: Synthesized ${newGoals.length} goals.`,
    );
    this._emit('scheduler:goals:synthesized', {
      cycleId,
      count: newGoals.length,
      goals: newGoals,
    });

    // Phase 29: The Autonomous Board of Directors
    // The Board convenes periodically (e.g. 10% of cycles) to inject macro Market/Financial Epics
    if (Math.random() < 0.1) {
      this._emit('scheduler:phase', { cycleId, phase: 'BOARD_MEETING' });
      await boardOfDirectorsService.holdBoardMeeting();
    }

    // Phase 32: The Metamorphic Core
    // Periodically (e.g. 5% of cycles), the Swarm profiles its own Orchestrator logic
    if (Math.random() < 0.05) {
      this._emit('scheduler:phase', {
        cycleId,
        phase: 'METAMORPHIC_REFLECTION',
      });
      await metamorphicCoreService.commenceSelfReflection();
    }

    // 3. MERGE into backlog (dedup by goal text similarity — simple substring check)
    const existing = new Set(
      this.backlog.map(g => g.goal.toLowerCase().substring(0, 40)),
    );
    for (const g of newGoals) {
      if (!existing.has(g.goal.toLowerCase().substring(0, 40))) {
        this.backlog.push(g);
      }
    }
    // Keep backlog capped and sorted by priority
    this.backlog.sort((a, b) => a.priority - b.priority);
    if (this.backlog.length > BACKLOG_LIMIT)
      this.backlog = this.backlog.slice(0, BACKLOG_LIMIT);
    this._emit('scheduler:backlog:updated', {
      cycleId,
      backlogSize: this.backlog.length,
      backlog: this.backlog,
    });

    // 4. LAUNCH top goal if backlog has work
    let sprintResult = null;
    if (this.backlog.length > 0) {
      const topGoal = this.backlog.shift(); // pop highest priority
      this._emit('scheduler:phase', { cycleId, phase: 'LAUNCH_SPRINT' });
      logger.info(
        `🗓️ Scheduler [${cycleId}]: Launching sprint for goal (p${topGoal.priority}): "${topGoal.goal.substring(0, 80)}"`,
      );

      try {
        this.activeScheduledSprint = topGoal;
        sprintResult = await autonomousSprintService.launchSprint(
          topGoal.goal,
          {
            repoPath: this.scanDir,
            autoDeploy: true,
            autoDoc: true,
            branchPrefix: 'auto-sprint',
          },
        );
        this._emit('scheduler:sprint:done', {
          cycleId,
          goal: topGoal.goal,
          status: sprintResult.status,
        });
      } catch (e) {
        logger.error(`🗓️ Scheduler [${cycleId}]: Sprint failed — ${e.message}`);
        this._emit('scheduler:sprint:failed', {
          cycleId,
          goal: topGoal.goal,
          error: e.message,
        });
      } finally {
        this.activeScheduledSprint = null;
      }
    } else {
      logger.info(`🗓️ Scheduler [${cycleId}]: Backlog empty — nothing to run.`);
      this._emit('scheduler:cycle:idle', { cycleId });
    }

    // 5. GOVERNANCE REPORT
    const cycleRecord = {
      cycleId,
      startTime: new Date(startTime).toISOString(),
      durationMs: Date.now() - startTime,
      signalsFound: signals.length,
      goalsAdded: newGoals.length,
      backlogSize: this.backlog.length,
      sprintLaunched: !!sprintResult,
      sprintStatus: sprintResult?.status ?? 'none',
    };
    this.runHistory.unshift(cycleRecord);
    if (this.runHistory.length > 50) this.runHistory.pop();

    await this._writeGovernanceDigest(
      cycleRecord,
      signals,
      newGoals,
      sprintResult,
    );

    logger.info(
      `🗓️ Scheduler [${cycleId}]: Cycle done in ${cycleRecord.durationMs}ms.`,
    );
    this._emit('scheduler:cycle:done', cycleRecord);
  }

  // ─────────────────────────────────────────
  // Manual Trigger (event-driven entry point)
  // ─────────────────────────────────────────

  /**
   * Trigger an immediate scan + sprint (e.g. from a git push webhook).
   * @param {string} [reason] - Human-readable trigger reason
   */
  async triggerNow(reason = 'manual') {
    logger.info(`🗓️ Scheduler: Manual trigger — reason: ${reason}`);
    this._emit('scheduler:triggered', { reason });
    return this.runCycle();
  }

  // ─────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────

  getStatus() {
    return {
      running: this.running,
      backlogSize: this.backlog.length,
      backlog: this.backlog,
      activeSprintGoal: this.activeScheduledSprint?.goal ?? null,
      lastCycle: this.runHistory[0] ?? null,
      cycleCount: this.runHistory.length,
      scanDir: this.scanDir,
    };
  }

  getBacklog() {
    return [...this.backlog];
  }
  getHistory(limit = 10) {
    return this.runHistory.slice(0, limit);
  }

  /**
   * Add a manually specified goal directly to the backlog.
   */
  addGoalToBacklog(goal, priority = 3) {
    const entry = {
      id: crypto.randomUUID().slice(0, 8),
      goal,
      priority,
      rationale: 'Manually added',
      sourceSignals: ['manual'],
      synthesizedAt: new Date().toISOString(),
    };
    this.backlog.push(entry);
    this.backlog.sort((a, b) => a.priority - b.priority);
    if (this.backlog.length > BACKLOG_LIMIT)
      this.backlog = this.backlog.slice(0, BACKLOG_LIMIT);
    this._emit('scheduler:backlog:updated', {
      backlogSize: this.backlog.length,
      backlog: this.backlog,
    });
    return entry;
  }

  clearBacklog() {
    this.backlog = [];
    this._emit('scheduler:backlog:cleared', {});
    return { cleared: true };
  }

  // ─────────────────────────────────────────
  // Governance Digest Writer
  // ─────────────────────────────────────────

  async _writeGovernanceDigest(cycle, signals, goals, sprintResult) {
    try {
      const digestPath = path.join(
        process.cwd(),
        'reports',
        `scheduler_digest_${new Date().toISOString().split('T')[0]}.md`,
      );
      await fs.mkdir(path.dirname(digestPath), { recursive: true });

      const top5Signals = signals
        .slice(0, 5)
        .map(
          s =>
            `- \`[${s.severity}] ${s.type}\` @ \`${path.basename(s.file)}:${s.line}\` — ${s.text.substring(0, 80)}`,
        )
        .join('\n');

      const goalList = goals
        .slice(0, 5)
        .map(g => `- **p${g.priority}** ${g.goal.substring(0, 100)}`)
        .join('\n');

      const content = `# 🗓️ Autonomous Scheduler Digest
**Cycle**: ${cycle.cycleId} | **Date**: ${cycle.startTime} | **Duration**: ${cycle.durationMs}ms

## Signals Detected (${cycle.signalsFound})
${top5Signals || '_None_'}

## Goals Synthesized (${cycle.goalsAdded})
${goalList || '_None_'}

## Sprint Launched
${
  cycle.sprintLaunched
    ? `✅ Sprint ran for goal — Status: \`${cycle.sprintStatus}\``
    : `⏳ No sprint launched (backlog empty or sprint in progress)`
}

## Backlog Remaining
${cycle.backlogSize} goal(s) queued for next cycle.
`;

      // Append to daily digest file (don't overwrite previous cycles today)
      let existing = '';
      try {
        existing = await fs.readFile(digestPath, 'utf-8');
      } catch {}
      await fs.writeFile(digestPath, content + '\n---\n' + existing);
      logger.info(`📋 Scheduler: Digest written → ${digestPath}`);
    } catch (e) {
      logger.warn(`Scheduler: Failed to write digest — ${e.message}`);
    }
  }

  _emit(event, data) {
    schedulerBus.emit(event, data);
    logger.info(
      `🗓️ SchedulerBus [${event}]: ${JSON.stringify(data).substring(0, 120)}`,
    );
  }
}

export const sprintSchedulerService = new SprintSchedulerService();
