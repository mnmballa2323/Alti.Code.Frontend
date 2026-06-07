/**
 * Copyright (c) 2024 Inso Code
 *
 * oss.agent.registry.js — Persistent OSS Agent Catalog
 *
 * JSON-backed persistence layer for all synthesized OSS agents.
 * Survives process restarts. Written to data/oss_agents.json.
 */

import { logger } from '../../../shared/logger.js';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const REGISTRY_FILE = path.join(DATA_DIR, 'oss_agents.json');

/**
 * @typedef {{
 *   slug: string,
 *   fullName: string,
 *   name: string,
 *   owner: string,
 *   description: string,
 *   language: string,
 *   stars: number,
 *   url: string,
 *   topics: string[],
 *   agentName: string,
 *   exportName: string,
 *   filePath: string,
 *   keywords: string[],
 *   createdAt: string,
 *   trending: boolean,
 *   registered: boolean,
 * }} OssAgentRecord
 */

export class OssAgentRegistry {
    constructor() {
        this.name = 'OssAgentRegistry';
        /** @type {Map<string, OssAgentRecord>} */
        this._records = new Map();
        this._loaded = false;
    }

    /** Load from disk. Must be called before first use. */
    async load() {
        if (this._loaded) return;
        try {
            await fs.mkdir(DATA_DIR, { recursive: true });
            const raw = await fs.readFile(REGISTRY_FILE, 'utf8');
            const list = JSON.parse(raw);
            for (const record of list) {
                this._records.set(record.slug, record);
            }
            logger.info(`📚 OssRegistry: Loaded ${this._records.size} agents from disk`);
        } catch {
            logger.info('📚 OssRegistry: No existing registry found — starting fresh');
        }
        this._loaded = true;
    }

    /** Persist to disk. */
    async _persist() {
        await fs.mkdir(DATA_DIR, { recursive: true });
        const list = [...this._records.values()];
        await fs.writeFile(REGISTRY_FILE, JSON.stringify(list, null, 2), 'utf8');
    }

    /**
     * Add or update a record.
     * @param {OssAgentRecord} record
     */
    async add(record) {
        this._records.set(record.slug, record);
        await this._persist();
        logger.info(`📚 OssRegistry: Saved agent for ${record.slug} (total: ${this._records.size})`);
    }

    /**
     * Check if an agent already exists for this repo slug.
     * @param {string} slug - e.g. 'facebook/react'
     */
    has(slug) {
        return this._records.has(slug);
    }

    /**
     * Get a single record by slug.
     * @param {string} slug
     * @returns {OssAgentRecord | null}
     */
    get(slug) {
        return this._records.get(slug) ?? null;
    }

    /**
     * List all records with optional filtering.
     * @param {{ language?: string, q?: string, limit?: number, offset?: number }} [filter]
     * @returns {OssAgentRecord[]}
     */
    list(filter = {}) {
        let results = [...this._records.values()];

        if (filter.language) {
            results = results.filter(r => r.language?.toLowerCase() === filter.language.toLowerCase());
        }

        if (filter.q) {
            const q = filter.q.toLowerCase();
            results = results.filter(r =>
                r.slug.toLowerCase().includes(q) ||
                r.description?.toLowerCase().includes(q) ||
                r.keywords?.some(k => k.includes(q))
            );
        }

        // Sort by stars descending
        results.sort((a, b) => (b.stars || 0) - (a.stars || 0));

        const offset = filter.offset || 0;
        const limit = filter.limit || 100;
        return results.slice(offset, offset + limit);
    }

    /**
     * All known slugs (used for diffing against trending).
     * @returns {string[]}
     */
    getAllSlugs() {
        return [...this._records.keys()];
    }

    /**
     * Remove an OSS agent record.
     * @param {string} slug
     * @returns {boolean} true if existed
     */
    async remove(slug) {
        const existed = this._records.delete(slug);
        if (existed) await this._persist();
        return existed;
    }

    /**
     * Return aggregate stats.
     * @returns {{ total: number, byLanguage: Object, byDate: Object, topByStars: OssAgentRecord[] }}
     */
    getStats() {
        const all = [...this._records.values()];

        const byLanguage = {};
        for (const r of all) {
            const lang = r.language || 'Unknown';
            byLanguage[lang] = (byLanguage[lang] || 0) + 1;
        }

        const byDate = {};
        for (const r of all) {
            const date = r.createdAt?.split('T')[0] || 'unknown';
            byDate[date] = (byDate[date] || 0) + 1;
        }

        const topByStars = all
            .sort((a, b) => (b.stars || 0) - (a.stars || 0))
            .slice(0, 10)
            .map(r => ({ slug: r.slug, stars: r.stars, language: r.language }));

        return {
            total: all.length,
            byLanguage,
            byDate,
            topByStars,
        };
    }
}

export const ossAgentRegistry = new OssAgentRegistry();
