/**
 * Agent Profiler Service — v6.5.0 Adaptive Agent Performance Profiling
 *
 * Tracks quality metrics per agent across every dispatch call:
 *   - Success / failure rate
 *   - Average latency (ms)
 *   - Test-pass rate (when sprint step has test results)
 *   - Cost efficiency (result quality per ms)
 *   - Composite score (0–100) for RouteOptimizer decisions
 *
 * Also runs:
 *   - SurgeProtection: circuit breaker that demotes agents failing >3 consecutive times
 *   - RouteOptimizer: wraps capabilityRouter.dispatch() with profile-weighted agent selection
 *   - Self-Tuner: when agent score < LOW_SCORE_THRESHOLD, triggers Self-Expanding Swarm
 *                 to synthesize a replacement, then autonomicService patches the route
 *
 * Storage: in-memory profiles (Map) + periodic flush to vectorStoreService (type: 'agent_profile')
 * The in-memory store is the fast path; vector store is the long-term learning record.
 */

import crypto from 'crypto';
import EventEmitter from 'events';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';
import { vectorStoreService } from '../memory/vector.store.js';
import { selfExpandingSwarmService } from '../agents/self_expanding_swarm.service.js';
import { autonomicService } from '../surgeon/autonomic.service.js';

export const profilerBus = new EventEmitter();

// ─────────────────────────────────────────────────────────────────────────────
// Thresholds
// ─────────────────────────────────────────────────────────────────────────────
const SURGE_CONSECUTIVE_FAILS = 3; // trips circuit breaker
const SURGE_SUPPRESS_MS = 15 * 60_000; // 15 min demotion window
const LOW_SCORE_THRESHOLD = 40; // below this → self-tuner fires
const MIN_SAMPLES_FOR_SCORE = 5; // need at least 5 calls to compute score
const EXPLORE_RATIO = 0.1; // 10% of calls explore untested agents
const FLUSH_INTERVAL_MS = 5 * 60_000; // flush profiles to vector store every 5 min

