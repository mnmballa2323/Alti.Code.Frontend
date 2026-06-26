/**
 * Copyright (c) 2024 Inso Code
 *
 * OPENCLAW SKILLS BRIDGE
 * Real scanner of the openclaw/skills submodule tree — reads SKILL.md files
 * and extracts name/description from YAML frontmatter.
 * Also integrates with ClawhHub (clawhub.ai) for the live skill registry.
 * MIT License — https://github.com/openclaw/skills
 */

import { logger } from '../../../shared/logger.js';
import { clawhubService } from './clawhub.service.js';
import fs from 'fs';
import path from 'path';

/** Extract YAML frontmatter value for a given key from SKILL.md content */
function extractFrontmatter(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*(.+)`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : null;
}

/** Recursively walk a directory and collect all SKILL.md paths (max depth 5) */
function walkForSkillMds(dir, depth = 0, results = []) {
  if (depth > 5) return results;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkForSkillMds(fullPath, depth + 1, results);
      } else if (entry.name === 'SKILL.md') {
        results.push(fullPath);
      }
    }
  } catch (_) {
    /* skip unreadable dirs */
  }
  return results;
}

class OpenClawSkillsBridge {
  constructor() {
    this.skillsPath = path.resolve('submodules', 'openclaw', 'skills');
    this.agentSkillsPath = path.resolve('submodules', 'agent-skills-context');
    this.availableSkills = [];
    this._loaded = false;
  }

  /**
   * Load skills from:
   * 1. openclaw/skills submodule (SKILL.md file scanner)
   * 2. agent-skills-context submodule (SKILL.md file scanner)
   * 3. ClawhHub live registry (with local fallback)
   */
  async loadSkills() {
    try {
      const skills = [];

      // Source 1: openclaw/skills submodule — scan SKILL.md files
      if (fs.existsSync(this.skillsPath)) {
        const skillMds = walkForSkillMds(this.skillsPath);
        for (const mdPath of skillMds) {
          try {
            const content = fs.readFileSync(mdPath, 'utf8');
            const name =
              extractFrontmatter(content, 'name') ||
              path.basename(path.dirname(mdPath));
            const description =
              extractFrontmatter(content, 'description') ||
              `OpenClaw skill: ${name}`;
            skills.push({
              name,
              description,
              source: 'openclaw/skills',
              path: mdPath,
            });
          } catch (_) {
            /* skip bad files */
          }
        }
        logger.info(
          `[skills-bridge] Scanned ${skillMds.length} SKILL.md files from openclaw/skills`,
        );
      } else {
        logger.warn(
          '[skills-bridge] openclaw/skills submodule not initialized.',
        );
      }

      // Source 2: agent-skills-context submodule
      if (fs.existsSync(this.agentSkillsPath)) {
        const agentMds = walkForSkillMds(this.agentSkillsPath);
        for (const mdPath of agentMds) {
          try {
            const content = fs.readFileSync(mdPath, 'utf8');
            const name =
              extractFrontmatter(content, 'name') ||
              path.basename(path.dirname(mdPath));
            const description =
              extractFrontmatter(content, 'description') ||
              `Context engineering skill: ${name}`;
            skills.push({
              name,
              description,
              source: 'agent-skills-context',
              path: mdPath,
            });
          } catch (_) {
            /* skip */
          }
        }
        logger.info(
          `[skills-bridge] Scanned ${agentMds.length} SKILL.md files from agent-skills-context`,
        );
      }

      // Source 3: ClawhHub live registry (graceful fallback if offline)
      try {
        const clawhubSkills = await clawhubService.listSkills();
        for (const s of clawhubSkills) {
          if (!skills.find(existing => existing.name === s.name)) {
            skills.push({ ...s, source: s.source || 'clawhub' });
          }
        }
      } catch (err) {
        logger.warn(`[skills-bridge] ClawhHub unavailable: ${err.message}`);
      }

      this.availableSkills = skills;
      this._loaded = true;
      logger.info(`[skills-bridge] Total skills loaded: ${skills.length}`);
      return this.availableSkills;
    } catch (error) {
      logger.error(`[skills-bridge] Failed to load skills: ${error.message}`);
      return [];
    }
  }

  /** Get skills by source */
  getSkillsBySource(source) {
    return this.availableSkills.filter(s => s.source === source);
  }

  /** Search skills by keyword */
  searchSkills(query) {
    const q = query.toLowerCase();
    return this.availableSkills.filter(
      s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q),
    );
  }

  /** Generate MCP tool definitions for all loaded skills */
  getMcpToolDefinitions() {
    return this.availableSkills.map(skill => ({
      name: `openclaw_${(skill.name || 'unknown').replace(/[^a-z0-9_]/gi, '_')}`,
      description: skill.description || skill.name,
      parameters: {
        type: 'object',
        properties: {
          input: { type: 'string', description: 'Input for this skill' },
        },
      },
    }));
  }

  get skillCount() {
    return this.availableSkills.length;
  }
  get isLoaded() {
    return this._loaded;
  }
}

export const openClawSkills = new OpenClawSkillsBridge();
