/**
 * @fileoverview YamlAgentLoader — YAML DSL Agent Loader (v3.1.0)
 *
 * Reads `*.agent.yaml` files from the definitions/ directory and dynamically
 * creates BaseSpecialistAgent subclasses from them. Supports hot-reload using
 * fs.watch so new agents activate without a server restart.
 *
 * YAML Schema:
 * ```yaml
 * id: agent.python.datascience
 * name: Python Data Scientist
 * version: "1.0.0"
 * description: Specializes in pandas, numpy, and ML pipelines.
 * preamble: |
 *   You are an expert Python data scientist ...
 * capabilities:
 *   - data_analysis
 *   - machine_learning
 * ```
 */
import fs from 'fs/promises';
import { watch } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../../../shared/logger.js';
import { BaseSpecialistAgent } from './base_specialist.agent.js';
import { GeminiAiService } from '../gemini/gemini.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFINITIONS_DIR = path.join(__dirname, 'definitions');

/**
 * Parses a minimal YAML subset (key: value, multiline |, list items).
 * Using a tiny hand-rolled parser to avoid adding a dependency for this
 * lightweight use-case. For complex YAML, swap in `js-yaml`.
 *
 * @param {string} text
 * @returns {Object}
 */
function parseYaml(text) {
    const result = {};
    const lines = text.split(/\r?\n/);
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Skip comments and blank lines
        if (!line.trim() || line.trim().startsWith('#')) { i++; continue; }

        // Multiline block scalar (key: |)
        const blockMatch = line.match(/^(\w[\w.]*)\s*:\s*\|$/);
        if (blockMatch) {
            const key = blockMatch[1];
            const indent = line.search(/\S/);
            const block = [];
            i++;
            while (i < lines.length && (lines[i].search(/\S/) > indent || !lines[i].trim())) {
                block.push(lines[i].replace(new RegExp(`^\\s{${indent + 2}}`), ''));
                i++;
            }
            result[key] = block.join('\n').trimEnd();
            continue;
        }

        // List item under a key
        const listItemMatch = line.match(/^(\s+)-\s+(.+)$/);
        if (listItemMatch) {
            const val = listItemMatch[2].trim();
            // Find the owning key (most recently set array)
            const keys = Object.keys(result);
            const ownerKey = keys.reverse().find((k) => Array.isArray(result[k]));
            if (ownerKey) result[ownerKey].push(val);
            i++;
            continue;
        }

        // Key: value or Key: (start of list)
        const kvMatch = line.match(/^([\w.]+)\s*:\s*(.*)$/);
        if (kvMatch) {
            const key = kvMatch[1];
            const val = kvMatch[2].trim();
            if (val === '') {
                // Peek ahead — if next line is a list item, start array
                if (i + 1 < lines.length && lines[i + 1].match(/^\s+-/)) {
                    result[key] = [];
                } else {
                    result[key] = '';
                }
            } else {
                // Strip surrounding quotes
                result[key] = val.replace(/^["']|["']$/g, '');
            }
            i++;
            continue;
        }

        i++;
    }

    return result;
}

/**
 * Creates a live agent class from a parsed YAML definition.
 *
 * @param {Object} def - Parsed YAML definition
 * @returns {BaseSpecialistAgent}
 */
function createAgentFromDefinition(def) {
    if (!def.id || !def.name || !def.preamble) {
        throw new Error(`YAML agent definition missing required fields: id, name, preamble`);
    }

    class YamlAgent extends BaseSpecialistAgent {
        constructor() {
            super();
            this.name = def.name;
            this.description = def.description || '';
            this.preamble = def.preamble;
            this.manifest = {
                id: def.id,
                version: def.version || '1.0.0',
                capabilities: Array.isArray(def.capabilities) ? def.capabilities : [],
                source: 'yaml_dsl',
            };
        }

        async consult(prompt, contextData = []) {
            logger.info(`📄 [YAML Agent] ${this.name}: processing request...`);
            const ctx = contextData.map((c) => `[${c.path}]\n${c.content}`).join('\n');
            try {
                return await GeminiAiService.generateContent(
                    `${this.preamble}\n\n=== CONTEXT ===\n${ctx}\n\n=== REQUEST ===\n${prompt}`
                );
            } catch (e) {
                throw new Error(`[YAML Agent] ${this.name} failed: ${e.message}`);
            }
        }
    }

    return new YamlAgent();
}

/**
 * Loads all *.agent.yaml files from the definitions/ directory.
 *
 * @returns {Promise<Map<string, BaseSpecialistAgent>>} Map of agentId → agent instance
 */
async function loadYamlAgents() {
    const agents = new Map();

    let files = [];
    try {
        files = await fs.readdir(DEFINITIONS_DIR);
    } catch {
        logger.warn(`⚠️  YAML Agent Loader: definitions/ directory not found — creating it.`);
        await fs.mkdir(DEFINITIONS_DIR, { recursive: true });
        return agents;
    }

    const yamlFiles = files.filter((f) => f.endsWith('.agent.yaml'));

    for (const file of yamlFiles) {
        try {
            const raw = await fs.readFile(path.join(DEFINITIONS_DIR, file), 'utf8');
            const def = parseYaml(raw);
            const agent = createAgentFromDefinition(def);
            agents.set(def.id, agent);
            logger.info(`✅ YAML Agent Loaded: ${def.name} (${def.id}) v${def.version || '1.0.0'}`);
        } catch (e) {
            logger.error(`❌ YAML Agent Loader: Failed to load ${file} — ${e.message}`);
        }
    }

    return agents;
}

/**
 * Starts a file watcher on the definitions/ directory.
 * On any change (.agent.yaml created/modified), re-loads that specific agent.
 *
 * @param {Map<string, BaseSpecialistAgent>} agentMap — live registry to update
 */
function watchDefinitions(agentMap) {
    try {
        watch(DEFINITIONS_DIR, { persistent: false }, async (eventType, filename) => {
            if (!filename || !filename.endsWith('.agent.yaml')) return;
            const filePath = path.join(DEFINITIONS_DIR, filename);
            logger.info(`🔄 YAML hot-reload triggered for: ${filename}`);
            try {
                const raw = await fs.readFile(filePath, 'utf8');
                const def = parseYaml(raw);
                const agent = createAgentFromDefinition(def);
                agentMap.set(def.id, agent);
                logger.info(`♻️  YAML Agent Hot-Reloaded: ${def.name} (${def.id})`);
            } catch (e) {
                logger.error(`❌ YAML hot-reload failed for ${filename}: ${e.message}`);
            }
        });
        logger.info(`👁️  YAML Agent Loader: watching ${DEFINITIONS_DIR} for changes`);
    } catch (e) {
        logger.warn(`⚠️  YAML Agent Loader: Could not start watcher — ${e.message}`);
    }
}

export { loadYamlAgents, watchDefinitions, createAgentFromDefinition, parseYaml };