// ─────────────────────────────────────────────────────────────────────────────
// AgentProfiler
// ─────────────────────────────────────────────────────────────────────────────
export class AgentProfiler {
  constructor() {
    /**
     * profiles: Map<agentName, AgentProfile>
     * AgentProfile = {
     *   name, calls, successes, failures, consecutiveFails,
     *   totalLatencyMs, testPassCount, testFailCount,
     *   lastCalledAt, surgedUntil, score
     * }
     */
    this.profiles = new Map();
    this._flushTimer = null;
    logger.info('📊 AgentProfiler v6.5.0: Initialized.');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Record call outcome
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Record the result of a single agent dispatch.
   * @param {string}  agentName
   * @param {boolean} success
   * @param {number}  latencyMs
   * @param {object}  [opts]
   * @param {boolean} [opts.testPassed]   — did the generated code pass tests?
   * @param {number}  [opts.costUsd]      — estimated USD cost
   */
  record(agentName, success, latencyMs, opts = {}) {
    if (!agentName) return;
    const p = this._getOrCreate(agentName);
    const now = Date.now();

    p.calls++;
    p.lastCalledAt = new Date(now).toISOString();
    p.totalLatencyMs += latencyMs || 0;

    if (success) {
      p.successes++;
      p.consecutiveFails = 0;
    } else {
      p.failures++;
      p.consecutiveFails++;
    }

    if (opts.testPassed === true) p.testPassCount++;
    if (opts.testPassed === false) p.testFailCount++;
    if (opts.costUsd) p.totalCostUsd = (p.totalCostUsd || 0) + opts.costUsd;

    // Recompute composite score
    p.score = this._computeScore(p);

    // Surge protection check
    if (p.consecutiveFails >= SURGE_CONSECUTIVE_FAILS) {
      this._tripCircuit(agentName, p);
    }

    profilerBus.emit('profiler:recorded', {
      agentName,
      success,
      latencyMs,
      score: p.score,
    });

    // Self-tuner: fire when score drops below threshold (only after MIN_SAMPLES)
    if (
      p.calls >= MIN_SAMPLES_FOR_SCORE &&
      p.score < LOW_SCORE_THRESHOLD &&
      !p._selfTuneQueued
    ) {
      p._selfTuneQueued = true;
      setImmediate(() => this._triggerSelfTune(agentName, p));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Surge Protection (circuit breaker)
  // ─────────────────────────────────────────────────────────────────────────

  isSurged(agentName) {
    const p = this.profiles.get(agentName);
    if (!p?.surgedUntil) return false;
    if (Date.now() < p.surgedUntil) return true;
    // Surge expired — reset
    p.surgedUntil = null;
    p.consecutiveFails = 0;
    logger.info(
      `📊 Profiler: Agent "${agentName}" surge expired — back in rotation.`,
    );
    return false;
  }

  getSurgedAgents() {
    const now = Date.now();
    return [...this.profiles.entries()]
      .filter(([, p]) => p.surgedUntil && now < p.surgedUntil)
      .map(([name, p]) => ({
        name,
        surgedUntil: new Date(p.surgedUntil).toISOString(),
        score: p.score,
      }));
  }

  _tripCircuit(agentName, profile) {
    profile.surgedUntil = Date.now() + SURGE_SUPPRESS_MS;
    logger.warn(
      `⚡ SurgeProtection: Agent "${agentName}" demoted for ${SURGE_SUPPRESS_MS / 60000} min (${SURGE_CONSECUTIVE_FAILS} consecutive failures).`,
    );
    profilerBus.emit('profiler:surge', {
      agentName,
      surgedUntil: new Date(profile.surgedUntil).toISOString(),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Route selection helpers (used by RouteOptimizer)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Given a list of candidate matches (from CapabilityRouter.score()),
   * apply profiler weighting: demote surged agents, boost high-scorers,
   * with 10% exploration budget for untested agents.
   *
   * @param {{ agent, score: number, name: string }[]} candidates
   * @returns {{ agent, score: number, name: string } | null} — best candidate
   */
  selectBest(candidates) {
    if (!candidates.length) return null;

    // Separate surged vs available
    const available = candidates.filter(c => !this.isSurged(c.name));
    if (!available.length) {
      logger.warn(
        '📊 Profiler: All candidates surged — using first regardless.',
      );
      return candidates[0];
    }

    // Explore: 10% chance to pick lowest-samples agent (discovery)
    const untested = available.filter(
      c => (this.profiles.get(c.name)?.calls ?? 0) < MIN_SAMPLES_FOR_SCORE,
    );
    if (untested.length && Math.random() < EXPLORE_RATIO) {
      const pick = untested[Math.floor(Math.random() * untested.length)];
      logger.info(
        `📊 Profiler: EXPLORE — trying under-sampled agent "${pick.name}"`,
      );
      return pick;
    }

    // Exploit: pick highest composite score * keyword match score
    const scored = available.map(c => {
      const profile = this.profiles.get(c.name);
      const profileScore =
        profile && profile.calls >= MIN_SAMPLES_FOR_SCORE ? profile.score : 50;
      return { ...c, composite: c.score * (profileScore / 100) };
    });
    scored.sort((a, b) => b.composite - a.composite);
    return scored[0];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Scoring
  // ─────────────────────────────────────────────────────────────────────────

  _computeScore(p) {
    if (p.calls < 2) return 50; // neutral until we have data

    const successRate = p.successes / p.calls; // 0–1, weight 40
    const testRate =
      p.testPassCount + p.testFailCount > 0
        ? p.testPassCount / (p.testPassCount + p.testFailCount)
        : 0.5; // 0–1, weight 30
    const avgLatency = p.totalLatencyMs / p.calls;
    const latencyScore = Math.max(0, 1 - avgLatency / 10_000); // 10s = 0, 0ms = 1, weight 30

    return Math.round(successRate * 40 + testRate * 30 + latencyScore * 30);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Self-Tuner (low-score escalation)
  // ─────────────────────────────────────────────────────────────────────────

  async _triggerSelfTune(agentName, profile) {
    logger.warn(
      `🔧 Self-Tuner: Agent "${agentName}" score=${profile.score} < ${LOW_SCORE_THRESHOLD}. Escalating…`,
    );
    profilerBus.emit('profiler:self_tune:started', {
      agentName,
      score: profile.score,
    });

    try {
      // 1. Ask Self-Expanding Swarm to synthesize a replacement
      const synthesisPrompt = `The agent "${agentName}" has a performance score of ${profile.score}/100 (${profile.successes} successes, ${profile.failures} failures out of ${profile.calls} total calls, avg latency ${Math.round(profile.totalLatencyMs / profile.calls)}ms). Synthesize an improved replacement agent that handles the same domain with better reliability and faster responses.`;

      const synthesis = await selfExpandingSwarmService
        .synthesizeAgent(synthesisPrompt)
        .catch(e => {
          logger.warn(`Self-Tuner: Swarm synthesis failed — ${e.message}`);
          return null;
        });

      if (synthesis?.filePath) {
        // 2. Run autonomic surgical sweep on the new file to verify complexity
        await autonomicService
          .commenceProactiveSweep([synthesis.filePath])
          .catch(() => {});
        logger.info(
          `🔧 Self-Tuner: Replacement agent written to ${synthesis.filePath}`,
        );
        profilerBus.emit('profiler:self_tune:done', {
          agentName,
          replacementFile: synthesis.filePath,
        });

        // 3. Persist learning record
        await vectorStoreService
          .add(
            `Self-tune: agent "${agentName}" score=${profile.score} → replacement synthesized at ${synthesis.filePath}`,
            { type: 'self_tune', agentName, score: profile.score },
          )
          .catch(() => {});
      }
    } catch (e) {
      logger.error(`🔧 Self-Tuner: ${e.message}`);
      profilerBus.emit('profiler:self_tune:failed', {
        agentName,
        error: e.message,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Persistence (vector-store flush)
  // ─────────────────────────────────────────────────────────────────────────

  startPeriodicFlush() {
    if (this._flushTimer) return;
    this._flushTimer = setInterval(
      () => this._flushToStore(),
      FLUSH_INTERVAL_MS,
    );
    logger.info(
      `📊 Profiler: Vector flush every ${FLUSH_INTERVAL_MS / 60000} min.`,
    );
  }

  stopPeriodicFlush() {
    clearInterval(this._flushTimer);
    this._flushTimer = null;
  }

  async _flushToStore() {
    const entries = [...this.profiles.entries()];
    if (!entries.length) return;
    await Promise.allSettled(
      entries.map(([name, p]) =>
        vectorStoreService.add(
          `Agent profile: ${name} | calls=${p.calls} success=${p.successes} fail=${p.failures} score=${p.score} avgLatency=${Math.round(p.totalLatencyMs / (p.calls || 1))}ms`,
          {
            type: 'agent_profile',
            agentName: name,
            score: p.score,
            calls: p.calls,
          },
        ),
      ),
    );
    logger.info(
      `📊 Profiler: Flushed ${entries.length} agent profiles to vector store.`,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────────────────────────────────

  getProfile(agentName) {
    return this.profiles.get(agentName) ?? null;
  }

  getAllProfiles() {
    return [...this.profiles.entries()]
      .map(([name, p]) => ({
        name,
        calls: p.calls,
        successRate: p.calls ? Math.round((p.successes / p.calls) * 100) : 0,
        avgLatencyMs: p.calls ? Math.round(p.totalLatencyMs / p.calls) : 0,
        testPassRate:
          p.testPassCount + p.testFailCount > 0
            ? Math.round(
                (p.testPassCount / (p.testPassCount + p.testFailCount)) * 100,
              )
            : null,
        score: p.score,
        surged: this.isSurged(name),
        consecutiveFails: p.consecutiveFails,
        lastCalledAt: p.lastCalledAt,
      }))
      .sort((a, b) => b.score - a.score);
  }

  getLeaderboard(limit = 10) {
    return this.getAllProfiles().slice(0, limit);
  }

  _getOrCreate(name) {
    if (!this.profiles.has(name)) {
      this.profiles.set(name, {
        name,
        calls: 0,
        successes: 0,
        failures: 0,
        consecutiveFails: 0,
        totalLatencyMs: 0,
        testPassCount: 0,
        testFailCount: 0,
        totalCostUsd: 0,
        surgedUntil: null,
        score: 50,
        lastCalledAt: null,
        _selfTuneQueued: false,
      });
    }
    return this.profiles.get(name);
  }
}

export const agentProfiler = new AgentProfiler();
