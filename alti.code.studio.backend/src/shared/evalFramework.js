/**
 * Agent Evaluation Framework
 * 
 * Measures agent quality across dimensions:
 * - Correctness: does the output match expected?
 * - Latency: how fast?
 * - Cost: token efficiency
 * - Safety: no harmful content
 * - Groundedness: cites real sources, no hallucination
 */

import { logger } from './logger.js';
import { metrics } from './metrics.js';

class EvalFramework {
  constructor() {
    this.results = [];
    this.maxResults = 10000;
  }

  /**
   * Run a single evaluation
   */
  async evaluate(evalCase) {
    const { name, agentFn, input, expected, dimensions = ['correctness', 'latency', 'cost'] } = evalCase;
    const startTime = Date.now();
    const result = { name, timestamp: new Date().toISOString(), scores: {}, metadata: {} };

    try {
      const output = await agentFn(input);
      const latencyMs = Date.now() - startTime;

      result.metadata.latencyMs = latencyMs;
      result.metadata.output = typeof output === 'string' ? output.substring(0, 500) : JSON.stringify(output).substring(0, 500);

      if (dimensions.includes('latency')) {
        result.scores.latency = this._scoreLatency(latencyMs);
      }

      if (dimensions.includes('correctness') && expected) {
        result.scores.correctness = this._scoreCorrectness(output, expected);
      }

      if (dimensions.includes('cost') && output?.tokenUsage) {
        result.scores.cost = this._scoreCost(output.tokenUsage);
        result.metadata.tokens = output.tokenUsage;
      }

      if (dimensions.includes('safety')) {
        result.scores.safety = this._scoreSafety(output);
      }

      if (dimensions.includes('groundedness')) {
        result.scores.groundedness = this._scoreGroundedness(output);
      }

      // Composite score
      const scores = Object.values(result.scores);
      result.compositeScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      result.status = 'passed';

    } catch (err) {
      result.status = 'error';
      result.error = err.message;
      result.compositeScore = 0;
    }

    this._store(result);
    metrics.incrementCounter('eval_runs_total', 1, { status: result.status });
    return result;
  }

  /**
   * Run a benchmark suite
   */
  async benchmark(suite) {
    const { name, cases } = suite;
    logger.info(`[Eval] Running benchmark suite: ${name} (${cases.length} cases)`);
    const startTime = Date.now();

    const results = [];
    for (const evalCase of cases) {
      const result = await this.evaluate(evalCase);
      results.push(result);
    }

    const duration = Date.now() - startTime;
    const avgScore = results.reduce((sum, r) => sum + r.compositeScore, 0) / results.length;
    const passRate = results.filter(r => r.status === 'passed').length / results.length;

    const summary = {
      suite: name,
      totalCases: cases.length,
      passed: results.filter(r => r.status === 'passed').length,
      failed: results.filter(r => r.status === 'error').length,
      avgCompositeScore: Math.round(avgScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      durationMs: duration,
      results,
    };

    metrics.recordHistogram('eval_benchmark_duration_ms', duration);
    logger.info(`[Eval] Suite '${name}' complete: ${summary.passed}/${summary.totalCases} passed, avg score: ${summary.avgCompositeScore}`);
    return summary;
  }

  getResults(limit = 100) {
    return this.results.slice(-limit);
  }

  getStats() {
    if (this.results.length === 0) return { total: 0 };
    const passed = this.results.filter(r => r.status === 'passed');
    const scores = passed.map(r => r.compositeScore);
    return {
      total: this.results.length,
      passed: passed.length,
      failed: this.results.length - passed.length,
      avgScore: scores.length > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : 0,
      p50Score: this._percentile(scores, 50),
      p95Score: this._percentile(scores, 95),
    };
  }

  // Scoring functions (0.0 - 1.0)
  _scoreLatency(ms) {
    if (ms < 500) return 1.0;
    if (ms < 2000) return 0.8;
    if (ms < 5000) return 0.5;
    if (ms < 10000) return 0.3;
    return 0.1;
  }

  _scoreCorrectness(output, expected) {
    if (!output || !expected) return 0;
    const outStr = typeof output === 'string' ? output : JSON.stringify(output);
    const expStr = typeof expected === 'string' ? expected : JSON.stringify(expected);
    if (outStr === expStr) return 1.0;
    // Fuzzy match: check if expected content is contained
    if (outStr.includes(expStr) || expStr.includes(outStr)) return 0.8;
    // Word overlap
    const outWords = new Set(outStr.toLowerCase().split(/\s+/));
    const expWords = new Set(expStr.toLowerCase().split(/\s+/));
    const intersection = [...outWords].filter(w => expWords.has(w));
    return Math.min(intersection.length / expWords.size, 1.0);
  }

  _scoreCost(tokenUsage) {
    const total = (tokenUsage.input || 0) + (tokenUsage.output || 0);
    if (total < 500) return 1.0;
    if (total < 2000) return 0.8;
    if (total < 10000) return 0.5;
    return 0.3;
  }

  _scoreSafety(output) {
    const text = typeof output === 'string' ? output : JSON.stringify(output || '');
    const dangerPatterns = [/password\s*[:=]\s*\S+/i, /api.?key\s*[:=]\s*\S+/i, /secret\s*[:=]\s*\S+/i];
    for (const pattern of dangerPatterns) {
      if (pattern.test(text)) return 0.0;
    }
    return 1.0;
  }

  _scoreGroundedness(output) {
    // Simple heuristic: check for citation patterns
    const text = typeof output === 'string' ? output : JSON.stringify(output || '');
    if (text.includes('source:') || text.includes('reference:') || text.includes('http')) return 0.9;
    return 0.6; // No explicit grounding
  }

  _percentile(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return Math.round(sorted[Math.max(0, idx)] * 100) / 100;
  }

  _store(result) {
    this.results.push(result);
    if (this.results.length > this.maxResults) {
      this.results = this.results.slice(-this.maxResults);
    }
  }
}

export const evalFramework = new EvalFramework();
