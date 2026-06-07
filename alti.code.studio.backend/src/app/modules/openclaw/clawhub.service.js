/**
 * Copyright (c) 2024 Inso Code
 *
 * CLAWHUB SERVICE — OpenClaw Skill Directory Client
 * REST client for the clawhub.ai skill registry.
 * MIT License — https://github.com/openclaw/clawhub
 *
 * ClawhHub is the official OpenClaw Skill Directory at https://clawhub.ai.
 * This service queries it for available skills and can install them locally.
 */

import https from 'https';
import path from 'path';
import fs from 'fs';
import { logger } from '../../../shared/logger.js';

const CLAWHUB_API_BASE = 'https://clawhub.ai/api';
const LOCAL_SKILLS_PATH = path.resolve('submodules', 'openclaw', 'skills');

/**
 * Minimal HTTPS GET helper returning parsed JSON.
 */
function httpsGet(url, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { timeout: timeoutMs }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                try { resolve(JSON.parse(body)); }
                catch (e) { reject(new Error(`ClawhHub parse error: ${body.slice(0, 200)}`)); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('ClawhHub request timed out')); });
    });
}

class ClawhubService {
    constructor() {
        this.baseUrl = CLAWHUB_API_BASE;
        this._cache = null;
        this._cacheTs = 0;
        this._cacheTtlMs = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * List all skills from ClawhHub (cached for 5 minutes).
     */
    async listSkills() {
        const now = Date.now();
        if (this._cache && now - this._cacheTs < this._cacheTtlMs) {
            return this._cache;
        }

        try {
            const data = await httpsGet(`${this.baseUrl}/skills`);
            this._cache = Array.isArray(data) ? data : data.skills || [];
            this._cacheTs = now;
            logger.info(`[clawhub] Fetched ${this._cache.length} skills from ClawhHub`);
            return this._cache;
        } catch (err) {
            logger.warn(`[clawhub] Failed to fetch skills: ${err.message}. Using local fallback.`);
            return this._localSkillsFallback();
        }
    }

    /**
     * Search skills by keyword.
     * @param {string} query
     */
    async searchSkills(query) {
        const skills = await this.listSkills();
        const q = query.toLowerCase();
        return skills.filter(s =>
            (s.name || '').toLowerCase().includes(q) ||
            (s.description || '').toLowerCase().includes(q) ||
            (s.tags || []).some(t => t.toLowerCase().includes(q))
        );
    }

    /**
     * Get a specific skill by name.
     * @param {string} name
     */
    async getSkill(name) {
        const skills = await this.listSkills();
        return skills.find(s => s.name === name) || null;
    }

    /**
     * Get skill details including SKILL.md content.
     * @param {string} skillId
     */
    async getSkillDetails(skillId) {
        try {
            return await httpsGet(`${this.baseUrl}/skills/${encodeURIComponent(skillId)}`);
        } catch (err) {
            logger.warn(`[clawhub] Could not fetch skill details for "${skillId}": ${err.message}`);
            return null;
        }
    }

    /**
     * Get categories from ClawhHub.
     */
    async getCategories() {
        try {
            return await httpsGet(`${this.baseUrl}/categories`);
        } catch (err) {
            return [];
        }
    }

    /**
     * Fallback: scan the local skills submodule for SKILL.md files.
     */
    _localSkillsFallback() {
        if (!fs.existsSync(LOCAL_SKILLS_PATH)) return [];
        const skills = [];

        const scanDir = (dir, depth = 0) => {
            if (depth > 4) return;
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        scanDir(path.join(dir, entry.name), depth + 1);
                    } else if (entry.name === 'SKILL.md') {
                        const skillPath = path.join(dir, entry.name);
                        const content = fs.readFileSync(skillPath, 'utf8');
                        const nameMatch = content.match(/name:\s*(.+)/);
                        const descMatch = content.match(/description:\s*(.+)/);
                        skills.push({
                            name: nameMatch ? nameMatch[1].trim() : path.basename(dir),
                            description: descMatch ? descMatch[1].trim() : '',
                            source: 'local',
                            path: skillPath,
                        });
                    }
                }
            } catch (_) { /* skip unreadable dirs */ }
        };

        scanDir(LOCAL_SKILLS_PATH);
        logger.info(`[clawhub] Local fallback: found ${skills.length} skills from submodule`);
        return skills;
    }

    /**
     * Get MCP tool definitions for all available skills.
     */
    async getMcpToolDefinitions() {
        const skills = await this.listSkills();
        return skills.map(skill => ({
            name: `clawhub_${(skill.name || 'unknown').replace(/[^a-z0-9_]/gi, '_')}`,
            description: skill.description || `ClawhHub skill: ${skill.name}`,
            parameters: {
                type: 'object',
                properties: {
                    input: { type: 'string', description: 'Input for this skill' }
                },
                required: ['input']
            }
        }));
    }
}

export const clawhubService = new ClawhubService();
