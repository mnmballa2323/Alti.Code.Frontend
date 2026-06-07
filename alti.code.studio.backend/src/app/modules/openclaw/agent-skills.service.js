/**
 * Copyright (c) 2024 Inso Code
 *
 * AGENT SKILLS SERVICE — Context Engineering Bridge
 * Loads and applies Agent Skills from the muratcankoylan/Agent-Skills-for-Context-Engineering submodule.
 * MIT License — https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering
 *
 * Provides: SCRATCHPAD, SELECTOR, COMPRESSOR, CONTEXT-DISTILLERY, TOKEN-BUDGET patterns
 * for context window optimization in multi-agent systems.
 */

import fs from 'fs';
import path from 'path';
import { logger } from '../../../shared/logger.js';

const SKILLS_BASE = path.resolve('submodules', 'agent-skills-context');

/** Parse YAML frontmatter block from a markdown file */
function parseFrontmatter(content) {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!match) return {};
    const result = {};
    for (const line of match[1].split('\n')) {
        const kv = line.match(/^(\w[\w-]*):\s*(.+)/);
        if (kv) result[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
    }
    return result;
}

/** Walk for all .md files in the submodule */
function walkMd(dir, results = [], depth = 0) {
    if (depth > 4) return results;
    try {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const fp = path.join(dir, entry.name);
            if (entry.isDirectory()) walkMd(fp, results, depth + 1);
            else if (entry.name.endsWith('.md')) results.push(fp);
        }
    } catch (_) { }
    return results;
}

class AgentSkillsService {
    constructor() {
        this._skills = null;
    }

    /**
     * Load all agent skill definitions from the submodule.
     * Returns an array of { name, description, content, path, category }.
     */
    loadSkills() {
        if (this._skills) return this._skills;
        if (!fs.existsSync(SKILLS_BASE)) {
            logger.warn('[agent-skills] Submodule not initialized. Run: git submodule update --init');
            return [];
        }

        const mdFiles = walkMd(SKILLS_BASE);
        const skills = [];

        for (const fp of mdFiles) {
            try {
                const content = fs.readFileSync(fp, 'utf8');
                const meta = parseFrontmatter(content);
                const relPath = path.relative(SKILLS_BASE, fp);
                const parts = relPath.split(path.sep);

                skills.push({
                    name: meta.name || path.basename(fp, '.md'),
                    description: meta.description || '',
                    category: parts.length > 1 ? parts[0] : 'general',
                    content,
                    path: fp,
                    meta,
                });
            } catch (_) { }
        }

        this._skills = skills;
        logger.info(`[agent-skills] Loaded ${skills.length} context engineering skills`);
        return skills;
    }

    /**
     * Get the full content of a skill by name.
     */
    getSkillContent(name) {
        const skills = this.loadSkills();
        const skill = skills.find(s => s.name.toLowerCase() === name.toLowerCase() ||
            s.path.toLowerCase().includes(name.toLowerCase()));
        return skill ? skill.content : null;
    }

    /**
     * Get skills by category.
     */
    getSkillsByCategory(category) {
        return this.loadSkills().filter(s => s.category === category);
    }

    /**
     * Get all unique categories.
     */
    getCategories() {
        return [...new Set(this.loadSkills().map(s => s.category))];
    }

    /**
     * Build a context engineering system prompt block from multiple skills.
     * Useful for injecting the right patterns into Gemini's context window.
     * @param {string[]} skillNames - Specific skill names to include
     */
    buildContextBlock(skillNames = []) {
        const skills = this.loadSkills();
        const selected = skillNames.length > 0
            ? skills.filter(s => skillNames.some(n =>
                s.name.toLowerCase().includes(n.toLowerCase())))
            : skills.slice(0, 5); // Default: top 5 skills

        if (selected.length === 0) return '';
        return selected.map(s => `## Skill: ${s.name}\n${s.content}`).join('\n\n---\n\n');
    }

    /**
     * Apply token budget optimization — estimate token count and trim context.
     * @param {string} context - The full context string
     * @param {number} maxTokens - Token limit
     */
    applyTokenBudget(context, maxTokens = 8000) {
        // Rough approximation: 4 chars ≈ 1 token
        const maxChars = maxTokens * 4;
        if (context.length <= maxChars) return context;
        const truncated = context.slice(0, maxChars);
        logger.debug(`[agent-skills] Token budget applied: truncated from ${context.length} to ${maxChars} chars`);
        return truncated + '\n\n[...context truncated for token budget...]';
    }

    /**
     * Compress context by removing redundant lines and whitespace.
     * Implements the COMPRESSOR pattern.
     */
    compressContext(context) {
        const lines = context.split('\n');
        const seen = new Set();
        const unique = lines.filter(line => {
            const trimmed = line.trim();
            if (trimmed.length < 3) return true; // keep blanks and short lines
            if (seen.has(trimmed)) return false;
            seen.add(trimmed);
            return true;
        });
        return unique.join('\n');
    }

    get skillCount() { return (this._skills || this.loadSkills()).length; }
}

export const agentSkillsService = new AgentSkillsService();
