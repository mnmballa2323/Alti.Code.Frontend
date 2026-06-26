/**
 * Copyright (c) 2024 Inso Code
 *
 * agent.index.js — The Swarm Agent Capability Index
 *
 * A queryable index of every agent in the Swarm.
 * Exposes search, stats, listing, and capability lookup APIs
 * for use by the Orchestrator, frontend, and health dashboards.
 */

import { logger } from '../../../shared/logger.js';
import { capabilityRouter } from './capability.router.js';

class AgentCapabilityIndex {
  constructor() {
    this._buildIndex();
  }

  _buildIndex() {
    this.entries = capabilityRouter.table.map(entry => ({
      name: entry.agent.name,
      description: entry.agent.description,
      keywords: entry.keywords,
      preamblePreview: (entry.agent.preamble || '').substring(0, 200) + '...',
    }));
    logger.info(
      `📋 AgentIndex: Indexed ${this.entries.length} specialist agents.`,
    );
  }

  /**
   * Search the index by keyword.
   * @param {string} query
   * @returns {{ name: string, description: string, keywords: string[], score: number }[]}
   */
  search(query) {
    const q = query.toLowerCase();
    const terms = q.split(/\s+/).filter(t => t.length > 2);
    return this.entries
      .map(e => {
        let score = 0;

        // Keyword matches
        for (const kw of e.keywords) {
          const kwLower = kw.toLowerCase();
          if (q.includes(kwLower)) {
            score += 3;
          }
          for (const term of terms) {
            if (kwLower.includes(term)) {
              score += 1;
            }
          }
        }

        // Name matches
        const nameLower = e.name.toLowerCase();
        if (q.includes(nameLower)) {
          score += 5;
        }
        for (const term of terms) {
          if (nameLower.includes(term)) {
            score += 2;
          }
        }

        // Description matches
        const descLower = e.description.toLowerCase();
        if (q.includes(descLower)) {
          score += 2;
        }
        for (const term of terms) {
          if (descLower.includes(term)) {
            score += 1;
          }
        }

        return { ...e, score };
      })
      .filter(e => e.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * List all agents, optionally filtered by a keyword prefix.
   * @param {string} [filter]
   * @returns {object[]}
   */
  list(filter = '') {
    if (!filter) return this.entries;
    const f = filter.toLowerCase();
    return this.entries.filter(
      e =>
        e.name.toLowerCase().includes(f) ||
        e.keywords.some(kw => kw.includes(f)),
    );
  }

  /**
   * Get a specific agent's full index entry by name.
   * @param {string} name
   */
  get(name) {
    return (
      this.entries.find(e => e.name.toLowerCase() === name.toLowerCase()) ??
      null
    );
  }

  /**
   * Return statistical summary of the index.
   * @returns {object}
   */
  stats() {
    const totalKeywords = this.entries.reduce(
      (acc, e) => acc + e.keywords.length,
      0,
    );
    return {
      totalAgents: this.entries.length,
      totalKeywords,
      avgKeywordsPerAgent: (totalKeywords / (this.entries.length || 1)).toFixed(
        1,
      ),
      agentNames: this.entries.map(e => e.name),
    };
  }

  /**
   * Rebuild the index (call after hot-loading new agents).
   */
  rebuild() {
    this._buildIndex();
    logger.info(
      `📋 AgentIndex: Rebuilt — ${this.entries.length} agents indexed.`,
    );
  }
}

export const agentIndex = new AgentCapabilityIndex();
