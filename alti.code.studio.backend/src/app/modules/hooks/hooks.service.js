/**
 * Hooks Service — Event-driven agent automation
 *
 * Hooks fire agent prompts or shell commands when IDE/workspace events occur.
 * Config stored in .alti/hooks.json
 *
 * Supported trigger types:
 *   file-save, file-create, file-delete
 *   prompt-submit, agent-turn-complete
 *   before-tool, after-tool
 *   before-spec-task, after-spec-task
 *   manual
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { logger } from '../../../shared/logger.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

const VALID_TRIGGERS = [
  'file-save',
  'file-create',
  'file-delete',
  'prompt-submit',
  'agent-turn-complete',
  'before-tool',
  'after-tool',
  'before-spec-task',
  'after-spec-task',
  'manual',
];

const VALID_ACTIONS = ['agent-prompt', 'shell-command'];

class HooksService {
  constructor() {
    this.configDir = path.join(process.cwd(), '.alti');
    this.configPath = path.join(this.configDir, 'hooks.json');
  }

  async _ensureConfig() {
    await fs.mkdir(this.configDir, { recursive: true });
    try {
      await fs.access(this.configPath);
    } catch {
      await fs.writeFile(this.configPath, JSON.stringify([], null, 2));
    }
  }

  async _readHooks() {
    await this._ensureConfig();
    const raw = await fs.readFile(this.configPath, 'utf-8');
    return JSON.parse(raw);
  }

  async _writeHooks(hooks) {
    await this._ensureConfig();
    await fs.writeFile(this.configPath, JSON.stringify(hooks, null, 2));
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────

  /**
   * Create a new hook.
   * @param {object} def
   * @param {string} def.name - Human-readable name
   * @param {object} def.trigger - { type, filePattern? }
   * @param {object} def.action - { type: 'agent-prompt'|'shell-command', value: string }
   * @param {boolean} [def.enabled=true]
   */
  async createHook(def) {
    const { name, trigger, action, enabled = true } = def;

    if (!name?.trim()) throw new Error('"name" is required.');
    if (!trigger?.type || !VALID_TRIGGERS.includes(trigger.type)) {
      throw new Error(
        `"trigger.type" must be one of: ${VALID_TRIGGERS.join(', ')}`,
      );
    }
    if (!action?.type || !VALID_ACTIONS.includes(action.type)) {
      throw new Error(
        `"action.type" must be one of: ${VALID_ACTIONS.join(', ')}`,
      );
    }
    if (!action?.value?.trim()) throw new Error('"action.value" is required.');

    const hooks = await this._readHooks();
    const hook = {
      id: crypto.randomUUID(),
      name: name.trim(),
      trigger: { type: trigger.type, filePattern: trigger.filePattern || null },
      action: { type: action.type, value: action.value.trim() },
      enabled,
      createdAt: new Date().toISOString(),
      lastFiredAt: null,
      fireCount: 0,
    };
    hooks.push(hook);
    await this._writeHooks(hooks);
    logger.info(`🪝 Hooks: created "${hook.name}" (${hook.id})`);
    return hook;
  }

  /**
   * List all hooks.
   */
  async listHooks() {
    return this._readHooks();
  }

  /**
   * Get a single hook by ID.
   */
  async getHook(id) {
    const hooks = await this._readHooks();
    const hook = hooks.find(h => h.id === id);
    if (!hook) throw new Error(`Hook "${id}" not found.`);
    return hook;
  }

  /**
   * Update a hook (partial patch).
   * @param {string} id
   * @param {object} patch - Fields to update
   */
  async updateHook(id, patch) {
    const hooks = await this._readHooks();
    const idx = hooks.findIndex(h => h.id === id);
    if (idx === -1) throw new Error(`Hook "${id}" not found.`);

    const allowed = ['name', 'trigger', 'action', 'enabled'];
    for (const key of allowed) {
      if (patch[key] !== undefined) hooks[idx][key] = patch[key];
    }
    hooks[idx].updatedAt = new Date().toISOString();
    await this._writeHooks(hooks);
    logger.info(`🪝 Hooks: updated "${id}"`);
    return hooks[idx];
  }

  /**
   * Delete a hook by ID.
   */
  async deleteHook(id) {
    const hooks = await this._readHooks();
    const filtered = hooks.filter(h => h.id !== id);
    if (filtered.length === hooks.length)
      throw new Error(`Hook "${id}" not found.`);
    await this._writeHooks(filtered);
    logger.info(`🪝 Hooks: deleted "${id}"`);
  }

  // ─── EVENT TRIGGERING ────────────────────────────────────────────────────

  /**
   * Trigger all hooks that match the given event type (and optional file context).
   * @param {string} eventType - One of VALID_TRIGGERS
   * @param {object} [context] - { file?, sessionId?, toolName?, specId? }
   */
  async triggerEvent(eventType, context = {}) {
    const hooks = await this._readHooks();
    const matching = hooks.filter(h => {
      if (!h.enabled) return false;
      if (h.trigger.type !== eventType) return false;
      // File pattern matching
      if (h.trigger.filePattern && context.file) {
        const pattern = h.trigger.filePattern;
        const filename = path.basename(context.file);
        const ext = pattern.replace(/^\*\./, '.');
        if (
          !filename.endsWith(ext) &&
          !filename.includes(pattern.replace(/\*/g, ''))
        ) {
          return false;
        }
      }
      return true;
    });

    if (matching.length === 0) return [];

    logger.info(
      `🪝 Hooks: firing ${matching.length} hook(s) for event "${eventType}"`,
    );

    const results = await Promise.allSettled(
      matching.map(hook => this._fireHook(hook, context)),
    );

    // Update fire stats
    const hooksData = await this._readHooks();
    for (const hook of matching) {
      const h = hooksData.find(hh => hh.id === hook.id);
      if (h) {
        h.lastFiredAt = new Date().toISOString();
        h.fireCount = (h.fireCount || 0) + 1;
      }
    }
    await this._writeHooks(hooksData);

    return results.map((r, i) => ({
      hookId: matching[i].id,
      hookName: matching[i].name,
      status: r.status,
      value: r.status === 'fulfilled' ? r.value : r.reason?.message,
    }));
  }

  /**
   * Manually fire a specific hook by ID.
   * @param {string} id
   * @param {object} [context]
   */
  async fireHookById(id, context = {}) {
    const hook = await this.getHook(id);
    if (!hook.enabled) throw new Error(`Hook "${id}" is disabled.`);
    return this._fireHook(hook, context);
  }

  async _fireHook(hook, context) {
    logger.info(`🪝 Firing hook "${hook.name}" (${hook.action.type})`);

    if (hook.action.type === 'shell-command') {
      try {
        const envContext = Object.entries(context)
          .map(([k, v]) => `${k.toUpperCase()}=${v || ''}`)
          .join(' ');
        const cmd = `${envContext} ${hook.action.value}`;
        const output = execSync(cmd, {
          cwd: process.cwd(),
          timeout: 30000,
          encoding: 'utf-8',
        });
        return { type: 'shell', output };
      } catch (e) {
        throw new Error(`Shell hook failed: ${e.message}`);
      }
    }

    if (hook.action.type === 'agent-prompt') {
      const contextStr = Object.entries(context)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      const fullPrompt = `${hook.action.value}\n\nCONTEXT:\n${contextStr}`;
      const response = await GeminiAiService.generateContent(fullPrompt);
      return { type: 'agent', response };
    }

    throw new Error(`Unknown action type: ${hook.action.type}`);
  }
}

export const hooksService = new HooksService();
